import Navbar from "@/components/store/Navbar";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">{children}</main>

      {/* Footer stub, replaced during polish in Module 12 */}
      <footer className="h-16 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
        <span className="text-sm text-neutral-400">
          © 2026 DropZone. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
