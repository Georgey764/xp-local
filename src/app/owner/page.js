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
      // STEP 1: Use maybeSingle() to avoid 406 errors entirely
      const { data: redemption, error: fetchError } = await supabase
        .from("redemptions")
        .select(
          `
        *, 
        rewards(label, cost), 
        venues!inner(owner_id)
      `
        )
        .eq("code", inputCode.toUpperCase())
        .eq("venues.owner_id", user.id) // <--- Only show codes for THIS owner
        .maybeSingle();

      // STEP 2: Precise Error Feedback
      if (fetchError) throw new Error("Connection error. Try again.");
      if (!redemption) throw new Error("Code does not exist.");
      if (redemption.status !== "active")
        throw new Error("Code already used or deactivated.");
      if (new Date(redemption.expires_at) < new Date())
        throw new Error("Code has expired.");

      // STEP 3: Mark as used — change status to inactive
      // We add .select() so we can confirm the update worked
      const { error: updateError } = await supabase
        .from("redemptions")
        .update({
          status: "inactive",
          redeemed_at: now,
          // Note: We leave expires_at alone so you have a record of when it WOULD have expired
        })
        .eq("id", redemption.id)
        .select();

      if (updateError) throw new Error("Failed to process redemption.");

      // STEP 4: Log activity
      // We use the reward cost for the log even if we don't change the balance here,
      // so the owner sees the VALUE of what was given away.
      await supabase.from("activity_logs").insert({
        venue_id: redemption.venue_id,
        user_id: redemption.user_id,
        action_name: (redemption.rewards?.label || "REWARD").toUpperCase(),
        display_name: "Staff Verification",
        xp_change: 0, // 0 because the XP was already deducted at purchase
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
    <div className="max-w-md mx-auto py-20 px-6 min-h-screen bg-white font-sans antialiased">
      <header className="text-center mb-12 space-y-2">
        <div className="w-16 h-16 text-[oklch(64%_0.24_274)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
          Verify <span className="text-[oklch(64%_0.24_274)]">XP.</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
          Secure Redemption Portal
        </p>
      </header>

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="relative group">
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full bg-neutral-50 rounded-[2rem] px-8 py-8 text-4xl font-mono font-black tracking-[0.3em] text-center outline-none border-2 border-neutral-100 focus:border-[oklch(64%_0.24_274)] focus:bg-white transition-all shadow-inner uppercase"
          />
          <div className="absolute top-4 right-6 opacity-10 group-focus-within:opacity-30 transition-opacity">
            <Zap size={20} />
          </div>
        </div>

        {message.text && (
          <div
            className={`flex items-center gap-3 p-5 rounded-[1.5rem] border ${
              message.type === "success"
                ? "bg-green-50 border-green-100 text-green-700"
                : "bg-red-50 border-red-100 text-red-700"
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
          className="w-full py-6 bg-black text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
        >
          {isVerifying ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            "Verify & Deactivate"
          )}
        </button>
      </form>

      <footer className="mt-12 text-center">
        <p className="text-[9px] font-bold uppercase opacity-20 tracking-widest leading-relaxed">
          Only active & non-expired codes can be redeemed.
          <br />
          Status becomes <strong>inactive</strong> immediately.
        </p>
      </footer>
    </div>
  );
}
