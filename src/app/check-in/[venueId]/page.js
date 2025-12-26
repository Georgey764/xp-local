"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import {
  Zap,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Lock,
  Sparkles,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

export default function CheckInPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { venueId } = useParams();

  const [loading, setLoading] = useState(true);
  const [isValidVenue, setIsValidVenue] = useState(true);
  const [user, setUser] = useState(null);
  const [venueName, setVenueName] = useState("");
  const [rewards, setRewards] = useState([]);
  const [claimStatus, setClaimStatus] = useState(null);

  /**
   * handleClaimXP: Executes the RPC to credit the scan reward.
   */
  const handleClaimXP = useCallback(
    async (userId) => {
      try {
        // This single call now handles XP + Completion + Activity Log
        const { data, error } = await supabase.rpc("claim_scan_xp", {
          user_id_input: userId,
          venue_id_input: venueId,
        });

        if (error) throw error;

        // Sync UI status
        setClaimStatus(data && data.success ? "success" : "cooldown");
      } catch (err) {
        console.error("Claim Error:", err);
        setClaimStatus("error");
      } finally {
        setLoading(false);
      }
    },
    [supabase, venueId]
  );

  useEffect(() => {
    const initCheckIn = async () => {
      // 1. Pre-validate UUID format locally
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(venueId)) {
        setIsValidVenue(false);
        setLoading(false);
        return;
      }

      try {
        // 2. Verify Venue Existence
        const { data: venueRes, error: venueErr } = await supabase
          .from("venues")
          .select("name")
          .eq("id", venueId)
          .maybeSingle();

        if (venueErr || !venueRes) {
          setIsValidVenue(false);
          setLoading(false);
          return;
        }

        setVenueName(venueRes.name);

        // 3. Parallel fetch of Marketplace preview and Auth state
        const [rewardsRes, authRes] = await Promise.all([
          supabase
            .from("rewards")
            .select("label, cost")
            .eq("venue_id", venueId)
            .limit(4),
          supabase.auth.getUser(),
        ]);

        setRewards(rewardsRes.data || []);
        const activeUser = authRes.data.user;
        setUser(activeUser);

        if (activeUser) {
          // Trigger the XP claim automatically if logged in
          await handleClaimXP(activeUser.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.loge(err);
        setIsValidVenue(false);
        setLoading(false);
      }
    };

    if (venueId) initCheckIn();
  }, [venueId, handleClaimXP, supabase]);

  const handleOAuthSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/check-in/${venueId}`,
      },
    });
  };

  // --- LOADING STATE ---
  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2
          className="animate-spin text-[oklch(64%_0.24_274)] mb-4"
          size={32}
        />
        <span className="text-[10px] font-black uppercase tracking-widest opacity-20">
          Verifying Venue...
        </span>
      </div>
    );

  // --- ERROR STATE: INVALID VENUE ---
  if (!isValidVenue)
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={40} className="text-red-500 mb-6" />
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">
          Invalid URL.
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 max-w-[200px] leading-relaxed">
          The scanned QR code is either expired or the venue no longer exists.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-8 px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl"
        >
          Return Home
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans antialiased">
      <div className="w-full max-w-md space-y-6">
        {/* --- BRANDING --- */}
        <header className="text-center space-y-2">
          <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-100 text-[oklch(64%_0.24_274)]">
            <Zap size={32} fill="currentColor" />
          </div>
          <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.3em]">
            Checking into
          </p>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
            {venueName}
          </h1>
        </header>

        {/* --- INTERACTIVE CARD --- */}
        <div className="bg-neutral-50 rounded-[3rem] p-8 border border-neutral-100 space-y-8 shadow-sm">
          {!user ? (
            /* --- UNSIGNED VIEW --- */
            <div className="space-y-8">
              <div className="flex items-center gap-4 bg-white p-5 rounded-[2rem] shadow-sm">
                <Sparkles size={20} className="text-[oklch(88%_0.19_118)]" />
                <div>
                  <h3 className="text-lg font-black italic uppercase leading-none">
                    Congrats!
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">
                    +50 XP Ready
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <ShoppingBag size={14} className="opacity-20" />
                  <h4 className="text-[9px] font-black uppercase tracking-widest opacity-20 italic">
                    Marketplace Preview
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {rewards.map((reward, i) => (
                    <div
                      key={i}
                      className="bg-white p-4 rounded-2xl border border-neutral-50 flex flex-col gap-1"
                    >
                      <span className="text-[10px] font-bold uppercase truncate">
                        {reward.label}
                      </span>
                      <span className="text-[9px] font-black text-[oklch(64%_0.24_274)]">
                        {reward.cost} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleOAuthSignIn}
                className="w-full py-5 bg-[oklch(64%_0.24_274)] text-white rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-[11px] flex items-center justify-center gap-2 shadow-xl shadow-[oklch(64%_0.24_274)]/20 active:scale-95 transition-all"
              >
                Save my 50 XP now <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            /* --- SIGNED IN VIEW --- */
            <div className="text-center py-4 space-y-6">
              {claimStatus === "success" ? (
                /* SUCCESS STATE: CELEBRATE XP */
                <div className="space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-[oklch(88%_0.19_118)]/10 rounded-full flex items-center justify-center mx-auto text-[oklch(88%_0.19_118)]">
                    <CheckCircle2 size={56} />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-[oklch(64%_0.24_274)]">
                      +50 XP Earned!
                    </h2>
                    <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mt-3">
                      Your loyalty is paying off
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/customer/${venueId}`)}
                    className="w-full py-5 bg-black text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all"
                  >
                    Go to Marketplace
                  </button>
                </div>
              ) : (
                /* COOLDOWN STATE: LOCKED */
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-300">
                    <Lock size={40} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic uppercase leading-none">
                      XP Already Claimed.
                    </h2>
                    <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-2">
                      12-hour cooldown active
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/customer/${venueId}`)}
                    className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
