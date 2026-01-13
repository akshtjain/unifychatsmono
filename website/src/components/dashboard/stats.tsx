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
        <p className="text-muted-foreground/60 text-xs mt-2">of 4 available</p>
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
