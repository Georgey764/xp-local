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
  Tag,
  Download,
  Loader2,
  AlertCircle,
  Check,
  X,
} from "lucide-react";

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
    placeholder: "https://google.com/...",
  },
  {
    id: "ig_follow",
    label: "IG Follow",
    xp: 25,
    icon: <Instagram size={18} />,
    desc: "+25 XP",
    requiresLink: true,
    placeholder: "https://instagram.com/yourpage",
  },
];

const REWARD_PRESETS = [
  {
    id: "mystery_treat",
    label: "Mystery Treat",
    xpCost: 150,
    icon: <Sparkles size={14} />,
    type: "special",
  },
  {
    id: "5_off_25",
    label: "$5 Off ($25+)",
    xpCost: 500,
    icon: <DollarSign size={14} />,
    type: "fixed",
  },
  {
    id: "bogo_drink",
    label: "BOGO Drink",
    xpCost: 600,
    icon: <Coffee size={14} />,
    type: "special",
  },
  {
    id: "25_pct_order",
    label: "25% Off Order",
    xpCost: 800,
    icon: <Percent size={14} />,
    type: "pct",
  },
  {
    id: "free_cupcake",
    label: "Free Cupcake",
    xpCost: 800,
    icon: <Gift size={14} />,
    type: "free_item",
  },
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

  useEffect(() => {
    const checkUserStatus = async () => {
      // Use getSession to prevent the 401 error in console for unauthenticated visitors
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return setLoading(false);

      const { data: staffRecord } = await supabase
        .from("venue_staff")
        .select("venue_id")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (staffRecord) router.push("/owner");
      else setLoading(false);
    };
    checkUserStatus();
  }, [supabase, router]);

  const isValidUrl = (url) => {
    try {
      return url.startsWith("https://") && url.length > 12;
    } catch (e) {
      return false;
    }
  };

  const isStep1Valid = () => {
    if (!formData.venueName.trim()) return false;
    return !formData.selectedTasks.some((id) => {
      const task = TASK_REGISTRY.find((t) => t.id === id);
      return task?.requiresLink ? !isValidUrl(formData.taskLinks[id]) : false;
    });
  };

  const isStep2Valid = () =>
    formData.rewardCatalog.length >= 1 &&
    formData.rewardCatalog.every(
      (r) =>
        r.promoId !== "" &&
        (r.type === "free_item" ? r.itemName.trim() !== "" : true)
    );

  const launchEconomy = async () => {
    setIsLaunching(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    try {
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const baseSlug = formData.venueName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      const uniqueSlug = `${baseSlug}-${randomSuffix}`;

      const { data: venue } = await supabase
        .from("venues")
        .insert([
          {
            name: formData.venueName,
            slug: uniqueSlug,
            owner_id: user.id,
            primary_color: "var(--primary-brand)",
          },
        ])
        .select()
        .single();

      await supabase
        .from("venue_staff")
        .insert([{ venue_id: venue.id, user_id: user.id, role: "admin" }]);

      const tasksToInsert = TASK_REGISTRY.filter((t) =>
        formData.selectedTasks.includes(t.id)
      ).map((t) => ({
        venue_id: venue.id,
        label: t.label,
        xp_reward: t.xp,
        action_type: t.id,
        target_url: formData.taskLinks[t.id] || null,
        is_active: true,
      }));
      await supabase.from("earning_tasks").insert(tasksToInsert);

      const rewardsToInsert = formData.rewardCatalog.map((r) => ({
        venue_id: venue.id,
        label: r.type === "free_item" ? `Free ${r.itemName}` : r.label,
        cost: r.xpCost,
        is_active: true,
      }));
      await supabase.from("rewards").insert(rewardsToInsert);

      setQrUrl(`${window.location.origin}/check-in/${venue.id}`);
    } catch (err) {
      alert(err.message);
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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 transition-colors duration-500">
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Zap size={20} fill="currentColor" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic">
            XP LOCAL
          </span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-10">
        {/* Step Indicator */}
        <div className="flex justify-center items-center gap-2 mb-12">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] transition-all ${
                step === num
                  ? "bg-primary text-white shadow-lg scale-110"
                  : step > num
                  ? "bg-accent text-black"
                  : "bg-muted text-foreground/20"
              }`}
            >
              {step > num ? <CheckCircle2 size={14} /> : num}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-surface p-6 rounded-[2rem] border-2 border-primary shadow-sm">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">
                Venue Name
              </label>
              <input
                type="text"
                placeholder="e.g. Cafe Local"
                value={formData.venueName}
                onChange={(e) =>
                  setFormData({ ...formData, venueName: e.target.value })
                }
                className="w-full bg-transparent text-2xl font-black italic outline-none p-2 placeholder:text-foreground/10"
              />
            </div>

            <div className="space-y-3">
              {TASK_REGISTRY.map((t) => {
                const isSel = formData.selectedTasks.includes(t.id);
                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-[2rem] border-2 transition-all ${
                      isSel
                        ? "border-accent bg-surface"
                        : "border-transparent bg-muted/50"
                    }`}
                  >
                    <button
                      onClick={() =>
                        !t.required &&
                        setFormData({
                          ...formData,
                          selectedTasks: isSel
                            ? formData.selectedTasks.filter((x) => x !== t.id)
                            : [...formData.selectedTasks, t.id],
                        })
                      }
                      className="w-full flex items-center gap-4 text-left"
                    >
                      <div
                        className={`p-3 rounded-xl ${
                          isSel
                            ? "bg-primary text-white"
                            : "bg-surface text-foreground/20"
                        }`}
                      >
                        {t.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm">{t.label}</div>
                        <div className="text-[10px] font-black text-primary uppercase tracking-widest">
                          {t.desc}
                        </div>
                      </div>
                      {isSel && (
                        <CheckCircle2 size={18} className="text-accent" />
                      )}
                    </button>
                    {t.requiresLink && isSel && (
                      <input
                        type="url"
                        placeholder={t.placeholder}
                        value={formData.taskLinks[t.id] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            taskLinks: {
                              ...formData.taskLinks,
                              [t.id]: e.target.value,
                            },
                          })
                        }
                        className="w-full mt-4 p-3 rounded-xl text-[11px] font-bold border border-border bg-background outline-none focus:border-primary"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in zoom-in-95">
            <h2 className="text-3xl font-black italic text-center">
              Reward <span className="text-primary">Marketplace.</span>
            </h2>
            {formData.rewardCatalog.map((item) => (
              <div
                key={item.id}
                className={`relative p-6 bg-surface rounded-[2.5rem] border-2 border-b-4 transition-all ${
                  item.promoId
                    ? "border-accent"
                    : "border-red-500/20 border-dashed"
                }`}
              >
                <div className="flex flex-wrap gap-2 mb-4">
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
                      className={`px-3 py-2 rounded-full border-2 text-[10px] font-black uppercase transition-all ${
                        item.promoId === p.id
                          ? "bg-primary border-primary text-white"
                          : "bg-muted border-border text-foreground/40"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {item.type === "free_item" && (
                  <input
                    type="text"
                    placeholder="Item Name (e.g. Latte)"
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
                    className="w-full bg-background p-3 rounded-2xl border border-border text-[11px] font-bold outline-none"
                  />
                )}
              </div>
            ))}
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
              className="w-full py-6 border-4 border-dashed rounded-[2.5rem] border-border text-foreground/20 font-black uppercase text-[10px] tracking-widest"
            >
              + Add Reward
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center animate-in fade-in">
            {!qrUrl ? (
              <div className="bg-foreground p-12 rounded-[3.5rem] text-background space-y-8">
                <h2 className="text-4xl font-black italic tracking-tighter leading-none">
                  Deploy <br /> <span className="text-accent">Economy.</span>
                </h2>
                <button
                  onClick={launchEconomy}
                  disabled={isLaunching}
                  className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black uppercase flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  {isLaunching ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Rocket size={18} />
                  )}{" "}
                  Launch Platform
                </button>
              </div>
            ) : (
              <div className="bg-surface p-10 rounded-[3.5rem] border border-border shadow-2xl space-y-8">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase">
                  Platform <span className="text-primary">Live.</span>
                </h2>
                <div className="p-6 bg-white rounded-[2.5rem] inline-block border-4 border-dashed border-muted">
                  <QRCodeSVG
                    id="venue-qr"
                    value={qrUrl}
                    size={200}
                    fgColor="#000"
                  />
                </div>
                <button
                  onClick={() => router.push("/owner")}
                  className="w-full py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest"
                >
                  Go to Dashboard{" "}
                  <ArrowRight size={18} className="inline ml-2" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer Nav */}
        {!qrUrl && (
          <div className="mt-12 flex justify-between p-3 bg-surface/60 backdrop-blur-md rounded-[2rem] border border-border">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="px-6 py-3 text-[10px] font-black uppercase text-foreground/40 disabled:opacity-0"
            >
              Back
            </button>
            {step < 3 && (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 ? !isStep1Valid() : !isStep2Valid()}
                className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg disabled:opacity-40 transition-all"
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
