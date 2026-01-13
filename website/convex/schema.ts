import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const providerType = v.union(
  v.literal("chatgpt"),
  v.literal("claude"),
  v.literal("gemini"),
  v.literal("grok")
);

export default defineSchema({
  // User conversations synced from different AI platforms
  conversations: defineTable({
    userId: v.string(), // Clerk user ID
    provider: providerType,
    externalId: v.string(), // Conversation ID from the AI platform
    title: v.optional(v.string()),
    url: v.optional(v.string()), // Original URL of the conversation
    messageCount: v.number(),
    lastSyncedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_provider", ["userId", "provider"])
    .index("by_external", ["userId", "provider", "externalId"]),

  // Individual messages within conversations
  messages: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(), // Denormalized for easier querying
    provider: providerType,
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    preview: v.string(), // First 100 chars for quick display
    externalIndex: v.number(), // Position in original conversation
    timestamp: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user", ["userId"])
    .index("by_user_provider", ["userId", "provider"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["userId", "provider", "role"],
    }),

  // User bookmarks for specific messages
  bookmarks: defineTable({
    userId: v.string(),
    messageId: v.id("messages"),
    conversationId: v.id("conversations"),
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_message", ["messageId"])
    .index("by_conversation", ["conversationId"]),

  // Export history for tracking user exports
  exports: defineTable({
    userId: v.string(),
    conversationIds: v.array(v.id("conversations")),
    format: v.union(v.literal("json"), v.literal("markdown"), v.literal("pdf")),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    downloadUrl: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // Sync tokens for incremental sync from extension
  syncTokens: defineTable({
    userId: v.string(),
    provider: providerType,
    token: v.string(), // Opaque token for resuming sync
    lastSyncAt: v.number(),
  }).index("by_user_provider", ["userId", "provider"]),
});
