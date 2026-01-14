import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { providerType } from "./schema";
import { internal } from "./_generated/api";

// Get all conversations for the current user
export const list = query({
  args: {
    provider: v.optional(providerType),
    projectId: v.optional(v.id("projects")),
    unassigned: v.optional(v.boolean()), // If true, only return conversations without a project
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    // Filter by project
    if (args.projectId !== undefined) {
      const conversations = await ctx.db
        .query("conversations")
        .withIndex("by_user_project", (q) =>
          q.eq("userId", userId).eq("projectId", args.projectId)
        )
        .order("desc")
        .collect();

      // Further filter by provider if specified
      if (args.provider) {
        return conversations.filter((c) => c.provider === args.provider);
      }
      return conversations;
    }

    // Filter for unassigned conversations only
    if (args.unassigned) {
      const allConversations = await ctx.db
        .query("conversations")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();

      const unassigned = allConversations.filter((c) => !c.projectId);

      if (args.provider) {
        return unassigned.filter((c) => c.provider === args.provider);
      }
      return unassigned;
    }

    // No project filter - return all or filter by provider
    if (args.provider) {
      return await ctx.db
        .query("conversations")
        .withIndex("by_user_provider", (q) =>
          q.eq("userId", userId).eq("provider", args.provider!)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get a single conversation with its messages
export const get = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      return null;
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    return {
      ...conversation,
      messages,
    };
  },
});

// Sync a conversation from the extension
export const sync = mutation({
  args: {
    provider: providerType,
    externalId: v.string(),
    title: v.optional(v.string()),
    url: v.optional(v.string()),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        index: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const now = Date.now();

    // Check if conversation already exists
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_external", (q) =>
        q
          .eq("userId", userId)
          .eq("provider", args.provider)
          .eq("externalId", args.externalId)
      )
      .unique();

    let conversationId;

    if (existing) {
      // Update existing conversation
      await ctx.db.patch(existing._id, {
        title: args.title ?? existing.title,
        url: args.url ?? existing.url,
        messageCount: args.messages.length,
        lastSyncedAt: now,
      });
      conversationId = existing._id;

      // Delete existing messages for re-sync
      const existingMessages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", existing._id)
        )
        .collect();

      for (const msg of existingMessages) {
        await ctx.db.delete(msg._id);
      }
    } else {
      // Create new conversation
      conversationId = await ctx.db.insert("conversations", {
        userId,
        provider: args.provider,
        externalId: args.externalId,
        title: args.title,
        url: args.url,
        messageCount: args.messages.length,
        lastSyncedAt: now,
        createdAt: now,
      });
    }

    // Insert all messages
    for (const msg of args.messages) {
      await ctx.db.insert("messages", {
        conversationId,
        userId,
        provider: args.provider,
        role: msg.role,
        content: msg.content,
        preview: msg.content.slice(0, 100),
        externalIndex: msg.index,
        timestamp: now,
      });
    }

    return conversationId;
  },
});

// Delete a conversation and its messages
export const remove = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Conversation not found");
    }

    // Delete all messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    // Delete all bookmarks for this conversation
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    for (const bookmark of bookmarks) {
      await ctx.db.delete(bookmark._id);
    }

    // Delete the conversation
    await ctx.db.delete(args.conversationId);
  },
});

// Internal mutation for syncing - called only from trusted HTTP action after auth validation
// This does NOT validate tokens - authentication is handled by the HTTP layer
export const syncFromExtensionInternal = internalMutation({
  args: {
    userId: v.string(),
    provider: providerType,
    externalId: v.string(),
    title: v.string(),
    url: v.string(),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        index: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { userId } = args;
    const now = Date.now();

    // Check if conversation already exists
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_external", (q) =>
        q
          .eq("userId", userId)
          .eq("provider", args.provider)
          .eq("externalId", args.externalId)
      )
      .unique();

    let conversationId;

    if (existing) {
      // Update existing conversation
      await ctx.db.patch(existing._id, {
        title: args.title ?? existing.title,
        url: args.url ?? existing.url,
        messageCount: args.messages.length,
        lastSyncedAt: now,
      });
      conversationId = existing._id;

      // Delete existing messages for re-sync
      const existingMessages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", existing._id)
        )
        .collect();

      for (const msg of existingMessages) {
        await ctx.db.delete(msg._id);
      }
    } else {
      // Create new conversation
      conversationId = await ctx.db.insert("conversations", {
        userId,
        provider: args.provider,
        externalId: args.externalId,
        title: args.title,
        url: args.url,
        messageCount: args.messages.length,
        lastSyncedAt: now,
        createdAt: now,
      });
    }

    // Insert all messages
    for (const msg of args.messages) {
      await ctx.db.insert("messages", {
        conversationId,
        userId,
        provider: args.provider,
        role: msg.role,
        content: msg.content,
        preview: msg.content.slice(0, 100),
        externalIndex: msg.index,
        timestamp: now,
      });
    }

    return conversationId;
  },
});

// Assign a conversation to a project
export const assignToProject = mutation({
  args: {
    conversationId: v.id("conversations"),
    projectId: v.optional(v.id("projects")), // Pass undefined to unassign
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Conversation not found");
    }

    // Verify project belongs to user if provided
    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (!project || project.userId !== identity.subject) {
        throw new Error("Project not found");
      }
    }

    await ctx.db.patch(args.conversationId, {
      projectId: args.projectId,
    });
  },
});

// Bulk assign conversations to a project
export const bulkAssignToProject = mutation({
  args: {
    conversationIds: v.array(v.id("conversations")),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify project belongs to user if provided
    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (!project || project.userId !== identity.subject) {
        throw new Error("Project not found");
      }
    }

    for (const convId of args.conversationIds) {
      const conversation = await ctx.db.get(convId);
      if (conversation && conversation.userId === identity.subject) {
        await ctx.db.patch(convId, {
          projectId: args.projectId,
        });
      }
    }
  },
});

// Get conversation stats for the dashboard
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const byProvider = {
      chatgpt: 0,
      claude: 0,
      gemini: 0,
      grok: 0,
      perplexity: 0,
    };

    let totalMessages = 0;

    for (const conv of conversations) {
      byProvider[conv.provider]++;
      totalMessages += conv.messageCount;
    }

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return {
      totalConversations: conversations.length,
      totalMessages,
      totalBookmarks: bookmarks.length,
      byProvider,
    };
  },
});
