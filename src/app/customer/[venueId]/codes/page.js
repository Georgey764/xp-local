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
        .select(
          `
          *,
          rewards (label, cost)
        `
        )
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
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <header className="pt-8 pb-10 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-3 bg-surface rounded-2xl border border-border text-foreground/50"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black italic uppercase tracking-tighter">
          My <span className="text-primary">Wallet</span>
        </h1>
        <div className="w-11" /> {/* Spacer for balance */}
      </header>

      {/* Codes List */}
      <div className="space-y-4 max-w-md mx-auto">
        {codes.length === 0 ? (
          <div className="text-center py-20 space-y-4 opacity-30">
            <Ticket size={48} className="mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest">
              No active codes yet
            </p>
          </div>
        ) : (
          codes.map((item) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={item.id}
              className="bg-surface border border-border rounded-[2.5rem] p-6 flex items-center gap-6"
            >
              {/* Status Icon */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  item.status === "active"
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-muted text-foreground/20"
                }`}
              >
                {item.status === "active" ? (
                  <QrCode size={24} />
                ) : (
                  <Clock size={24} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-black italic uppercase text-sm truncate">
                  {item.rewards?.label}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Code:
                  </span>
                  <span className="font-mono text-lg font-black tracking-tighter">
                    {item.code}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span
                  className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ${
                    item.status === "active"
                      ? "bg-accent text-black"
                      : "bg-muted text-foreground/40"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Help Note */}
      <div className="mt-12 p-8 bg-muted/50 rounded-[2.5rem] border border-dashed border-border text-center">
        <p className="text-[10px] font-bold uppercase opacity-40 leading-relaxed max-w-[200px] mx-auto">
          Show these codes to the staff at the counter to claim your rewards.
        </p>
      </div>
    </div>
  );
}
