import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { DashboardStats, PlatformStats } from "@/components/dashboard/stats";
import { ConversationsList } from "@/components/dashboard/conversations-list";
import { SearchMessages } from "@/components/dashboard/search";
import { BookmarksList } from "@/components/dashboard/bookmarks";
import { ConnectExtension } from "@/components/dashboard/connect-extension";

// Check if Clerk is configured
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default async function DashboardPage() {
  // If Clerk is not configured, show a placeholder message
  if (!clerkPubKey) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Dashboard</h1>
          <p className="text-muted-foreground">
            Configure Clerk to enable authentication and dashboard features.
          </p>
        </div>
      </main>
    );
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.emailAddresses[0]?.emailAddress}
            </span>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {user.firstName || "there"}!
          </h1>
          <p className="text-muted-foreground">
            Manage your synced AI conversations, search across platforms, and access your bookmarks.
          </p>
        </div>

        {/* Stats */}
        <DashboardStats />

        {/* Platform breakdown */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            By Platform
          </h2>
          <PlatformStats />
        </div>

        {/* Search */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Search Messages
          </h2>
          <SearchMessages />
        </div>

        {/* Tabs for Conversations and Bookmarks */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Conversations */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Your Conversations
            </h2>
            <ConversationsList />
          </div>

          {/* Bookmarks */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Bookmarks
            </h2>
            <BookmarksList />
          </div>
        </div>

        {/* Connect Extension */}
        <div className="mb-12">
          <ConnectExtension />
        </div>

        {/* Download section */}
        <div id="download" className="p-8 bg-card rounded-2xl border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Download the extension
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Install UnifyChats on your browser to start syncing your
            conversations.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/unifychats-chrome.zip"
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
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
              Download for Chrome
            </a>
            <a
              href="/unifychats-firefox.zip"
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground border border-border rounded-xl font-medium hover:bg-secondary/80 transition-colors"
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
              Download for Firefox
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
