/**
 * UnifyChats - Popup Script
 */

const SUPPORTED_HOSTS = {
  'chat.openai.com': 'ChatGPT',
  'chatgpt.com': 'ChatGPT',
  'claude.ai': 'Claude',
  'gemini.google.com': 'Gemini',
  'grok.com': 'Grok',
  'x.com': 'Grok (X)'
};

// Use shared config (loaded from config.js)
const WEBSITE_URL = CONFIG.WEBSITE_URL;

// Check current tab status
async function checkCurrentTab() {
  const providerEl = document.getElementById('current-provider');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab && tab.url) {
      const url = new URL(tab.url);
      const provider = SUPPORTED_HOSTS[url.hostname];

      if (provider) {
        providerEl.textContent = provider;
        providerEl.classList.add('status-active');
      } else {
        providerEl.textContent = 'Not supported';
        providerEl.classList.add('status-inactive');
      }
    } else {
      providerEl.textContent = 'Unknown';
      providerEl.classList.add('status-inactive');
    }
  } catch (err) {
    providerEl.textContent = 'Error';
    providerEl.classList.add('status-inactive');
  }
}

// Check authentication status
async function checkAuthStatus() {
  const authDot = document.getElementById('auth-dot');
  const authText = document.getElementById('auth-text');
  const authBtn = document.getElementById('auth-btn');
  const authBtnText = document.getElementById('auth-btn-text');
  const syncStats = document.getElementById('sync-stats');

  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' }, resolve);
    });

    if (response?.isAuthenticated) {
      // Connected
      authDot.classList.add('connected');
      authText.textContent = 'Connected to UnifyChats';
      authBtn.classList.remove('connect');
      authBtn.classList.add('disconnect');
      authBtnText.textContent = 'Open Dashboard';
      syncStats.classList.add('visible');
      syncStats.textContent = 'Use the Sync button in the panel to save conversations.';

      authBtn.onclick = () => {
        window.open(`${WEBSITE_URL}/dashboard`, '_blank');
      };
    } else {
      // Not connected
      authDot.classList.remove('connected');
      authText.textContent = 'Not connected';
      authBtn.classList.add('connect');
      authBtn.classList.remove('disconnect');
      authBtnText.textContent = 'Connect to UnifyChats';
      syncStats.classList.remove('visible');

      authBtn.onclick = () => {
        window.open(`${WEBSITE_URL}/dashboard?connect=extension`, '_blank');
      };
    }
  } catch (err) {
    authText.textContent = 'Error checking status';
    authBtn.onclick = () => {
      window.open(`${WEBSITE_URL}/dashboard`, '_blank');
    };
  }
}

// Initialize
checkCurrentTab();
checkAuthStatus();
