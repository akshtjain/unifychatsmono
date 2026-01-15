"use client";

import { useState } from "react";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    // TODO: Integrate with your email service (Convex, Mailchimp, etc.)
    // For now, simulate a successful submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStatus("success");
    setEmail("");
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-subtle">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm mb-6">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          Coming Soon
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Premium features launching soon
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          Smarter search, usage insights, and app integrations. Get notified when we launch.
        </p>

        {status === "success" ? (
          <div className="inline-flex items-center gap-2 px-6 py-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            You&apos;re on the list! We&apos;ll be in touch.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 h-12 px-4 bg-surface border border-border rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="h-12 px-6 bg-white text-gray-950 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                "Notify me"
              )}
            </button>
          </form>
        )}

        <p className="text-gray-500 text-sm mt-4">
          No spam. Unsubscribe anytime.
        </p>

        {/* Upcoming features preview */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          {[
            { icon: "🔍", title: "Smarter Search", desc: "Find anything fast" },
            { icon: "✨", title: "AI Insights", desc: "See your patterns" },
            { icon: "📝", title: "App Exports", desc: "Send to your apps" },
            { icon: "🏷️", title: "Auto Organize", desc: "Less manual work" },
          ].map((feature, index) => (
            <div key={index} className="p-4 bg-surface/50 rounded-xl border border-border">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <div className="text-sm font-medium text-white">{feature.title}</div>
              <div className="text-xs text-gray-500">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
