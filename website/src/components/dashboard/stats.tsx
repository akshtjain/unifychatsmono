"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function DashboardStats() {
  const stats = useQuery(api.conversations.stats);

  if (stats === undefined) {
    // Loading state
    return (
      <div className="grid md:grid-cols-4 gap-4 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 bg-card rounded-2xl border border-border animate-pulse"
          >
            <div className="h-4 w-24 bg-secondary rounded mb-2" />
            <div className="h-8 w-16 bg-secondary rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (stats === null) {
    // Not authenticated or error
    return (
      <div className="grid md:grid-cols-4 gap-4 mb-12">
        <div className="p-6 bg-card rounded-2xl border border-border">
          <p className="text-muted-foreground text-sm mb-1">Total Conversations</p>
          <p className="text-3xl font-bold text-foreground">—</p>
          <p className="text-muted-foreground/60 text-xs mt-2">Sign in to sync</p>
        </div>
        <div className="p-6 bg-card rounded-2xl border border-border">
          <p className="text-muted-foreground text-sm mb-1">Messages Indexed</p>
          <p className="text-3xl font-bold text-foreground">—</p>
          <p className="text-muted-foreground/60 text-xs mt-2">Sign in to sync</p>
        </div>
        <div className="p-6 bg-card rounded-2xl border border-border">
          <p className="text-muted-foreground text-sm mb-1">Bookmarks</p>
          <p className="text-3xl font-bold text-foreground">—</p>
          <p className="text-muted-foreground/60 text-xs mt-2">Sign in to sync</p>
        </div>
        <div className="p-6 bg-card rounded-2xl border border-border">
          <p className="text-muted-foreground text-sm mb-1">Connected Platforms</p>
          <p className="text-3xl font-bold text-foreground">—</p>
          <p className="text-muted-foreground/60 text-xs mt-2">Sign in to sync</p>
        </div>
      </div>
    );
  }

  const connectedPlatforms = Object.values(stats.byProvider).filter(
    (count) => count > 0
  ).length;

  return (
    <div className="grid md:grid-cols-4 gap-4 mb-12">
      <div className="p-6 bg-card rounded-2xl border border-border">
        <p className="text-muted-foreground text-sm mb-1">Total Conversations</p>
        <p className="text-3xl font-bold text-foreground">
          {stats.totalConversations}
        </p>
        <p className="text-muted-foreground/60 text-xs mt-2">
          Across {connectedPlatforms} platform
          {connectedPlatforms !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="p-6 bg-card rounded-2xl border border-border">
        <p className="text-muted-foreground text-sm mb-1">Messages Indexed</p>
        <p className="text-3xl font-bold text-foreground">{stats.totalMessages}</p>
        <p className="text-muted-foreground/60 text-xs mt-2">Searchable messages</p>
      </div>
      <div className="p-6 bg-card rounded-2xl border border-border">
        <p className="text-muted-foreground text-sm mb-1">Bookmarks</p>
        <p className="text-3xl font-bold text-foreground">{stats.totalBookmarks}</p>
        <p className="text-muted-foreground/60 text-xs mt-2">Saved messages</p>
      </div>
      <div className="p-6 bg-card rounded-2xl border border-border">
        <p className="text-muted-foreground text-sm mb-1">Connected Platforms</p>
        <p className="text-3xl font-bold text-foreground">{connectedPlatforms}</p>
        <p className="text-muted-foreground/60 text-xs mt-2">of 5 available</p>
      </div>
    </div>
  );
}

export function PlatformStats() {
  const stats = useQuery(api.conversations.stats);

  if (!stats) return null;

  const platforms = [
    { id: "chatgpt", name: "ChatGPT", color: "text-platform-chatgpt" },
    { id: "claude", name: "Claude", color: "text-platform-claude" },
    { id: "gemini", name: "Gemini", color: "text-platform-gemini" },
    { id: "grok", name: "Grok", color: "text-platform-grok" },
    { id: "perplexity", name: "Perplexity", color: "text-platform-perplexity" },
  ] as const;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {platforms.map((platform) => {
        const count = stats.byProvider[platform.id];
        return (
          <div
            key={platform.id}
            className="p-4 bg-card rounded-xl border border-border"
          >
            <p className={`text-sm font-medium ${platform.color}`}>
              {platform.name}
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">{count}</p>
            <p className="text-muted-foreground/60 text-xs">conversation{count !== 1 ? "s" : ""}</p>
          </div>
        );
      })}
    </div>
  );
}

// Compact stats for sidebar
export function CompactStats() {
  const stats = useQuery(api.conversations.stats);

  if (stats === undefined) {
    return (
      <div className="p-4 bg-card rounded-xl border border-border">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-3 w-20 bg-secondary rounded animate-pulse" />
              <div className="h-4 w-8 bg-secondary rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stats === null) return null;

  const platforms = [
    { id: "chatgpt", name: "ChatGPT", color: "bg-platform-chatgpt" },
    { id: "claude", name: "Claude", color: "bg-platform-claude" },
    { id: "gemini", name: "Gemini", color: "bg-platform-gemini" },
    { id: "grok", name: "Grok", color: "bg-platform-grok" },
    { id: "perplexity", name: "Perplexity", color: "bg-platform-perplexity" },
  ] as const;

  const activePlatforms = platforms.filter(p => stats.byProvider[p.id] > 0);

  return (
    <div className="p-4 bg-card rounded-xl border border-border">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        Quick Stats
      </p>

      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Conversations</span>
          <span className="text-sm font-semibold text-foreground">{stats.totalConversations}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Messages</span>
          <span className="text-sm font-semibold text-foreground">{stats.totalMessages}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Saved</span>
          <span className="text-sm font-semibold text-foreground">{stats.totalBookmarks}</span>
        </div>
      </div>

      {activePlatforms.length > 0 && (
        <div className="border-t border-border mt-3 pt-3">
          <p className="text-xs text-muted-foreground mb-2">By Platform</p>
          <div className="space-y-1.5">
            {activePlatforms.map((platform) => (
              <div
                key={platform.id}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className={`w-2 h-2 rounded-full ${platform.color}`} />
                  {platform.name}
                </span>
                <span className="text-foreground font-medium">{stats.byProvider[platform.id]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
