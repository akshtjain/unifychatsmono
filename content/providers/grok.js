/**
 * Grok provider configuration
 * Matches: grok.com, x.com/i/grok
 */
window.AIChatIndexProviders = window.AIChatIndexProviders || {};

window.AIChatIndexProviders.grok = {
  id: 'grok',
  name: 'Grok',

  // Check if we're on a Grok page
  isActive() {
    return window.location.hostname === 'grok.com' ||
           (window.location.hostname === 'x.com' && window.location.pathname.includes('/i/grok'));
  },

  // Selector for the container that holds all messages
  getConversationContainer() {
    return document.querySelector('#last-reply-container')?.parentElement ||
           document.querySelector('main');
  },

  // Selector for individual message elements
  getMessageSelector() {
    return '.message-bubble, [id^="response-"]';
  },

  // Get all message elements
  getMessages() {
    // Look for message bubbles which contain both user and assistant messages
    const messageBubbles = document.querySelectorAll('.message-bubble');

    if (messageBubbles.length > 0) {
      return messageBubbles;
    }

    // Fallback: look for response containers
    const responses = document.querySelectorAll('[id^="response-"]');
    if (responses.length > 0) {
      return responses;
    }

    // Try other patterns
    let messages = document.querySelectorAll('.response-content-markdown');
    return messages;
  },

  // Extract message data from a message element
  parseMessage(element) {
    const classList = element.className || '';

    // Check if this contains a thinking container (indicates assistant response)
    const hasThinking = element.querySelector('.thinking-container') !== null;
    // Check if it has multiple paragraphs, headings, or lists (likely assistant)
    const hasStructuredContent = element.querySelectorAll('h3, h4, ul, ol').length > 0;
    // Check for response-content-markdown with substantial content
    const markdownContent = element.querySelector('.response-content-markdown');
    const contentLength = markdownContent ? markdownContent.textContent.length : element.textContent.length;

    // User messages are typically short and don't have thinking containers or structured content
    const isAssistant = hasThinking || hasStructuredContent || contentLength > 200;

    // Get the text content
    let text = '';
    if (markdownContent) {
      // Get first paragraph for preview
      const firstP = markdownContent.querySelector('p');
      text = firstP ? firstP.textContent.trim() : markdownContent.textContent.trim();
    } else {
      const contentEl = element.querySelector('p') || element;
      text = contentEl.textContent.trim();
    }

    return {
      element,
      role: isAssistant ? 'assistant' : 'user',
      preview: text.substring(0, 50).replace(/\n/g, ' '),
      fullText: text
    };
  }
};
