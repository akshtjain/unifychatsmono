"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

/**
 * Component that syncs auth state with the browser extension.
 * When user logs out, it notifies the extension to clear its stored credentials.
 */
export function ExtensionAuthSync() {
  const { isSignedIn, isLoaded } = useAuth();
  const wasSignedIn = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    // Track sign-out transition
    if (wasSignedIn.current === true && isSignedIn === false) {
      // User just signed out - notify extension
      notifyExtensionLogout();
    }

    wasSignedIn.current = isSignedIn ?? false;
  }, [isSignedIn, isLoaded]);

  // Also check on page load if user is not signed in but extension might still have auth
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      // User is not signed in - ensure extension knows
      // This handles the case where user logged out in another tab
      notifyExtensionLogout();
    }
  }, [isLoaded, isSignedIn]);

  return null;
}

function notifyExtensionLogout() {
  // Method 1: Custom event (for content script listening on this page)
  window.dispatchEvent(new CustomEvent("unifychats-logout"));

  // Method 2: localStorage flag (for content script in other tabs)
  try {
    localStorage.setItem("unifychats_extension_logout", Date.now().toString());
    // Clean up after a moment
    setTimeout(() => {
      localStorage.removeItem("unifychats_extension_logout");
    }, 1000);
  } catch {
    // localStorage might not be available
  }
}
