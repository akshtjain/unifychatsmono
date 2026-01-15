"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

const faqs = [
  {
    question: "How is this different from browser history?",
    answer:
      "Browser history only saves URLs — you still have to manually scroll through each conversation to find what you need. UnifyChats indexes every message and lets you search by content across all platforms. Plus, your data syncs to the cloud so you can access it from any device.",
  },
  {
    question: "What happens to my conversations if I use AI on another device?",
    answer:
      "As long as you have the extension installed and you're signed in, conversations sync automatically to your account. You can access all your indexed conversations from any device through the web dashboard.",
  },
  {
    question: "Which AI platforms are supported?",
    answer:
      "We currently support ChatGPT, Claude, Gemini, Grok, and Perplexity. We're actively adding more platforms based on user requests. The extension only activates on supported sites.",
  },
  {
    question: "Can I export my conversations?",
    answer:
      "Yes! You can export conversations in JSON or Markdown format. We're also working on direct integrations with Notion, Obsidian, and other note-taking apps.",
  },
  {
    question: "Is my data private?",
    answer:
      "Absolutely. Your conversations are encrypted in transit and stored securely. We don't read, analyze, or train on your data. You can delete your data at any time from the dashboard.",
  },
  {
    question: "Is it free?",
    answer:
      "The core features are free forever — sync, search, bookmarks, and projects. We're building premium features like smarter search and usage insights that will be available on paid plans.",
  },
  {
    question: "Why do I need to load the extension manually?",
    answer:
      "We're in the process of getting the extension listed on the Chrome Web Store and Firefox Add-ons. For now, you can load it manually in developer mode — it takes about a minute and works exactly the same.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Questions & answers
          </h2>
          <p className="text-gray-400 text-lg">
            Everything you need to know about UnifyChats.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-surface rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-elevated transition-colors"
              >
                <span className="font-medium text-white pr-4">{faq.question}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn(
                    "w-5 h-5 text-gray-500 transition-transform flex-shrink-0",
                    openIndex === index && "rotate-180"
                  )}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openIndex === index ? "max-h-96" : "max-h-0"
                )}
              >
                <p className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
