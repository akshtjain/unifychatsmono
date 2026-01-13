/**
 * ChatGPT provider configuration
 * Matches: chat.openai.com, chatgpt.com
 */
window.AIChatIndexProviders = window.AIChatIndexProviders || {};

window.AIChatIndexProviders.chatgpt = {
  id: 'chatgpt',
  name: 'ChatGPT',

  // Check if we're on a ChatGPT page
  isActive() {
    return window.location.hostname === 'chat.openai.com' ||
           window.location.hostname === 'chatgpt.com';
  },

  // Selector for the container that holds all messages
  getConversationContainer() {
    return document.querySelector('main [class*="react-scroll-to-bottom"]') ||
           document.querySelector('main');
  },

  // Selector for individual message elements
  getMessageSelector() {
    return '[data-message-author-role]';
  },

  // Get all message elements
  getMessages() {
    return document.querySelectorAll(this.getMessageSelector());
  },

  // Extract message data from a message element
  parseMessage(element) {
    const role = element.getAttribute('data-message-author-role');
    const isUser = role === 'user';

    // Get the text content
    const contentEl = element.querySelector('.markdown, .whitespace-pre-wrap');
    const text = contentEl ? contentEl.textContent.trim() : element.textContent.trim();

    return {
      element,
      role: isUser ? 'user' : 'assistant',
      preview: text.substring(0, 50).replace(/\n/g, ' '),
      fullText: text
    };
  }
};
