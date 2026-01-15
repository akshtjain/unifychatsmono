import { Card } from "./ui/card";

const useCases = [
  {
    title: "Everyday Life",
    description: "Find that recipe AI suggested, the travel tips you asked about, or advice you got last month.",
    example: '"What was that pasta recipe Claude gave me?"',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: "Work & Projects",
    description: "Revisit ideas for presentations, email drafts, or brainstorming sessions across all your AI chats.",
    example: '"Find my conversation about the marketing plan"',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    title: "Learning & Growth",
    description: "Keep track of explanations, tutorials, and helpful answers. Build your personal learning library.",
    example: '"How did Gemini explain budgeting?"',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    title: "Creative Ideas",
    description: "Save writing inspiration, gift ideas, and creative suggestions. Your AI brainstorming, all in one place.",
    example: '"Show me birthday gift ideas I asked about"',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
];

export function UseCases() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Built for how you use AI
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Whether it&apos;s work, learning, or everyday questions — find any conversation instantly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {useCases.map((useCase, index) => (
            <Card key={index} hover className="group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-muted border border-accent-border flex items-center justify-center text-accent flex-shrink-0 group-hover:shadow-glow transition-shadow">
                  {useCase.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">
                    {useCase.description}
                  </p>
                  <div className="inline-block px-3 py-1.5 bg-gray-800/50 rounded-lg text-xs text-gray-300">
                    {useCase.example}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
