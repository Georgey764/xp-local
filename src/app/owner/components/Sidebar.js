"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Zap,
  ShieldCheck,
  Activity,
  Settings2,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BarChart3, // Added for Analytics
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email);
    };
    getUser();
  }, [supabase, mounted]);

  const menu = [
    { label: "Verify Code", icon: ShieldCheck, path: "/owner" },
    { label: "Live Feed", icon: Activity, path: "/owner/feed" },
    { label: "Analytics", icon: BarChart3, path: "/owner/stats" }, // New Stats Page
    { label: "Campaigns", icon: Settings2, path: "/owner/setup" },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!mounted)
    return (
      <div className="hidden lg:block w-72 bg-white h-screen border-r border-neutral-100" />
    );

  return (
    <>
      {/* MOBILE TRIGGER */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-5 left-5 z-[100] p-3 bg-primary text-white rounded-2xl shadow-xl active:scale-90 cursor-pointer border-none"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* BACKDROP */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR ASIDE */}
      <aside
        className={`
          fixed top-0 left-0 z-[90] w-72 bg-white flex flex-col border-r border-neutral-100
          transition-transform duration-500 ease-in-out
          h-screen lg:h-screen lg:sticky lg:top-0 shrink-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* LOGO AREA */}
        <div className="p-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform hover:rotate-6">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="font-black text-xl uppercase italic tracking-tighter leading-none text-black">
                XP LOCAL
              </h2>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-black/20">
                Store Owner
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION AREA */}
        <nav className="flex-1 px-6 space-y-2 overflow-y-auto no-scrollbar">
          {menu.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className="relative block"
              >
                <div
                  className={`
                  flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all
                  ${
                    isActive
                      ? "bg-primary text-white shadow-xl shadow-primary/25"
                      : "text-black/40 hover:text-black hover:bg-neutral-50"
                  }
                `}
                >
                  <div className="flex items-center gap-4">
                    <item.icon
                      size={18}
                      className={isActive ? "text-white" : "text-black/20"}
                    />
                    {item.label}
                  </div>
                  {isActive && <ChevronRight size={14} />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER AREA */}
        <div className="p-6 space-y-4 shrink-0 mt-auto border-t border-neutral-100">
          {/* USER CARD */}
          <div className="bg-neutral-50 rounded-[2.5rem] p-4 flex items-center gap-3 border border-neutral-100">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-neutral-100 font-black text-primary text-xs">
              {userEmail ? userEmail[0].toUpperCase() : "O"}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[9px] font-black uppercase tracking-wider truncate text-black">
                {userEmail ? userEmail.split("@")[0] : "Admin"}
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--color-accent)]" />
                <span className="text-[7px] font-bold text-black/30 uppercase tracking-widest">
                  Live Terminal
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-black/40 hover:bg-red-500/10 hover:text-red-500 transition-all group cursor-pointer border-none"
          >
            <LogOut
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
