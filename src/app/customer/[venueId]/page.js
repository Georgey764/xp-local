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
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-accent selection:text-black">
      <div className="p-6 space-y-10 max-w-md mx-auto pb-32">
        {/* HEADER: Balance Display */}
        <header className="text-center pt-10 space-y-6 relative">
          <button
            onClick={() => router.back()}
            className="absolute left-0 top-10 p-3 bg-surface rounded-2xl border border-neutral-100 text-neutral-400 hover:text-primary transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full border-4 border-neutral-100 flex items-center justify-center mx-auto bg-surface shadow-[0_0_50px_var(--color-primary)]/10">
              <Zap
                size={40}
                className="text-primary fill-primary/10 animate-pulse"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase opacity-30 tracking-[0.3em]">
              <TrendingUp size={12} />
              Current Balance
            </div>
            <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-none text-neutral-950">
              {data.balance}
            </h1>
            <div className="text-reward font-black italic tracking-widest text-xl">
              XP
            </div>
          </div>
        </header>

        {/* REWARDS GRID */}
        <section className="grid grid-cols-2 gap-4">
          {data.rewards.map((reward) => {
            const canAfford = data.balance >= reward.cost;
            return (
              <motion.div
                key={reward.id}
                layoutId={`reward-${reward.id}`}
                whileTap={canAfford ? { scale: 0.96 } : {}}
                onClick={() => canAfford && setSelectedReward(reward)}
                className={`group relative p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center text-center space-y-4 overflow-hidden
                  ${
                    canAfford
                      ? "bg-surface border-neutral-100 shadow-xl shadow-primary/5 cursor-pointer hover:border-accent"
                      : "bg-neutral-50 border-neutral-100 opacity-50 grayscale cursor-not-allowed"
                  }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    canAfford
                      ? "text-primary bg-primary/10"
                      : "text-neutral-200 bg-neutral-100"
                  }`}
                >
                  {canAfford ? <Sparkles size={28} /> : <Lock size={24} />}
                </div>

                <div className="space-y-1 relative z-10">
                  <h4 className="text-[12px] font-black uppercase leading-tight tracking-tight text-neutral-900">
                    {reward.label}
                  </h4>
                  <div
                    className={`text-[13px] font-black italic uppercase ${
                      canAfford ? "text-reward" : "text-neutral-300"
                    }`}
                  >
                    {reward.cost}{" "}
                    <span className="text-[10px] not-italic opacity-60">
                      XP
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>
      </div>

      {/* REDEMPTION MODAL */}
      <AnimatePresence>
        {selectedReward && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isRedeeming && setSelectedReward(null)}
              className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xl"
            />

            <motion.div
              layoutId={`reward-${selectedReward.id}`}
              className="relative w-full max-w-sm bg-surface rounded-[4rem] p-10 space-y-8 shadow-2xl border border-neutral-100"
            >
              <header className="text-center space-y-3">
                <div className="inline-flex p-4 rounded-3xl bg-accent/10 text-accent mb-2">
                  <Gift size={32} />
                </div>
                <h2 className="text-4xl font-black italic uppercase leading-none tracking-tighter text-neutral-950">
                  Unlock <br /> <span className="text-primary">Reward.</span>
                </h2>
                <p className="text-[11px] font-bold uppercase text-neutral-400 tracking-[0.2em]">
                  {selectedReward.label}
                </p>
              </header>

              {/* Receipt Visual */}
              <div className="bg-neutral-950 text-neutral-50 rounded-[3rem] p-8 space-y-5 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />

                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                  <span>Balance</span>
                  <span>{data.balance} XP</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-accent">
                  <span>Cost</span>
                  <span className="flex items-center gap-1">
                    -{selectedReward.cost} <Zap size={10} fill="currentColor" />
                  </span>
                </div>
                <div className="h-px bg-neutral-800" />
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase opacity-40 italic">
                    New Stash
                  </span>
                  <span className="text-reward font-black text-2xl tracking-tighter italic">
                    {data.balance - selectedReward.cost}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={executePurchase}
                  disabled={isRedeeming}
                  className="w-full py-6 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isRedeeming ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Confirm Unlock"
                  )}
                </button>
                <button
                  onClick={() => setSelectedReward(null)}
                  disabled={isRedeeming}
                  className="w-full py-2 text-neutral-400 hover:text-neutral-900 font-black uppercase tracking-widest text-[9px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
