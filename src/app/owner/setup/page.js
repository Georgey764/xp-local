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
  MessageSquare,
  Users,
  Calendar,
  Smartphone,
  Download,
  ToggleLeft,
  ToggleRight,
  Tag,
  Gift,
  AlertTriangle,
  Save,
  RotateCcw,
  CheckCircle2,
  Zap,
} from "lucide-react";

const ICON_MAP = {
  google_review: <Star size={18} />,
  ig_follow: <Instagram size={18} />,
  sms_signup: <MessageSquare size={18} />,
  referral: <Users size={18} />,
  recurring: <Calendar size={18} />,
  default: <Smartphone size={18} />,
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
  const [venueSlug, setVenueSlug] = useState("");
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
        .select("venue_id, venues(slug, name)")
        .eq("user_id", user.id)
        .single();

      if (staffRecord) {
        setVenueId(staffRecord.venue_id);
        setVenueSlug(staffRecord.venues.slug);
        setVenueName(staffRecord.venues.name);

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

        const sortedTasks = (tasksRes.data || []).sort((a, b) => {
          const priority = ["sms_signup", "recurring", "referral"];
          return (
            priority.indexOf(a.action_type) - priority.indexOf(b.action_type)
          );
        });

        setTasks(sortedTasks);
        setRewards(rewardsRes.data || []);

        const initialLinks = {};
        sortedTasks.forEach((t) => {
          if (t.target_url) initialLinks[t.id] = t.target_url;
        });
        setPendingLinks(initialLinks);
      }
    } catch (err) {
      console.error("Error loading setup:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isLinkValid = (url) => {
    if (!url) return false;
    let checkUrl = url.trim();
    if (!/^https?:\/\//i.test(checkUrl)) checkUrl = `https://${checkUrl}`;
    const urlPattern = /^(https:\/\/)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/;
    return (
      checkUrl.toLowerCase().startsWith("https://") && urlPattern.test(checkUrl)
    );
  };

  const handleSaveSingleLink = async (taskId) => {
    let url = pendingLinks[taskId]?.trim() || "";
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    if (!isLinkValid(url)) return alert("⚠️ Please enter a valid HTTPS URL.");

    setSavingTaskId(taskId);
    try {
      const { error } = await supabase
        .from("earning_tasks")
        .update({ target_url: url })
        .eq("id", taskId);
      if (error) throw error;
      setTasks(
        tasks.map((t) => (t.id === taskId ? { ...t, target_url: url } : t))
      );
    } catch (err) {
      alert("❌ Save failed.");
    } finally {
      setSavingTaskId(null);
    }
  };

  const handleDiscardSingle = (taskId) => {
    const originalTask = tasks.find((t) => t.id === taskId);
    setPendingLinks({
      ...pendingLinks,
      [taskId]: originalTask?.target_url || "",
    });
  };

  const toggleTaskStatus = async (taskId, currentStatus, actionType) => {
    if (actionType === "recurring") return;
    const { error } = await supabase
      .from("earning_tasks")
      .update({ is_active: !currentStatus })
      .eq("id", taskId);
    if (!error)
      setTasks(
        tasks.map((t) =>
          t.id === taskId ? { ...t, is_active: !currentStatus } : t
        )
      );
  };

  const handleAddReward = async (e) => {
    e.preventDefault();
    let finalLabel =
      newReward.type === "free_item"
        ? newReward.itemName
          ? `Free ${newReward.itemName}`
          : "Free Item"
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
      setNewReward({
        label: REWARD_PRESETS[0].label,
        xpCost: REWARD_PRESETS[0].xpCost,
        type: REWARD_PRESETS[0].type,
        promoId: REWARD_PRESETS[0].id,
        itemName: "",
      });
    }
  };

  const deleteReward = async (id) => {
    const { error } = await supabase.from("rewards").delete().eq("id", id);
    if (!error) setRewards(rewards.filter((r) => r.id !== id));
  };

  const downloadQR = () => {
    const svg = document.getElementById("venue-setup-qr");
    if (!svg) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 1000, 1000);
      ctx.drawImage(img, 50, 50, 900, 900);
      const link = document.createElement("a");
      link.download = `${venueName.replace(/\s+/g, "-")}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(
        unescape(encodeURIComponent(new XMLSerializer().serializeToString(svg)))
      );
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );

  return (
    <div className="space-y-12 py-8 pb-32 max-w-xl mx-auto px-6 animate-in fade-in duration-700 font-sans text-foreground bg-background">
      {/* HEADER */}
      <header className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full border border-border mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">
            {venueName || "Venue Profile"}
          </span>
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
          Campaign <span className="text-primary">Setup.</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">
          Configure your loyalty ecosystem
        </p>
      </header>

      {/* QR CARD (High Contrast) */}
      <section className="bg-foreground text-background p-10 rounded-[3.5rem] shadow-2xl flex flex-col items-center text-center gap-8 border border-border/10">
        <div className="p-5 bg-white rounded-[2.5rem] shadow-inner">
          <QRCodeSVG
            id="venue-setup-qr"
            value={`${
              typeof window !== "undefined" ? window.location.origin : ""
            }/check-in/${venueId}`}
            size={160}
            level={"H"}
            fgColor="#000000"
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-black italic uppercase tracking-tight">
            Check-in <span className="text-primary">QR.</span>
          </h3>
          <button
            onClick={downloadQR}
            className="px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-all mx-auto shadow-xl shadow-primary/20"
          >
            <Download size={16} /> Save PNG
          </button>
        </div>
      </section>

      {/* EARNING DESTINATIONS */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 px-2">
          Earning Destinations
        </h3>
        <div className="space-y-4">
          {tasks.map((task) => {
            const isLinkable = ![
              "recurring",
              "sms_signup",
              "referral",
            ].includes(task.action_type);
            const currentUrl = pendingLinks[task.id] || "";
            const isValid = isLinkValid(currentUrl);
            const hasChanged = currentUrl !== (task.target_url || "");

            return (
              <div
                key={task.id}
                className={`bg-surface rounded-[2.5rem] border p-2 transition-all duration-300 ${
                  task.is_active
                    ? "border-border shadow-sm"
                    : "border-dashed border-border/50 opacity-50"
                }`}
              >
                <div className="flex items-center gap-4 p-4">
                  <div
                    className={`p-4 rounded-2xl ${
                      task.is_active
                        ? "bg-muted text-primary"
                        : "bg-muted/50 text-foreground/20"
                    }`}
                  >
                    {ICON_MAP[task.action_type] || <Smartphone size={18} />}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-black uppercase tracking-tight truncate">
                      {task.label || task.action_type.replace("_", " ")}
                    </div>
                    <div className="text-[9px] font-bold text-foreground/30 uppercase mt-0.5">
                      {isLinkable ? "External Destination" : "Core Feature"}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      toggleTaskStatus(
                        task.id,
                        task.is_active,
                        task.action_type
                      )
                    }
                    disabled={task.action_type === "recurring"}
                    className={
                      task.action_type === "recurring"
                        ? "opacity-0"
                        : "hover:scale-110 active:scale-90 transition-transform"
                    }
                  >
                    {task.is_active ? (
                      <ToggleRight size={32} className="text-primary" />
                    ) : (
                      <ToggleLeft size={32} className="text-foreground/20" />
                    )}
                  </button>
                </div>
                {isLinkable && task.is_active && (
                  <div className="px-4 pb-4 animate-in slide-in-from-top-2 space-y-3">
                    <div
                      className={`bg-background p-4 rounded-[1.5rem] flex items-center gap-3 border transition-all ${
                        isValid
                          ? "border-green-500/20"
                          : "border-border focus-within:border-primary/40"
                      }`}
                    >
                      <LinkIcon
                        size={14}
                        className={
                          isValid ? "text-green-500" : "text-foreground/20"
                        }
                      />
                      <input
                        className="flex-1 bg-transparent text-[11px] font-bold outline-none placeholder:text-foreground/10"
                        placeholder="https://..."
                        value={currentUrl}
                        onChange={(e) =>
                          setPendingLinks({
                            ...pendingLinks,
                            [task.id]: e.target.value,
                          })
                        }
                      />
                      {isValid ? (
                        <CheckCircle2 size={14} className="text-green-500" />
                      ) : (
                        <AlertTriangle
                          size={14}
                          className="text-amber-500 animate-pulse"
                        />
                      )}
                    </div>
                    {hasChanged && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDiscardSingle(task.id)}
                          className="px-4 py-2 bg-muted text-foreground/40 rounded-xl text-[8px] font-black uppercase"
                        >
                          <RotateCcw size={10} />
                        </button>
                        <button
                          onClick={() => handleSaveSingleLink(task.id)}
                          disabled={savingTaskId === task.id || !isValid}
                          className="px-4 py-2 bg-foreground text-background rounded-xl text-[8px] font-black uppercase flex items-center gap-2 shadow-lg disabled:opacity-30"
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

      {/* MARKETPLACE */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 px-2">
          Marketplace
        </h3>
        {isAddingReward && (
          <div className="bg-surface p-8 rounded-[3.5rem] border-2 border-primary shadow-xl animate-in zoom-in-95 duration-300 space-y-6 mb-8">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-black italic uppercase">
                New Reward.
              </h4>
              <button
                onClick={() => setIsAddingReward(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X size={20} className="text-foreground/30" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                      ? "bg-primary text-white"
                      : "bg-muted text-foreground/40 border border-border"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {newReward.type === "free_item" && (
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 px-2">
                  Item Details
                </p>
                <input
                  className="w-full p-5 bg-background rounded-2xl text-sm font-bold border-2 border-border focus:border-primary/40 outline-none"
                  placeholder="e.g. Cold Brew Coffee"
                  value={newReward.itemName}
                  onChange={(e) =>
                    setNewReward({ ...newReward, itemName: e.target.value })
                  }
                />
              </div>
            )}
            <div className="bg-foreground text-background rounded-3xl p-6 flex justify-between items-center">
              <span className="text-[9px] font-black uppercase opacity-40">
                Cost
              </span>
              <span className="text-2xl font-black italic">
                {newReward.xpCost}{" "}
                <span className="text-primary not-italic">XP</span>
              </span>
            </div>
            <button
              onClick={handleAddReward}
              className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
              Create Item
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {rewards.map((item) => (
            <div
              key={item.id}
              className="bg-surface p-6 rounded-[2.5rem] border border-border shadow-sm relative group"
            >
              <button
                onClick={() => deleteReward(item.id)}
                className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-foreground/20 hover:text-red-500"
              >
                <X size={14} />
              </button>
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-primary mb-4">
                <Gift size={20} />
              </div>
              <div className="text-[10px] font-black uppercase tracking-tight leading-tight mb-1">
                {item.label}
              </div>
              <div className="text-[9px] font-bold text-primary uppercase">
                {item.cost} XP
              </div>
            </div>
          ))}
          {!isAddingReward && (
            <button
              onClick={() => setIsAddingReward(true)}
              className="bg-muted/30 p-6 rounded-[2.5rem] border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-2 transition-all hover:bg-muted/50 hover:border-primary/30 min-h-[140px]"
            >
              <Plus size={24} className="text-foreground/20" />
              <span className="text-[8px] font-black uppercase tracking-widest text-foreground/30">
                Add New Reward
              </span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
