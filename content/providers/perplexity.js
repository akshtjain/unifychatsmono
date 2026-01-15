/**
 * Perplexity provider configuration
 * Matches: perplexity.ai
 */
window.AIChatIndexProviders = window.AIChatIndexProviders || {};

window.AIChatIndexProviders.perplexity = {
  id: 'perplexity',
  name: 'Perplexity',

  // Check if we're on a Perplexity page
  isActive() {
    return window.location.hostname === 'www.perplexity.ai' ||
           window.location.hostname === 'perplexity.ai';
  },

  // Selector for the container that holds all messages
  getConversationContainer() {
    return document.querySelector('[class*="ThreadLayout"]') ||
           document.querySelector('main') ||
           document.querySelector('[class*="ConversationThread"]');
  },

  // Selector for individual message elements
  getMessageSelector() {
    return '[class*="ThreadMessage"], [class*="QueryMessage"], [class*="AnswerMessage"]';
  },

  // Get all message elements
  getMessages() {
    const messages = [];
    const seen = new Set();

    // Find user queries - look for ANY element with group/query class
    // Initial query uses h1, follow-up queries use div
    const userQueries = document.querySelectorAll('[class*="group/query"]');
    userQueries.forEach(el => {
      // Skip if inside another group/query element (nested)
      const parent = el.parentElement?.closest('[class*="group/query"]');
      if (parent) return;

      // Skip if already seen or empty
      const textContent = el.textContent.trim();
      if (!textContent || textContent.length === 0) return;

      const key = 'user-' + textContent.substring(0, 50);
      if (!seen.has(key)) {
        seen.add(key);
        el.dataset.perplexityRole = 'user';
        messages.push(el);
      }
    });

    // Find AI answers - look for top-level prose containers
    // Be specific to avoid matching nested elements
    const proseContainers = document.querySelectorAll('div[class*="prose"][class*="dark:prose-invert"]');
    proseContainers.forEach(el => {
      // Skip if this is inside another prose container (nested)
      const parentProse = el.parentElement?.closest('[class*="prose"]');
      if (parentProse) return;

      // Skip if already processed
      const firstText = el.textContent.trim().substring(0, 50);
      const key = 'assistant-' + firstText;
      if (seen.has(key)) return;

      // Check if it has substantial text
      if (el.textContent.trim().length > 20) {
        seen.add(key);
        el.dataset.perplexityRole = 'assistant';
        messages.push(el);
      }
    });

    // Sort by DOM position to maintain order
    if (messages.length > 0) {
      messages.sort((a, b) => {
        const position = a.compareDocumentPosition(b);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
      return messages;
    }

    // Fallback: Look for markdown content containers
    const markdownContainers = document.querySelectorAll('[id*="markdown-content"]');
    if (markdownContainers.length > 0) {
      return Array.from(markdownContainers);
    }

    return [];
  },

  // Extract message data from a message element
  parseMessage(element) {
    const predeterminedRole = element.dataset.perplexityRole;
    const isUser = predeterminedRole === 'user';

    let text = '';

    if (isUser) {
      // For user queries - look for select-text span
      const queryTextEl = element.querySelector('.select-text') ||
                          element.querySelector('span[class*="select"]') ||
                          element.querySelector('span');
      text = queryTextEl ? queryTextEl.textContent.trim() : element.textContent.trim();
    } else {
      // For AI answers - get the first paragraph or the full text
      const firstPara = element.querySelector('p');
      if (firstPara) {
        text = firstPara.textContent.trim();
      } else {
        text = element.textContent.trim();
      }
    }

    // Clean up text - remove excess whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return {
      element,
      role: isUser ? 'user' : 'assistant',
      preview: text.substring(0, 50).replace(/\n/g, ' '),
      fullText: text
    };
  }
};
