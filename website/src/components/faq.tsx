"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

const faqs = [
  {
    question: "Is this extension safe to use?",
    answer:
      "Yes. The extension only runs on AI chat websites, doesn't collect any data, makes no network requests, and all code is open source for you to review.",
  },
  {
    question: "Why isn't it in the Chrome Web Store?",
    answer:
      "Publishing to the Chrome Web Store requires a developer account ($5 one-time fee) and review process. We're working on getting it listed. For now, you can load it manually using the steps above—it's just as safe.",
  },
  {
    question: "The index isn't showing any messages",
    answer:
      "AI chat websites occasionally update their code which can break the extension. Try refreshing the page first. If it still doesn't work, check for extension updates or report the issue on GitHub.",
  },
  {
    question: "Can I use this on mobile?",
    answer:
      "Currently, this extension only works on desktop browsers. Mobile browser extensions have limited support, but we may explore options in the future.",
  },
  {
    question: "Will you add support for other AI chat sites?",
    answer:
      "Yes! We plan to add support for more platforms. If you have a specific site in mind, let us know by opening an issue on GitHub.",
  },
  {
    question: "Firefox says the extension is 'temporary'",
    answer:
      "Firefox requires extensions to be signed for permanent installation. You can still use it, but you'll need to reload it after restarting Firefox. We're working on getting it signed.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently asked questions
          </h2>
          <p className="text-gray-400 text-lg">
            Everything you need to know about AI Chat Index.
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
