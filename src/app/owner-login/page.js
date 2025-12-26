"use client";

import Logo from "@/components/global/Logo";
import React, { useState } from "react";
import {
  Zap,
  ArrowRight,
  Github,
  Chrome,
  ShieldCheck,
  Gift,
  Star,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const Page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleOAuthClick = async (provider) => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
    console.log(`Initiating OAuth flow for: ${provider}`);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        // Redirects back to your local dev environment after login
        redirectTo: `${
          window.location.origin
        }/auth/callback?next=${encodeURIComponent("/builder")}`,
      },
    });
    if (error) console.error(error);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased flex flex-col lg:flex-row">
      {/* Left Column: Brand & Social Proof */}
      <div className="hidden lg:flex lg:w-1/2 bg-[oklch(28%_0.04_260)] relative overflow-hidden flex-col justify-between p-12">
        {/* Animated Background Blobs using semantic theme colors */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[oklch(64%_0.24_274)]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-[oklch(88%_0.19_118)]/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <Logo />

          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            Welcome back to the <br />
            <span className="text-[oklch(88%_0.19_118)]">Leaderboard.</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-md font-medium leading-relaxed">
            Access your secure venue dashboard to track ROI, manage custom
            rewards, and monitor brand advocates.
          </p>
        </div>

        {/* Floating Reward Preview */}
        <div className="absolute bottom-40 right-10 z-20 animate-bounce transition-transform duration-1000 hidden xl:block">
          <div className="bg-[oklch(84%_0.17_75)] p-4 rounded-2xl shadow-2xl rotate-12">
            <Gift className="text-white" size={24} />
          </div>
        </div>

        <div className="relative z-10 mt-auto bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem]">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-[oklch(28%_0.04_260)] bg-slate-700 overflow-hidden"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                      i + 25
                    }`}
                    alt="User"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm font-bold text-white">
              Trusted by 500+ premium venues
            </p>
          </div>
          <p className="text-slate-300 italic font-medium leading-relaxed">
            &quot;The data-driven insights from XP Local changed how we think
            about loyalty. Our organic social reach has never been higher.&quot;
          </p>
          <div className="flex items-center justify-between mt-4">
            <p className="text-[oklch(88%_0.19_118)] text-sm font-black uppercase tracking-widest">
              — Sunset Bistro
            </p>
            <div className="flex gap-1 text-[oklch(84%_0.17_75)]">
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: OAuth Login Interface */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-24 relative">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile Logo Only */}
          <div
            onClick={() => {
              router.push("/");
            }}
            className="cursor-pointer lg:hidden flex items-center gap-2 mb-12"
          >
            <div className="w-8 h-8 bg-[oklch(64%_0.24_274)] rounded-lg flex items-center justify-center shadow-lg">
              <Zap className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="text-xl font-black tracking-tighter">
              XP<span className="text-[oklch(64%_0.24_274)]">LOCAL</span>
            </span>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl font-black mb-3 tracking-tight">
              Partner Sign In
            </h1>
            <p className="opacity-60 font-medium text-lg leading-relaxed">
              For your security, we use verified social authentication to manage
              your venue.
            </p>
          </div>

          <div className="space-y-4">
            {/* Google OAuth Button */}
            <button
              onClick={() => handleOAuthClick("google")}
              disabled={isLoading}
              className="w-full group flex items-center justify-between px-8 py-5 bg-white dark:bg-[oklch(22%_0.03_260)] border-2 border-neutral-100 dark:border-neutral-800 rounded-[2rem] hover:border-[oklch(64%_0.24_274)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <Chrome size={24} className="text-[oklch(64%_0.24_274)]" />
                <span className="font-black text-lg">Continue with Google</span>
              </div>
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* <div className="mt-12 p-6 bg-[oklch(96%_0.01_60)] dark:bg-[oklch(22%_0.03_260)] rounded-3xl border border-neutral-100 dark:border-neutral-800 flex gap-4">
            <Info className="text-[oklch(64%_0.24_274)] shrink-0" size={20} />
            <p className="text-sm font-medium opacity-60 leading-relaxed">
              If you already have an account, your data will be automatically
              synced. New to XP Local?
              <a
                href="/owner-register"
                className="ml-1 text-[oklch(64%_0.24_274)] font-black hover:underline underline-offset-4"
              >
                Register your venue first.
              </a>
            </p>
          </div> */}

          <p className="mt-12 text-center text-xs font-bold opacity-30 uppercase tracking-[0.2em]">
            Secure B2B Portal for Partners
          </p>
        </div>

        {/* Status Bar */}
        <div className="mt-auto pt-10 text-center lg:text-left flex items-center justify-center lg:justify-start gap-4">
          <button className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
            <ShieldCheck size={14} /> Encrypted Session
          </button>
          <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
          <button className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
            Support: v2.0.4
          </button>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import "tailwindcss";

        @theme {
          --color-primary: oklch(64% 0.24 274);
          --color-accent: oklch(88% 0.19 118);
          --color-reward: oklch(84% 0.17 75);
          --color-neutral-50: oklch(99% 0.005 60);
          --color-neutral-950: oklch(14% 0.02 260);

          --color-background: var(--color-neutral-50);
          --color-foreground: oklch(20% 0.05 260);
        }

        .dark {
          --color-background: var(--color-neutral-950);
          --color-foreground: oklch(92% 0.02 260);
        }

        @media (prefers-color-scheme: dark) {
          :root:not(.light) {
            --color-background: var(--color-neutral-950);
            --color-foreground: oklch(92% 0.02 260);
          }
        }

        :root {
          --background: var(--color-background);
          --foreground: var(--color-foreground);
        }

        body {
          background: var(--background);
          color: var(--foreground);
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }
        .animate-pulse {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `,
        }}
      />
    </div>
  );
};

export default Page;
