"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  BarChart3,
  TrendingUp,
  Star,
  Instagram,
  Calendar,
  Loader2,
  Users,
  ArrowUpRight,
} from "lucide-react";

export default function VenueStatsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    google_review: 0,
    ig_follow: 0,
    recurring: 0,
    total_actions: 0,
    unique_users: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);

  const loadStats = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch only logs where the associated venue is owned by this user
      // We use the inner join syntax to filter by the venues table owner_id
      const { data: logs, error } = await supabase
        .from("activity_logs")
        .select(
          `
          *,
          venues!inner(owner_id)
        `
        )
        .eq("venues.owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 2. Process Stats
      const counts = {
        google_review: 0,
        ig_follow: 0,
        recurring: 0,
        total_actions: logs?.length || 0,
        unique_users: new Set(logs?.map((l) => l.user_id)).size,
      };

      logs?.forEach((log) => {
        const action = log.action_name?.toLowerCase();
        if (action?.includes("google") || action?.includes("review"))
          counts.google_review++;
        else if (action?.includes("ig") || action?.includes("instagram"))
          counts.ig_follow++;
        else if (action?.includes("recurring") || action?.includes("scan"))
          counts.recurring++;
      });

      setStats(counts);
      setRecentLogs(logs?.slice(0, 5) || []);
    } catch (err) {
      console.error("Stats Load Error:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased p-6 pb-20">
      <div className="max-w-xl mx-auto space-y-10">
        {/* HEADER */}
        <header className="pt-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-50 border border-neutral-100 rounded-full mb-2">
            <BarChart3 size={12} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-black/40">
              Performance Insights
            </span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
            Advocacy <span className="text-primary">Stats.</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20">
            Real-time engagement data
          </p>
        </header>

        {/* TOP LEVEL TOTALS */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-50 p-6 rounded-[2.5rem] border border-neutral-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">
              Total Conversions
            </p>
            <div className="text-4xl font-black italic text-black">
              {stats.total_actions}
            </div>
          </div>
          <div className="bg-neutral-50 p-6 rounded-[2.5rem] border border-neutral-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">
              Unique Advocates
            </p>
            <div className="text-4xl font-black italic text-black">
              {stats.unique_users}
            </div>
          </div>
        </section>

        {/* SPECIFIC ACTION BREAKDOWN */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 px-2">
            Task Distribution
          </h3>

          <div className="space-y-3">
            {[
              {
                label: "Google Reviews",
                value: stats.google_review,
                icon: <Star size={18} />,
                color: "text-primary",
                bg: "bg-primary/5",
              },
              {
                label: "Instagram Follows",
                value: stats.ig_follow,
                icon: <Instagram size={18} />,
                color: "text-reward",
                bg: "bg-reward/5",
              },
              {
                label: "Recurring Visits",
                value: stats.recurring,
                icon: <Calendar size={18} />,
                color: "text-accent",
                bg: "bg-accent/5",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-6 bg-white border border-neutral-100 rounded-[2rem] shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-tight text-black">
                      {item.label}
                    </h4>
                    <p className="text-[9px] font-bold text-black/20 uppercase">
                      Lifetime Total
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-black italic">{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* MINI FEED */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">
              Recent Activity
            </h3>
            <TrendingUp size={14} className="text-primary opacity-30" />
          </div>
          <div className="bg-neutral-50 rounded-[2.5rem] border border-neutral-100 overflow-hidden">
            {recentLogs.map((log, idx) => (
              <div
                key={log.id}
                className={`p-5 flex items-center justify-between ${
                  idx !== recentLogs.length - 1
                    ? "border-b border-neutral-100"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-[10px] font-black">
                    {log.display_name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-black">
                      {log.display_name}
                    </p>
                    <p className="text-[8px] font-bold text-black/40 uppercase">
                      {new Date(log.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-[9px] font-black uppercase text-primary italic">
                  {log.action_name}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
