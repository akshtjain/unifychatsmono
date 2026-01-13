/**
 * AI Chat Index - Main Content Script
 * Creates a floating index panel for navigating chat messages
 * Supports syncing conversations to UnifyChats cloud
 */

(function() {
  'use strict';

  // Avoid double initialization
  if (window.__aiChatIndexInitialized) return;
  window.__aiChatIndexInitialized = true;

  const providers = window.AIChatIndexProviders || {};

  // Find the active provider for this page
  function getActiveProvider() {
    for (const [key, provider] of Object.entries(providers)) {
      if (provider.isActive()) {
        return provider;
      }
    }
    return null;
  }

  // State
  let currentProvider = null;
  let isExpanded = false;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let panelPosition = { x: null, y: null };
  let isSyncing = false;

  // Auto-sync state
  let autoSyncEnabled = false;
  let autoSyncInterval = null;
  let lastSyncHash = null;
  let activityDebounceTimer = null;
  let lastSyncTime = 0;

  // Auto-sync configuration (in milliseconds)
  const AUTO_SYNC_CONFIG = {
    activityDebounce: 5000,     // 5 seconds after activity stops
    periodicInterval: 300000,   // 5 minutes
    minSyncInterval: 30000      // Minimum 30 seconds between syncs
  };

  // Use shared config (loaded from config.js via manifest)
  const WEBSITE_URL = CONFIG.WEBSITE_URL;

  // DOM Elements
  let floatingButton = null;
  let panel = null;
  let messageList = null;

  // Create the floating button
  function createFloatingButton() {
    floatingButton = document.createElement('div');
    floatingButton.id = 'ai-chat-index-btn';
    floatingButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>
      <span class="ai-chat-index-badge">0</span>
    `;
    floatingButton.title = 'Chat Index';

    floatingButton.addEventListener('click', togglePanel);

    document.body.appendChild(floatingButton);
    return floatingButton;
  }

  // Create the index panel
  function createPanel() {
    panel = document.createElement('div');
    panel.id = 'ai-chat-index-panel';
    panel.innerHTML = `
      <div class="ai-chat-index-header">
        <span class="ai-chat-index-title">Message Index</span>
        <span class="ai-chat-index-provider"></span>
        <button class="ai-chat-index-close" title="Close">&times;</button>
      </div>
      <div class="ai-chat-index-controls">
        <button class="ai-chat-index-filter active" data-filter="all">All</button>
        <button class="ai-chat-index-filter" data-filter="user">User</button>
        <button class="ai-chat-index-filter" data-filter="assistant">Assistant</button>
      </div>
      <div class="ai-chat-index-list"></div>
      <div class="ai-chat-index-footer">
        <div class="ai-chat-index-footer-left">
          <button class="ai-chat-index-sync-btn" title="Sync to UnifyChats">
            <svg class="ai-chat-index-sync-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9"/>
            </svg>
            <span>Sync</span>
          </button>
          <label class="ai-chat-index-auto-toggle" title="Auto-sync when conversation changes">
            <input type="checkbox" class="ai-chat-index-auto-checkbox">
            <span class="ai-chat-index-auto-slider"></span>
          </label>
          <span class="ai-chat-index-sync-status"></span>
        </div>
        <div class="ai-chat-index-footer-right">
          <button class="ai-chat-index-refresh-btn" title="Refresh messages">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 21h5v-5"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Event listeners
    panel.querySelector('.ai-chat-index-close').addEventListener('click', togglePanel);
    panel.querySelector('.ai-chat-index-header').addEventListener('mousedown', startDrag);
    panel.querySelector('.ai-chat-index-sync-btn').addEventListener('click', handleSyncClick);
    panel.querySelector('.ai-chat-index-refresh-btn').addEventListener('click', handleRefreshClick);

    // Auto-sync toggle
    panel.querySelector('.ai-chat-index-auto-checkbox').addEventListener('change', (e) => {
      setAutoSyncEnabled(e.target.checked);
    });

    // Filter buttons
    panel.querySelectorAll('.ai-chat-index-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        panel.querySelectorAll('.ai-chat-index-filter').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        updateMessageList(e.target.dataset.filter);
      });
    });

    messageList = panel.querySelector('.ai-chat-index-list');

    document.body.appendChild(panel);
    return panel;
  }

  // Toggle panel visibility
  function togglePanel() {
    isExpanded = !isExpanded;
    panel.classList.toggle('expanded', isExpanded);
    floatingButton.classList.toggle('active', isExpanded);

    if (isExpanded) {
      updateMessageList();
      positionPanel();
      checkAuthStatus();
    }
  }

  // Position the panel near the button
  function positionPanel() {
    if (panelPosition.x !== null) {
      panel.style.left = panelPosition.x + 'px';
      panel.style.top = panelPosition.y + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }
  }

  // Drag functionality
  function startDrag(e) {
    if (e.target.classList.contains('ai-chat-index-close')) return;

    isDragging = true;
    const rect = panel.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    panel.classList.add('dragging');
  }

  function onDrag(e) {
    if (!isDragging) return;

    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;

    // Keep panel within viewport
    const maxX = window.innerWidth - panel.offsetWidth;
    const maxY = window.innerHeight - panel.offsetHeight;

    panelPosition.x = Math.max(0, Math.min(x, maxX));
    panelPosition.y = Math.max(0, Math.min(y, maxY));

    panel.style.left = panelPosition.x + 'px';
    panel.style.top = panelPosition.y + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  }

  function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    panel.classList.remove('dragging');
  }

  // Update the message list
  function updateMessageList(filter = 'all') {
    if (!currentProvider || !messageList) return;

    const messages = currentProvider.getMessages();
    messageList.innerHTML = '';

    let count = 0;
    let userCount = 0;
    let assistantCount = 0;

    messages.forEach((msgEl, index) => {
      const msgData = currentProvider.parseMessage(msgEl);
      if (!msgData.preview) return;

      if (msgData.role === 'user') userCount++;
      else assistantCount++;

      if (filter !== 'all' && msgData.role !== filter) return;

      count++;
      const item = document.createElement('div');
      item.className = `ai-chat-index-item ai-chat-index-item-${msgData.role}`;
      item.innerHTML = `
        <span class="ai-chat-index-role">${msgData.role === 'user' ? 'You' : 'AI'}</span>
        <span class="ai-chat-index-preview">${escapeHtml(msgData.preview)}${msgData.fullText.length > 50 ? '...' : ''}</span>
      `;

      item.addEventListener('click', () => scrollToMessage(msgData.element));
      messageList.appendChild(item);
    });

    // Update badge
    const badge = floatingButton.querySelector('.ai-chat-index-badge');
    badge.textContent = userCount + assistantCount;

    // Update provider name
    const providerLabel = panel.querySelector('.ai-chat-index-provider');
    providerLabel.textContent = currentProvider.name;
  }

  // Scroll to a message
  function scrollToMessage(element) {
    if (!element) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Highlight the message briefly
    element.classList.add('ai-chat-index-highlight');
    setTimeout(() => {
      element.classList.remove('ai-chat-index-highlight');
    }, 2000);
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Track if we're waiting for sign-in
  let waitingForSignIn = false;

  // Check authentication status
  // showFeedback: shows "Checking..." while loading
  // Only shows "Connected!" if user was waiting for sign-in
  function checkAuthStatus(showFeedback = false) {
    const syncBtn = panel?.querySelector('.ai-chat-index-sync-btn');
    const statusEl = panel?.querySelector('.ai-chat-index-sync-status');
    const refreshBtn = panel?.querySelector('.ai-chat-index-refresh-btn');

    if (!syncBtn || !statusEl) return;

    const wasWaitingForSignIn = waitingForSignIn;

    if (showFeedback) {
      statusEl.textContent = 'Checking...';
      statusEl.style.color = '#a1a1aa';
      if (refreshBtn) refreshBtn.classList.add('spinning');
    }

    chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' }, (response) => {
      if (refreshBtn) refreshBtn.classList.remove('spinning');

      if (response?.isAuthenticated) {
        syncBtn.classList.remove('not-authenticated');
        // Only show "Connected!" if user was waiting for sign-in
        if (wasWaitingForSignIn) {
          statusEl.textContent = 'Connected!';
          statusEl.style.color = '#6ee7b7';
          setTimeout(() => {
            statusEl.textContent = '';
          }, 2000);
        } else {
          statusEl.textContent = '';
        }
        statusEl.style.cursor = 'default';
        statusEl.onclick = null;
        waitingForSignIn = false;
      } else {
        syncBtn.classList.add('not-authenticated');
        statusEl.textContent = 'Sign in to sync';
        statusEl.style.color = '#a1a1aa';
        statusEl.style.cursor = 'pointer';
        statusEl.onclick = () => {
          waitingForSignIn = true;
          window.open(`${WEBSITE_URL}/dashboard`, '_blank');
        };
      }
    });
  }

  // Handle refresh button click - refresh both auth status and conversation messages
  function handleRefreshClick() {
    const refreshBtn = panel?.querySelector('.ai-chat-index-refresh-btn');
    const statusEl = panel?.querySelector('.ai-chat-index-sync-status');

    if (refreshBtn) refreshBtn.classList.add('spinning');

    // Reset sync hash since conversation may have changed
    lastSyncHash = null;

    // Show refreshing status
    if (statusEl && !statusEl.textContent) {
      statusEl.textContent = 'Refreshing...';
      statusEl.style.color = '#a1a1aa';
    }

    // Refresh the message list with current conversation
    const filter = panel.querySelector('.ai-chat-index-filter.active')?.dataset.filter || 'all';
    updateMessageList(filter);

    // Re-setup observer in case conversation container changed
    setupObserver();

    // Check auth status (silent - don't show "Connected!")
    chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' }, (response) => {
      const syncBtn = panel?.querySelector('.ai-chat-index-sync-btn');
      if (response?.isAuthenticated) {
        if (syncBtn) syncBtn.classList.remove('not-authenticated');
      } else {
        if (syncBtn) syncBtn.classList.add('not-authenticated');
      }
    });

    // Stop spinner and clear status
    setTimeout(() => {
      if (refreshBtn) refreshBtn.classList.remove('spinning');
      if (statusEl && statusEl.textContent === 'Refreshing...') {
        statusEl.textContent = '';
      }
    }, 500);
  }

  // Auto-retry when tab regains focus (user might have just signed in)
  function setupAutoRetry() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && waitingForSignIn && panel) {
        // Small delay to let the extension pick up new auth
        setTimeout(() => {
          checkAuthStatus(true);
        }, 500);
      }
    });

    // Also check on window focus
    window.addEventListener('focus', () => {
      if (waitingForSignIn && panel) {
        setTimeout(() => {
          checkAuthStatus(true);
        }, 500);
      }
    });
  }

  // ==================== AUTO-SYNC FUNCTIONS ====================

  // Generate a simple hash of conversation data to detect changes
  function getConversationHash() {
    try {
      const data = collectConversationData();
      const hashInput = JSON.stringify({
        provider: data.provider,
        externalId: data.externalId,
        messageCount: data.messages.length,
        lastMessageContent: data.messages[data.messages.length - 1]?.content?.slice(0, 100) || ''
      });
      let hash = 0;
      for (let i = 0; i < hashInput.length; i++) {
        const char = hashInput.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString();
    } catch (e) {
      return null;
    }
  }

  // Update sync status for auto-sync operations
  // Uses the main status element and sync button icon for consistent UX
  function updateAutoSyncIndicator(status) {
    const statusEl = panel?.querySelector('.ai-chat-index-sync-status');
    const syncBtn = panel?.querySelector('.ai-chat-index-sync-btn');
    if (!statusEl) return;

    switch (status) {
      case 'syncing':
        statusEl.textContent = 'Syncing...';
        statusEl.style.color = '#a1a1aa';
        statusEl.style.cursor = 'default';
        statusEl.onclick = null;
        if (syncBtn) syncBtn.classList.add('syncing');
        break;
      case 'success':
        statusEl.textContent = 'Synced!';
        statusEl.style.color = '#6ee7b7';
        if (syncBtn) syncBtn.classList.remove('syncing');
        setTimeout(() => {
          // Only clear if no other status has been set
          if (statusEl.textContent === 'Synced!') {
            statusEl.textContent = '';
          }
        }, 2000);
        break;
      case 'error':
        statusEl.textContent = 'Sync failed';
        statusEl.style.color = '#f87171';
        if (syncBtn) syncBtn.classList.remove('syncing');
        setTimeout(() => {
          // Only clear if no other status has been set
          if (statusEl.textContent === 'Sync failed') {
            statusEl.textContent = '';
          }
        }, 3000);
        break;
    }
  }

  // Perform auto-sync with all guards
  async function performAutoSync(source = 'unknown') {
    console.log(`[UnifyChats] Auto-sync triggered (source: ${source})`);

    // Guard: Check if auto-sync is enabled
    if (!autoSyncEnabled) {
      console.log('[UnifyChats] Auto-sync disabled, skipping');
      return;
    }

    // Guard: Check if already syncing
    if (isSyncing) {
      console.log('[UnifyChats] Already syncing, skipping');
      return;
    }

    // Guard: Check minimum interval between syncs
    const now = Date.now();
    if (now - lastSyncTime < AUTO_SYNC_CONFIG.minSyncInterval) {
      console.log('[UnifyChats] Too soon since last sync, skipping');
      return;
    }

    // Guard: Check extension context
    if (!chrome.runtime?.id) {
      console.log('[UnifyChats] Extension context invalid, skipping');
      return;
    }

    // Guard: Check authentication
    const authStatus = await new Promise(resolve => {
      chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' }, resolve);
    });

    if (!authStatus?.isAuthenticated) {
      console.log('[UnifyChats] Not authenticated, skipping auto-sync');
      return;
    }

    // Guard: Check if conversation has changed
    const currentHash = getConversationHash();
    if (currentHash && currentHash === lastSyncHash) {
      console.log('[UnifyChats] No changes detected, skipping sync');
      return;
    }

    // Perform the sync
    try {
      isSyncing = true;
      updateAutoSyncIndicator('syncing');

      const conversationData = collectConversationData();

      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: 'SYNC_CONVERSATION', data: conversationData },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (response?.success) {
              resolve(response.data);
            } else {
              reject(new Error(response?.error || 'Sync failed'));
            }
          }
        );
      });

      lastSyncHash = currentHash;
      lastSyncTime = Date.now();
      updateAutoSyncIndicator('success');
      console.log('[UnifyChats] Auto-sync successful');

    } catch (error) {
      console.error('[UnifyChats] Auto-sync error:', error);
      updateAutoSyncIndicator('error');

      // If auth error, disable auto-sync
      if (error.message?.includes('401') || error.message?.includes('auth')) {
        setAutoSyncEnabled(false);
      }
    } finally {
      isSyncing = false;
    }
  }

  // Start periodic auto-sync
  function startPeriodicSync() {
    if (autoSyncInterval) {
      clearInterval(autoSyncInterval);
    }
    autoSyncInterval = setInterval(() => {
      performAutoSync('periodic');
    }, AUTO_SYNC_CONFIG.periodicInterval);
  }

  // Stop periodic auto-sync
  function stopPeriodicSync() {
    if (autoSyncInterval) {
      clearInterval(autoSyncInterval);
      autoSyncInterval = null;
    }
  }

  // Set auto-sync enabled state and persist
  function setAutoSyncEnabled(enabled) {
    autoSyncEnabled = enabled;

    // Update toggle UI
    const checkbox = panel?.querySelector('.ai-chat-index-auto-checkbox');
    if (checkbox) {
      checkbox.checked = enabled;
    }

    // Persist to storage
    chrome.storage.sync.set({ autoSyncEnabled: enabled });

    // Start or stop periodic sync
    if (enabled) {
      startPeriodicSync();
      // Perform initial sync when enabled
      performAutoSync('enabled');
    } else {
      stopPeriodicSync();
      clearTimeout(activityDebounceTimer);
    }

    console.log(`[UnifyChats] Auto-sync ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Load auto-sync setting from storage
  function loadAutoSyncSetting() {
    chrome.storage.sync.get(['autoSyncEnabled'], (result) => {
      const enabled = result.autoSyncEnabled === true;

      const checkbox = panel?.querySelector('.ai-chat-index-auto-checkbox');
      if (checkbox) {
        checkbox.checked = enabled;
      }

      autoSyncEnabled = enabled;

      if (enabled) {
        startPeriodicSync();
      }
    });
  }

  // Setup page leave sync trigger
  function setupPageLeaveSync() {
    // Sync when page is about to unload
    window.addEventListener('beforeunload', () => {
      if (autoSyncEnabled && !isSyncing) {
        const currentHash = getConversationHash();
        if (currentHash && currentHash !== lastSyncHash) {
          try {
            const conversationData = collectConversationData();
            chrome.runtime.sendMessage({
              type: 'SYNC_CONVERSATION_BEACON',
              data: conversationData
            });
          } catch (e) {
            console.error('[UnifyChats] Page leave sync failed:', e);
          }
        }
      }
    });

    // Also sync when tab becomes hidden (switching tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && autoSyncEnabled) {
        performAutoSync('tab-hidden');
      }
    });
  }

  // ==================== END AUTO-SYNC FUNCTIONS ====================

  // Handle sync button click
  async function handleSyncClick() {
    console.log('[UnifyChats] Sync button clicked');

    if (isSyncing) {
      console.log('[UnifyChats] Already syncing, ignoring click');
      return;
    }

    const syncBtn = panel.querySelector('.ai-chat-index-sync-btn');
    const statusEl = panel.querySelector('.ai-chat-index-sync-status');

    // Check auth first
    console.log('[UnifyChats] Checking auth status...');

    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      statusEl.textContent = 'Please refresh page';
      statusEl.style.color = '#f87171';
      console.error('[UnifyChats] Extension context invalidated - page refresh needed');
      return;
    }

    const authStatus = await new Promise(resolve => {
      chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' }, (response) => {
        console.log('[UnifyChats] Auth status response:', response);
        resolve(response);
      });
    });

    if (!authStatus?.isAuthenticated) {
      console.log('[UnifyChats] Not authenticated, opening website');
      statusEl.textContent = 'Sign in first';
      statusEl.style.color = '#f87171';
      window.open(`${WEBSITE_URL}/dashboard`, '_blank');
      return;
    }

    isSyncing = true;
    syncBtn.classList.add('syncing');
    statusEl.textContent = 'Syncing...';
    statusEl.style.color = '#a1a1aa';

    try {
      console.log('[UnifyChats] Collecting conversation data...');
      const conversationData = collectConversationData();
      console.log('[UnifyChats] Conversation data:', {
        provider: conversationData.provider,
        messageCount: conversationData.messages?.length,
        title: conversationData.title
      });

      console.log('[UnifyChats] Sending sync request to background...');
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: 'SYNC_CONVERSATION', data: conversationData },
          (response) => {
            console.log('[UnifyChats] Background response:', response);
            if (chrome.runtime.lastError) {
              console.error('[UnifyChats] Runtime error:', chrome.runtime.lastError);
              reject(new Error(chrome.runtime.lastError.message));
            } else if (response?.success) {
              resolve(response.data);
            } else {
              reject(new Error(response?.error || 'Sync failed'));
            }
          }
        );
      });

      console.log('[UnifyChats] Sync successful:', response);
      statusEl.textContent = 'Synced!';
      statusEl.style.color = '#6ee7b7';

      setTimeout(() => {
        statusEl.textContent = '';
      }, 3000);

    } catch (error) {
      console.error('[UnifyChats] Sync error:', error);
      const errorMsg = error.message || 'Sync failed';

      // Check if this is an auth error (token expired or invalid)
      if (errorMsg.includes('401') || errorMsg.includes('auth') || errorMsg.includes('Unauthorized') || errorMsg.includes('Not authenticated')) {
        // Clear stored auth and update UI
        chrome.runtime.sendMessage({ type: 'LOGOUT' });
        statusEl.textContent = 'Session expired. Sign in again';
        statusEl.style.cursor = 'pointer';
        statusEl.onclick = () => {
          window.open(`${WEBSITE_URL}/dashboard`, '_blank');
        };
        syncBtn.classList.add('not-authenticated');
      } else {
        statusEl.textContent = errorMsg;
      }
      statusEl.style.color = '#f87171';

      setTimeout(() => {
        if (!statusEl.textContent.includes('Sign in')) {
          statusEl.textContent = '';
        }
      }, 5000);
    } finally {
      isSyncing = false;
      syncBtn.classList.remove('syncing');
    }
  }

  // Collect conversation data for syncing
  function collectConversationData() {
    if (!currentProvider) {
      throw new Error('No provider active');
    }

    const messages = currentProvider.getMessages();
    const parsedMessages = [];

    messages.forEach((msgEl, index) => {
      const msgData = currentProvider.parseMessage(msgEl);
      if (!msgData.fullText) return;

      parsedMessages.push({
        role: msgData.role,
        content: msgData.fullText,
        index: index
      });
    });

    // Try to get conversation ID from URL
    const url = window.location.href;
    let externalId = url;

    // Extract conversation ID based on provider
    if (currentProvider.id === 'chatgpt') {
      const match = url.match(/\/c\/([a-zA-Z0-9-]+)/);
      externalId = match ? match[1] : url;
    } else if (currentProvider.id === 'claude') {
      const match = url.match(/\/chat\/([a-zA-Z0-9-]+)/);
      externalId = match ? match[1] : url;
    }

    // Try to get title from page
    let title = document.title;
    // Clean up common suffixes
    title = title
      .replace(/ - ChatGPT$/, '')
      .replace(/ - Claude$/, '')
      .replace(/ - Gemini$/, '')
      .replace(/ \| Grok$/, '')
      .trim();

    return {
      provider: currentProvider.id,
      externalId: externalId,
      title: title || 'Untitled Conversation',
      url: url,
      messages: parsedMessages
    };
  }

  // Store observer reference for cleanup
  let conversationObserver = null;

  // Set up MutationObserver to watch for new messages
  function setupObserver() {
    if (!currentProvider) return;

    const container = currentProvider.getConversationContainer();
    if (!container) {
      // Retry after a delay if container not found
      setTimeout(setupObserver, 1000);
      return;
    }

    // Disconnect existing observer before creating new one
    if (conversationObserver) {
      conversationObserver.disconnect();
      conversationObserver = null;
    }

    conversationObserver = new MutationObserver((mutations) => {
      // Debounce updates for UI
      clearTimeout(window.__aiChatIndexUpdateTimeout);
      window.__aiChatIndexUpdateTimeout = setTimeout(() => {
        const filter = panel.querySelector('.ai-chat-index-filter.active')?.dataset.filter || 'all';
        updateMessageList(filter);
      }, 300);

      // Debounce auto-sync on activity
      if (autoSyncEnabled) {
        clearTimeout(activityDebounceTimer);
        activityDebounceTimer = setTimeout(() => {
          performAutoSync('activity');
        }, AUTO_SYNC_CONFIG.activityDebounce);
      }
    });

    conversationObserver.observe(container, {
      childList: true,
      subtree: true
    });

    console.log('[UnifyChats] Observer attached to conversation container');
  }

  // Track current URL for SPA navigation detection
  let currentUrl = window.location.href;

  // Detect URL changes in SPA (ChatGPT, Claude, etc. don't reload the page)
  function setupUrlChangeDetection() {
    // Check for URL changes periodically (SPAs don't always trigger popstate)
    setInterval(() => {
      if (window.location.href !== currentUrl) {
        console.log('[UnifyChats] URL changed, refreshing...');
        const oldUrl = currentUrl;
        currentUrl = window.location.href;
        handleUrlChange(oldUrl, currentUrl);
      }
    }, 500);

    // Also listen for popstate (back/forward navigation)
    window.addEventListener('popstate', () => {
      if (window.location.href !== currentUrl) {
        const oldUrl = currentUrl;
        currentUrl = window.location.href;
        handleUrlChange(oldUrl, currentUrl);
      }
    });
  }

  // Handle URL change - refresh messages and reset sync state
  function handleUrlChange(oldUrl, newUrl) {
    console.log('[UnifyChats] Navigated from', oldUrl, 'to', newUrl);

    // Reset sync hash since we're on a new conversation
    lastSyncHash = null;

    // Show loading indicator
    const refreshBtn = panel?.querySelector('.ai-chat-index-refresh-btn');
    if (refreshBtn) refreshBtn.classList.add('spinning');

    // Wait a moment for the new conversation to load, then refresh
    setTimeout(() => {
      // Update the message list
      const filter = panel?.querySelector('.ai-chat-index-filter.active')?.dataset.filter || 'all';
      updateMessageList(filter);

      // Re-setup observer for new conversation container
      setupObserver();

      // Stop the spinner
      if (refreshBtn) refreshBtn.classList.remove('spinning');

      // Trigger auto-sync for the new conversation if enabled
      if (autoSyncEnabled) {
        // Clear any pending activity debounce
        clearTimeout(activityDebounceTimer);
        // Sync after a short delay to let messages load
        activityDebounceTimer = setTimeout(() => {
          performAutoSync('navigation');
        }, 1500);
      }
    }, 800);
  }

  // Initialize
  function init() {
    currentProvider = getActiveProvider();

    if (!currentProvider) {
      console.log('[UnifyChats] No matching provider found for this page');
      return;
    }

    console.log(`[UnifyChats] Initialized for ${currentProvider.name}`);

    createFloatingButton();
    createPanel();
    setupObserver();
    setupAutoRetry();
    setupPageLeaveSync();
    setupUrlChangeDetection();

    // Load auto-sync setting after panel is created
    setTimeout(() => {
      loadAutoSyncSetting();
    }, 100);

    // Initial update after a short delay to let the page load
    setTimeout(() => updateMessageList(), 1000);
  }

  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
