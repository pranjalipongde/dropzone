import Link from "next/link";
import { auth } from "@/lib/auth";
import NavbarActions from "./NavbarActions";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/products?category=sneakers", label: "Sneakers" },
  { href: "/products?category=apparel", label: "Apparel" },
  { href: "/products?category=accessories", label: "Accessories" },
];

export default async function Navbar() {
  // Runs on the server: reads the session cookie, no loading flash in the browser
  const session = await auth();

  // Pass only plain, serializable data to the client component
  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }
    : null;

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display font-bold text-xl tracking-tight"
        >
          Drop<span className="text-accent">Zone</span>
        </Link>

        {/* Nav links: hidden on mobile for now */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Cart + account (client island) */}
        <NavbarActions user={user} />
      </div>
    </header>
  );
}
