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
  const authBtnIcon = document.getElementById('auth-btn-icon');
  const syncStats = document.getElementById('sync-stats');

  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' }, resolve);
    });

    if (response?.isAuthenticated) {
      // Connected - show success state
      authDot.classList.add('connected');
      authText.textContent = 'Signed in';
      authBtn.classList.remove('connect');
      authBtn.classList.add('disconnect');
      authBtnText.textContent = 'View Dashboard';
      // Change icon to external link
      authBtnIcon.innerHTML = '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>';
      syncStats.classList.add('visible');
      syncStats.textContent = 'Click the purple button on any chat to sync your conversations.';

      authBtn.onclick = () => {
        window.open(`${WEBSITE_URL}/dashboard`, '_blank');
      };
    } else {
      // Not connected - prompt to sign in
      authDot.classList.remove('connected');
      authText.textContent = 'Not signed in';
      authBtn.classList.add('connect');
      authBtn.classList.remove('disconnect');
      authBtnText.textContent = 'Sign in to sync';
      syncStats.classList.add('visible');
      syncStats.textContent = 'Sign in to save and search your AI conversations.';

      authBtn.onclick = () => {
        window.open(`${WEBSITE_URL}/dashboard?connect=extension`, '_blank');
      };
    }
  } catch (err) {
    authText.textContent = 'Connection error';
    authBtnText.textContent = 'Try again';
    authBtn.onclick = () => {
      window.open(`${WEBSITE_URL}/dashboard`, '_blank');
    };
  }
}

// Initialize
checkCurrentTab();
checkAuthStatus();
