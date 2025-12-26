"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import {
  Ticket,
  Loader2,
  ChevronLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function MyCodes() {
  const supabase = useMemo(() => createClient(), []);
  const { venueId } = useParams();
  const router = useRouter();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCodes = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Join with rewards table to get the label
      const { data, error } = await supabase
        .from("redemptions")
        .select(
          `
          *,
          rewards (
            label
          )
        `
        )
        .eq("venue_id", venueId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCodes(data || []);
    } catch (err) {
      console.error("Error loading codes:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, venueId]);

  useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  // Helper to calculate time remaining for the 1-month expiry
  const getTimeRemaining = (expiresAt) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diff = expiryDate - now;

    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days}d left`;
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
    <div className="p-6 pb-20 space-y-8 max-w-md mx-auto min-h-screen bg-white font-sans antialiased">
      <header className="pt-10 relative">
        <button
          onClick={() => router.back()}
          className="absolute left-0 -top-2 p-2 bg-neutral-50 rounded-full text-neutral-400"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mt-8">
          My <span className="text-[oklch(64%_0.24_274)]">Wallet.</span>
        </h1>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 mt-2">
          Present codes to staff at checkout
        </p>
      </header>

      {codes.length === 0 ? (
        <div className="text-center py-32 space-y-4">
          <Ticket size={48} className="mx-auto opacity-10" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-20">
            No rewards claimed yet
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {codes.map((item) => {
            const timeRemaining = getTimeRemaining(item.expires_at);
            const isRedeemed = item.status === "inactive";
            const isExpired = timeRemaining === "Expired" && !isRedeemed;

            return (
              <div
                key={item.id}
                className={`relative bg-white rounded-[2.5rem] border overflow-hidden transition-all 
                  ${
                    isRedeemed || isExpired
                      ? "opacity-50 grayscale border-neutral-100"
                      : "border-neutral-100 shadow-sm"
                  }`}
              >
                {/* TICKET TOP: Reward Info */}
                <div className="p-8 border-b border-dashed border-neutral-100 relative">
                  {/* Decorative Ticket Notches */}
                  <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-white rounded-full border border-neutral-100" />
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white rounded-full border border-neutral-100" />

                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30">
                        Reward Item
                      </span>
                      <h3 className="text-sm font-black uppercase tracking-tight leading-none">
                        {item.rewards?.label || "Unknown Reward"}
                      </h3>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 
                            ${
                              isRedeemed
                                ? "bg-green-50 text-green-600"
                                : isExpired
                                ? "bg-red-50 text-red-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                    >
                      {isRedeemed ? (
                        <CheckCircle2 size={10} />
                      ) : isExpired ? (
                        <AlertCircle size={10} />
                      ) : (
                        <Clock size={10} />
                      )}
                      {isRedeemed
                        ? "Redeemed"
                        : isExpired
                        ? "Expired"
                        : "Active"}
                    </div>
                  </div>

                  {/* THE 6-DIGIT CODE */}
                  <div className="bg-neutral-900 rounded-3xl p-8 text-center space-y-3 shadow-inner">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30">
                      Claim Code
                    </p>
                    <div className="text-4xl font-mono font-black text-[oklch(64%_0.24_274)] tracking-[0.2em]">
                      {item.code}
                    </div>
                  </div>
                </div>

                {/* TICKET BOTTOM: Expiry Info */}
                <div className="px-8 py-5 flex justify-between items-center bg-neutral-50/50">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="opacity-20" />
                    <span className="text-[9px] font-bold uppercase opacity-30 tracking-widest">
                      {isRedeemed
                        ? "Used on " +
                          new Date(item.redeemed_at).toLocaleDateString()
                        : timeRemaining}
                    </span>
                  </div>
                  {!isRedeemed && !isExpired && (
                    <div className="w-2 h-2 rounded-full bg-[oklch(64%_0.24_274)] animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
