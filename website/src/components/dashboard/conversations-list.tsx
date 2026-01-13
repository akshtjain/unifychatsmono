"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";

type Provider = "chatgpt" | "claude" | "gemini" | "grok";

const providerColors: Record<Provider, string> = {
  chatgpt: "bg-platform-chatgpt/10 text-platform-chatgpt border-platform-chatgpt/20",
  claude: "bg-platform-claude/10 text-platform-claude border-platform-claude/20",
  gemini: "bg-platform-gemini/10 text-platform-gemini border-platform-gemini/20",
  grok: "bg-platform-grok/10 text-platform-grok border-platform-grok/20",
};

const providerNames: Record<Provider, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  grok: "Grok",
};

export function ConversationsList() {
  const [selectedProvider, setSelectedProvider] = useState<Provider | undefined>();
  const conversations = useQuery(api.conversations.list, {
    provider: selectedProvider,
  });
  const removeConversation = useMutation(api.conversations.remove);

  const [deletingId, setDeletingId] = useState<Id<"conversations"> | null>(null);

  const handleDelete = async (id: Id<"conversations">) => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      setDeletingId(id);
      try {
        await removeConversation({ conversationId: id });
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (conversations === undefined) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 bg-card rounded-xl border border-border animate-pulse"
          >
            <div className="h-5 w-48 bg-secondary rounded mb-2" />
            <div className="h-4 w-24 bg-secondary rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setSelectedProvider(undefined)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedProvider === undefined
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {(["chatgpt", "claude", "gemini", "grok"] as Provider[]).map(
          (provider) => (
            <button
              key={provider}
              onClick={() => setSelectedProvider(provider)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedProvider === provider
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {providerNames[provider]}
            </button>
          )
        )}
      </div>

      {/* Conversations list */}
      {conversations.length === 0 ? (
        <div className="p-8 bg-card rounded-xl border border-border text-center">
          <p className="text-muted-foreground">No conversations synced yet.</p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            Use the extension to sync your AI chats.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              className="p-4 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium border ${
                        providerColors[conv.provider]
                      }`}
                    >
                      {providerNames[conv.provider]}
                    </span>
                    <span className="text-muted-foreground/60 text-xs">
                      {conv.messageCount} messages
                    </span>
                  </div>
                  <h3 className="text-foreground font-medium truncate">
                    {conv.title || "Untitled Conversation"}
                  </h3>
                  {conv.url && (
                    <a
                      href={conv.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline"
                    >
                      Open original
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(conv._id)}
                  disabled={deletingId === conv._id}
                  className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                  title="Delete conversation"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
