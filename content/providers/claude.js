/**
 * Claude provider configuration
 * Matches: claude.ai
 */
window.AIChatIndexProviders = window.AIChatIndexProviders || {};

window.AIChatIndexProviders.claude = {
  id: 'claude',
  name: 'Claude',

  // Check if we're on a Claude page
  isActive() {
    return window.location.hostname === 'claude.ai';
  },

  // Selector for the container that holds all messages
  getConversationContainer() {
    return document.querySelector('[class*="conversation-content"]') ||
           document.querySelector('main') ||
           document.querySelector('[data-testid="conversation-turn-wrapper"]')?.parentElement;
  },

  // Selector for individual message elements
  getMessageSelector() {
    return '[data-testid="user-message"], [data-testid="assistant-message"], [data-testid="conversation-turn-wrapper"]';
  },

  // Get all message elements
  getMessages() {
    // Find user messages - look for the user message container with the bubble style
    const userMessages = document.querySelectorAll('[data-testid="user-message"]');

    // Find assistant messages - look for standard-markdown containers (Claude responses)
    const assistantMessages = document.querySelectorAll('.standard-markdown');

    // Combine and sort by DOM order
    const allElements = [...userMessages, ...assistantMessages];

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

    // Fallback approaches
    let messages = document.querySelectorAll('[data-testid="conversation-turn-wrapper"]');

    if (messages.length === 0) {
      messages = document.querySelectorAll('.font-user-message, .font-claude-message');
    }

    return messages;
  },

  // Extract message data from a message element
  parseMessage(element) {
    const testId = element.getAttribute('data-testid') || '';
    const classList = element.className || '';

    // Simple check: user messages have data-testid="user-message"
    // Assistant messages have class "standard-markdown"
    const isUser = testId === 'user-message';
    const isAssistant = classList.includes('standard-markdown');

    // Get the text content
    let text = '';
    if (isUser) {
      // User message - get text directly
      text = element.textContent.trim();
    } else if (isAssistant) {
      // Assistant message - get from the markdown content
      const firstPara = element.querySelector('.font-claude-response-body') ||
                        element.querySelector('p');
      text = firstPara ? firstPara.textContent.trim() : element.textContent.trim();
    } else {
      text = element.textContent.trim();
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
