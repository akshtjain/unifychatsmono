import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative w-8 h-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/unify-chats-app.png"
          alt="UnifyChats logo"
          width={32}
          height={32}
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <span className="font-semibold text-foreground">UnifyChats</span>
      )}
    </div>
  );
}
