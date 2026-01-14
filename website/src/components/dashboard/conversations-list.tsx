"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon, FolderIcon, Trash2, ExternalLink, FolderMinus, MessageSquare, Clock, RefreshCw, BookOpen } from "lucide-react";
import { ChatReader } from "./chat-reader";

type Provider = "chatgpt" | "claude" | "gemini" | "grok" | "perplexity";

const providerColors: Record<Provider, string> = {
  chatgpt: "bg-platform-chatgpt/10 text-platform-chatgpt border-platform-chatgpt/20",
  claude: "bg-platform-claude/10 text-platform-claude border-platform-claude/20",
  gemini: "bg-platform-gemini/10 text-platform-gemini border-platform-gemini/20",
  grok: "bg-platform-grok/10 text-platform-grok border-platform-grok/20",
  perplexity: "bg-platform-perplexity/10 text-platform-perplexity border-platform-perplexity/20",
};

const providerBgColors: Record<Provider, string> = {
  chatgpt: "bg-platform-chatgpt",
  claude: "bg-platform-claude",
  gemini: "bg-platform-gemini",
  grok: "bg-platform-grok",
  perplexity: "bg-platform-perplexity",
};

const providerNames: Record<Provider, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  grok: "Grok",
  perplexity: "Perplexity",
};

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface ConversationsListProps {
  projectId?: Id<"projects"> | null | "unassigned";
}

export function ConversationsList({ projectId }: ConversationsListProps) {
  const [selectedProvider, setSelectedProvider] = useState<Provider | undefined>();
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);

  // Build query args based on project filter
  const queryArgs = {
    provider: selectedProvider,
    ...(projectId === "unassigned"
      ? { unassigned: true as const }
      : projectId
        ? { projectId }
        : {}
    ),
  };

  const conversations = useQuery(api.conversations.list, queryArgs);
  const projects = useQuery(api.projects.list);
  const removeConversation = useMutation(api.conversations.remove);
  const assignToProject = useMutation(api.conversations.assignToProject);

  const [deletingId, setDeletingId] = useState<Id<"conversations"> | null>(null);

  const handleDelete = async (id: Id<"conversations">) => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      setDeletingId(id);
      try {
        await removeConversation({ conversationId: id });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleAssignToProject = async (
    conversationId: Id<"conversations">,
    targetProjectId: Id<"projects"> | undefined
  ) => {
    await assignToProject({
      conversationId,
      projectId: targetProjectId,
    });
  };

  const handleOpenReader = (conversationId: Id<"conversations">) => {
    setSelectedConversationId(conversationId);
    setReaderOpen(true);
  };

  if (conversations === undefined) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 bg-card rounded-xl border border-border animate-pulse"
          >
            <div className="h-5 w-48 bg-secondary rounded mb-2" />
            <div className="h-4 w-24 bg-secondary rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Find project for each conversation
  const projectMap = new Map(
    projects?.map((p) => [p._id, p]) ?? []
  );

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setSelectedProvider(undefined)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedProvider === undefined
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {(["chatgpt", "claude", "gemini", "grok", "perplexity"] as Provider[]).map(
          (provider) => (
            <button
              key={provider}
              onClick={() => setSelectedProvider(provider)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedProvider === provider
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {providerNames[provider]}
            </button>
          )
        )}
      </div>

      {/* Conversations table */}
      {conversations.length === 0 ? (
        <div className="p-8 bg-card rounded-xl border border-border text-center">
          <p className="text-muted-foreground">
            {projectId === "unassigned"
              ? "No unassigned conversations."
              : projectId
                ? "No conversations in this project."
                : "No conversations synced yet."}
          </p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            {projectId
              ? "Assign conversations to this project from the main list."
              : "Use the extension to sync your AI chats."}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-4 py-3 bg-secondary/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <div className="w-20">Platform</div>
            <div>Conversation</div>
            <div className="w-20 text-center">Messages</div>
            <div className="w-24">Created</div>
            <div className="w-24">Last Sync</div>
            <div className="w-28">Project</div>
            <div className="w-10"></div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {conversations.map((conv) => {
              const convProject = conv.projectId
                ? projectMap.get(conv.projectId)
                : null;

              return (
                <div
                  key={conv._id}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-secondary/30 transition-colors group"
                >
                  {/* Platform */}
                  <div className="w-20">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${providerColors[conv.provider]}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${providerBgColors[conv.provider]}`} />
                      {providerNames[conv.provider]}
                    </span>
                  </div>

                  {/* Conversation Title */}
                  <div className="min-w-0">
                    <button
                      onClick={() => handleOpenReader(conv._id)}
                      className="text-foreground font-medium truncate text-sm hover:text-primary transition-colors text-left block max-w-full"
                    >
                      {conv.title || "Untitled Conversation"}
                    </button>
                    <div className="flex items-center gap-2 mt-0.5">
                      <button
                        onClick={() => handleOpenReader(conv._id)}
                        className="text-muted-foreground text-xs hover:text-primary inline-flex items-center gap-1 transition-colors"
                      >
                        <BookOpen className="h-3 w-3" />
                        Read
                      </button>
                      {conv.url && (
                        <a
                          href={conv.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground text-xs hover:text-primary inline-flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Original
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Message Count */}
                  <div className="w-20 text-center">
                    <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {conv.messageCount}
                    </span>
                  </div>

                  {/* Created */}
                  <div className="w-24">
                    <span
                      className="inline-flex items-center gap-1 text-muted-foreground text-xs"
                      title={new Date(conv.createdAt).toLocaleString()}
                    >
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(conv.createdAt)}
                    </span>
                  </div>

                  {/* Last Sync */}
                  <div className="w-24">
                    <span
                      className="inline-flex items-center gap-1 text-muted-foreground text-xs"
                      title={new Date(conv.lastSyncedAt).toLocaleString()}
                    >
                      <RefreshCw className="h-3 w-3" />
                      {formatRelativeTime(conv.lastSyncedAt)}
                    </span>
                  </div>

                  {/* Project */}
                  <div className="w-28">
                    {convProject ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium truncate max-w-full"
                        style={{
                          backgroundColor: `${convProject.color}20`,
                          color: convProject.color,
                        }}
                      >
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: convProject.color }}
                        />
                        <span className="truncate">{convProject.name}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50 text-xs">—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="w-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-1.5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-secondary"
                          disabled={deletingId === conv._id}
                        >
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {conv.url && (
                          <>
                            <DropdownMenuItem asChild>
                              <a
                                href={conv.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open original
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <FolderIcon className="h-4 w-4 mr-2" />
                            Move to project
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {conv.projectId && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleAssignToProject(conv._id, undefined)
                                  }
                                >
                                  <FolderMinus className="h-4 w-4 mr-2" />
                                  Remove from project
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {projects?.map((project) => (
                              <DropdownMenuItem
                                key={project._id}
                                onClick={() =>
                                  handleAssignToProject(conv._id, project._id)
                                }
                                disabled={conv.projectId === project._id}
                              >
                                <span
                                  className="h-3 w-3 rounded-full mr-2"
                                  style={{ backgroundColor: project.color }}
                                />
                                {project.name}
                              </DropdownMenuItem>
                            ))}
                            {(!projects || projects.length === 0) && (
                              <DropdownMenuItem disabled>
                                No projects yet
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(conv._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat Reader Dialog */}
      <ChatReader
        conversationId={selectedConversationId}
        open={readerOpen}
        onOpenChange={setReaderOpen}
      />
    </div>
  );
}
