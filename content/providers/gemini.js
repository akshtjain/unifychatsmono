/**
 * Gemini provider configuration
 * Matches: gemini.google.com
 */
window.AIChatIndexProviders = window.AIChatIndexProviders || {};

window.AIChatIndexProviders.gemini = {
  id: 'gemini',
  name: 'Gemini',

  // Check if we're on a Gemini page
  isActive() {
    return window.location.hostname === 'gemini.google.com';
  },

  // Get the conversation title from the page
  getTitle() {
    // Try to get the title from the conversation title span
    const titleEl = document.querySelector('.conversation-title') ||
                    document.querySelector('[class*="conversation-title"]') ||
                    document.querySelector('.gds-title-m');
    if (titleEl && titleEl.textContent.trim()) {
      return titleEl.textContent.trim();
    }
    return null;
  },

  // Selector for the container that holds all messages
  getConversationContainer() {
    return document.querySelector('.conversation-container') ||
           document.querySelector('main');
  },

  // Selector for individual message elements
  getMessageSelector() {
    return '.user-query-container, .model-response-container, .response-container, message-content';
  },

  // Get all message elements
  getMessages() {
    // Get user queries - filter to only get non-nested containers
    const allUserContainers = document.querySelectorAll('.user-query-container');
    const userMessages = [];

    allUserContainers.forEach(container => {
      // Only include if this container is not inside another .user-query-container
      const parent = container.parentElement?.closest('.user-query-container');
      if (!parent) {
        userMessages.push(container);
      }
    });

    // Get model responses - use model-response custom element
    const modelMessages = document.querySelectorAll('model-response');

    // Combine and sort by DOM order
    const allElements = [...userMessages, ...modelMessages];

    if (allElements.length > 0) {
      // Sort by document position to maintain conversation order
      allElements.sort((a, b) => {
        const position = a.compareDocumentPosition(b);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
      return allElements;
    }

    // Fallback: try custom elements
    let messages = document.querySelectorAll('message-content');

    if (messages.length === 0) {
      // Another pattern Gemini might use
      messages = document.querySelectorAll('.conversation-turn');
    }

    return messages;
  },

  // Extract message data from a message element
  parseMessage(element) {
    const tagName = element.tagName?.toLowerCase() || '';
    const classList = element.className || '';

    // Check if it's a user message by class
    const isUser = classList.includes('user-query-container');
    // Check if it's a model response by tag name
    const isAssistant = tagName === 'model-response';

    // Get the text content based on message type
    let text = '';
    if (isUser) {
      // User message: look for query text
      const queryText = element.querySelector('.query-text-line') ||
                        element.querySelector('.query-text') ||
                        element.querySelector('[class*="query-text"]');
      text = queryText ? queryText.textContent.trim() : element.textContent.trim();
    } else {
      // Assistant message: look for markdown panel or response text
      const responseText = element.querySelector('.markdown-main-panel') ||
                           element.querySelector('.model-response-text') ||
                           element.querySelector('p');
      text = responseText ? responseText.textContent.trim() : element.textContent.trim();
    }

    const role = isUser ? 'user' : 'assistant';

    return {
      element,
      role: role,
      preview: text.substring(0, 50).replace(/\n/g, ' '),
      fullText: text
    };
  }
};
