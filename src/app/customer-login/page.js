"use client";

import React, { useState } from "react";
import { Zap, ArrowRight, Chrome, ShieldCheck, Gift, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  const handleOAuthClick = async (provider) => {
    setIsLoading(true);
    // Note: The loading timeout is just for visual feedback
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
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col lg:flex-row selection:bg-accent selection:text-black">
      {/* Left Column: Brand & Social Proof */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-800 relative overflow-hidden flex-col justify-between p-12">
        {/* Animated Background Blobs using semantic theme colors */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div
            onClick={() => router.push("/")}
            className="cursor-pointer flex items-center gap-2 mb-12 group w-fit"
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-neutral-50">
              XP<span className="text-primary">LOCAL</span>
            </span>
          </div>

          <h2 className="text-5xl font-black text-neutral-50 leading-tight mb-6">
            Welcome back to the <br />
            <span className="text-accent italic">Leaderboard.</span>
          </h2>
          <p className="text-xl text-neutral-200 opacity-60 max-w-md font-medium leading-relaxed">
            Access your personal dashboard to track XP, claim rewards, and
            dominate your local venue feeds.
          </p>
        </div>

        {/* Floating Reward Preview */}
        <div className="absolute bottom-40 right-10 z-20 animate-bounce transition-transform duration-1000 hidden xl:block">
          <div className="bg-reward p-4 rounded-2xl shadow-2xl rotate-12">
            <Gift className="text-white" size={24} />
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="relative z-10 mt-auto bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem]">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-neutral-800 bg-neutral-900 overflow-hidden"
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
            <p className="text-sm font-bold text-neutral-50">
              Trusted by 5,000+ local advocates
            </p>
          </div>
          <p className="text-neutral-200 italic font-medium leading-relaxed opacity-80">
            &quot;Being an advocate for my favorite cafe actually pays for my
            lunch now. The XP Local system makes every visit feel like a
            win.&quot;
          </p>
          <div className="flex items-center justify-between mt-6">
            <p className="text-accent text-sm font-black uppercase tracking-widest">
              — Sarah Jenkins
            </p>
            <div className="flex gap-1 text-reward">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill="currentColor" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: OAuth Login Interface */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-24 relative bg-background">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile Logo Only */}
          <div
            onClick={() => router.push("/")}
            className="cursor-pointer lg:hidden flex items-center gap-2 mb-12"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg">
              <Zap className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase text-neutral-950">
              XP<span className="text-primary">LOCAL</span>
            </span>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl font-black mb-3 tracking-tight text-neutral-950">
              Customer Sign In
            </h1>
            <p className="opacity-40 font-medium text-lg leading-relaxed text-neutral-900">
              Use your verified social account to securely access your rewards
              and track your visits.
            </p>
          </div>

          <div className="space-y-4">
            {/* Google OAuth Button */}
            <button
              onClick={() => handleOAuthClick("google")}
              disabled={isLoading}
              className="w-full group flex items-center justify-between px-8 py-5 bg-surface border-2 border-neutral-100 rounded-[2.5rem] hover:border-primary transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <Chrome size={24} className="text-primary" />
                <span className="font-black text-lg text-neutral-900">
                  Continue with Google
                </span>
              </div>
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
            </button>
          </div>

          <p className="mt-12 text-center text-[10px] font-black opacity-20 uppercase tracking-[0.3em] text-neutral-900">
            Secure Portal for XP Local Customers
          </p>
        </div>

        {/* Status Bar */}
        <div className="mt-auto pt-10 text-center lg:text-left flex items-center justify-center lg:justify-start gap-4 border-t border-neutral-100">
          <button className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
            <ShieldCheck size={14} className="text-primary" /> Encrypted Session
          </button>
          <span className="w-1 h-1 rounded-full bg-neutral-200"></span>
          <button className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
            Version: 2.5.0
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
