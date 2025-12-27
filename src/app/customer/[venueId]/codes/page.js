"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import {
  Ticket,
  Clock,
  ChevronRight,
  Loader2,
  QrCode,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CustomerWallet() {
  const { venueId } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [codes, setCodes] = useState([]);

  useEffect(() => {
    const fetchCodes = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("redemptions")
        .select(`*, rewards (label, cost)`)
        .eq("user_id", user.id)
        .eq("venue_id", venueId)
        .order("created_at", { ascending: false });

      setCodes(data || []);
      setLoading(false);
    };

    fetchCodes();
  }, [supabase, venueId]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-accent selection:text-black">
      <div className="max-w-md mx-auto p-6 pb-24">
        {/* Header */}
        <header className="pt-8 pb-10 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-3 bg-surface rounded-2xl border border-neutral-100 text-neutral-400 hover:text-primary transition-all active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black italic uppercase tracking-tighter text-neutral-950">
            My <span className="text-primary">Wallet.</span>
          </h1>
          <div className="w-11" /> {/* Layout Balance Spacer */}
        </header>

        {/* Codes List */}
        <div className="space-y-4">
          {codes.length === 0 ? (
            <div className="text-center py-20 space-y-4 opacity-20">
              <Ticket size={48} className="mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                No active rewards
              </p>
            </div>
          ) : (
            codes.map((item) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={item.id}
                className="bg-surface border border-neutral-100 rounded-[2.5rem] p-6 flex items-center gap-6 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all"
              >
                {/* Visual Accent for Active items */}
                {item.status === "active" && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-accent/10 blur-2xl rounded-full -mr-8 -mt-8" />
                )}

                {/* Status Icon Container */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-3 ${
                    item.status === "active"
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-neutral-100 text-neutral-300"
                  }`}
                >
                  {item.status === "active" ? (
                    <QrCode size={24} />
                  ) : (
                    <Clock size={24} />
                  )}
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-black italic uppercase text-[12px] tracking-tight truncate text-neutral-900 leading-none mb-2">
                    {item.rewards?.label}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary opacity-60">
                      Claim Code
                    </span>
                    <span className="font-mono text-xl font-black tracking-tighter text-neutral-950">
                      {item.code}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="text-right">
                  <span
                    className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border ${
                      item.status === "active"
                        ? "bg-accent/10 text-accent border-accent/20"
                        : "bg-neutral-50 text-neutral-400 border-neutral-100"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Security / Help Note */}
        <div className="mt-12 p-10 bg-neutral-50 rounded-[3rem] border border-dashed border-neutral-200 text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center gap-4">
            <ShieldCheck size={24} className="text-primary opacity-30" />
            <p className="text-[10px] font-bold uppercase opacity-40 leading-relaxed max-w-[220px] mx-auto text-neutral-800">
              Present these codes to the staff at the counter to redeem. Codes
              are single-use only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
