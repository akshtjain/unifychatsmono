"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, User, Bot, Copy, Check } from "lucide-react";
import { useState } from "react";

type Provider = "chatgpt" | "claude" | "gemini" | "grok" | "perplexity";

const providerColors: Record<Provider, string> = {
  chatgpt: "bg-platform-chatgpt/10 text-platform-chatgpt border-platform-chatgpt/20",
  claude: "bg-platform-claude/10 text-platform-claude border-platform-claude/20",
  gemini: "bg-platform-gemini/10 text-platform-gemini border-platform-gemini/20",
  grok: "bg-platform-grok/10 text-platform-grok border-platform-grok/20",
  perplexity: "bg-platform-perplexity/10 text-platform-perplexity border-platform-perplexity/20",
};

const providerBgColors: Record<Provider, string> = {
  chatgpt: "bg-platform-chatgpt",
  claude: "bg-platform-claude",
  gemini: "bg-platform-gemini",
  grok: "bg-platform-grok",
  perplexity: "bg-platform-perplexity",
};

const providerNames: Record<Provider, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  grok: "Grok",
  perplexity: "Perplexity",
};

interface ChatReaderProps {
  conversationId: Id<"conversations"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function MessageBubble({
  role,
  content,
  provider,
}: {
  role: "user" | "assistant";
  content: string;
  provider: Provider;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-primary text-primary-foreground"
            : `${providerBgColors[provider]} text-white`
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message */}
      <div
        className={`group relative max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-secondary text-foreground rounded-tl-sm"
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
          {content}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`absolute -bottom-8 ${isUser ? "right-0" : "left-0"} opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-muted-foreground`}
          title="Copy message"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

export function ChatReader({
  conversationId,
  open,
  onOpenChange,
}: ChatReaderProps) {
  const conversation = useQuery(
    api.conversations.get,
    conversationId ? { conversationId } : "skip"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg font-semibold truncate">
                {conversation?.title || "Untitled Conversation"}
              </DialogTitle>
              <div className="flex items-center gap-3 mt-2">
                {conversation && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${providerColors[conversation.provider]}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${providerBgColors[conversation.provider]}`}
                    />
                    {providerNames[conversation.provider]}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {conversation?.messages.length} messages
                </span>
                {conversation?.url && (
                  <a
                    href={conversation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-xs hover:underline inline-flex items-center gap-1"
                  >
                    Open original
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-6">
            {conversation === undefined ? (
              // Loading state
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${i % 2 === 1 ? "flex-row-reverse" : ""}`}
                  >
                    <div className="h-8 w-8 rounded-full bg-secondary animate-pulse" />
                    <div
                      className={`h-20 rounded-2xl bg-secondary animate-pulse ${
                        i % 2 === 1 ? "w-48" : "w-64"
                      }`}
                    />
                  </div>
                ))}
              </div>
            ) : conversation === null ? (
              // Not found state
              <div className="text-center py-12 text-muted-foreground">
                Conversation not found
              </div>
            ) : conversation.messages.length === 0 ? (
              // Empty state
              <div className="text-center py-12 text-muted-foreground">
                No messages in this conversation
              </div>
            ) : (
              // Messages
              conversation.messages.map((message) => (
                <MessageBubble
                  key={message._id}
                  role={message.role}
                  content={message.content}
                  provider={conversation.provider}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
