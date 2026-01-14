import { cn } from "@/lib/utils";

const platforms = [
  {
    name: "ChatGPT",
    logo: "/logos/chat-gpt-white.svg",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    url: "https://chatgpt.com",
  },
  {
    name: "Claude",
    logo: "/logos/claude-logo.svg",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    url: "https://claude.ai",
  },
  {
    name: "Gemini",
    logo: "/logos/gemini-logo.svg",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    url: "https://gemini.google.com",
  },
  {
    name: "Grok",
    logo: "/logos/grok-logo.svg",
    color: "bg-gray-500/10 text-gray-300 border-gray-500/20",
    url: "https://grok.com",
  },
  {
    name: "Perplexity",
    logo: "/logos/perplexity-logo.svg",
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    url: "https://perplexity.ai",
  },
];

interface PlatformIconsProps {
  className?: string;
  showLinks?: boolean;
}

export function PlatformIcons({ className, showLinks = false }: PlatformIconsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {platforms.map((platform) => {
        const content = (
          <div
            key={platform.name}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors",
              platform.color,
              showLinks && "hover:border-current/40 cursor-pointer"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={platform.logo}
              alt={`${platform.name} logo`}
              width={16}
              height={16}
              className="w-4 h-4 object-contain"
            />
            <span className="text-sm font-medium">{platform.name}</span>
          </div>
        );

        if (showLinks) {
          return (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {content}
            </a>
          );
        }

        return content;
      })}
    </div>
  );
}

export function PlatformGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {platforms.map((platform) => (
        <a
          key={platform.name}
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-300",
            "bg-surface hover:bg-surface-elevated",
            "border-border hover:border-border-accent",
            "hover:-translate-y-1 hover:shadow-surface"
          )}
        >
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              platform.color
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={platform.logo}
              alt={`${platform.name} logo`}
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
            />
          </div>
          <span className="font-medium text-gray-200">{platform.name}</span>
        </a>
      ))}
    </div>
  );
}
