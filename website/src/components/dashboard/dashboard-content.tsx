"use client";

import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { CompactStats } from "@/components/dashboard/stats";
import { ConversationsList } from "@/components/dashboard/conversations-list";
import { BookmarksList } from "@/components/dashboard/bookmarks";
import { ConnectExtension } from "@/components/dashboard/connect-extension";
import { ProjectsSidebar } from "@/components/dashboard/projects-sidebar";

export function DashboardContent() {
  const [selectedProjectId, setSelectedProjectId] = useState<
    Id<"projects"> | null | "unassigned"
  >(null);

  return (
    <div className="flex gap-8">
      {/* Projects Sidebar */}
      <div className="w-64 flex-shrink-0 hidden lg:block">
        <div className="sticky top-36">
          <ProjectsSidebar
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />

          {/* Compact Stats in Sidebar - only on home */}
          {selectedProjectId === null && (
            <div className="mt-6">
              <CompactStats />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile Project Selector */}
        <div className="lg:hidden mb-6">
          <ProjectsSidebar
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />
        </div>

        {/* Saved Messages - only show on home */}
        {selectedProjectId === null && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Saved Messages
              </h2>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                Bookmarked from conversations
              </span>
            </div>
            <BookmarksList />
          </div>
        )}

        {/* Conversations */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {selectedProjectId === null
              ? "All Conversations"
              : selectedProjectId === "unassigned"
                ? "Unassigned Conversations"
                : "Project Conversations"}
          </h2>
          <ConversationsList projectId={selectedProjectId} />
        </div>

        {/* Connect Extension */}
        <div className="mb-8">
          <ConnectExtension />
        </div>

        {/* Download section */}
        <div id="download" className="p-6 bg-card rounded-xl border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Download the extension
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Install UnifyChats on your browser to start syncing your
            conversations.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/unifychats-chrome.zip"
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Chrome
            </a>
            <a
              href="/unifychats-firefox.zip"
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Firefox
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
