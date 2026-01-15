export function DashboardPreview() {
  return (
    <section className="py-16 md:py-24 bg-gradient-subtle">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your AI conversations, organized
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Access all your chats from one dashboard. Search, bookmark, and organize across every platform.
          </p>
        </div>

        {/* Placeholder for dashboard screenshot */}
        <div className="relative rounded-2xl border border-border overflow-hidden bg-surface/50 shadow-surface-lg">
          <img
            src="/screenshots/dashboard-preview.png"
            alt="UnifyChats dashboard showing conversations from multiple AI platforms"
            className="w-full h-auto"
            style={{ minHeight: '400px', objectFit: 'cover' }}
          />
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
          >
            Try the dashboard
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
