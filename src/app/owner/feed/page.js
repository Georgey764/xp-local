"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  Activity,
  ChevronDown,
  User,
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

  /**
   * fetchLogs: Joins logs with public.profiles to get OAuth data (Name/Avatar)
   */
  const fetchLogs = useCallback(async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    try {
      const { data, count, error } = await supabase
        .from("activity_logs")
        .select(
          `
          *,
    profiles (
      full_name,
      avatar_url,
      email
    ),
    venues!inner (
      owner_id
    )
        `,
          { count: "exact" }
        )
        .eq("venues.owner_id", user.id)
        .order("created_at", { ascending: false });

      console.log(data);

      if (error) throw error;

      // Map profiles data to the 'user_info' key for consistent UI rendering
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

    // Real-time subscription: Re-fetches on new logs to ensure join data is captured
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

  // Statistics calculations
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
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2
          className="animate-spin text-[oklch(64%_0.24_274)]"
          size={32}
        />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20">
          Syncing Live Events...
        </span>
      </div>
    );

  return (
    <div className="space-y-8 py-6 max-w-2xl mx-auto px-4 animate-in fade-in duration-700 font-sans">
      {/* HEADER & REFRESH */}
      <header className="flex justify-between items-end px-2">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
            Activity <span className="text-[oklch(64%_0.24_274)]">Feed.</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30">
              {totalCount} Total Events • Live
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchLogs();
          }}
          className="p-4 bg-neutral-50 rounded-[1.25rem] text-neutral-400 hover:text-black transition-all active:scale-90"
        >
          <RefreshCcw size={18} />
        </button>
      </header>

      {/* STAT CARDS: GAINS VS BURNS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-30 mb-1">
              XP Issued (Today)
            </p>
            <p className="text-2xl font-black text-green-500">
              +{todayEarnings.toLocaleString()}
            </p>
          </div>
          <Activity size={24} className="text-green-500 opacity-10" />
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-30 mb-1">
              XP Burned (Today)
            </p>
            <p className="text-2xl font-black text-red-500">
              -{todayRedemptions.toLocaleString()}
            </p>
          </div>
          <Zap size={24} className="text-red-500 opacity-10" />
        </div>
      </div>

      {/* ACTIVITY FEED LIST */}
      <div className="bg-white rounded-[3.5rem] border border-neutral-100 shadow-xl overflow-hidden">
        <div className="divide-y divide-neutral-50">
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <div
                key={item.id}
                className="p-8 flex items-center justify-between hover:bg-neutral-50/50 transition-colors group"
              >
                <div className="flex items-center gap-5">
                  {/* DYNAMIC USER AVATAR (Google Photo or Initial) */}
                  <div className="w-14 h-14 bg-neutral-900 rounded-[1.3rem] flex items-center justify-center overflow-hidden shadow-lg border border-white/10">
                    {item.user_info?.avatar_url ? (
                      <img
                        src={item.user_info.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-black text-lg">
                        {item.user_info?.full_name?.[0] ||
                          item.user_info?.email?.[0].toUpperCase() ||
                          "G"}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {/* DISPLAY NAME: Prioritizes Google Full Name */}
                    <div className="font-black text-sm tracking-tight text-black flex items-center gap-2">
                      {item.user_info?.full_name ||
                        item.user_info?.email?.split("@")[0] ||
                        "Guest"}
                      {item.xp_change > 49 && (
                        <TrendingUp
                          size={12}
                          className="text-[oklch(64%_0.24_274)]"
                        />
                      )}
                    </div>
                    <div className="text-[10px] font-black opacity-40 uppercase tracking-widest italic leading-none">
                      {item.action_name} —{" "}
                      <span className="text-[oklch(64%_0.24_274)]">
                        {item.display_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* XP CHANGE INDICATOR */}
                <div className="text-right space-y-1">
                  <div
                    className={`text-lg font-black ${
                      item.xp_change > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {item.xp_change > 0 ? `+${item.xp_change}` : item.xp_change}
                  </div>
                  <div className="text-[9px] font-bold opacity-20 uppercase flex items-center justify-end gap-1">
                    <Clock size={10} />{" "}
                    {formatDistanceToNow(new Date(item.created_at))} ago
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center space-y-4">
              <Zap size={40} className="mx-auto opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">
                Awaiting your first event...
              </p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {hasMore && (
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="w-full py-8 bg-neutral-50/50 hover:bg-neutral-100 transition-all border-t border-neutral-100 flex items-center justify-center gap-3 active:bg-neutral-200"
          >
            <ChevronDown size={16} className="text-neutral-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
              Load Earlier Activity
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
