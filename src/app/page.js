"use client";

import React from "react";
import HeaderNavigation from "./components/HeaderNavigation";
import {
  Zap,
  Camera,
  MapPin,
  ChevronRight,
  ArrowRight,
  Smartphone,
  BarChart3,
  ShieldCheck,
  Star,
  Gift,
  TrendingUp,
} from "lucide-react";

const App = () => {
  const features = [
    {
      icon: <Camera className="w-6 h-6 text-primary" />,
      title: "Social Mining Engine",
      description:
        "Automatically detect and reward customer selfies and stories. Turn diners into your 24/7 high-impact marketing team.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-accent" />,
      title: "Fraud-Proof Tracking",
      description:
        "GPS-fencing and rotating QR IDs ensure rewards are only claimed by customers physically verified at your venue.",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-reward" />,
      title: "The ROI Dashboard",
      description:
        "Track 'Customer Lifetime Value' (CLV) growth. See exactly which posts led to new walk-ins and repeat visits.",
    },
  ];

  return (
    /* Force background white and text black at the root */
    <div className="min-h-screen bg-white text-black font-sans selection:bg-accent selection:text-black antialiased">
      <HeaderNavigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-52 lg:pb-40 overflow-hidden bg-white">
        {/* Aesthetic Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-10 left-0 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-40" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 opacity-40" />
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-reward rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            {/* Using neutral-100 which is oklch(96% 0.01 260) - nearly white but textured */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-primary text-xs font-black mb-8 uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Next-Gen B2B Gamification
            </div>

            <h1 className="text-6xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.9] text-black">
              Turn your diners into <br className="hidden lg:block" />
              <span className="text-primary underline decoration-accent decoration-8 underline-offset-8">
                brand advocates.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-xl lg:text-2xl text-black/70 mb-12 font-medium leading-relaxed">
              XP Local uses digital incentives and social mining to turn casual
              visits into viral growth and lifetime loyalty.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-10 py-5 bg-primary text-white font-black rounded-[2rem] hover:brightness-110 transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 flex items-center justify-center gap-2 group">
                Get Started Free
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              {/* Secondary button forced to white background with black border/text */}
              <button className="w-full sm:w-auto px-10 py-5 bg-white text-black font-black rounded-[2rem] border-2 border-neutral-200 hover:border-accent transition-all flex items-center justify-center gap-2">
                The ROI Case Study
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats Section */}
      <section className="py-20 border-y border-neutral-100 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-black">
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
                <div className="text-xs font-bold opacity-40 uppercase tracking-widest text-black/40">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="product" className="py-32 bg-white text-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight leading-none text-black">
                Stop guessing. <br />
                Start gamifying.
              </h2>
              <p className="text-lg text-black/60 font-medium">
                The lightweight tech layer that helps high-aesthetic venues
                dominate social feeds and drive recurring revenue.
              </p>
            </div>
            <div className="hidden md:block">
              <button className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm hover:gap-4 transition-all group">
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
                className="group p-10 rounded-[3rem] bg-neutral-50 border border-transparent hover:border-accent hover:bg-white hover:shadow-2xl transition-all cursor-default"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 text-black">
                  {feature.title}
                </h3>
                <p className="text-black/60 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Prop Section - Explicitly using your defined Neutral-800 which is dark */}
      <section className="py-24 bg-neutral-800 text-white rounded-[3rem] lg:rounded-[5rem] mx-4 lg:mx-8 mb-20 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl lg:text-6xl font-black mb-10 leading-none text-white">
                Low friction. <br />
                <span className="text-accent">High impact.</span>
              </h2>
              <div className="space-y-10">
                <div className="flex gap-6 text-white">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                    <Smartphone className="text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">
                      Browser-Based Rewards
                    </h4>
                    <p className="text-white/50 font-medium leading-relaxed">
                      No app store downloads. Customers scan, earn, and share in
                      seconds. Lowering the barrier to entry triples adoption
                      rates.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 text-white">
                  <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0 border border-accent/30">
                    <TrendingUp className="text-accent" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Churn Guard™ AI</h4>
                    <p className="text-white/50 font-medium leading-relaxed">
                      Our ML engine identifies when a loyal regular stops coming
                      and automatically pushes a &quot;Bonus Reward&quot; to
                      their wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center scale-90 lg:scale-100">
              {/* Mobile Phone Mockup - Fixed to dark backdrop and white surface */}
              <div className="relative w-72 h-[500px] bg-neutral-950 rounded-[3rem] border-8 border-neutral-900 shadow-2xl overflow-hidden ring-1 ring-white/10">
                <div className="h-full w-full bg-neutral-50 flex flex-col">
                  <div className="p-6 bg-primary text-white pt-12">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                      Rooftop Lounge XP
                    </p>
                    <p className="text-3xl font-black">Level 08</p>
                  </div>
                  <div className="p-6 flex-1 bg-white">
                    <div className="mb-6">
                      <p className="text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wide">
                        Rewards Progress
                      </p>
                      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-accent rounded-full"></div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <p className="text-[10px] font-bold text-neutral-400">
                          750 / 1000 XP
                        </p>
                        <p className="text-[10px] font-black text-primary uppercase underline">
                          Claim $10
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4 text-black">
                      <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <Zap size={12} className="text-primary" /> Daily Quests
                      </p>
                      <div className="p-4 bg-white rounded-2xl flex items-center justify-between border border-neutral-100 shadow-sm">
                        <div className="flex items-center gap-3">
                          <Camera size={16} className="text-primary" />
                          <span className="text-xs font-bold text-black">
                            Post a Story
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-primary">
                          +150 XP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-reward p-4 rounded-2xl shadow-xl transform rotate-12">
                <Gift className="text-white" />
              </div>
              <div className="absolute bottom-10 -left-10 bg-accent p-3 rounded-xl shadow-lg transform -rotate-6">
                <Star className="text-black fill-current" size={20} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-neutral-100 text-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white fill-current" />
                </div>
                <span className="text-xl font-black tracking-tighter uppercase text-black">
                  XP LOCAL
                </span>
              </div>
              <p className="text-black/40 font-medium text-sm text-center md:text-left leading-relaxed">
                The gamification infrastructure for high-aesthetic hospitality.
                <br />
                Turn your physical presence into digital reach.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-10 font-bold text-sm text-black/60">
              <a href="#" className="hover:text-primary transition-colors">
                Platform
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Contact Sales
              </a>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-neutral-100 text-center text-black/20 text-xs font-bold uppercase tracking-[0.2em]">
            © 2025 XP Local Technologies Inc. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
