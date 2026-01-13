"use client";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { useState } from "react";
import { MessageCircle, Mail, Github, ChevronDown, ExternalLink } from "lucide-react";

const faqs = [
  {
    question: "How do I get started with AI Chat Index?",
    answer:
      "Getting started is easy! Simply sign up for an account, install our browser extension for your preferred browser, and connect your AI chat platforms. The extension will automatically index your conversations, making them searchable from your dashboard.",
  },
  {
    question: "Which AI platforms are supported?",
    answer:
      "We currently support ChatGPT, Claude, Google Gemini, and Grok. We're actively working on adding support for more platforms. If there's a specific platform you'd like to see supported, please let us know!",
  },
  {
    question: "Is my chat data secure?",
    answer:
      "Yes, we take security very seriously. We don't store the actual content of your conversations on our servers - only metadata and search indexes. All data is encrypted in transit and at rest. See our Privacy Policy for more details.",
  },
  {
    question: "Can I delete my indexed data?",
    answer:
      "Absolutely. You have full control over your data. You can delete individual indexed conversations or clear all your data from the dashboard settings. Account deletion will remove all associated data within 30 days.",
  },
  {
    question: "Is there a free plan available?",
    answer:
      "Yes! AI Chat Index offers a free tier that allows you to index and search your conversations across all supported platforms. We also offer premium plans with additional features for power users.",
  },
  {
    question: "How do I report a bug or request a feature?",
    answer:
      "We love hearing from our users! You can report bugs or request features through our GitHub repository, or send us an email directly. We review all feedback and prioritize based on community interest.",
  },
];

const contactMethods = [
  {
    icon: Github,
    title: "GitHub",
    description: "Report issues or contribute to our open source project",
    link: "https://github.com",
    linkText: "View Repository",
  },
  {
    icon: Mail,
    title: "Email",
    description: "Reach out directly for support inquiries",
    link: "mailto:smartmedia761@gmail.com",
    linkText: "smartmedia761@gmail.com",
  },
  {
    icon: MessageCircle,
    title: "Community",
    description: "Join our community for discussions and help",
    link: "https://discord.com",
    linkText: "Join Discord",
  },
];

export default function SupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <main className="min-h-screen">
      <Nav />

      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Support Center
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Find answers to common questions or get in touch with our team.
              We're here to help you get the most out of AI Chat Index.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 rounded-xl bg-card border border-border hover:border-accent/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <method.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {method.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  {method.description}
                </p>
                <span className="text-accent text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  {method.linkText}
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            ))}
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-surface border border-border overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-card/50 transition-colors"
                  >
                    <span className="font-medium text-foreground pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openIndex === index ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ${openIndex === index ? "max-h-96" : "max-h-0"
                      }`}
                  >
                    <p className="px-6 pb-4 text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-16 p-8 rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Still need help?
            </h3>
            <p className="text-gray-400 mb-4">
              Can't find what you're looking for? Our team is happy to assist.
            </p>
            <a
              href="mailto:smartmedia761@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-black font-medium hover:bg-accent/90 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
