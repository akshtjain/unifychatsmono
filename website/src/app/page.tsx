import { Nav } from "@/components/nav";
import { PlatformGrid, PlatformIcons } from "@/components/platform-icons";
import { Features } from "@/components/features";
import { InstallGuide } from "@/components/install-guide";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <Nav />

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-muted border border-accent-border text-accent text-sm mb-8">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Free &amp; Open Source
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-gradient">Never lose track of</span>
            <br />
            <span className="text-white">your AI conversations</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            A browser extension that adds a floating index to ChatGPT, Claude,
            Gemini, and Grok. Jump to any message in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="#install"
              className="inline-flex items-center gap-2 h-12 px-6 bg-white text-gray-950 rounded-xl font-medium hover:bg-gray-100 transition-all hover:shadow-lg hover:shadow-white/10"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Install Now — It&apos;s Free
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 h-12 px-6 bg-surface border border-border rounded-xl font-medium text-gray-300 hover:text-white hover:border-border-accent transition-all"
            >
              See how it works
            </a>
          </div>

          {/* Platform icons */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-gray-500 text-sm">Works with</p>
            <PlatformIcons showLinks />
          </div>
        </div>
      </section>

      {/* Demo visual */}
      <section className="pb-20 md:pb-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative rounded-2xl border border-border overflow-hidden bg-surface shadow-surface-lg">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/50 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-lg bg-gray-800 text-gray-400 text-xs">
                  chatgpt.com
                </div>
              </div>
            </div>

            {/* Demo content */}
            <div className="flex">
              {/* Chat area */}
              <div className="flex-1 p-6 space-y-4">
                <div className="flex justify-end">
                  <div className="max-w-[80%] p-4 rounded-2xl rounded-tr-sm bg-accent/20 text-gray-200 text-sm">
                    How do I center a div in CSS?
                  </div>
                </div>
                <div className="flex">
                  <div className="max-w-[80%] p-4 rounded-2xl rounded-tl-sm bg-gray-800 text-gray-300 text-sm">
                    There are several ways to center a div. The most modern
                    approach is using Flexbox with display: flex and
                    justify-content: center...
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[80%] p-4 rounded-2xl rounded-tr-sm bg-accent/20 text-gray-200 text-sm">
                    What about CSS Grid?
                  </div>
                </div>
                <div className="flex">
                  <div className="max-w-[80%] p-4 rounded-2xl rounded-tl-sm bg-gray-800 text-gray-300 text-sm">
                    With CSS Grid, you can use display: grid and place-items:
                    center for an even simpler solution...
                  </div>
                </div>
              </div>

              {/* Index panel */}
              <div className="w-64 border-l border-border bg-gray-900/50">
                <div className="p-3 bg-gradient-to-r from-accent to-purple-600 text-white text-sm font-medium">
                  Message Index
                </div>
                <div className="p-2 space-y-1">
                  {[
                    { role: "You", text: "How do I center a div..." },
                    { role: "AI", text: "There are several ways..." },
                    { role: "You", text: "What about CSS Grid?" },
                    { role: "AI", text: "With CSS Grid, you can..." },
                  ].map((msg, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          msg.role === "You"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {msg.role}
                      </span>
                      <span className="text-xs text-gray-400 truncate">
                        {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating button indicator */}
            <div className="absolute bottom-4 right-72 w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shadow-glow">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <circle cx="4" cy="6" r="1" fill="white" />
                <circle cx="4" cy="12" r="1" fill="white" />
                <circle cx="4" cy="18" r="1" fill="white" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Supported platforms */}
      <section className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Works with your favorite AI assistants
          </h2>
          <p className="text-gray-400 mb-10">
            One extension for all your AI conversations
          </p>
          <PlatformGrid />
        </div>
      </section>

      <Features />
      <InstallGuide />
      <FAQ />
      <Footer />
    </main>
  );
}
