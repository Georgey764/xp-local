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
    <div className="bg-white min-h-screen flex flex-col">
      <main className="flex-1 pb-24">{children}</main>

      {/* Persistent Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-neutral-100 px-8 py-5 flex justify-around items-center z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${
                isActive ? "text-[oklch(64%_0.24_274)]" : "text-neutral-300"
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 3 : 2} />
              <span
                className={`text-[8px] font-black uppercase tracking-widest ${
                  isActive ? "opacity-100" : "opacity-40"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
