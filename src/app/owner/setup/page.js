"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import {
  Star,
  Instagram,
  Link as LinkIcon,
  Plus,
  Loader2,
  X,
  Calendar,
  Download,
  ToggleLeft,
  ToggleRight,
  Gift,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2, // Added for deletion
} from "lucide-react";

const ICON_MAP = {
  google_review: <Star size={18} />,
  ig_follow: <Instagram size={18} />,
  recurring: <Calendar size={18} />,
};

const REWARD_PRESETS = [
  { id: "mystery_treat", label: "Mystery Treat", xpCost: 150, type: "special" },
  { id: "5_off_25", label: "$5 Off ($25+)", xpCost: 500, type: "fixed" },
  { id: "bogo_drink", label: "BOGO Drink", xpCost: 600, type: "special" },
  { id: "25_pct_order", label: "25% Off Order", xpCost: 800, type: "pct" },
  { id: "free_cupcake", label: "Free Cupcake", xpCost: 800, type: "free_item" },
];

export default function SetupPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [venueId, setVenueId] = useState(null);
  const [venueName, setVenueName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [pendingName, setPendingName] = useState("");
  const [tasks, setTasks] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [pendingLinks, setPendingLinks] = useState({});
  const [savingTaskId, setSavingTaskId] = useState(null);

  const [isAddingReward, setIsAddingReward] = useState(false);
  const [newReward, setNewReward] = useState({
    label: REWARD_PRESETS[0].label,
    xpCost: REWARD_PRESETS[0].xpCost,
    type: REWARD_PRESETS[0].type,
    promoId: REWARD_PRESETS[0].id,
    itemName: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: staffRecord } = await supabase
        .from("venue_staff")
        .select("venue_id, venues(name)")
        .eq("user_id", user.id)
        .single();

      if (staffRecord) {
        setVenueId(staffRecord.venue_id);
        setVenueName(staffRecord.venues.name);
        setPendingName(staffRecord.venues.name);

        const [tasksRes, rewardsRes] = await Promise.all([
          supabase
            .from("earning_tasks")
            .select("*")
            .eq("venue_id", staffRecord.venue_id),
          supabase
            .from("rewards")
            .select("*")
            .eq("venue_id", staffRecord.venue_id),
        ]);

        const filteredTasks = (tasksRes.data || []).filter((t) =>
          ["recurring", "google_review", "ig_follow"].includes(t.action_type)
        );

        setTasks(filteredTasks);
        setRewards(rewardsRes.data || []);

        const initialLinks = {};
        filteredTasks.forEach((t) => {
          if (t.target_url) initialLinks[t.id] = t.target_url;
        });
        setPendingLinks(initialLinks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateName = async () => {
    if (!pendingName.trim()) return;
    const { error } = await supabase
      .from("venues")
      .update({ name: pendingName })
      .eq("id", venueId);
    if (!error) {
      setVenueName(pendingName);
      setIsEditingName(false);
    }
  };

  const isLinkValid = (url) => {
    if (!url) return false;
    const checkUrl = url.trim();
    const urlPattern = /^(https:\/\/)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/;
    return urlPattern.test(checkUrl);
  };

  const handleSaveSingleLink = async (taskId, url) => {
    setSavingTaskId(taskId);
    await supabase
      .from("earning_tasks")
      .update({ target_url: url })
      .eq("id", taskId);
    setSavingTaskId(null);
    fetchData();
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    const { error } = await supabase
      .from("earning_tasks")
      .update({ is_active: !currentStatus })
      .eq("id", taskId);
    if (!error) fetchData();
  };

  const handleAddReward = async () => {
    let finalLabel =
      newReward.type === "free_item"
        ? `Free ${newReward.itemName}`
        : newReward.label;
    const { data, error } = await supabase
      .from("rewards")
      .insert([
        { venue_id: venueId, label: finalLabel, cost: newReward.xpCost },
      ])
      .select()
      .single();
    if (!error) {
      setRewards([...rewards, data]);
      setIsAddingReward(false);
    }
  };

  // NEW: Delete reward logic
  const handleDeleteReward = async (id) => {
    if (rewards.length <= 1) return; // Prevent deleting the last reward
    const { error } = await supabase.from("rewards").delete().eq("id", id);
    if (!error) {
      setRewards(rewards.filter((r) => r.id !== id));
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased pb-20">
      <div className="max-w-xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-700">
        {/* HEADER & NAME EDITOR */}
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neutral-100 bg-neutral-50 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
              Control Panel
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2 animate-in zoom-in-95">
                <input
                  value={pendingName}
                  onChange={(e) => setPendingName(e.target.value)}
                  className="text-3xl font-black tracking-tighter uppercase bg-surface border-b-2 border-primary outline-none px-2 text-center"
                  autoFocus
                />
                <button
                  onClick={handleUpdateName}
                  className="p-2 bg-primary text-white rounded-full"
                >
                  <Save size={18} />
                </button>
              </div>
            ) : (
              <h1
                onClick={() => setIsEditingName(true)}
                className="text-4xl font-black tracking-tighter uppercase leading-none group cursor-pointer flex items-center gap-3 text-neutral-950"
              >
                {venueName}{" "}
                <Edit3
                  size={20}
                  className="opacity-0 group-hover:opacity-30 transition-opacity"
                />
              </h1>
            )}
          </div>
        </header>

        {/* QR SECTION */}
        <section className="bg-neutral-800 text-neutral-50 p-10 rounded-[3.5rem] shadow-2xl flex flex-col items-center text-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-10 -mt-10" />
          <div className="p-5 bg-white rounded-[2.5rem] shadow-xl relative z-10">
            <QRCodeSVG
              value={`${window.location.origin}/check-in/${venueId}`}
              size={160}
              level={"H"}
              fgColor="#000000"
            />
          </div>
          <button className="px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-primary/40">
            <Download size={16} /> Download QR
          </button>
        </section>

        {/* EARNING DESTINATIONS */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 px-2">
            Earning Destinations
          </h3>
          <div className="space-y-4">
            {tasks.map((task) => {
              const isLinkable = ["google_review", "ig_follow"].includes(
                task.action_type
              );
              const currentUrl = pendingLinks[task.id] || "";
              const isValid = isLinkValid(currentUrl);
              const isDirty = currentUrl !== (task.target_url || "");
              const showInvalidError = currentUrl.length > 5 && !isValid;

              return (
                <div
                  key={task.id}
                  className={`bg-surface rounded-[2.5rem] border transition-all duration-300 p-2 ${
                    task.is_active
                      ? "border-neutral-200 shadow-sm"
                      : "border-dashed border-neutral-100 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-4 p-4">
                    <div
                      className={`p-4 rounded-2xl ${
                        task.is_active
                          ? "bg-primary/10 text-primary"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      {ICON_MAP[task.action_type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black uppercase tracking-tight truncate text-neutral-900">
                        {task.label || task.action_type}
                      </div>
                      <div className="text-[9px] font-bold opacity-30 uppercase">
                        {isLinkable ? "Social Link" : "Automated Check-in"}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.is_active)}
                      disabled={task.action_type === "recurring"}
                    >
                      {task.is_active ? (
                        <ToggleRight size={32} className="text-primary" />
                      ) : (
                        <ToggleLeft size={32} className="text-neutral-200" />
                      )}
                    </button>
                  </div>

                  {isLinkable && task.is_active && (
                    <div className="px-4 pb-4 animate-in slide-in-from-top-2 space-y-3">
                      <div
                        className={`bg-background p-4 rounded-[1.5rem] flex flex-col gap-2 border transition-all ${
                          showInvalidError
                            ? "border-red-500/50 bg-red-50/10"
                            : isValid
                            ? "border-accent/40 bg-accent/5"
                            : "border-neutral-100 focus-within:border-primary"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <LinkIcon
                            size={14}
                            className={
                              isValid
                                ? "text-accent"
                                : showInvalidError
                                ? "text-red-500"
                                : "opacity-20"
                            }
                          />
                          <input
                            className="flex-1 bg-transparent text-[11px] font-bold outline-none placeholder:opacity-20"
                            placeholder="https://..."
                            value={currentUrl}
                            onChange={(e) =>
                              setPendingLinks({
                                ...pendingLinks,
                                [task.id]: e.target.value,
                              })
                            }
                          />
                          {isValid && (
                            <CheckCircle2 size={14} className="text-accent" />
                          )}
                          {showInvalidError && (
                            <AlertCircle size={14} className="text-red-500" />
                          )}
                        </div>
                        {showInvalidError && (
                          <p className="text-[8px] font-black uppercase text-red-500 tracking-tighter">
                            URL must start with https://
                          </p>
                        )}
                      </div>
                      {isDirty && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              setPendingLinks({
                                ...pendingLinks,
                                [task.id]: task.target_url || "",
                              })
                            }
                            className="px-4 py-2 bg-neutral-100 text-neutral-400 rounded-xl text-[8px] font-black uppercase flex items-center gap-2"
                          >
                            <RotateCcw size={10} /> Reset
                          </button>
                          <button
                            onClick={() =>
                              handleSaveSingleLink(task.id, currentUrl)
                            }
                            disabled={!isValid || savingTaskId === task.id}
                            className="px-4 py-2 bg-primary text-white rounded-xl text-[8px] font-black uppercase flex items-center gap-2 shadow-lg disabled:opacity-20"
                          >
                            {savingTaskId === task.id ? (
                              <Loader2 className="animate-spin" size={10} />
                            ) : (
                              <Save size={10} />
                            )}{" "}
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* MARKETPLACE SECTION */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 px-2">
            Reward Marketplace
          </h3>

          {isAddingReward && (
            <div className="bg-surface p-8 rounded-[3.5rem] border-2 border-primary shadow-2xl animate-in zoom-in-95 space-y-6 mb-8 relative">
              <div className="flex justify-between items-center">
                <h4 className="text-xl font-black italic uppercase text-neutral-900">
                  New Reward.
                </h4>
                <button
                  onClick={() => setIsAddingReward(false)}
                  className="p-2 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors"
                >
                  <X size={20} className="opacity-30" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {REWARD_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() =>
                      setNewReward({
                        ...newReward,
                        label: p.label,
                        xpCost: p.xpCost,
                        type: p.type,
                        promoId: p.id,
                      })
                    }
                    className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase transition-all ${
                      newReward.promoId === p.id
                        ? "bg-primary text-white shadow-lg"
                        : "bg-neutral-50 border border-neutral-100 opacity-60"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {newReward.type === "free_item" && (
                <input
                  className="w-full p-5 bg-background rounded-2xl text-sm font-bold border-2 border-neutral-100 focus:border-primary outline-none"
                  placeholder="e.g. Cold Brew Coffee"
                  value={newReward.itemName}
                  onChange={(e) =>
                    setNewReward({ ...newReward, itemName: e.target.value })
                  }
                />
              )}
              <div className="bg-neutral-800 text-neutral-50 rounded-3xl p-6 flex justify-between items-center">
                <span className="text-[9px] font-black uppercase opacity-40">
                  XP Cost
                </span>
                <span className="text-2xl font-black italic">
                  {newReward.xpCost}{" "}
                  <span className="text-reward not-italic">XP</span>
                </span>
              </div>
              <button
                onClick={handleAddReward}
                className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Add to Marketplace
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {rewards.map((item) => (
              <div
                key={item.id}
                className="bg-surface p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm relative group hover:border-accent transition-all overflow-hidden"
              >
                {/* DELETE BUTTON: Visible on hover, disabled if only 1 reward */}
                {rewards.length > 1 && (
                  <button
                    onClick={() => handleDeleteReward(item.id)}
                    className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-reward mb-4">
                  <Gift size={20} />
                </div>
                <div className="text-[10px] font-black uppercase text-neutral-900 mb-1 leading-tight pr-6">
                  {item.label}
                </div>
                <div className="text-[9px] font-black text-reward uppercase">
                  {item.cost} XP
                </div>
              </div>
            ))}
            {!isAddingReward && (
              <button
                onClick={() => setIsAddingReward(true)}
                className="bg-neutral-50 p-6 rounded-[2.5rem] border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-2 transition-all hover:bg-white hover:border-primary/30 min-h-[140px]"
              >
                <Plus size={24} className="opacity-20" />
                <span className="text-[8px] font-black uppercase tracking-widest opacity-30">
                  Add Reward
                </span>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
