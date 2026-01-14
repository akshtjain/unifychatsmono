import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),
});

// Sync conversation from extension
// The extension will call this endpoint with a JWT token from Clerk
// Authentication is handled by Convex's built-in auth system (validates JWT via JWKS)
http.route({
  path: "/sync",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // CORS headers for all responses
    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Verify Authorization header is present
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          code: "MISSING_TOKEN",
          message: "Authorization header with Bearer token is required"
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    try {
      // Use Convex's built-in auth - validates JWT signature via JWKS automatically
      // This handles token expiration, signature verification, and issuer validation
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        return new Response(
          JSON.stringify({
            error: "Unauthorized",
            code: "INVALID_TOKEN",
            message: "Token is invalid, expired, or not properly signed. Please refresh your session."
          }),
          { status: 401, headers: corsHeaders }
        );
      }

      const userId = identity.subject;
      if (!userId) {
        return new Response(
          JSON.stringify({
            error: "Unauthorized",
            code: "MISSING_USER_ID",
            message: "Token does not contain a valid user identifier"
          }),
          { status: 401, headers: corsHeaders }
        );
      }

      const body = await request.json();

      // Validate required fields
      if (!body.provider || !body.externalId || !body.messages) {
        return new Response(
          JSON.stringify({
            error: "Bad Request",
            code: "MISSING_FIELDS",
            message: "Missing required fields: provider, externalId, or messages"
          }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Validate provider
      const validProviders = ["chatgpt", "claude", "gemini", "grok"];
      if (!validProviders.includes(body.provider)) {
        return new Response(
          JSON.stringify({
            error: "Bad Request",
            code: "INVALID_PROVIDER",
            message: `Invalid provider: ${body.provider}. Valid providers: ${validProviders.join(", ")}`
          }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Call the internal mutation with validated userId
      // Internal mutations can only be called from server-side code (trusted)
      const conversationId = await ctx.runMutation(
        internal.conversations.syncFromExtensionInternal,
        {
          userId,
          provider: body.provider,
          externalId: body.externalId,
          title: body.title || "Untitled",
          url: body.url || "",
          messages: body.messages,
        }
      );

      return new Response(
        JSON.stringify({ success: true, conversationId }),
        { status: 200, headers: corsHeaders }
      );
    } catch (error: any) {
      console.error("Sync error:", error);

      // Determine error type for proper HTTP status
      const errorMessage = error.message || "Sync failed";
      const isServerError = !errorMessage.includes("Unauthorized");

      return new Response(
        JSON.stringify({
          error: isServerError ? "Internal Server Error" : "Unauthorized",
          code: isServerError ? "SYNC_FAILED" : "AUTH_ERROR",
          message: errorMessage
        }),
        { status: isServerError ? 500 : 401, headers: corsHeaders }
      );
    }
  }),
});

// CORS preflight for sync endpoint
http.route({
  path: "/sync",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

// Search messages endpoint for extension
// Authentication handled by Convex's built-in auth system
http.route({
  path: "/search",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    // Verify Authorization header is present
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          code: "MISSING_TOKEN",
          message: "Authorization header with Bearer token is required"
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    try {
      // Use Convex's built-in auth validation
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        return new Response(
          JSON.stringify({
            error: "Unauthorized",
            code: "INVALID_TOKEN",
            message: "Token is invalid, expired, or not properly signed. Please refresh your session."
          }),
          { status: 401, headers: corsHeaders }
        );
      }

      const url = new URL(request.url);
      const query = url.searchParams.get("q");
      const provider = url.searchParams.get("provider");
      const limit = parseInt(url.searchParams.get("limit") || "20");

      if (!query) {
        return new Response(
          JSON.stringify({
            error: "Bad Request",
            code: "MISSING_QUERY",
            message: "Query parameter 'q' is required"
          }),
          { status: 400, headers: corsHeaders }
        );
      }

      const results = await ctx.runQuery(api.messages.search, {
        query,
        provider: provider as any,
        limit,
      });

      return new Response(
        JSON.stringify({ results }),
        { status: 200, headers: corsHeaders }
      );
    } catch (error: any) {
      console.error("Search error:", error);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          code: "SEARCH_FAILED",
          message: error.message || "Search failed"
        }),
        { status: 500, headers: corsHeaders }
      );
    }
  }),
});

// CORS preflight for search endpoint
http.route({
  path: "/search",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

// Toggle bookmark for a message (by conversation external ID and message index)
// Used by browser extension to bookmark messages
http.route({
  path: "/bookmark",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Verify Authorization header is present
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          code: "MISSING_TOKEN",
          message: "Authorization header with Bearer token is required"
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    try {
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        return new Response(
          JSON.stringify({
            error: "Unauthorized",
            code: "INVALID_TOKEN",
            message: "Token is invalid, expired, or not properly signed."
          }),
          { status: 401, headers: corsHeaders }
        );
      }

      const userId = identity.subject;
      const body = await request.json();

      // Validate required fields
      if (!body.provider || !body.externalId || body.messageIndex === undefined) {
        return new Response(
          JSON.stringify({
            error: "Bad Request",
            code: "MISSING_FIELDS",
            message: "Missing required fields: provider, externalId, or messageIndex"
          }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Call the internal mutation to toggle bookmark
      const result = await ctx.runMutation(
        internal.bookmarks.toggleByIndexInternal,
        {
          userId,
          provider: body.provider,
          externalId: body.externalId,
          messageIndex: body.messageIndex,
        }
      );

      return new Response(
        JSON.stringify({ success: true, ...result }),
        { status: 200, headers: corsHeaders }
      );
    } catch (error: any) {
      console.error("Bookmark error:", error);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          code: "BOOKMARK_FAILED",
          message: error.message || "Bookmark operation failed"
        }),
        { status: 500, headers: corsHeaders }
      );
    }
  }),
});

// CORS preflight for bookmark endpoint
http.route({
  path: "/bookmark",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

// Get bookmark status for messages in a conversation (by external ID and message indices)
http.route({
  path: "/bookmarks/status",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: corsHeaders }
        );
      }

      const userId = identity.subject;
      const body = await request.json();

      if (!body.provider || !body.externalId) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: corsHeaders }
        );
      }

      const result = await ctx.runQuery(
        internal.bookmarks.getStatusByConversationInternal,
        {
          userId,
          provider: body.provider,
          externalId: body.externalId,
        }
      );

      return new Response(
        JSON.stringify({ success: true, bookmarkedIndices: result }),
        { status: 200, headers: corsHeaders }
      );
    } catch (error: any) {
      console.error("Bookmark status error:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Failed to get bookmark status" }),
        { status: 500, headers: corsHeaders }
      );
    }
  }),
});

// CORS preflight for bookmarks/status endpoint
http.route({
  path: "/bookmarks/status",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

export default http;
