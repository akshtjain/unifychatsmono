"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export function ConnectExtension() {
  const { getToken } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Check if we came from extension connect flow
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connect") === "extension") {
      handleConnect();
    }
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionStatus("idle");
    setErrorMessage("");

    try {
      // Get the Clerk JWT token
      const token = await getToken({ template: "convex" });

      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      // Get Convex URL from environment
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

      if (!convexUrl) {
        throw new Error("Convex not configured");
      }

      // Store in localStorage for the extension to pick up
      // The extension can read this via a content script on our domain
      localStorage.setItem(
        "unifychats_extension_auth",
        JSON.stringify({
          token,
          convexUrl,
          timestamp: Date.now(),
        })
      );

      // Dispatch event to notify the extension content script
      window.dispatchEvent(new CustomEvent("unifychats-token-generated"));

      // Listen for successful connection from extension
      const connectionHandler = () => {
        setConnectionStatus("success");
        window.removeEventListener("unifychats-extension-connected", connectionHandler);
      };
      window.addEventListener("unifychats-extension-connected", connectionHandler);

      // Set success after a short delay (in case extension isn't installed)
      setTimeout(() => {
        setConnectionStatus("success");
      }, 500);
    } catch (error: any) {
      setConnectionStatus("error");
      setErrorMessage(error.message || "Connection failed");
    } finally {
      setIsConnecting(false);
    }
  };

  const copyToken = async () => {
    try {
      const token = await getToken({ template: "convex" });
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

      if (token && convexUrl) {
        const data = JSON.stringify({ token, convexUrl });
        await navigator.clipboard.writeText(data);
        setConnectionStatus("success");
      }
    } catch {
      setErrorMessage("Failed to copy token");
    }
  };

  return (
    <div className="p-6 bg-card rounded-2xl border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Connect Extension
      </h3>
      <p className="text-muted-foreground text-sm mb-4">
        Link your browser extension to sync conversations across devices.
      </p>

      {connectionStatus === "success" ? (
        <div className="p-4 bg-success/10 border border-success/20 rounded-xl">
          <p className="text-success text-sm font-medium mb-2">
            Connection token generated!
          </p>
          <p className="text-muted-foreground text-xs">
            Open the UnifyChats extension popup and click &quot;Connect&quot; to complete
            setup. The extension will automatically detect your credentials.
          </p>
        </div>
      ) : connectionStatus === "error" ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl mb-4">
          <p className="text-destructive text-sm">{errorMessage}</p>
        </div>
      ) : null}

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-wait"
        >
          {isConnecting ? "Connecting..." : "Generate Connection Token"}
        </button>
      </div>

      <p className="text-muted-foreground/60 text-xs mt-4">
        Don&apos;t have the extension?{" "}
        <a href="#download" className="text-primary hover:underline">
          Download it here
        </a>
      </p>
    </div>
  );
}
