import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { providerType } from "./schema";

// Get all bookmarks for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Fetch message and conversation details for each bookmark
    const results = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const message = await ctx.db.get(bookmark.messageId);
        const conversation = await ctx.db.get(bookmark.conversationId);

        return {
          ...bookmark,
          message: message
            ? {
                role: message.role,
                preview: message.preview,
                content: message.content,
                provider: message.provider,
              }
            : null,
          conversation: conversation
            ? {
                title: conversation.title,
                url: conversation.url,
                provider: conversation.provider,
              }
            : null,
        };
      })
    );

    return results;
  },
});

// Add a bookmark
export const add = mutation({
  args: {
    messageId: v.id("messages"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify the message exists and belongs to the user
    const message = await ctx.db.get(args.messageId);
    if (!message || message.userId !== userId) {
      throw new Error("Message not found");
    }

    // Check if already bookmarked
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .first();

    if (existing) {
      // Update existing bookmark
      await ctx.db.patch(existing._id, {
        note: args.note,
      });
      return existing._id;
    }

    // Create new bookmark
    const bookmarkId = await ctx.db.insert("bookmarks", {
      userId,
      messageId: args.messageId,
      conversationId: message.conversationId,
      note: args.note,
      createdAt: Date.now(),
    });

    return bookmarkId;
  },
});

// Remove a bookmark
export const remove = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== identity.subject) {
      throw new Error("Bookmark not found");
    }

    await ctx.db.delete(args.bookmarkId);
  },
});

// Update bookmark note
export const updateNote = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== identity.subject) {
      throw new Error("Bookmark not found");
    }

    await ctx.db.patch(args.bookmarkId, {
      note: args.note,
    });
  },
});

// Toggle bookmark - add if not exists, remove if exists
export const toggle = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify the message exists and belongs to the user
    const message = await ctx.db.get(args.messageId);
    if (!message || message.userId !== userId) {
      throw new Error("Message not found");
    }

    // Check if already bookmarked
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .first();

    if (existing && existing.userId === userId) {
      // Remove existing bookmark
      await ctx.db.delete(existing._id);
      return { bookmarked: false, bookmarkId: null };
    }

    // Create new bookmark
    const bookmarkId = await ctx.db.insert("bookmarks", {
      userId,
      messageId: args.messageId,
      conversationId: message.conversationId,
      createdAt: Date.now(),
    });

    return { bookmarked: true, bookmarkId };
  },
});

// Get bookmark status for multiple messages (batch query)
export const getByMessages = query({
  args: {
    messageIds: v.array(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {};
    }

    const userId = identity.subject;
    const result: Record<string, { bookmarkId: string; note?: string }> = {};

    // Query bookmarks for each message
    await Promise.all(
      args.messageIds.map(async (messageId) => {
        const bookmark = await ctx.db
          .query("bookmarks")
          .withIndex("by_message", (q) => q.eq("messageId", messageId))
          .first();

        if (bookmark && bookmark.userId === userId) {
          result[messageId] = {
            bookmarkId: bookmark._id,
            note: bookmark.note,
          };
        }
      })
    );

    return result;
  },
});

// Internal mutation to toggle bookmark by message index (used by HTTP endpoint for extension)
export const toggleByIndexInternal = internalMutation({
  args: {
    userId: v.string(),
    provider: providerType,
    externalId: v.string(),
    messageIndex: v.number(),
  },
  handler: async (ctx, args) => {
    // Find the conversation
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_external", (q) =>
        q
          .eq("userId", args.userId)
          .eq("provider", args.provider)
          .eq("externalId", args.externalId)
      )
      .first();

    if (!conversation) {
      throw new Error("Conversation not found. Please sync the conversation first.");
    }

    // Find the message by index
    const message = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
      .filter((q) => q.eq(q.field("externalIndex"), args.messageIndex))
      .first();

    if (!message) {
      throw new Error("Message not found. Please sync the conversation first.");
    }

    // Check if already bookmarked
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_message", (q) => q.eq("messageId", message._id))
      .first();

    if (existing && existing.userId === args.userId) {
      // Remove existing bookmark
      await ctx.db.delete(existing._id);
      return { bookmarked: false, messageIndex: args.messageIndex };
    }

    // Create new bookmark
    await ctx.db.insert("bookmarks", {
      userId: args.userId,
      messageId: message._id,
      conversationId: conversation._id,
      createdAt: Date.now(),
    });

    return { bookmarked: true, messageIndex: args.messageIndex };
  },
});

// Internal query to get bookmark status for a conversation (used by HTTP endpoint)
export const getStatusByConversationInternal = internalQuery({
  args: {
    userId: v.string(),
    provider: providerType,
    externalId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the conversation
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_external", (q) =>
        q
          .eq("userId", args.userId)
          .eq("provider", args.provider)
          .eq("externalId", args.externalId)
      )
      .first();

    if (!conversation) {
      return [];
    }

    // Get all bookmarks for this conversation
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    // Get the message indices for each bookmark
    const bookmarkedIndices: number[] = [];
    for (const bookmark of bookmarks) {
      const message = await ctx.db.get(bookmark.messageId);
      if (message) {
        bookmarkedIndices.push(message.externalIndex);
      }
    }

    return bookmarkedIndices;
  },
});
