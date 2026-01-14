"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useMemo } from "react";
import { BookmarkButton } from "./bookmark-button";
import { Id } from "../../../convex/_generated/dataModel";

type Provider = "chatgpt" | "claude" | "gemini" | "grok";

const providerColors: Record<Provider, string> = {
  chatgpt: "bg-platform-chatgpt/10 text-platform-chatgpt",
  claude: "bg-platform-claude/10 text-platform-claude",
  gemini: "bg-platform-gemini/10 text-platform-gemini",
  grok: "bg-platform-grok/10 text-platform-grok",
};

export function SearchMessages() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce the search
  const handleSearch = (value: string) => {
    setQuery(value);
    // Simple debounce
    setTimeout(() => {
      setDebouncedQuery(value);
    }, 300);
  };

  const results = useQuery(
    api.messages.search,
    debouncedQuery.length >= 2 ? { query: debouncedQuery, limit: 20 } : "skip"
  );

  // Get message IDs for bookmark status lookup
  const messageIds = useMemo(
    () => (results ?? []).map((r) => r._id),
    [results]
  );

  // Query bookmark status for all results
  const bookmarkStatus = useQuery(
    api.bookmarks.getByMessages,
    messageIds.length > 0 ? { messageIds } : "skip"
  );

  return (
    <div>
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search across all your conversations..."
          className="w-full px-4 py-2.5 pl-10 pr-10 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setDebouncedQuery("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Clear search"
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results */}
      {query.length >= 2 && (
        <div className="mt-4 space-y-3">
          {results === undefined ? (
            <div className="p-4 bg-card rounded-xl border border-border animate-pulse">
              <div className="h-4 w-48 bg-secondary rounded" />
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 bg-card rounded-xl border border-border text-center">
              <p className="text-muted-foreground">No messages found for &quot;{query}&quot;</p>
            </div>
          ) : (
            results.map((result) => (
              <div
                key={result._id}
                className="p-4 bg-card rounded-xl border border-border group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          providerColors[result.provider]
                        }`}
                      >
                        {result.provider}
                      </span>
                      <span className="text-muted-foreground/60 text-xs capitalize">
                        {result.role}
                      </span>
                      {result.conversationTitle && (
                        <span className="text-muted-foreground/60 text-xs">
                          in {result.conversationTitle}
                        </span>
                      )}
                    </div>
                    <p className="text-foreground text-sm line-clamp-3">{result.content}</p>
                    {result.conversationUrl && (
                      <a
                        href={result.conversationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-xs hover:underline mt-2 inline-block"
                      >
                        Open conversation
                      </a>
                    )}
                  </div>
                  <BookmarkButton
                    messageId={result._id as Id<"messages">}
                    isBookmarked={!!bookmarkStatus?.[result._id]}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    size="sm"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
