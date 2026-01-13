import { cn } from "@/lib/utils";

const platforms = [
  {
    name: "ChatGPT",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
      </svg>
    ),
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    url: "https://chatgpt.com",
  },
  {
    name: "Claude",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
      </svg>
    ),
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    url: "https://claude.ai",
  },
  {
    name: "Gemini",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.311l7.071 3.536L12 11.382 4.929 7.847 12 4.311zM4 8.882l7 3.5v7.236l-7-3.5V8.882zm9 10.736v-7.236l7-3.5v7.236l-7 3.5z" />
      </svg>
    ),
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    url: "https://gemini.google.com",
  },
  {
    name: "Grok",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "bg-gray-500/10 text-gray-300 border-gray-500/20",
    url: "https://grok.com",
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
            {platform.icon}
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <div className="scale-150">{platform.icon}</div>
          </div>
          <span className="font-medium text-gray-200">{platform.name}</span>
        </a>
      ))}
    </div>
  );
}
