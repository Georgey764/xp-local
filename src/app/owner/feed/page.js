"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  Activity,
  ChevronDown,
  Zap,
  Loader2,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";

export default function FeedPage() {
  const supabase = useMemo(() => createClient(), []);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    try {
      const { data, count, error } = await supabase
        .from("activity_logs")
        .select(
          `
          *,
          profiles (full_name, avatar_url, email),
          venues!inner (owner_id)
        `,
          { count: "exact" }
        )
        .eq("venues.owner_id", user.id)
        .order("created_at", { ascending: false });

      const formattedData = data?.map((log) => ({
        ...log,
        user_info: log.profiles,
      }));

      setLogs(formattedData || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel("live-feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_logs",
        },
        () => fetchLogs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchLogs]);

  const todayEarnings = logs
    .filter(
      (log) =>
        log.xp_change > 0 &&
        new Date(log.created_at).toDateString() === new Date().toDateString()
    )
    .reduce((acc, log) => acc + log.xp_change, 0);

  const todayRedemptions = logs
    .filter(
      (log) =>
        log.xp_change < 0 &&
        new Date(log.created_at).toDateString() === new Date().toDateString()
    )
    .reduce((acc, log) => acc + Math.abs(log.xp_change), 0);

  const currentItems = logs.slice(0, visibleCount);
  const hasMore = visibleCount < logs.length;

  if (loading)
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">
          Syncing Live Events...
        </span>
      </div>
    );

  return (
    <div className="space-y-8 py-6 max-w-2xl mx-auto px-4 animate-in fade-in duration-700 font-sans text-foreground">
      {/* HEADER & REFRESH */}
      <header className="flex justify-between items-end px-2">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
            Activity <span className="text-primary">Feed.</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">
              {totalCount} Total Events • Live
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchLogs();
          }}
          className="p-4 bg-muted rounded-[1.25rem] text-foreground/40 hover:text-foreground transition-all active:scale-90 border border-border"
        >
          <RefreshCcw size={18} />
        </button>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface p-6 rounded-[2.5rem] border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-foreground/30 mb-1">
              XP Issued (Today)
            </p>
            <p className="text-2xl font-black text-green-500">
              +{todayEarnings.toLocaleString()}
            </p>
          </div>
          <Activity size={24} className="text-green-500 opacity-20" />
        </div>
        <div className="bg-surface p-6 rounded-[2.5rem] border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-foreground/30 mb-1">
              XP Burned (Today)
            </p>
            <p className="text-2xl font-black text-red-500">
              -{todayRedemptions.toLocaleString()}
            </p>
          </div>
          <Zap size={24} className="text-red-500 opacity-20" />
        </div>
      </div>

      {/* ACTIVITY FEED LIST */}
      <div className="bg-surface rounded-[3.5rem] border border-border shadow-xl overflow-hidden">
        <div className="divide-y divide-border">
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <div
                key={item.id}
                className="p-8 flex items-center justify-between hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-5">
                  {/* AVATAR */}
                  <div className="w-14 h-14 bg-foreground rounded-[1.3rem] flex items-center justify-center overflow-hidden shadow-lg border border-border">
                    {item.user_info?.avatar_url ? (
                      <img
                        src={item.user_info.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-background font-black text-lg">
                        {item.user_info?.full_name?.[0] ||
                          item.user_info?.email?.[0].toUpperCase() ||
                          "G"}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="font-black text-sm tracking-tight text-foreground flex items-center gap-2">
                      {item.user_info?.full_name ||
                        item.user_info?.email?.split("@")[0] ||
                        "Guest"}
                      {item.xp_change > 49 && (
                        <TrendingUp size={12} className="text-primary" />
                      )}
                    </div>
                    <div className="text-[10px] font-black text-foreground/40 uppercase tracking-widest italic leading-none">
                      {item.action_name} —{" "}
                      <span className="text-primary">{item.display_name}</span>
                    </div>
                  </div>
                </div>

                {/* XP CHANGE */}
                <div className="text-right space-y-1">
                  <div
                    className={`text-lg font-black ${
                      item.xp_change > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {item.xp_change > 0 ? `+${item.xp_change}` : item.xp_change}
                  </div>
                  <div className="text-[9px] font-bold text-foreground/20 uppercase flex items-center justify-end gap-1">
                    <Clock size={10} />{" "}
                    {formatDistanceToNow(new Date(item.created_at))} ago
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center space-y-4">
              <Zap size={40} className="mx-auto text-foreground/10" />
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">
                Awaiting your first event...
              </p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {hasMore && (
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="w-full py-8 bg-muted/50 hover:bg-muted transition-all border-t border-border flex items-center justify-center gap-3 active:bg-muted"
          >
            <ChevronDown size={16} className="text-foreground/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
              Load Earlier Activity
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
