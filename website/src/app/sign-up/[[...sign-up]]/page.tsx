import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px]" />
      </div>

      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-surface border border-border shadow-surface-lg",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            socialButtonsBlockButton:
              "bg-surface-elevated border-border hover:bg-surface-overlay",
            formFieldLabel: "text-gray-300",
            formFieldInput:
              "bg-surface-elevated border-border text-white placeholder:text-gray-500",
            footerActionLink: "text-accent hover:text-accent/80",
          },
        }}
      />
    </main>
  );
}
