"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  messageId: Id<"messages">;
  isBookmarked: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function BookmarkButton({
  messageId,
  isBookmarked,
  className = "",
  size = "md",
}: BookmarkButtonProps) {
  const toggleBookmark = useMutation(api.bookmarks.toggle);
  const [isToggling, setIsToggling] = useState(false);
  const [optimisticBookmarked, setOptimisticBookmarked] = useState<boolean | null>(null);

  const currentlyBookmarked = optimisticBookmarked ?? isBookmarked;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isToggling) return;

    setIsToggling(true);
    setOptimisticBookmarked(!currentlyBookmarked);

    try {
      await toggleBookmark({ messageId });
    } catch {
      // Revert optimistic update on error
      setOptimisticBookmarked(null);
    } finally {
      setIsToggling(false);
      // Clear optimistic state after mutation completes
      setOptimisticBookmarked(null);
    }
  };

  const sizeClasses = size === "sm" ? "p-1" : "p-1.5";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`${sizeClasses} rounded-md transition-all ${
        currentlyBookmarked
          ? "text-primary bg-primary/10 hover:bg-primary/20"
          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
      } disabled:opacity-50 ${className}`}
      title={currentlyBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Bookmark
        className={`${iconSize} ${currentlyBookmarked ? "fill-current" : ""}`}
      />
    </button>
  );
}
