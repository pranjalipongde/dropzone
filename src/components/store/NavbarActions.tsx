"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  ShoppingBag,
  Package,
  UserRound,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useCartStore, selectTotalItems } from "@/store/cart";

interface NavbarActionsProps {
  user: { name?: string | null; email?: string | null; role?: string } | null;
}

export default function NavbarActions({ user }: NavbarActionsProps) {
  // Selector: this component re-renders only when the total count changes
  const cartCount = useCartStore(selectTotalItems);

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when the user clicks anywhere outside it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();

  const itemClass =
    "flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors";

  return (
    <div className="flex items-center gap-3">
      {/* ── Cart ── */}
      <Link
        href="/cart"
        aria-label={`Cart, ${cartCount} items`}
        className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <ShoppingBag size={22} />
        {cartCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-accent text-neutral-950 text-[11px] font-bold flex items-center justify-center">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </Link>

      {/* ── Account ── */}
      {user ? (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Account menu"
            aria-expanded={open}
            className="w-9 h-9 rounded-full bg-accent text-neutral-950 font-display font-bold flex items-center justify-center hover:bg-accent-dark transition-colors"
          >
            {initial}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <p className="text-sm font-semibold truncate">
                  {user.name ?? "Account"}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {user.email}
                </p>
              </div>

              <Link
                href="/account/orders"
                onClick={() => setOpen(false)}
                className={itemClass}
              >
                <Package size={16} /> My orders
              </Link>
              <Link
                href="/account/profile"
                onClick={() => setOpen(false)}
                className={itemClass}
              >
                <UserRound size={16} /> Profile
              </Link>

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className={itemClass}
                >
                  <LayoutDashboard size={16} /> Admin panel
                </Link>
              )}

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className={`${itemClass} w-full text-left border-t border-neutral-200 dark:border-neutral-800`}
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="px-5 py-2 rounded-full bg-accent text-neutral-950 text-sm font-semibold hover:bg-accent-dark transition-colors"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}
