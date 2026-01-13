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

  // Set to true for local development testing
  const DEV_MODE = true;
  const WEBSITE_URL = DEV_MODE ? 'http://localhost:3000' : 'https://unifychats.app';

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
        <button class="ai-chat-index-sync-btn" title="Sync to UnifyChats">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9"/>
          </svg>
          <span>Sync</span>
        </button>
        <span class="ai-chat-index-sync-status"></span>
      </div>
    `;

    // Event listeners
    panel.querySelector('.ai-chat-index-close').addEventListener('click', togglePanel);
    panel.querySelector('.ai-chat-index-header').addEventListener('mousedown', startDrag);
    panel.querySelector('.ai-chat-index-sync-btn').addEventListener('click', handleSyncClick);

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

  // Check authentication status
  function checkAuthStatus() {
    chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' }, (response) => {
      const syncBtn = panel.querySelector('.ai-chat-index-sync-btn');
      const statusEl = panel.querySelector('.ai-chat-index-sync-status');

      if (response?.isAuthenticated) {
        syncBtn.classList.remove('not-authenticated');
        statusEl.textContent = '';
      } else {
        syncBtn.classList.add('not-authenticated');
        statusEl.textContent = 'Sign in to sync';
        statusEl.style.cursor = 'pointer';
        statusEl.onclick = () => {
          window.open(`${WEBSITE_URL}/dashboard`, '_blank');
        };
      }
    });
  }

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
      statusEl.textContent = error.message || 'Sync failed';
      statusEl.style.color = '#f87171';

      setTimeout(() => {
        statusEl.textContent = '';
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

  // Set up MutationObserver to watch for new messages
  function setupObserver() {
    if (!currentProvider) return;

    const container = currentProvider.getConversationContainer();
    if (!container) {
      // Retry after a delay if container not found
      setTimeout(setupObserver, 1000);
      return;
    }

    const observer = new MutationObserver((mutations) => {
      // Debounce updates
      clearTimeout(window.__aiChatIndexUpdateTimeout);
      window.__aiChatIndexUpdateTimeout = setTimeout(() => {
        const filter = panel.querySelector('.ai-chat-index-filter.active')?.dataset.filter || 'all';
        updateMessageList(filter);
      }, 300);
    });

    observer.observe(container, {
      childList: true,
      subtree: true
    });
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
