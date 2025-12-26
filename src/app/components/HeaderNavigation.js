"use client";

import { Menu, X, Zap, LayoutDashboard, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const checkUser = async () => {
      const {
        data: { user: activeUser },
      } = await supabase.auth.getUser();
      setUser(activeUser);
    };
    checkUser();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [supabase]);

  const handleAction = () => {
    user ? router.push("/owner") : router.push("/owner-login");
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled ? "py-3 px-4" : "py-6 px-6"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto transition-all duration-500 rounded-2xl ${
          scrolled
            ? "bg-surface/90 backdrop-blur-md shadow-sm border border-border px-6 py-2"
            : "bg-transparent px-0 py-0"
        }`}
      >
        <div className="flex justify-between items-center h-12">
          {/* Logo - Using the primary variable */}
          <div
            onClick={() => router.push("/")}
            className="flex items-center gap-2 group cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-all shadow-lg shadow-primary/20">
              <Zap className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground">
              XP<span className="text-primary">LOCAL</span>
            </span>
          </div>

          {/* Desktop Nav - Using muted and surface variables */}
          <div className="hidden md:flex items-center bg-muted/50 rounded-full px-1.5 py-1 border border-border shadow-inner">
            {["Product", "How it Works", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-5 py-1.5 text-sm font-semibold text-foreground/70 hover:text-primary transition-all rounded-full hover:bg-surface"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Dynamic Action Button - Replaced bg-neutral-900 with foreground logic */}
          <div className="hidden md:flex items-center">
            <button
              onClick={handleAction}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-foreground text-background hover:ring-4 hover:ring-primary/20 transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              {user ? (
                <>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-muted text-foreground active:scale-90 transition-transform cursor-pointer"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed inset-x-4 top-24 transition-all duration-500 ease-out ${
          isMenuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-8 pointer-events-none"
        }`}
      >
        <div className="bg-surface rounded-[2.5rem] p-8 shadow-2xl border border-border">
          <div className="space-y-6 mb-8 text-center">
            {["Product", "How it Works", "Pricing"].map((item) => (
              <a
                key={item}
                href="#"
                className="block text-3xl font-black tracking-tight text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="pt-6 border-t border-border">
            <button
              onClick={handleAction}
              className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 cursor-pointer hover:opacity-90 transition-opacity"
            >
              {user ? "Go to Dashboard" : "Sign In to Owner Portal"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
