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
      console.error(err);
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
      await supabase
        .from("task_completions")
        .insert([{ user_id: user.id, venue_id: venueId, task_type: taskType }]);
      await supabase.rpc("increment_balance", {
        user_id_input: user.id,
        venue_id_input: venueId,
        amount: xpAmount,
      });
      await supabase
        .from("activity_logs")
        .insert({
          user_id: user.id,
          venue_id: venueId,
          action_name: taskType.toUpperCase(),
          display_name: taskLabel,
          xp_change: xpAmount,
        });
      loadData();
    } catch (err) {
      console.error(err);
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
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          return {
            disabled: true,
            label: `${h}h ${m}m ${s}s`,
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
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-accent selection:text-black pb-20">
      <div className="p-6 space-y-8 max-w-md mx-auto">
        <header className="pt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-50 border border-neutral-100 rounded-full mb-3">
            <Zap size={10} className="text-primary fill-primary" />
            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
              Quest Log
            </span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
            Earn <span className="text-primary">XP.</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 mt-2">
            Level up your status with daily actions
          </p>
        </header>

        <div className="grid gap-4">
          {tasks.map((task) => {
            const status = getTaskStatus(task);
            const isExternal = ["ig_follow", "google_review"].includes(
              task.action_type
            );

            const TaskBody = (
              <div className="flex items-center gap-5">
                <div
                  className={`p-4 rounded-2xl transition-all duration-300 ${
                    status.disabled
                      ? "bg-neutral-100 text-neutral-300"
                      : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white group-hover:rotate-6"
                  }`}
                >
                  {ICON_MAP[task.action_type] || <Zap size={20} />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-[12px] font-black uppercase tracking-tight truncate ${
                      status.disabled ? "text-neutral-300" : "text-neutral-900"
                    }`}
                  >
                    {task.label}
                  </h4>
                  <p className="text-[8px] font-bold uppercase opacity-30 leading-tight mt-0.5">
                    {DESC_MAP[task.action_type]}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        status.isCooldown
                          ? "bg-accent/10 text-accent font-mono"
                          : status.disabled
                          ? "bg-neutral-100 text-neutral-400"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {status.label ? status.label : `+${task.xp_reward} XP`}
                    </span>
                  </div>
                </div>

                {isExternal && !status.disabled ? (
                  <ExternalLink size={16} className="text-neutral-200" />
                ) : (
                  <ChevronRight size={18} className="text-neutral-200" />
                )}
              </div>
            );

            return isExternal && !status.disabled ? (
              <a
                key={task.id}
                href={task.target_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  handleExternalTask(
                    task.action_type,
                    task.xp_reward,
                    task.label
                  )
                }
                className="w-full bg-surface p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm active:scale-95 transition-all text-left group hover:border-primary/20 block"
              >
                {TaskBody}
              </a>
            ) : (
              <button
                key={task.id}
                disabled={status.disabled}
                className={`w-full bg-surface p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm transition-all text-left ${
                  status.disabled
                    ? "opacity-60 cursor-not-allowed"
                    : "active:scale-95 group hover:border-primary/20"
                }`}
              >
                {TaskBody}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
