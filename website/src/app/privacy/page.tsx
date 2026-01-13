import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Privacy Policy - AI Chat Index",
  description: "Our privacy policy and how we handle your data",
};

const sections = [
  {
    title: "Information We Collect",
    content: [
      "Account Information: When you create an account, we collect your email address and authentication credentials through our authentication provider (Clerk).",
      "Chat Data: We store references to your AI chat conversations from supported platforms (ChatGPT, Claude, Gemini, Grok) that you choose to index. We do not store the actual content of your conversations on our servers - only metadata and search indexes.",
      "Usage Data: We collect information about how you use our service, including search queries, feature usage, and interaction patterns to improve our service.",
    ],
  },
  {
    title: "How We Use Your Information",
    content: [
      "To provide and maintain our indexing and search service",
      "To personalize your experience and improve our features",
      "To communicate with you about service updates and support",
      "To ensure the security and integrity of our platform",
    ],
  },
  {
    title: "Data Storage and Security",
    content: [
      "Your data is stored securely using industry-standard encryption and security practices.",
      "We use Convex as our database provider, which implements robust security measures.",
      "We never sell your personal information to third parties.",
      "Access to your data is restricted to authorized personnel only.",
    ],
  },
  {
    title: "Third-Party Services",
    content: [
      "Authentication: We use Clerk for user authentication, which has its own privacy policy.",
      "AI Platforms: Our service integrates with ChatGPT, Claude, Gemini, and Grok. Your use of these platforms is subject to their respective privacy policies.",
      "Analytics: We may use analytics services to understand usage patterns and improve our service.",
    ],
  },
  {
    title: "Your Rights",
    content: [
      "Access: You can request a copy of your personal data at any time.",
      "Deletion: You can request deletion of your account and associated data.",
      "Correction: You can update your account information through your dashboard.",
      "Export: You can export your indexed data in standard formats.",
    ],
  },
  {
    title: "Data Retention",
    content: [
      "We retain your data for as long as your account is active.",
      "Upon account deletion, we remove your personal data within 30 days.",
      "Some anonymized usage data may be retained for analytics purposes.",
    ],
  },
  {
    title: "Changes to This Policy",
    content: [
      "We may update this privacy policy from time to time.",
      "We will notify you of any significant changes via email or through our service.",
      "Continued use of our service after changes constitutes acceptance of the updated policy.",
    ],
  },
  {
    title: "Contact Us",
    content: [
      "If you have any questions about this privacy policy or our data practices, please contact us through our support page or reach out via email.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Nav />

      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-400 text-lg">
              Last updated: January 2025
            </p>
          </div>

          <div className="mb-8 p-6 rounded-xl bg-surface border border-border">
            <p className="text-gray-300 leading-relaxed">
              At AI Chat Index, we take your privacy seriously. This policy
              describes how we collect, use, and protect your personal
              information when you use our service to index and search your AI
              conversations.
            </p>
          </div>

          <div className="space-y-8">
            {sections.map((section, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-card border border-border"
              >
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="text-gray-400 leading-relaxed flex gap-3"
                    >
                      <span className="text-accent mt-1.5 flex-shrink-0">
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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
