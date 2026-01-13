import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
