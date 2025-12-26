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
  Users,
  Calendar,
  Instagram,
  MessageSquare,
  Rocket,
  ArrowRight,
  Zap,
  Coffee,
  Sparkles,
  Plus,
  Tag,
  Download,
  Loader2,
  AlertCircle, // Added for validation feedback
  Check, // Added for validation feedback
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
    placeholder: "https://maps.google.com/...",
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
        id: "init",
        promoId: "mystery_treat",
        label: "Mystery Treat",
        xpCost: 150,
        itemName: "",
        type: "special",
      },
    ],
  });

  // URL Validation Helper
  const isValidUrl = (url) => {
    try {
      const pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
          "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
          "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
          "(\\#[-a-z\\d_]*)?$",
        "i"
      );
      return !!pattern.test(url) && url.startsWith("https://");
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return setLoading(false);
      const { data: staffRecord } = await supabase
        .from("venue_staff")
        .select("venue_id")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (staffRecord) router.push("/owner");
      else setLoading(false);
    };
    checkUserStatus();
  }, [supabase, router]);

  const isStep1Valid = () => {
    if (!formData.venueName.trim()) return false;
    return !formData.selectedTasks.some((taskId) => {
      const taskDef = TASK_REGISTRY.find((t) => t.id === taskId);
      if (taskDef?.requiresLink) {
        return !isValidUrl(formData.taskLinks[taskId]);
      }
      return false;
    });
  };

  const launchEconomy = async () => {
    setIsLaunching(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return alert("No active session found.");

    try {
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const baseSlug = formData.venueName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      const uniqueSlug = `${baseSlug}-${randomSuffix}`;

      const { data: venue, error: vErr } = await supabase
        .from("venues")
        .insert([
          {
            name: formData.venueName,
            slug: uniqueSlug,
            owner_id: user.id,
            primary_color: "oklch(64% 0.24 274)",
          },
        ])
        .select()
        .single();
      if (vErr) throw vErr;

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

      const rewardsToInsert = formData.rewardCatalog.map((r) => {
        let finalLabel = r.label;
        if (r.promoId === "free_cupcake" || r.label === "Free Cupcake") {
          finalLabel = r.itemName ? `Free ${r.itemName}` : "Free Item";
        }
        return {
          venue_id: venue.id,
          label: finalLabel,
          cost: r.xpCost,
          is_active: true,
        };
      });
      await supabase.from("rewards").insert(rewardsToInsert);

      setQrUrl(`${window.location.origin}/check-in/${venue.id}`);
    } catch (err) {
      alert("Error deploying: " + err.message);
    } finally {
      setIsLaunching(false);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById("venue-qr");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 50, 50, 900, 900);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${formData.venueName}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-black italic uppercase opacity-20">
        Initializing...
      </div>
    );

  return (
    <div className="min-h-screen bg-[oklch(99%_0.005_60)] pb-24 font-sans antialiased">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[oklch(64%_0.24_274)] rounded-xl flex items-center justify-center text-white">
            <Zap size={20} fill="currentColor" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic">
            XP LOCAL
          </span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="flex justify-center items-center gap-2 mb-12">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] transition-all ${
                step === num
                  ? "bg-[oklch(64%_0.24_274)] text-white shadow-lg scale-110"
                  : step > num
                  ? "bg-[oklch(88%_0.19_118)] text-black"
                  : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {step > num ? <CheckCircle2 size={12} /> : num}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white p-6 rounded-[2rem] border-2 border-[oklch(64%_0.24_274)] shadow-sm">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">
                Venue Name
              </label>
              <input
                type="text"
                placeholder="e.g. Cafe Local"
                value={formData.venueName}
                onChange={(e) =>
                  setFormData({ ...formData, venueName: e.target.value })
                }
                className="w-full bg-transparent text-2xl font-black italic outline-none p-2"
              />
            </div>
            <div className="space-y-3">
              {TASK_REGISTRY.map((t) => {
                const isSel = formData.selectedTasks.includes(t.id);
                const linkValue = formData.taskLinks[t.id] || "";
                const hasInput = linkValue.length > 0;
                const isUrlValid = isValidUrl(linkValue);

                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-[2rem] border-2 transition-all ${
                      isSel
                        ? "border-[oklch(88%_0.19_118)] bg-white shadow-sm"
                        : "border-transparent bg-neutral-100"
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
                            ? "bg-[oklch(64%_0.24_274)] text-white"
                            : "bg-white text-neutral-300"
                        }`}
                      >
                        {t.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm leading-tight">
                          {t.label}
                        </div>
                        <div className="text-[10px] font-black text-[oklch(64%_0.24_274)] uppercase tracking-widest">
                          {t.desc}
                        </div>
                      </div>
                      {isSel && (
                        <CheckCircle2
                          size={18}
                          className="text-[oklch(88%_0.19_118)]"
                        />
                      )}
                    </button>
                    {t.requiresLink && isSel && (
                      <div className="mt-4 relative">
                        <div className="flex justify-between items-center mb-1 ml-1">
                          <span
                            className={`text-[9px] font-black uppercase ${
                              hasInput && !isUrlValid
                                ? "text-red-500"
                                : "text-[oklch(64%_0.24_274)]"
                            }`}
                          >
                            {hasInput && !isUrlValid
                              ? "Invalid HTTPS URL"
                              : "Enter Task URL"}
                          </span>
                          {hasInput &&
                            (isUrlValid ? (
                              <Check size={14} className="text-green-500" />
                            ) : (
                              <AlertCircle size={14} className="text-red-500" />
                            ))}
                        </div>
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
                          className={`w-full p-3 pr-10 rounded-xl text-[11px] font-bold border outline-none transition-all ${
                            hasInput && !isUrlValid
                              ? "border-red-200 bg-red-50 focus:border-red-500"
                              : "border-neutral-100 bg-neutral-50 focus:border-[oklch(64%_0.24_274)]"
                          }`}
                        />
                      </div>
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
              Reward{" "}
              <span className="text-[oklch(64%_0.24_274)]">Marketplace.</span>
            </h2>
            {formData.rewardCatalog.map((item) => (
              <div
                key={item.id}
                className="p-6 bg-white rounded-[2.5rem] border-b-4 border-[oklch(88%_0.19_118)] shadow-sm"
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
                          ? "bg-[oklch(64%_0.24_274)] border-[oklch(64%_0.24_274)] text-white"
                          : "bg-neutral-50 border-neutral-100 text-neutral-400"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {item.type === "free_item" && (
                  <div className="flex items-center gap-2 bg-neutral-50 p-3 rounded-2xl border border-neutral-100 focus-within:border-[oklch(64%_0.24_274)] transition-colors">
                    <Tag size={14} className="text-[oklch(64%_0.24_274)]" />
                    <input
                      type="text"
                      placeholder="Item Name (e.g. Strawberry Cupcake)"
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
                      className="bg-transparent text-[11px] font-bold outline-none flex-1"
                    />
                  </div>
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
                      id: Date.now(),
                      label: "New Item",
                      xpCost: 500,
                      type: "special",
                    },
                  ],
                })
              }
              className="w-full py-6 border-4 border-dashed rounded-[2.5rem] text-neutral-300 font-black uppercase text-[10px] tracking-widest"
            >
              + Add Reward
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {!qrUrl ? (
              <div className="bg-[oklch(28%_0.04_260)] p-12 rounded-[3.5rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
                <h2 className="text-4xl font-black italic tracking-tighter leading-none">
                  Deploy <br />{" "}
                  <span className="text-[oklch(88%_0.19_118)]">Economy.</span>
                </h2>
                <button
                  onClick={launchEconomy}
                  disabled={isLaunching}
                  className="w-full py-5 bg-[oklch(64%_0.24_274)] text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1 transition-all"
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
              <div className="bg-white p-10 rounded-[3.5rem] border border-neutral-100 shadow-2xl text-center space-y-8 animate-in zoom-in-95">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-[oklch(88%_0.19_118)] rounded-full flex items-center justify-center text-black mb-2">
                    <CheckCircle2 size={24} />
                  </div>
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase">
                    Platform{" "}
                    <span className="text-[oklch(64%_0.24_274)]">Live.</span>
                  </h2>
                </div>
                <div className="p-6 bg-neutral-50 rounded-[2.5rem] inline-block border-4 border-dashed border-neutral-100">
                  <QRCodeSVG
                    id="venue-qr"
                    value={qrUrl}
                    size={200}
                    level={"H"}
                    includeMargin={true}
                    fgColor="#4B4ACF"
                  />
                </div>
                <div className="grid gap-3">
                  <button
                    onClick={downloadQR}
                    className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg"
                  >
                    <Download size={18} /> Download QR Code
                  </button>
                  <button
                    onClick={() => router.push("/owner")}
                    className="w-full py-5 border-2 border-neutral-100 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-neutral-50 transition-all text-neutral-400"
                  >
                    Go to Dashboard <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 flex justify-between p-3 bg-white/60 backdrop-blur-md rounded-[2rem] shadow-xl border border-neutral-100">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1 || !!qrUrl}
            className="px-6 py-3 text-[10px] font-black uppercase text-neutral-400 disabled:opacity-0"
          >
            Back
          </button>
          {step < 3 && (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 ? !isStep1Valid() : false}
              className="px-10 py-4 bg-[oklch(64%_0.24_274)] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg disabled:opacity-40 transition-all"
            >
              Next
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
