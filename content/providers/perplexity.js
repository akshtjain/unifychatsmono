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
    // Perplexity uses a main content area for the conversation
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
    // Try to find message blocks - Perplexity groups query and answer pairs
    // Look for query blocks (user questions)
    const queries = document.querySelectorAll('[class*="Query"], [class*="query-text"], [class*="UserQuery"]');

    // Look for answer blocks (AI responses)
    const answers = document.querySelectorAll('[class*="Answer"], [class*="answer-text"], [class*="prose"]');

    // Alternative: Look for the combined thread message structure
    let threadMessages = document.querySelectorAll('[class*="ThreadMessage"]');

    if (threadMessages.length > 0) {
      return threadMessages;
    }

    // Try finding messages by their container structure
    // Perplexity often has question-answer pairs in sections
    const sections = document.querySelectorAll('main section, [role="article"]');
    if (sections.length > 0) {
      return sections;
    }

    // Fallback: combine queries and answers
    const allElements = [...queries, ...answers];

    if (allElements.length > 0) {
      // Sort by DOM position to maintain order
      allElements.sort((a, b) => {
        const position = a.compareDocumentPosition(b);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
      return allElements;
    }

    // Last resort: look for any divs with substantial text content in main area
    const mainContent = document.querySelector('main');
    if (mainContent) {
      // Look for direct children that might be message containers
      const potentialMessages = mainContent.querySelectorAll(':scope > div > div');
      return potentialMessages;
    }

    return [];
  },

  // Extract message data from a message element
  parseMessage(element) {
    const classList = element.className || '';
    const textContent = element.textContent || '';

    // Detect if this is a user query or AI answer
    // User queries typically:
    // - Have "Query" or "question" in class name
    // - Are shorter
    // - Don't have citations/sources

    const isQueryClass = /query|question|user/i.test(classList);
    const isAnswerClass = /answer|response|prose|result/i.test(classList);

    // Check for citations/sources which indicate AI response
    const hasCitations = element.querySelector('[class*="citation"], [class*="source"], [class*="Citation"], a[href*="source"]') !== null;

    // Check for "Ask follow-up" or similar UI elements
    const hasFollowUp = element.querySelector('[class*="follow"], button[class*="related"]') !== null;

    // Answers typically have structured content
    const hasStructuredContent = element.querySelectorAll('h1, h2, h3, ul, ol, pre, code').length > 0;

    // Determine role based on signals
    let isUser = false;

    if (isQueryClass && !isAnswerClass) {
      isUser = true;
    } else if (isAnswerClass || hasCitations || hasFollowUp || hasStructuredContent) {
      isUser = false;
    } else {
      // Heuristic: user messages tend to be shorter
      isUser = textContent.length < 300 && !hasCitations;
    }

    // Get text content
    let text = '';

    // For answers, try to get the main prose content
    if (!isUser) {
      const proseEl = element.querySelector('[class*="prose"], [class*="markdown"], [class*="AnswerText"]');
      if (proseEl) {
        const firstPara = proseEl.querySelector('p');
        text = firstPara ? firstPara.textContent.trim() : proseEl.textContent.trim();
      } else {
        text = textContent.trim();
      }
    } else {
      // For queries, get the direct text
      const queryTextEl = element.querySelector('[class*="query-text"], [class*="QueryText"], span');
      text = queryTextEl ? queryTextEl.textContent.trim() : textContent.trim();
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
