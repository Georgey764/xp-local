"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { ShoppingBag, Ticket, Sparkles } from "lucide-react";

export default function VenueLayout({ children }) {
  const pathname = usePathname();
  const { venueId } = useParams();

  const navItems = [
    { label: "Earn", path: `/customer/${venueId}/earn`, icon: Sparkles },
    { label: "Shop", path: `/customer/${venueId}`, icon: ShoppingBag },
    { label: "Wallet", path: `/customer/${venueId}/codes`, icon: Ticket },
  ];

  return (
    <div className="bg-background min-h-screen flex flex-col transition-colors duration-500">
      <main className="flex-1 pb-24">{children}</main>

      {/* Persistent Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-2xl border-t border-border px-8 py-5 pb-8 flex justify-around items-center z-50">
        {navItems.map((item) => {
          // Check if path matches exactly or is the root of the shop
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${
                isActive
                  ? "text-primary"
                  : "text-foreground/30 hover:text-foreground/60"
              }`}
            >
              <item.icon
                size={20}
                strokeWidth={isActive ? 3 : 2}
                className={
                  isActive ? "drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" : ""
                }
              />
              <span
                className={`text-[8px] font-black uppercase tracking-widest ${
                  isActive ? "opacity-100" : "opacity-40"
                }`}
              >
                {item.label}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
