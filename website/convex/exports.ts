import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// List all exports for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("exports")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// Create a new export request
export const create = mutation({
  args: {
    conversationIds: v.array(v.id("conversations")),
    format: v.union(v.literal("json"), v.literal("markdown"), v.literal("pdf")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify all conversations belong to the user
    for (const convId of args.conversationIds) {
      const conv = await ctx.db.get(convId);
      if (!conv || conv.userId !== userId) {
        throw new Error("Conversation not found or not authorized");
      }
    }

    const exportId = await ctx.db.insert("exports", {
      userId,
      conversationIds: args.conversationIds,
      format: args.format,
      status: "pending",
      createdAt: Date.now(),
    });

    return exportId;
  },
});

// Generate export content (internal action)
export const generateExport = action({
  args: {
    exportId: v.id("exports"),
  },
  handler: async (ctx, args) => {
    // This would be called by a scheduled job or triggered manually
    // For now, we'll implement a simple JSON/Markdown generator

    const exportRecord = await ctx.runQuery(api.exports.getExportData, {
      exportId: args.exportId,
    });

    if (!exportRecord) {
      throw new Error("Export not found");
    }

    let content = "";

    if (exportRecord.format === "json") {
      content = JSON.stringify(exportRecord.conversations, null, 2);
    } else if (exportRecord.format === "markdown") {
      content = exportRecord.conversations
        .map((conv: any) => {
          let md = `# ${conv.title || "Untitled Conversation"}\n\n`;
          md += `**Provider:** ${conv.provider}\n`;
          md += `**URL:** ${conv.url || "N/A"}\n\n`;
          md += `---\n\n`;

          for (const msg of conv.messages) {
            const role = msg.role === "user" ? "**You**" : "**Assistant**";
            md += `${role}:\n\n${msg.content}\n\n---\n\n`;
          }

          return md;
        })
        .join("\n\n");
    }

    // In a real implementation, you'd upload this to file storage
    // and update the export record with a download URL
    await ctx.runMutation(api.exports.complete, {
      exportId: args.exportId,
      // downloadUrl would come from file storage
    });

    return content;
  },
});

// Get export data (internal query)
export const getExportData = query({
  args: {
    exportId: v.id("exports"),
  },
  handler: async (ctx, args) => {
    const exportRecord = await ctx.db.get(args.exportId);
    if (!exportRecord) {
      return null;
    }

    const conversations = await Promise.all(
      exportRecord.conversationIds.map(async (convId) => {
        const conv = await ctx.db.get(convId);
        if (!conv) return null;

        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", convId))
          .order("asc")
          .collect();

        return {
          ...conv,
          messages,
        };
      })
    );

    return {
      ...exportRecord,
      conversations: conversations.filter(Boolean),
    };
  },
});

// Mark export as complete
export const complete = mutation({
  args: {
    exportId: v.id("exports"),
    downloadUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.exportId, {
      status: "completed",
      downloadUrl: args.downloadUrl,
      completedAt: Date.now(),
    });
  },
});
