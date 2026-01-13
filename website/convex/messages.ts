import { v } from "convex/values";
import { query } from "./_generated/server";
import { providerType } from "./schema";

// Search across all messages
export const search = query({
  args: {
    query: v.string(),
    provider: v.optional(providerType),
    role: v.optional(v.union(v.literal("user"), v.literal("assistant"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const limit = args.limit ?? 20;

    let searchQuery = ctx.db
      .query("messages")
      .withSearchIndex("search_content", (q) => {
        let search = q.search("content", args.query).eq("userId", userId);

        if (args.provider) {
          search = search.eq("provider", args.provider);
        }

        if (args.role) {
          search = search.eq("role", args.role);
        }

        return search;
      });

    const messages = await searchQuery.take(limit);

    // Fetch conversation info for each message
    const results = await Promise.all(
      messages.map(async (msg) => {
        const conversation = await ctx.db.get(msg.conversationId);
        return {
          ...msg,
          conversationTitle: conversation?.title,
          conversationUrl: conversation?.url,
        };
      })
    );

    return results;
  },
});

// Get recent messages across all conversations
export const recent = query({
  args: {
    limit: v.optional(v.number()),
    provider: v.optional(providerType),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const limit = args.limit ?? 50;

    let query;

    if (args.provider) {
      query = ctx.db
        .query("messages")
        .withIndex("by_user_provider", (q) =>
          q.eq("userId", userId).eq("provider", args.provider!)
        );
    } else {
      query = ctx.db
        .query("messages")
        .withIndex("by_user", (q) => q.eq("userId", userId));
    }

    const messages = await query.order("desc").take(limit);

    // Fetch conversation info for each message
    const results = await Promise.all(
      messages.map(async (msg) => {
        const conversation = await ctx.db.get(msg.conversationId);
        return {
          ...msg,
          conversationTitle: conversation?.title,
          conversationUrl: conversation?.url,
        };
      })
    );

    return results;
  },
});
