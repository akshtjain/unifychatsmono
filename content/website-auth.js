/**
 * UnifyChats - Website Auth Content Script
 * Runs on the UnifyChats website to transfer auth tokens to the extension
 */

(function() {
  'use strict';

  // Check for auth data in localStorage on page load
  function checkForAuthToken() {
    try {
      const authData = localStorage.getItem('unifychats_extension_auth');
      if (authData) {
        const { token, convexUrl, timestamp } = JSON.parse(authData);

        // Only use tokens less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          // Send to background script
          chrome.runtime.sendMessage({
            type: 'SET_AUTH_TOKEN',
            token: token,
            convexUrl: convexUrl
          }, (response) => {
            if (response?.success) {
              console.log('[UnifyChats] Extension connected successfully!');
              // Clear the token from localStorage after successful transfer
              localStorage.removeItem('unifychats_extension_auth');
              // Dispatch event so the website knows connection succeeded
              window.dispatchEvent(new CustomEvent('unifychats-extension-connected'));
            }
          });
        } else {
          // Token expired, clean up
          localStorage.removeItem('unifychats_extension_auth');
        }
      }
    } catch (err) {
      console.error('[UnifyChats] Error checking auth token:', err);
    }
  }

  // Listen for storage changes (in case user generates token while page is open)
  window.addEventListener('storage', (event) => {
    if (event.key === 'unifychats_extension_auth' && event.newValue) {
      checkForAuthToken();
    }
  });

  // Also listen for custom event from the website
  window.addEventListener('unifychats-token-generated', () => {
    checkForAuthToken();
  });

  // Check on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkForAuthToken);
  } else {
    checkForAuthToken();
  }

  // Re-check periodically in case the token was set after initial load
  // (This handles the case where user clicks "Generate Token" on the page)
  const observer = new MutationObserver(() => {
    checkForAuthToken();
  });

  // Observe for any DOM changes which might indicate the token was generated
  observer.observe(document.body, { childList: true, subtree: true });

  // Clean up observer after 30 seconds (token should be transferred by then)
  setTimeout(() => observer.disconnect(), 30000);
})();
