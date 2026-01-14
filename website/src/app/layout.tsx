import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ExtensionAuthSync } from "@/components/extension-auth-sync";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Check if Clerk is configured
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const metadata: Metadata = {
  title: "UnifyChats - Navigate Your AI Conversations",
  description:
    "A free browser extension that adds a floating index to ChatGPT, Claude, Gemini, Grok, and Perplexity. Jump to any message instantly.",
  keywords: [
    "AI chat",
    "ChatGPT",
    "Claude",
    "Gemini",
    "Grok",
    "Perplexity",
    "browser extension",
    "chat navigation",
  ],
  manifest: "/manifest.json",
  openGraph: {
    title: "UnifyChats - Navigate Your AI Conversations",
    description:
      "A free browser extension that adds a floating index to ChatGPT, Claude, Gemini, Grok, and Perplexity.",
    type: "website",
    siteName: "UnifyChats",
  },
  twitter: {
    card: "summary_large_image",
    title: "UnifyChats - Navigate Your AI Conversations",
    description:
      "A free browser extension that adds a floating index to ChatGPT, Claude, Gemini, Grok, and Perplexity.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        {clerkPubKey && <ExtensionAuthSync />}
        {children}
      </body>
    </html>
  );

  // If Clerk is not configured, render without it
  if (!clerkPubKey) {
    return content;
  }

  return (
    <ClerkProvider
      appearance={{
        variables: {
          // Warm Ink amber theme
          colorPrimary: "#f59e0b",
          colorBackground: "#0a0a0c",
          colorInputBackground: "#141416",
          colorInputText: "#fafaf9",
          colorText: "#fafaf9",
          colorTextSecondary: "#a8a29e",
          colorDanger: "#f43f5e",
          colorSuccess: "#10b981",
          colorWarning: "#f59e0b",
          borderRadius: "0.625rem",
        },
        elements: {
          formButtonPrimary:
            "bg-primary hover:bg-primary/90 text-primary-foreground",
          card: "bg-card border border-border",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          formFieldLabel: "text-muted-foreground",
          formFieldInput: "bg-secondary border-border text-foreground",
          footerActionLink: "text-primary hover:text-primary/80",
          identityPreview: "bg-secondary",
          identityPreviewText: "text-foreground",
          identityPreviewEditButton: "text-primary",
          userButtonPopoverCard: "bg-card border border-border",
          userButtonPopoverActionButton: "text-foreground hover:bg-secondary",
          userButtonPopoverActionButtonText: "text-foreground",
          userButtonPopoverFooter: "hidden",
        },
      }}
    >
      <ConvexClientProvider>{content}</ConvexClientProvider>
    </ClerkProvider>
  );
}
