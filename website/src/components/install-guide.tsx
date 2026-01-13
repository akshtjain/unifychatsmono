"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

type Browser = "chrome" | "firefox";

const steps = {
  chrome: [
    {
      title: "Download the extension",
      description: "Click the button below to download the Chrome extension package.",
      action: {
        label: "Download for Chrome",
        href: "/ai-chat-index-chrome.zip",
      },
    },
    {
      title: "Unzip the download",
      description:
        "Find the downloaded ZIP file and extract it. Remember where you save the folder.",
    },
    {
      title: "Open Extensions page",
      description: "Go to your browser's extension management page.",
      code: "chrome://extensions",
    },
    {
      title: "Enable Developer Mode",
      description:
        "Find the 'Developer mode' toggle in the top-right corner and turn it on.",
    },
    {
      title: "Load the extension",
      description:
        "Click 'Load unpacked' and select the folder you extracted in step 2.",
    },
  ],
  firefox: [
    {
      title: "Download the extension",
      description: "Click the button below to download the Firefox extension package.",
      action: {
        label: "Download for Firefox",
        href: "/ai-chat-index-firefox.zip",
      },
    },
    {
      title: "Unzip the download",
      description:
        "Find the downloaded ZIP file and extract it. Remember where you save the folder.",
    },
    {
      title: "Open Add-ons Debugging",
      description: "Go to Firefox's debugging page for extensions.",
      code: "about:debugging#/runtime/this-firefox",
    },
    {
      title: "Load the extension",
      description:
        "Click 'Load Temporary Add-on' and select the manifest.json file inside your extracted folder.",
    },
  ],
};

export function InstallGuide() {
  const [browser, setBrowser] = useState<Browser>("chrome");

  return (
    <section id="install" className="py-24 md:py-32 bg-gradient-subtle">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Install in under a minute
          </h2>
          <p className="text-gray-400 text-lg">
            No technical knowledge required. Just follow these steps.
          </p>
        </div>

        {/* Browser tabs */}
        <div className="flex justify-center gap-2 mb-10">
          <button
            onClick={() => setBrowser("chrome")}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
              browser === "chrome"
                ? "bg-white text-gray-950"
                : "bg-surface text-gray-400 hover:text-white border border-border hover:border-border-accent"
            )}
          >
            Chrome / Edge / Brave
          </button>
          <button
            onClick={() => setBrowser("firefox")}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
              browser === "firefox"
                ? "bg-white text-gray-950"
                : "bg-surface text-gray-400 hover:text-white border border-border hover:border-border-accent"
            )}
          >
            Firefox
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps[browser].map((step, index) => (
            <div
              key={index}
              className="flex gap-5 p-5 bg-surface rounded-2xl border border-border"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 border border-accent-border flex items-center justify-center text-accent font-semibold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{step.description}</p>

                {step.code && (
                  <code className="inline-block px-4 py-2 bg-gray-900 rounded-lg text-accent text-sm font-mono select-all">
                    {step.code}
                  </code>
                )}

                {step.action && (
                  <a
                    href={step.action.href}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-4 h-4"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {step.action.label}
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* Success state */}
          <div className="flex gap-5 p-5 bg-surface rounded-2xl border border-green-500/30">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="w-5 h-5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">You&apos;re all set!</h3>
              <p className="text-gray-400 text-sm">
                Visit any supported AI chat and look for the purple button in the
                bottom-right corner.
              </p>
            </div>
          </div>
        </div>

        {/* Note for Firefox */}
        {browser === "firefox" && (
          <p className="text-center text-gray-500 text-sm mt-6">
            Note: Firefox temporary add-ons need to be reloaded after browser restart.
          </p>
        )}
      </div>
    </section>
  );
}
