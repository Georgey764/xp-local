"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import {
  Star,
  Instagram,
  MessageSquare,
  Users,
  Clock,
  ChevronRight,
  Zap,
  Loader2,
  ExternalLink,
} from "lucide-react";

const ICON_MAP = {
  google_review: <Star size={18} />,
  ig_follow: <Instagram size={18} />,
  sms_signup: <MessageSquare size={18} />,
  referral: <Users size={18} />,
  recurring: <Clock size={18} />,
};

// Map action types to user-friendly descriptions
const DESC_MAP = {
  recurring: "Scan to complete recurring visits",
  google_review: "Write us a review on Google",
  ig_follow: "Follow our official page on Instagram",
  sms_signup: "Join our SMS club for exclusive drops",
  referral: "Invite friends to join the community",
};

export default function EarnXP() {
  const supabase = useMemo(() => createClient(), []);
  const { venueId } = useParams();

  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const loadData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [tasksRes, completionsRes] = await Promise.all([
        supabase
          .from("earning_tasks")
          .select("*")
          .eq("venue_id", venueId)
          .eq("is_active", true),
        supabase
          .from("task_completions")
          .select("*")
          .eq("user_id", user.id)
          .eq("venue_id", venueId),
      ]);

      setTasks(tasksRes.data || []);
      setCompletions(completionsRes.data || []);
    } catch (err) {
      console.error("Failed to load earn data:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, venueId]);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleExternalTask = async (taskType, xpAmount, taskLabel) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // 1. Mark task as completed
      await supabase.from("task_completions").insert([
        {
          user_id: user.id,
          venue_id: venueId,
          task_type: taskType,
        },
      ]);

      // 2. Increment the user's balance
      await supabase.rpc("increment_balance", {
        user_id_input: user.id,
        venue_id_input: venueId,
        amount: xpAmount,
      });

      // 3. LOG TO ACTIVITY FEED
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        venue_id: venueId,
        action_name: taskType.toUpperCase(),
        display_name: taskLabel, // e.g., "Google Review"
        xp_change: xpAmount, // Positive value for earning
      });

      loadData();
    } catch (err) {
      console.error("Task credit error:", err);
    }
  };

  const getTaskStatus = (task) => {
    const taskCompletions = completions.filter((c) =>
      task.action_type === "recurring"
        ? c.task_type === "qr_scan"
        : c.task_type === task.action_type
    );

    if (task.action_type === "recurring") {
      const lastComp =
        taskCompletions.length > 0
          ? new Date(
              Math.max(...taskCompletions.map((c) => new Date(c.completed_at)))
            )
          : null;

      if (lastComp) {
        const cooldownEnd = new Date(lastComp.getTime() + 12 * 60 * 60 * 1000);
        if (now < cooldownEnd) {
          const diff = cooldownEnd - now;
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          return {
            disabled: true,
            label: `${hours}h ${mins}m ${secs}s left`,
            isCooldown: true,
          };
        }
      }
    }

    if (
      ["ig_follow", "sms_signup", "google_review"].includes(task.action_type) &&
      taskCompletions.length > 0
    ) {
      return { disabled: true, label: "Completed", isCooldown: false };
    }
    return { disabled: false, label: null, isCooldown: false };
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[oklch(64%_0.24_274)]" />
      </div>
    );

  return (
    <div className="p-6 space-y-8 max-w-md mx-auto min-h-screen bg-white">
      <header className="pt-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          Earn <span className="text-[oklch(64%_0.24_274)]">XP.</span>
        </h1>
        <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mt-1">
          Complete tasks to unlock rewards
        </p>
      </header>

      <div className="grid gap-4">
        {tasks.map((task) => {
          const status = getTaskStatus(task);
          const isExternal = ["ig_follow", "google_review"].includes(
            task.action_type
          );

          const content = (
            <>
              <div
                className={`p-4 rounded-2xl transition-colors ${
                  status.disabled
                    ? "bg-neutral-100 text-neutral-400"
                    : "bg-neutral-50 text-[oklch(64%_0.24_274)] group-hover:bg-[oklch(64%_0.24_274)] group-hover:text-white"
                }`}
              >
                {ICON_MAP[task.action_type] || <Zap size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[12px] font-black uppercase tracking-tight truncate">
                  {task.label}
                </h4>
                {/* Description added here */}
                <p className="text-[8px] font-bold uppercase opacity-30 leading-tight mt-0.5">
                  {DESC_MAP[task.action_type]}
                </p>
                <p
                  className={`text-[10px] font-black uppercase mt-1.5 ${
                    status.isCooldown
                      ? "text-blue-500 font-mono"
                      : "text-[oklch(64%_0.24_274)]"
                  }`}
                >
                  {status.label ? status.label : `+${task.xp_reward} XP`}
                </p>
              </div>
              {isExternal && !status.disabled ? (
                <ExternalLink size={16} className="opacity-20 shrink-0" />
              ) : (
                <ChevronRight size={18} className="opacity-20 shrink-0" />
              )}
            </>
          );

          if (isExternal && !status.disabled) {
            return (
              <a
                key={task.id}
                href={task.target_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  handleExternalTask(task.action_type, task.xp_reward)
                }
                className="w-full bg-white p-6 rounded-[2.5rem] border border-neutral-100 flex items-center gap-5 shadow-sm active:scale-95 transition-all text-left group"
              >
                {content}
              </a>
            );
          }

          return (
            <button
              key={task.id}
              disabled={status.disabled}
              className={`w-full bg-white p-6 rounded-[2.5rem] border border-neutral-100 flex items-center gap-5 shadow-sm transition-all text-left ${
                status.disabled ? "opacity-40 grayscale" : "active:scale-95"
              }`}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
