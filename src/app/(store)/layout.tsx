export default function StoreLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar stub — replaced in Module 4 ── */}
      <header className="sticky top-0 z-50 h-16 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md flex items-center px-6">
        <span className="font-display font-bold text-xl tracking-tight">
          Drop<span className="text-accent">Zone</span>
        </span>
      </header>

      {/* ── Page content renders here ── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer stub — replaced later ── */}
      <footer className="h-16 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
        <span className="text-sm text-neutral-400">
          © 2025 DropZone. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
