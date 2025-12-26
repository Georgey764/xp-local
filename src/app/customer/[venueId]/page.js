"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import {
  Gift,
  Loader2,
  Sparkles,
  Zap,
  ChevronLeft,
  CheckCircle2,
  Lock,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VenueMarketplace() {
  const supabase = useMemo(() => createClient(), []);
  const { venueId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ balance: 0, rewards: [], venue: null });
  const [selectedReward, setSelectedReward] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Background Scroll Lock
  useEffect(() => {
    document.body.style.overflow = selectedReward ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedReward]);

  const loadData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [balanceRes, rewardsRes, venueRes] = await Promise.all([
        supabase
          .from("balances")
          .select("xp_amount")
          .eq("user_id", user.id)
          .eq("venue_id", venueId)
          .maybeSingle(),
        supabase
          .from("rewards")
          .select("*")
          .eq("venue_id", venueId)
          .order("cost", { ascending: true }),
        supabase.from("venues").select("name").eq("id", venueId).single(),
      ]);

      setData({
        balance: balanceRes.data?.xp_amount || 0,
        rewards: rewardsRes.data || [],
        venue: venueRes.data,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase, venueId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const executePurchase = async () => {
    if (!selectedReward || data.balance < selectedReward.cost) return;
    setIsRedeeming(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error: rpcError } = await supabase.rpc("deduct_xp", {
        user_id_input: user.id,
        venue_id_input: venueId,
        amount: selectedReward.cost,
      });
      if (rpcError) throw rpcError;

      const claimCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      await Promise.all([
        supabase
          .from("redemptions")
          .insert([
            {
              user_id: user.id,
              venue_id: venueId,
              reward_id: selectedReward.id,
              code: claimCode,
              status: "active",
            },
          ]),
        supabase
          .from("activity_logs")
          .insert([
            {
              user_id: user.id,
              venue_id: venueId,
              xp_change: -selectedReward.cost,
              display_name: "Redeemed",
              action_name: selectedReward.label,
            },
          ]),
      ]);
      router.push(`/customer/${venueId}/codes`);
    } catch (err) {
      alert("Redemption failed.");
    } finally {
      setIsRedeeming(false);
      setSelectedReward(null);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Loader2 className="animate-spin text-primary" size={40} />
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      <div className="p-6 space-y-10 max-w-md mx-auto pb-32">
        {/* Header with improved Balance UI */}
        <header className="text-center pt-10 space-y-6 relative">
          <button
            onClick={() => router.back()}
            className="absolute left-0 top-10 p-3 bg-surface rounded-2xl border border-border text-foreground/40 hover:text-foreground transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full border-4 border-muted flex items-center justify-center mx-auto bg-surface shadow-[0_0_50px_rgba(168,85,247,0.15)]">
              <Zap
                size={40}
                className="text-primary fill-primary/20 animate-pulse"
              />
            </div>
            {/* Progress Arc could go here */}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase opacity-40 tracking-[0.3em]">
              <TrendingUp size={12} />
              Your XP Stash
            </div>
            <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-none bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
              {data.balance}
            </h1>
            <div className="text-primary font-black italic tracking-widest text-xl">
              XP
            </div>
          </div>
        </header>

        {/* Improved Grid with conditional Glow */}
        <section className="grid grid-cols-2 gap-4">
          {data.rewards.map((reward) => {
            const canAfford = data.balance >= reward.cost;
            return (
              <motion.div
                key={reward.id}
                layoutId={`reward-${reward.id}`}
                whileTap={canAfford ? { scale: 0.95 } : {}}
                onClick={() => canAfford && setSelectedReward(reward)}
                className={`group relative p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center text-center space-y-4 overflow-hidden
                  ${
                    canAfford
                      ? "bg-surface border-border shadow-xl shadow-primary/5 cursor-pointer hover:border-primary/50"
                      : "bg-muted/20 border-border/50 opacity-60 grayscale cursor-not-allowed"
                  }`}
              >
                {/* Decorative background glow for affordable items */}
                {canAfford && (
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                )}

                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    canAfford
                      ? "text-primary bg-primary/10"
                      : "text-foreground/20 bg-muted/50"
                  }`}
                >
                  {canAfford ? <Sparkles size={28} /> : <Lock size={24} />}
                </div>

                <div className="space-y-1 relative z-10">
                  <h4 className="text-[12px] font-black uppercase leading-tight tracking-tight">
                    {reward.label}
                  </h4>
                  <div
                    className={`text-[13px] font-black italic uppercase ${
                      canAfford ? "text-accent" : "text-foreground/20"
                    }`}
                  >
                    {reward.cost} <span className="text-[10px]">XP</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>
      </div>

      <AnimatePresence>
        {selectedReward && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isRedeeming && setSelectedReward(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            />

            <motion.div
              layoutId={`reward-${selectedReward.id}`}
              className="relative w-full max-w-sm bg-surface rounded-[4rem] p-10 space-y-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-border/50"
            >
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted rounded-full opacity-20" />

              <header className="text-center space-y-3 pt-4">
                <div className="inline-flex p-4 rounded-3xl bg-primary/10 text-primary mb-2">
                  <Gift size={32} />
                </div>
                <h2 className="text-4xl font-black italic uppercase leading-none tracking-tighter">
                  Unlock <br />
                  <span className="text-primary">Reward.</span>
                </h2>
                <p className="text-[11px] font-bold uppercase text-foreground/40 tracking-[0.2em]">
                  {selectedReward.label}
                </p>
              </header>

              <div className="bg-foreground text-background rounded-[3rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                {/* Visual "Pulse" in the background of receipt */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />

                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest opacity-40">
                  <span>Current Stash</span>
                  <span>{data.balance} XP</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-red-500">
                  <span>Drop Amount</span>
                  <span className="flex items-center gap-1 font-mono">
                    -{selectedReward.cost} <Zap size={10} />
                  </span>
                </div>
                <div className="h-[2px] bg-background/5 border-t border-dashed border-background/20" />
                <div className="flex justify-between items-center text-[14px] font-black uppercase tracking-widest">
                  <span className="opacity-40 italic">New Balance</span>
                  <span className="text-primary font-mono text-xl">
                    {data.balance - selectedReward.cost}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={executePurchase}
                  disabled={isRedeeming}
                  className="w-full py-6 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(168,85,247,0.3)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isRedeeming ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Zap size={18} fill="currentColor" /> Confirm Unlock
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedReward(null)}
                  disabled={isRedeeming}
                  className="w-full py-4 text-foreground/30 hover:text-foreground font-black uppercase tracking-widest text-[10px] transition-colors"
                >
                  Nevermind
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
