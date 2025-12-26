import Logo from "@/components/global/Logo";

export default function BuilderHeader() {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex justify-between items-center">
      <Logo color="neutral" />
      <div className="hidden sm:flex items-center gap-1 bg-surface px-3 py-1 rounded-full border border-border">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-widest">
          Builder Mode
        </span>
      </div>
    </nav>
  );
}
