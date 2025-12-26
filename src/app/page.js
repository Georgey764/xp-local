"use client";

import React, { useState, useEffect } from "react";
import HeaderNavigation from "./components/HeaderNavigation";
import {
  Zap,
  Camera,
  MapPin,
  ChevronRight,
  ArrowRight,
  Smartphone,
  BarChart3,
  Share2,
  ShieldCheck,
  Star,
  Menu,
  X,
  Gift,
  TrendingUp,
} from "lucide-react";

const App = () => {
  const features = [
    {
      icon: <Camera className="w-6 h-6 text-[oklch(64%_0.24_274)]" />,
      title: "Social Mining Engine",
      description:
        "Automatically detect and reward customer selfies and stories. Turn diners into your 24/7 high-impact marketing team.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[oklch(88%_0.19_118)]" />,
      title: "Fraud-Proof Tracking",
      description:
        "GPS-fencing and rotating QR IDs ensure rewards are only claimed by customers physically verified at your venue.",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-[oklch(84%_0.17_75)]" />,
      title: "The ROI Dashboard",
      description:
        "Track 'Customer Lifetime Value' (CLV) growth. See exactly which posts led to new walk-ins and repeat visits.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[oklch(88%_0.19_118)] selection:text-black antialiased">
      <HeaderNavigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-52 lg:pb-40 overflow-hidden">
        {/* Aesthetic Background Blobs using new Palette */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-10 left-0 w-96 h-96 bg-[oklch(64%_0.24_274)] rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-40" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-[oklch(88%_0.19_118)] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 opacity-40" />
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-[oklch(84%_0.17_75)] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[oklch(96%_0.01_60)] dark:bg-[oklch(22%_0.03_260)] border border-neutral-200 dark:border-neutral-700 text-[oklch(64%_0.24_274)] text-xs font-black mb-8 uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[oklch(64%_0.24_274)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[oklch(64%_0.24_274)]"></span>
              </span>
              Next-Gen B2B Gamification
            </div>

            <h1 className="text-6xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
              Turn your diners into <br className="hidden lg:block" />
              <span className="text-[oklch(64%_0.24_274)] underline decoration-[oklch(88%_0.19_118)] decoration-8 underline-offset-8">
                brand advocates.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-xl lg:text-2xl opacity-70 mb-12 font-medium leading-relaxed">
              XP Local uses digital incentives and social mining to turn casual
              visits into viral growth and lifetime loyalty.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-10 py-5 bg-[oklch(64%_0.24_274)] text-white font-black rounded-[2rem] hover:bg-[oklch(58%_0.23_274)] transition-all shadow-xl shadow-[oklch(64%_0.24_274)]/20 hover:-translate-y-1 flex items-center justify-center gap-2 group">
                Get Started Free
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-10 py-5 bg-[var(--background)] text-[var(--foreground)] font-black rounded-[2rem] border-2 border-neutral-200 dark:border-neutral-800 hover:border-[oklch(88%_0.19_118)] transition-all flex items-center justify-center gap-2">
                The ROI Case Study
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 border-y border-neutral-100 dark:border-neutral-800 bg-[oklch(99%_0.005_60)] dark:bg-[oklch(14%_0.02_260)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Avg. ROI", value: "4.2x" },
              { label: "UGC Growth", value: "+128%" },
              { label: "Repeat Visits", value: "+40%" },
              { label: "Zero-App Install", value: "100%" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl lg:text-4xl font-black mb-1">
                  {stat.value}
                </div>
                <div className="text-xs font-bold opacity-40 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="product" className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight leading-none">
                Stop guessing. <br />
                Start gamifying.
              </h2>
              <p className="text-lg opacity-60 font-medium">
                The lightweight tech layer that helps high-aesthetic venues
                dominate social feeds and drive recurring revenue.
              </p>
            </div>
            <div className="hidden md:block">
              <button className="flex items-center gap-2 text-[oklch(64%_0.24_274)] font-black uppercase tracking-widest text-sm hover:gap-4 transition-all group">
                View platform features{" "}
                <ChevronRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-10 rounded-[3rem] bg-[oklch(99%_0.005_60)] dark:bg-[oklch(22%_0.03_260)] border border-transparent hover:border-[oklch(88%_0.19_118)] hover:bg-[var(--background)] hover:shadow-2xl transition-all cursor-default"
              >
                <div className="w-16 h-16 bg-[var(--background)] rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black mb-4">{feature.title}</h3>
                <p className="opacity-60 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Prop Section */}
      <section className="py-24 bg-[oklch(28%_0.04_260)] text-[oklch(99%_0.005_60)] rounded-[3rem] lg:rounded-[5rem] mx-4 lg:mx-8 mb-20 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl lg:text-6xl font-black mb-10 leading-none">
                Low friction. <br />
                <span className="text-[oklch(88%_0.19_118)]">High impact.</span>
              </h2>
              <div className="space-y-10">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-[oklch(64%_0.24_274)]/20 flex items-center justify-center shrink-0 border border-[oklch(64%_0.24_274)]/30">
                    <Smartphone className="text-[oklch(64%_0.24_274)]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">
                      Browser-Based Rewards
                    </h4>
                    <p className="opacity-50 font-medium leading-relaxed">
                      No app store downloads. Customers scan, earn, and share in
                      seconds. Lowering the barrier to entry triples adoption
                      rates.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-[oklch(88%_0.19_118)]/20 flex items-center justify-center shrink-0 border border-[oklch(88%_0.19_118)]/30">
                    <TrendingUp className="text-[oklch(88%_0.19_118)]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Churn Guard™ AI</h4>
                    <p className="opacity-50 font-medium leading-relaxed">
                      Our ML engine identifies when a loyal regular stops coming
                      and automatically pushes a &quot;Bonus Reward&quot; to
                      their wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center scale-90 lg:scale-100">
              {/* Mobile Phone Mockup */}
              <div className="relative w-72 h-[500px] bg-neutral-900 rounded-[3rem] border-8 border-neutral-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
                <div className="h-full w-full bg-[oklch(99%_0.005_60)] flex flex-col">
                  <div className="p-6 bg-[oklch(64%_0.24_274)] text-white pt-12">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                      Rooftop Lounge XP
                    </p>
                    <p className="text-3xl font-black">Level 08</p>
                  </div>
                  <div className="p-6 flex-1">
                    <div className="mb-6">
                      <p className="text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wide">
                        Rewards Progress
                      </p>
                      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-[oklch(88%_0.19_118)] rounded-full shadow-[0_0_15px_oklch(88%_0.19_118)]"></div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <p className="text-[10px] font-bold text-neutral-400">
                          750 / 1000 XP
                        </p>
                        <p className="text-[10px] font-black text-[oklch(64%_0.24_274)] uppercase underline">
                          Claim $10
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4 text-slate-900">
                      <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <Zap size={12} className="text-[oklch(64%_0.24_274)]" />{" "}
                        Daily Quests
                      </p>
                      <div className="p-4 bg-white rounded-2xl flex items-center justify-between border border-neutral-100 shadow-sm">
                        <div className="flex items-center gap-3">
                          <Camera
                            size={16}
                            className="text-[oklch(64%_0.24_274)]"
                          />
                          <span className="text-xs font-bold">
                            Post a Story
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-[oklch(64%_0.24_274)]">
                          +150 XP
                        </span>
                      </div>
                      <div className="p-4 bg-white rounded-2xl flex items-center justify-between border border-neutral-100 shadow-sm opacity-60">
                        <div className="flex items-center gap-3">
                          <MapPin size={16} className="text-neutral-400" />
                          <span className="text-xs font-bold text-neutral-500">
                            Tag Location
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-neutral-400">
                          Done
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-[oklch(84%_0.17_75)] p-4 rounded-2xl shadow-xl transform rotate-12">
                <Gift className="text-white" />
              </div>
              <div className="absolute bottom-10 -left-10 bg-[oklch(88%_0.19_118)] p-3 rounded-xl shadow-lg transform -rotate-6">
                <Star className="text-neutral-900 fill-current" size={20} />
              </div>
            </div>
          </div>
        </div>
        {/* Glow Effects */}
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-[oklch(64%_0.24_274)]/10 rounded-full blur-[100px]" />
      </section>

      {/* Footer */}
      <footer className="py-20 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                <div className="w-8 h-8 bg-[oklch(64%_0.24_274)] rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white fill-current" />
                </div>
                <span className="text-xl font-black tracking-tighter uppercase">
                  XP LOCAL
                </span>
              </div>
              <p className="opacity-40 font-medium text-sm text-center md:text-left">
                The gamification infrastructure for high-aesthetic hospitality.{" "}
                <br />
                Turn your physical presence into digital reach.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-10 font-bold text-sm opacity-60">
              <a
                href="#"
                className="hover:text-[oklch(64%_0.24_274)] transition-colors"
              >
                Platform
              </a>
              <a
                href="#"
                className="hover:text-[oklch(64%_0.24_274)] transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:text-[oklch(64%_0.24_274)] transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:text-[oklch(64%_0.24_274)] transition-colors"
              >
                Contact Sales
              </a>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-neutral-100 dark:border-neutral-800 text-center text-neutral-300 text-xs font-bold uppercase tracking-[0.2em]">
            © 2025 XP Local Technologies Inc. All Rights Reserved.
          </div>
        </div>
      </footer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import "tailwindcss";

        @theme {
          /* Core semantic colors – gamification focused */
          --color-primary: oklch(64% 0.24 274); /* Electric violet – CTAs, progress, main actions */
          --color-primary-600: oklch(58% 0.23 274); /* Hover/active */
          --color-primary-700: oklch(50% 0.22 274); /* Darker press state */

          --color-accent: oklch(88% 0.19 118); /* Neon lime glow – badges, highlights, streaks */
          --color-accent-600: oklch(80% 0.18 118); /* Slightly muted hover */

          --color-reward: oklch(84% 0.17 75); /* Golden reward pop – achievements, +XP */
          --color-reward-600: oklch(76% 0.16 75);

          /* Neutrals */
          --color-neutral-50: oklch(99% 0.005 60); /* Almost pure white – light mode bg/cards */
          --color-neutral-100: oklch(96% 0.01 60);
          --color-neutral-200: oklch(92% 0.015 60);
          --color-neutral-800: oklch(28% 0.04 260);
          --color-neutral-950: oklch(14% 0.02 260); /* Deep slate – dark mode background */

          /* Semantic aliases */
          --color-background: var(--color-neutral-50);
          --color-foreground: oklch(20% 0.05 260);
          --color-surface: var(--color-neutral-50);
          --color-border: oklch(88% 0.015 260);
        }

        /* Dark mode adjustments */
        .dark {
          --color-background: var(--color-neutral-950);
          --color-foreground: oklch(92% 0.02 260);
          --color-surface: oklch(22% 0.03 260);
          --color-border: oklch(40% 0.03 260);

          /* Soften vivid colors */
          --color-primary: oklch(72% 0.23 274);
          --color-accent: oklch(92% 0.16 118);
          --color-reward: oklch(88% 0.16 75);
        }

        @media (prefers-color-scheme: dark) {
          :root:not(.light) {
            --color-background: var(--color-neutral-950);
            --color-foreground: oklch(92% 0.02 260);
            --color-surface: oklch(22% 0.03 260);
            --color-border: oklch(40% 0.03 260);

            --color-primary: oklch(72% 0.23 274);
            --color-accent: oklch(92% 0.16 118);
            --color-reward: oklch(88% 0.16 75);
          }
        }

        :root {
          --background: var(--color-background);
          --foreground: var(--color-foreground);
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `,
        }}
      />
    </div>
  );
};

export default App;
