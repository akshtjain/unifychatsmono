import { Nav } from "@/components/nav";
import { PlatformGrid, PlatformIcons } from "@/components/platform-icons";
import { HowItWorks } from "@/components/how-it-works";
import { DashboardPreview } from "@/components/dashboard-preview";
import { Features } from "@/components/features";
import { UseCases } from "@/components/use-cases";
import { InstallGuide } from "@/components/install-guide";
import { FAQ } from "@/components/faq";
import { EmailCapture } from "@/components/email-capture";
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
            <span className="text-gradient">One place for all your</span>
            <br />
            <span className="text-white">AI conversations</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Search, sync, and organize conversations across ChatGPT, Claude,
            Gemini, Grok, and Perplexity. Your AI knowledge, always at your fingertips.
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
              href="/dashboard"
              className="inline-flex items-center gap-2 h-12 px-6 bg-surface border border-border rounded-xl font-medium text-gray-300 hover:text-white hover:border-border-accent transition-all"
            >
              Try the dashboard
            </a>
          </div>

          {/* Platform icons */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-gray-500 text-sm">Works with</p>
            <PlatformIcons showLinks />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Extension Screenshot */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              A floating index for any AI chat
            </h2>
            <p className="text-gray-400">
              Jump to any message instantly. Filter by role. Always accessible.
            </p>
          </div>
          {/* Placeholder for extension screenshot */}
          <div className="relative rounded-2xl border border-border overflow-hidden bg-surface/50 shadow-surface-lg">
            <img
              src="/screenshots/extension-preview.png"
              alt="UnifyChats extension floating panel on ChatGPT"
              className="w-full h-auto"
              style={{ minHeight: '400px', objectFit: 'cover' }}
            />
            {/* Fallback placeholder if image not found */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 opacity-0 hover:opacity-0">
              <p className="text-gray-500 text-sm">Extension screenshot placeholder</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <DashboardPreview />

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
      <UseCases />
      <InstallGuide />
      <FAQ />
      <EmailCapture />
      <Footer />
    </main>
  );
}
