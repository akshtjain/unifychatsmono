"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";

type Provider = "chatgpt" | "claude" | "gemini" | "grok";

const providerColors: Record<Provider, string> = {
  chatgpt: "bg-platform-chatgpt/10 text-platform-chatgpt",
  claude: "bg-platform-claude/10 text-platform-claude",
  gemini: "bg-platform-gemini/10 text-platform-gemini",
  grok: "bg-platform-grok/10 text-platform-grok",
};

export function BookmarksList() {
  const bookmarks = useQuery(api.bookmarks.list);
  const removeBookmark = useMutation(api.bookmarks.remove);
  const updateNote = useMutation(api.bookmarks.updateNote);

  const [editingId, setEditingId] = useState<Id<"bookmarks"> | null>(null);
  const [editNote, setEditNote] = useState("");
  const [deletingId, setDeletingId] = useState<Id<"bookmarks"> | null>(null);

  const handleEditNote = (id: Id<"bookmarks">, currentNote: string) => {
    setEditingId(id);
    setEditNote(currentNote || "");
  };

  const handleSaveNote = async (id: Id<"bookmarks">) => {
    await updateNote({ bookmarkId: id, note: editNote });
    setEditingId(null);
    setEditNote("");
  };

  const handleDelete = async (id: Id<"bookmarks">) => {
    if (confirm("Remove this bookmark?")) {
      setDeletingId(id);
      try {
        await removeBookmark({ bookmarkId: id });
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (bookmarks === undefined) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 bg-card rounded-xl border border-border animate-pulse"
          >
            <div className="h-4 w-48 bg-secondary rounded mb-2" />
            <div className="h-3 w-64 bg-secondary rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="p-8 bg-card rounded-xl border border-border text-center">
        <svg
          className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        <p className="text-muted-foreground">No bookmarks yet.</p>
        <p className="text-muted-foreground/60 text-sm mt-1">
          Bookmark messages in the extension to save them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark._id}
          className="p-4 bg-card rounded-xl border border-border group"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {bookmark.message && bookmark.conversation && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        providerColors[bookmark.message.provider as Provider]
                      }`}
                    >
                      {bookmark.message.provider}
                    </span>
                    <span className="text-muted-foreground/60 text-xs capitalize">
                      {bookmark.message.role}
                    </span>
                  </div>
                  <p className="text-foreground text-sm mb-2 line-clamp-3">
                    {bookmark.message.content}
                  </p>
                  {bookmark.conversation.title && (
                    <p className="text-muted-foreground/60 text-xs">
                      From: {bookmark.conversation.title}
                    </p>
                  )}
                </>
              )}

              {/* Note section */}
              {editingId === bookmark._id ? (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveNote(bookmark._id)}
                    className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 bg-secondary text-muted-foreground text-sm rounded-lg hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              ) : bookmark.note ? (
                <p
                  className="mt-2 text-primary text-sm cursor-pointer hover:underline"
                  onClick={() => handleEditNote(bookmark._id, bookmark.note || "")}
                >
                  Note: {bookmark.note}
                </p>
              ) : (
                <button
                  onClick={() => handleEditNote(bookmark._id, "")}
                  className="mt-2 text-muted-foreground/60 text-xs hover:text-primary"
                >
                  + Add note
                </button>
              )}
            </div>

            <button
              onClick={() => handleDelete(bookmark._id)}
              disabled={deletingId === bookmark._id}
              className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
              title="Remove bookmark"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
