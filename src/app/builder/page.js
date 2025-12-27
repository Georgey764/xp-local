"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import {
  Percent,
  DollarSign,
  Gift,
  Star,
  CheckCircle2,
  Calendar,
  Instagram,
  Rocket,
  ArrowRight,
  Zap,
  Coffee,
  Sparkles,
  Download,
  Loader2,
  Globe,
  Link as LinkIcon,
  Trash2,
  Plus,
} from "lucide-react";

// ... (TASK_REGISTRY and REWARD_PRESETS remain the same)
const TASK_REGISTRY = [
  {
    id: "recurring",
    label: "Recurring Visits",
    xp: 50,
    icon: <Calendar size={18} />,
    desc: "+50 XP",
    required: true,
  },
  {
    id: "google_review",
    label: "Google Review",
    xp: 100,
    icon: <Star size={18} />,
    desc: "+100 XP",
    requiresLink: true,
    placeholder: "https://...",
  },
  {
    id: "ig_follow",
    label: "IG Follow",
    xp: 25,
    icon: <Instagram size={18} />,
    desc: "+25 XP",
    requiresLink: true,
    placeholder: "https://...",
  },
];

const REWARD_PRESETS = [
  { id: "mystery_treat", label: "Mystery Treat", xpCost: 150, type: "special" },
  { id: "5_off_25", label: "$5 Off ($25+)", xpCost: 500, type: "fixed" },
  { id: "bogo_drink", label: "BOGO Drink", xpCost: 600, type: "special" },
  { id: "25_pct_order", label: "25% Off Order", xpCost: 800, type: "pct" },
  { id: "free_cupcake", label: "Free Cupcake", xpCost: 800, type: "free_item" },
];

export default function XPLocalBuilder() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [isLaunching, setIsLaunching] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  const [formData, setFormData] = useState({
    venueName: "",
    selectedTasks: ["recurring"],
    taskLinks: { google_review: "", ig_follow: "" },
    rewardCatalog: [
      {
        id: Date.now().toString(),
        promoId: "",
        label: "",
        xpCost: 0,
        itemName: "",
        type: "",
      },
    ],
  });

  // ... (checkUser and isValidHttpsUrl remain the same)
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return setLoading(false);
      const { data } = await supabase
        .from("venue_staff")
        .select("venue_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (data) router.push("/owner");
      else setLoading(false);
    };
    checkUser();
  }, [supabase, router]);

  const isValidHttpsUrl = (url) => {
    try {
      const pattern = new RegExp("^(https:\\/\\/)", "i");
      return !!pattern.test(url) && url.length > 12;
    } catch (e) {
      return false;
    }
  };

  const isStep1Valid = () => {
    if (!formData.venueName.trim() || formData.venueName.length < 3)
      return false;
    return formData.selectedTasks.every((taskId) => {
      const task = TASK_REGISTRY.find((t) => t.id === taskId);
      return task.requiresLink
        ? isValidHttpsUrl(formData.taskLinks[taskId])
        : true;
    });
  };

  const isStep2Valid = () =>
    formData.rewardCatalog.length >= 1 &&
    formData.rewardCatalog.every(
      (r) => r.promoId && (r.type === "free_item" ? r.itemName.trim() : true)
    );

  const removeReward = (id) => {
    if (formData.rewardCatalog.length > 1) {
      setFormData({
        ...formData,
        rewardCatalog: formData.rewardCatalog.filter((r) => r.id !== id),
      });
    }
  };

  const launchEconomy = async () => {
    setIsLaunching(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    try {
      const slug = `${formData.venueName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-${Math.random()
        .toString(36)
        .substring(2, 6)}`;
      const { data: venue } = await supabase
        .from("venues")
        .insert([{ name: formData.venueName, slug, owner_id: user.id }])
        .select()
        .single();
      await supabase
        .from("venue_staff")
        .insert([{ venue_id: venue.id, user_id: user.id, role: "admin" }]);

      const tasks = TASK_REGISTRY.filter((t) =>
        formData.selectedTasks.includes(t.id)
      ).map((t) => ({
        venue_id: venue.id,
        label: t.label,
        xp_reward: t.xp,
        action_type: t.id,
        target_url: formData.taskLinks[t.id] || null,
        is_active: true,
      }));
      await supabase.from("earning_tasks").insert(tasks);

      const rewards = formData.rewardCatalog.map((r) => ({
        venue_id: venue.id,
        label: r.type === "free_item" ? `Free ${r.itemName}` : r.label,
        cost: r.xpCost,
        is_active: true,
      }));
      await supabase.from("rewards").insert(rewards);
      setQrUrl(`${window.location.origin}/check-in/${venue.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLaunching(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-accent/30">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-neutral-100 px-6 py-4">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="font-black text-lg tracking-tighter uppercase italic text-neutral-950">
              XP Local
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-12">
        {/* Step Stepper */}
        <div className="flex justify-between items-center mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-100 -z-10" />
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-500 border-4 ${
                step === num
                  ? "bg-primary text-white border-background shadow-xl scale-125"
                  : step > num
                  ? "bg-accent text-black border-background"
                  : "bg-neutral-50 text-neutral-200 border-background"
              }`}
            >
              {step > num ? <CheckCircle2 size={16} /> : num}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <header className="space-y-2">
              <h2 className="text-4xl font-black italic tracking-tighter uppercase text-neutral-950">
                Identity <span className="text-primary">&</span> Tasks.
              </h2>
              <p className="text-sm opacity-50 font-medium">
                Define your venue and what customers do to earn.
              </p>
            </header>

            <div className="bg-surface p-8 rounded-[3rem] border border-neutral-100 shadow-sm space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">
                Venue Name
              </label>
              <input
                type="text"
                placeholder="The Coffee House"
                value={formData.venueName}
                onChange={(e) =>
                  setFormData({ ...formData, venueName: e.target.value })
                }
                className="w-full bg-transparent text-3xl font-black italic outline-none p-2 placeholder:opacity-10"
              />
            </div>

            <div className="grid gap-4">
              {TASK_REGISTRY.map((t) => {
                const isSelected = formData.selectedTasks.includes(t.id);
                const linkValue = formData.taskLinks[t.id];
                const linkValid = isValidHttpsUrl(linkValue);
                return (
                  <div
                    key={t.id}
                    className={`p-6 rounded-[2.5rem] border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-accent bg-surface shadow-sm"
                        : "border-transparent bg-neutral-50/50"
                    }`}
                  >
                    <button
                      onClick={() =>
                        !t.required &&
                        setFormData({
                          ...formData,
                          selectedTasks: isSelected
                            ? formData.selectedTasks.filter((x) => x !== t.id)
                            : [...formData.selectedTasks, t.id],
                        })
                      }
                      className="w-full flex items-center gap-5 text-left"
                    >
                      <div
                        className={`p-4 rounded-2xl ${
                          isSelected
                            ? "bg-primary text-white shadow-lg"
                            : "bg-neutral-100 text-neutral-300"
                        }`}
                      >
                        {t.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-black uppercase text-xs tracking-tight text-neutral-900">
                          {t.label}
                        </div>
                        <div className="text-[10px] font-black text-primary uppercase tracking-widest">
                          {t.desc}
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                          isSelected
                            ? "bg-accent border-accent text-black"
                            : "border-neutral-200"
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={14} />}
                      </div>
                    </button>
                    {t.requiresLink && isSelected && (
                      <div className="mt-6 space-y-2 animate-in slide-in-from-top-2">
                        <div
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 bg-background transition-all ${
                            linkValid
                              ? "border-accent/40"
                              : "border-neutral-100 focus-within:border-primary"
                          }`}
                        >
                          <LinkIcon
                            size={14}
                            className={linkValid ? "text-accent" : "opacity-20"}
                          />
                          <input
                            type="url"
                            placeholder={t.placeholder}
                            value={linkValue}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                taskLinks: {
                                  ...formData.taskLinks,
                                  [t.id]: e.target.value,
                                },
                              })
                            }
                            className="flex-1 bg-transparent text-[11px] font-bold outline-none placeholder:opacity-20"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in fade-in">
            <header className="space-y-2 text-center md:text-left">
              <h2 className="text-4xl font-black italic tracking-tighter uppercase text-neutral-950">
                Reward <span className="text-primary">Market.</span>
              </h2>
              <p className="text-sm opacity-50 font-medium">
                Select at least one reward for your customers.
              </p>
            </header>

            <div className="space-y-6">
              {formData.rewardCatalog.map((item, index) => (
                <div
                  key={item.id}
                  className={`relative p-8 bg-surface rounded-[3rem] border-2 transition-all ${
                    item.promoId
                      ? "border-accent shadow-sm"
                      : "border-neutral-100 border-dashed"
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      {REWARD_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              rewardCatalog: formData.rewardCatalog.map((r) =>
                                r.id === item.id
                                  ? {
                                      ...r,
                                      promoId: p.id,
                                      label: p.label,
                                      xpCost: p.xpCost,
                                      type: p.type,
                                    }
                                  : r
                              ),
                            })
                          }
                          className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase transition-all border-2 ${
                            item.promoId === p.id
                              ? "bg-primary border-primary text-white"
                              : "bg-neutral-50 border-neutral-100 text-neutral-400"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    {formData.rewardCatalog.length > 1 && (
                      <button
                        onClick={() => removeReward(item.id)}
                        className="ml-4 p-2 text-neutral-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  {item.promoId && (
                    <div className="flex items-center justify-between p-4 bg-background rounded-2xl border border-neutral-100 animate-in slide-in-from-top-2">
                      <div>
                        <span className="text-[10px] font-black uppercase opacity-40">
                          Cost to Customer
                        </span>
                        <div className="text-xl font-black italic text-primary">
                          {item.xpCost}{" "}
                          <span className="text-[12px] not-italic">XP</span>
                        </div>
                      </div>
                      {item.type === "free_item" && (
                        <input
                          type="text"
                          placeholder="Item (e.g. Croissant)"
                          value={item.itemName || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rewardCatalog: formData.rewardCatalog.map((r) =>
                                r.id === item.id
                                  ? { ...r, itemName: e.target.value }
                                  : r
                              ),
                            })
                          }
                          className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 text-[11px] font-bold outline-none focus:border-primary w-1/2"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() =>
                setFormData({
                  ...formData,
                  rewardCatalog: [
                    ...formData.rewardCatalog,
                    {
                      id: Date.now().toString(),
                      promoId: "",
                      label: "",
                      xpCost: 0,
                      itemName: "",
                      type: "",
                    },
                  ],
                })
              }
              className="w-full py-6 border-4 border-dashed rounded-[3rem] border-neutral-100 text-neutral-300 font-black uppercase text-[10px] tracking-[0.3em] hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Another Reward
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 text-center animate-in zoom-in-95">
            {!qrUrl ? (
              <div className="bg-neutral-950 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32" />
                <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-10 relative z-10">
                  Deploy <br /> <span className="text-accent">Economy.</span>
                </h2>
                <button
                  onClick={launchEconomy}
                  disabled={isLaunching}
                  className="w-full py-6 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 active:scale-95 transition-all relative z-10 shadow-2xl shadow-primary/40"
                >
                  {isLaunching ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Rocket size={20} />
                  )}{" "}
                  Launch Platform
                </button>
              </div>
            ) : (
              <div className="bg-surface p-12 rounded-[4rem] border-2 border-accent shadow-2xl space-y-10">
                <h2 className="text-4xl font-black italic tracking-tighter uppercase text-neutral-950">
                  Platform <span className="text-primary">Live.</span>
                </h2>
                <div className="p-8 bg-white rounded-[3rem] inline-block border-8 border-neutral-50">
                  <QRCodeSVG value={qrUrl} size={240} fgColor="#000" />
                </div>
                <button
                  onClick={() => router.push("/owner")}
                  className="w-full py-6 bg-neutral-950 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3"
                >
                  Go to Owner Dashboard <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Floating Navigation */}
        {!qrUrl && (
          <div className="mt-16 flex justify-between items-center p-4 bg-surface/80 backdrop-blur-md rounded-[2.5rem] border border-neutral-100 shadow-lg">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="px-8 py-4 text-[10px] font-black uppercase opacity-40 disabled:opacity-0"
            >
              Back
            </button>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    step === i ? "bg-primary w-4" : "bg-neutral-200"
                  } transition-all`}
                />
              ))}
            </div>
            {step < 3 && (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 ? !isStep1Valid() : !isStep2Valid()}
                className="px-12 py-4 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 disabled:opacity-20 transition-all cursor-pointer"
              >
                Next
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
