"use client";

import React, { useState } from "react";
import { Zap, ArrowRight, Chrome, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  const handleOAuthClick = async (provider) => {
    setIsLoading(true);
    // Visual feedback delay
    setTimeout(() => setIsLoading(false), 1000);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${
          window.location.origin
        }/auth/callback?next=${encodeURIComponent("/customer")}`,
      },
    });
    if (error) console.error(error);
  };

  return (
    /* Force white background and black text explicitly */
    <div className="min-h-screen bg-white text-black font-sans antialiased flex flex-col lg:flex-row selection:bg-accent selection:text-black">
      {/* Left Column: Brand Identity (Forced Dark Section) */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-800 relative overflow-hidden flex-col justify-center p-12">
        {/* Aesthetic Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 space-y-8">
          <div
            onClick={() => router.push("/")}
            className="cursor-pointer flex items-center gap-2 group w-fit"
          >
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <Zap className="w-8 h-8 fill-current" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white uppercase">
              XP<span className="text-primary">LOCAL</span>
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-6xl font-black text-white leading-[0.9] tracking-tighter">
              The Hub for <br />
              <span className="text-accent italic">Advocates.</span>
            </h2>
            <p className="text-xl text-white/60 max-w-md font-medium leading-relaxed">
              Sign in to manage your rewards, track your social impact, and
              level up your local status.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: OAuth Login Interface (Forced Light Section) */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-24 relative bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile Logo Only (Forced Black/White) */}
          <div
            onClick={() => router.push("/")}
            className="cursor-pointer lg:hidden flex items-center gap-2 mb-12"
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase text-black">
              XP<span className="text-primary">LOCAL</span>
            </span>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl font-black mb-3 tracking-tight text-black">
              Customer Sign In
            </h1>
            <p className="text-black/50 font-medium text-lg leading-relaxed">
              Verified social authentication required for secure reward access.
            </p>
          </div>

          <div className="space-y-4">
            {/* Google OAuth Button - Forced light styles */}
            <button
              onClick={() => handleOAuthClick("google")}
              disabled={isLoading}
              className="w-full group flex items-center justify-between px-8 py-6 bg-white border-2 border-neutral-100 rounded-[2rem] hover:border-primary transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="flex items-center gap-4 text-black">
                <Chrome size={24} className="text-primary" />
                <span className="font-black text-lg">Continue with Google</span>
              </div>
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
            </button>
          </div>

          <div className="mt-12 flex justify-center">
            <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">
              Secure Terminal 2.5.0
            </p>
          </div>
        </div>

        {/* Status Bar - Forced light styling */}
        <div className="mt-auto pt-10 text-center lg:text-left flex items-center justify-center lg:justify-start gap-4 border-t border-neutral-100">
          <button className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors">
            <ShieldCheck size={14} className="text-primary" /> Encrypted Session
          </button>
          <span className="w-1 h-1 rounded-full bg-neutral-200"></span>
          <button className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors">
            Terms & Privacy
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
