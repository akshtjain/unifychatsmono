import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

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
http.route({
  path: "/sync",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Add CORS headers to all responses
    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Verify authentication via Clerk JWT
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - missing token" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Extract the token
    const token = authHeader.substring(7);

    try {
      const body = await request.json();

      // Validate required fields
      if (!body.provider || !body.externalId || !body.messages) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: provider, externalId, or messages" }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Validate provider
      const validProviders = ["chatgpt", "claude", "gemini", "grok"];
      if (!validProviders.includes(body.provider)) {
        return new Response(
          JSON.stringify({ error: `Invalid provider: ${body.provider}` }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Call the internal sync mutation with the token for auth
      // We use runMutation which will use the HTTP action's auth context
      const conversationId = await ctx.runMutation(
        api.conversations.syncFromExtension,
        {
          token,
          provider: body.provider,
          externalId: body.externalId,
          title: body.title || "Untitled",
          url: body.url || "",
          messages: body.messages,
        }
      );

      return new Response(
        JSON.stringify({ success: true, conversationId: conversationId }),
        { status: 200, headers: corsHeaders }
      );
    } catch (error: any) {
      console.error("Sync error:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Sync failed" }),
        { status: 500, headers: corsHeaders }
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
http.route({
  path: "/search",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const url = new URL(request.url);
      const query = url.searchParams.get("q");
      const provider = url.searchParams.get("provider");
      const limit = parseInt(url.searchParams.get("limit") || "20");

      if (!query) {
        return new Response(
          JSON.stringify({ error: "Missing query parameter" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const results = await ctx.runQuery(api.messages.search, {
        query,
        provider: provider as any,
        limit,
      });

      return new Response(JSON.stringify({ results }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ error: error.message || "Search failed" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
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

export default http;
