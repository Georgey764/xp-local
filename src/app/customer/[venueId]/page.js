"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import {
  Gift,
  Loader2,
  Sparkles,
  X,
  ArrowRight,
  Zap,
  Clock,
  ChevronLeft,
  CheckCircle2,
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
    if (selectedReward) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
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
        supabase.from("rewards").select("*").eq("venue_id", venueId),
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

  /**
   * executePurchase: Deducts XP, creates redemption code, and logs activity
   */
  const executePurchase = async () => {
    if (!selectedReward || data.balance < selectedReward.cost) return;
    setIsRedeeming(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 1. Deduct XP via RPC
      const { error: rpcError } = await supabase.rpc("deduct_xp", {
        user_id_input: user.id,
        venue_id_input: venueId,
        amount: selectedReward.cost,
      });
      if (rpcError) throw rpcError;

      // 2. Generate Code
      const claimCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      // 3. Parallel DB Operations: Insert Redemption and Log Activity
      const [redemptionRes, logRes] = await Promise.all([
        supabase.from("redemptions").insert([
          {
            user_id: user.id,
            venue_id: venueId,
            reward_id: selectedReward.id,
            code: claimCode,
            status: "active",
          },
        ]),
        supabase.from("activity_logs").insert([
          {
            user_id: user.id,
            venue_id: venueId,
            xp_change: -selectedReward.cost, // Negative because it's a spend
            display_name: "Marketplace Purchase",
            action_name: selectedReward.label,
          },
        ]),
      ]);

      if (redemptionRes.error) throw redemptionRes.error;
      if (logRes.error) throw logRes.error;

      router.push(`/customer/${venueId}/codes`);
    } catch (err) {
      console.error("Purchase Error:", err);
      alert("Redemption failed. Points were not deducted.");
    } finally {
      setIsRedeeming(false);
      setSelectedReward(null);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2
          className="animate-spin text-[oklch(64%_0.24_274)]"
          size={32}
        />
      </div>
    );

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <div className="p-6 space-y-10 max-w-md mx-auto">
        <header className="text-center pt-10 space-y-4 relative">
          <button
            onClick={() => router.back()}
            className="absolute left-0 top-10 p-3 bg-neutral-50 rounded-2xl text-neutral-400"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="w-14 h-14 text-[oklch(64%_0.24_274)] rounded-[1.25rem] flex items-center justify-center mx-auto">
            <Zap size={28} fill="currentColor" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase opacity-20 tracking-[0.4em]">
              Available Balance
            </p>
            <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
              {data.balance}
              <span className="text-[oklch(64%_0.24_274)]">XP</span>
            </h1>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-4">
          {data.rewards.map((reward) => {
            const canAfford = data.balance >= reward.cost;
            return (
              <motion.div
                key={reward.id}
                whileTap={canAfford ? { scale: 0.96 } : {}}
                onClick={() => canAfford && setSelectedReward(reward)}
                className={`p-6 rounded-[2.5rem] border transition-all flex flex-col items-center text-center space-y-4 
                  ${
                    canAfford
                      ? "bg-white border-neutral-100 shadow-sm cursor-pointer"
                      : "bg-neutral-50 border-dashed border-neutral-200 opacity-30 grayscale cursor-not-allowed"
                  }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    canAfford
                      ? "text-[oklch(64%_0.24_274)] bg-neutral-50"
                      : "text-neutral-300 bg-neutral-100"
                  }`}
                >
                  <Gift size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black uppercase leading-tight">
                    {reward.label}
                  </h4>
                  <div className="text-[12px] font-black text-[oklch(64%_0.24_274)] italic uppercase">
                    {reward.cost} XP
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
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-sm bg-white rounded-[3.5rem] p-10 space-y-8 shadow-2xl overflow-hidden"
            >
              <header className="text-center space-y-2">
                <h2 className="text-3xl font-black italic uppercase leading-none tracking-tighter">
                  Purchase Drop.
                </h2>
                <p className="text-[10px] font-bold uppercase opacity-30 tracking-[0.2em]">
                  {selectedReward.label}
                </p>
              </header>

              <div className="bg-neutral-950 text-white rounded-[2.5rem] p-8 space-y-5">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30">
                  <span>Balance</span>
                  <span>{data.balance} XP</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-red-400">
                  <span>Price</span>
                  <span>- {selectedReward.cost}</span>
                </div>
                <div className="h-[1px] bg-white/5" />
                <div className="flex justify-between items-center text-[12px] font-black uppercase tracking-widest">
                  <span className="text-white/30 italic">Remaining</span>
                  <span className="text-[oklch(64%_0.24_274)] font-mono">
                    {data.balance - selectedReward.cost}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedReward(null)}
                  disabled={isRedeeming}
                  className="flex-1 py-5 bg-neutral-100 text-black rounded-3xl font-black uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
                <button
                  onClick={executePurchase}
                  disabled={isRedeeming}
                  className="flex-[2] py-5 bg-[oklch(64%_0.24_274)] text-white rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                >
                  {isRedeeming ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Confirm
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
