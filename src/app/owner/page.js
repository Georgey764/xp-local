"use client";
import React, { useState } from "react";
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function RedeemPage() {
  const supabase = createClient();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.trim().length !== 6) return;

    setIsVerifying(true);
    setMessage({ text: "", type: "" });

    const inputCode = code.trim().toUpperCase();
    const now = new Date().toISOString();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    try {
      const { data: redemption, error: fetchError } = await supabase
        .from("redemptions")
        .select(`*, rewards(label, cost), venues!inner(owner_id)`)
        .eq("code", inputCode)
        .eq("venues.owner_id", user.id)
        .maybeSingle();

      if (fetchError) throw new Error("Connection error. Try again.");
      if (!redemption) throw new Error("Code does not exist.");
      if (redemption.status !== "active")
        throw new Error("Code already used or deactivated.");
      if (redemption.expires_at && new Date(redemption.expires_at) < new Date())
        throw new Error("Code has expired.");

      const { error: updateError } = await supabase
        .from("redemptions")
        .update({ status: "inactive", redeemed_at: now })
        .eq("id", redemption.id);

      if (updateError) throw new Error("Failed to process redemption.");

      await supabase.from("activity_logs").insert({
        venue_id: redemption.venue_id,
        user_id: redemption.user_id,
        action_name: (redemption.rewards?.label || "REWARD").toUpperCase(),
        display_name: "Staff Verification",
        xp_change: 0,
      });

      setMessage({
        text: `Success! ${redemption.rewards?.label || "Reward"} verified.`,
        type: "success",
      });
      setCode("");
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    /* Force white background and black text - No defaults */
    <div className="max-w-md mx-auto py-10 px-6 min-h-screen bg-white font-sans antialiased text-black">
      <header className="text-center mb-12 space-y-2">
        <div className="w-16 h-16 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg bg-white border border-neutral-100">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-black">
          Verify <span className="text-primary">XP.</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">
          Staff Terminal
        </p>
      </header>

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="relative group">
          {/* Forced light-mode input styling */}
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full bg-neutral-50 rounded-[2rem] px-8 py-8 text-4xl font-mono font-black tracking-[0.3em] text-center outline-none border-2 border-neutral-100 focus:border-primary focus:bg-white transition-all shadow-inner uppercase text-black placeholder:text-black/5"
          />
          <div className="absolute top-4 right-6 text-primary opacity-20">
            <Zap size={20} fill="currentColor" />
          </div>
        </div>

        {message.text && (
          <div
            className={`flex items-center gap-3 p-5 rounded-[1.5rem] border ${
              message.type === "success"
                ? "bg-green-500/5 border-green-500/20 text-green-600"
                : "bg-red-500/5 border-red-500/20 text-red-600"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="text-[11px] font-black uppercase tracking-tight">
              {message.text}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={code.trim().length !== 6 || isVerifying}
          className="w-full py-6 bg-black text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl active:scale-95 transition-all disabled:opacity-10 flex items-center justify-center gap-3 cursor-pointer border-none"
        >
          {isVerifying ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            "Verify & Deactivate"
          )}
        </button>
      </form>

      <footer className="mt-12 text-center">
        <p className="text-[9px] font-bold uppercase text-black/20 tracking-widest leading-relaxed">
          ONLY ACTIVE CODES CAN BE REDEEMED.
          <br />
          STATUS BECOMES <strong className="text-black/60">
            INACTIVE
          </strong>{" "}
          IMMEDIATELY.
        </p>
      </footer>
    </div>
  );
}
