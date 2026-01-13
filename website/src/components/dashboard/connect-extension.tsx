"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";

type ConnectionState = "checking" | "connected" | "not_connected" | "no_extension";

export function ConnectExtension() {
  const { getToken } = useAuth();
  const [connectionState, setConnectionState] = useState<ConnectionState>("checking");
  const [isConnecting, setIsConnecting] = useState(false);

  // Generate auth credentials for the extension to pick up
  const generateCredentials = useCallback(async () => {
    try {
      const token = await getToken({ template: "convex" });
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

      if (!token || !convexUrl) return false;

      localStorage.setItem(
        "unifychats_extension_auth",
        JSON.stringify({ token, convexUrl, timestamp: Date.now() })
      );
      window.dispatchEvent(new CustomEvent("unifychats-token-generated"));
      return true;
    } catch {
      return false;
    }
  }, [getToken]);

  // Check extension status and auto-connect if needed
  useEffect(() => {
    let mounted = true;

    const checkAndConnect = async () => {
      // Listen for successful connection from extension
      const handleConnected = () => {
        if (mounted) setConnectionState("connected");
      };
      window.addEventListener("unifychats-extension-connected", handleConnected);

      // Check if extension is installed by looking for its marker
      // The content script sets this when it loads on our domain
      const extensionMarker = document.querySelector('[data-unifychats-extension]');

      // Also check via a custom event response pattern
      let extensionDetected = false;
      const detectHandler = () => { extensionDetected = true; };
      window.addEventListener("unifychats-extension-present", detectHandler);
      window.dispatchEvent(new CustomEvent("unifychats-check-extension"));

      // Give extension a moment to respond
      await new Promise(resolve => setTimeout(resolve, 200));
      window.removeEventListener("unifychats-extension-present", detectHandler);

      if (!mounted) return;

      // Check URL params for connect flow from popup
      const params = new URLSearchParams(window.location.search);
      const fromPopup = params.get("connect") === "extension";

      if (extensionDetected || extensionMarker || fromPopup) {
        // Extension is installed, auto-generate credentials
        const success = await generateCredentials();

        // Wait a bit for extension to pick up the credentials
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!mounted) return;

        // If we came from popup, extension should have picked up credentials
        if (fromPopup) {
          setConnectionState("connected");
          // Clean up URL
          window.history.replaceState({}, "", "/dashboard");
        } else {
          // Check if we got the connected event
          setConnectionState(success ? "connected" : "not_connected");
        }
      } else {
        setConnectionState("no_extension");
      }

      return () => {
        window.removeEventListener("unifychats-extension-connected", handleConnected);
      };
    };

    checkAndConnect();

    return () => { mounted = false; };
  }, [generateCredentials]);

  // Manual reconnect for edge cases
  const handleReconnect = async () => {
    setIsConnecting(true);
    await generateCredentials();

    // Wait for extension to pick up
    await new Promise(resolve => setTimeout(resolve, 500));
    setConnectionState("connected");
    setIsConnecting(false);
  };

  // Render based on state
  if (connectionState === "checking") {
    return (
      <div className="p-6 bg-card rounded-2xl border border-border">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground text-sm">Checking extension status...</span>
        </div>
      </div>
    );
  }

  if (connectionState === "connected") {
    return (
      <div className="p-6 bg-card rounded-2xl border border-success/30">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-success">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Extension Connected</h3>
            <p className="text-muted-foreground text-sm">
              Your browser extension is linked to your account. Visit any supported chat site and click the purple button to sync conversations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (connectionState === "no_extension") {
    return (
      <div className="p-6 bg-card rounded-2xl border border-border">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-primary">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">Install the Extension</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Download and install the browser extension to start syncing your AI conversations.
            </p>
            <a
              href="#download"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Download Extension
            </a>
          </div>
        </div>
      </div>
    );
  }

  // not_connected state - extension installed but not linked
  return (
    <div className="p-6 bg-card rounded-2xl border border-border">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-warning">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">Reconnect Extension</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Your extension needs to be reconnected to sync conversations.
          </p>
          <button
            onClick={handleReconnect}
            disabled={isConnecting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Reconnect"}
          </button>
        </div>
      </div>
    </div>
  );
}
