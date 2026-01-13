/**
 * AI Chat Index - Background Script
 * Handles extension lifecycle events, sync, and auth
 */

// Import shared config (defines CONFIG.DEV_MODE and CONFIG.WEBSITE_URL)
// Chrome uses service worker (importScripts), Firefox loads via manifest
if (typeof importScripts === 'function') {
  importScripts('config.js');
}

console.log('[UnifyChats BG] Service worker starting...');

// Add runtime property
CONFIG.CONVEX_URL = null;

// Initialize config from storage
chrome.storage.sync.get(['convexUrl', 'authToken'], (result) => {
  console.log('[UnifyChats BG] Loaded config:', { hasToken: !!result.authToken, hasUrl: !!result.convexUrl });
  if (result.convexUrl) {
    CONFIG.CONVEX_URL = result.convexUrl;
  }
});

// Open onboarding page when extension is installed
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('onboarding/welcome.html')
    });
  } else if (details.reason === 'update') {
    console.log('[UnifyChats] Updated to version', chrome.runtime.getManifest().version);
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[UnifyChats BG] Received message:', message.type);

  if (message.type === 'SYNC_CONVERSATION') {
    console.log('[UnifyChats BG] Processing sync request...');
    handleSync(message.data)
      .then(result => {
        console.log('[UnifyChats BG] Sync success:', result);
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        console.error('[UnifyChats BG] Sync error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }

  if (message.type === 'GET_AUTH_STATUS') {
    getAuthStatus()
      .then(status => sendResponse(status))
      .catch(error => sendResponse({ isAuthenticated: false, error: error.message }));
    return true;
  }

  if (message.type === 'SET_AUTH_TOKEN') {
    chrome.storage.sync.set({
      authToken: message.token,
      convexUrl: message.convexUrl
    }, () => {
      CONFIG.CONVEX_URL = message.convexUrl;
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'LOGOUT') {
    chrome.storage.sync.remove(['authToken', 'convexUrl'], () => {
      CONFIG.CONVEX_URL = null;
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'GET_CONFIG') {
    sendResponse({
      convexUrl: CONFIG.CONVEX_URL,
      websiteUrl: CONFIG.WEBSITE_URL
    });
    return false;
  }
});

// Get authentication status
async function getAuthStatus() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['authToken', 'convexUrl'], (result) => {
      resolve({
        isAuthenticated: !!(result.authToken && result.convexUrl),
        convexUrl: result.convexUrl
      });
    });
  });
}

// Handle sync request
async function handleSync(data) {
  console.log('[UnifyChats] Starting sync...');
  console.log('[UnifyChats] Data to sync:', data?.provider, data?.messages?.length, 'messages');

  const { authToken, convexUrl } = await new Promise((resolve) => {
    chrome.storage.sync.get(['authToken', 'convexUrl'], resolve);
  });

  console.log('[UnifyChats] Auth status:', { hasToken: !!authToken, hasUrl: !!convexUrl });

  if (!authToken || !convexUrl) {
    throw new Error('Not authenticated. Please connect to UnifyChats first.');
  }

  // Construct the HTTP endpoint URL (Convex HTTP routes)
  // convexUrl is like https://xxx.convex.cloud, HTTP endpoint is at same domain
  const syncUrl = convexUrl.replace('.convex.cloud', '.convex.site') + '/sync';
  console.log('[UnifyChats] Sync URL:', syncUrl);

  try {
    const response = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(data)
    });

    console.log('[UnifyChats] Response status:', response.status);

    const result = await response.json();
    console.log('[UnifyChats] Response:', result);

    if (!response.ok) {
      throw new Error(result.error || 'Sync failed');
    }

    return result;
  } catch (error) {
    console.error('[UnifyChats] Sync error:', error);
    throw error;
  }
}

// Listen for messages from the website (for auth token transfer)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  // Only accept messages from our website
  if (!sender.url?.startsWith(CONFIG.WEBSITE_URL)) {
    sendResponse({ success: false, error: 'Unauthorized' });
    return;
  }

  if (message.type === 'SET_AUTH_TOKEN') {
    chrome.storage.sync.set({
      authToken: message.token,
      convexUrl: message.convexUrl
    }, () => {
      CONFIG.CONVEX_URL = message.convexUrl;
      sendResponse({ success: true });
    });
    return true;
  }
});
