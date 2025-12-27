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

  const handleClaimXP = useCallback(
    async (userId) => {
      try {
        const { data, error } = await supabase.rpc("claim_scan_xp", {
          user_id_input: userId,
          venue_id_input: venueId,
        });

        if (error) throw error;
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
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(venueId)) {
        setIsValidVenue(false);
        setLoading(false);
        return;
      }

      try {
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

        const { data: rewardsRes } = await supabase
          .from("rewards")
          .select("label, cost")
          .eq("venue_id", venueId)
          .limit(4);

        setRewards(rewardsRes || []);

        const {
          data: { user: activeUser },
        } = await supabase.auth.getUser();

        if (activeUser) {
          setUser(activeUser);
          await handleClaimXP(activeUser.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Initialization Error:", err);
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

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary mb-4" size={32} />
        <span className="text-[10px] font-black uppercase tracking-widest text-black/20">
          Verifying Venue...
        </span>
      </div>
    );

  if (!isValidVenue)
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={40} className="text-red-500 mb-6" />
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2 text-black">
          Invalid URL.
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 max-w-[200px] leading-relaxed">
          The scanned QR code is either expired or the venue no longer exists.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-8 px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl cursor-pointer"
        >
          Return Home
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans antialiased text-black selection:bg-accent selection:text-black">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center space-y-2">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-200 text-primary shadow-lg shadow-primary/10">
            <Zap size={32} fill="currentColor" />
          </div>
          <p className="text-[10px] font-black uppercase text-black/30 tracking-[0.3em]">
            Checking into
          </p>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-black">
            {venueName}
          </h1>
        </header>

        {/* Using bg-neutral-50 (oklch 99%) for the surface to maintain tint without dark mode shift */}
        <div className="bg-neutral-50 rounded-[3rem] p-8 border border-neutral-100 space-y-8 shadow-sm relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

          {!user ? (
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-4 bg-white p-5 rounded-[2rem] border border-neutral-200">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-black italic uppercase leading-none text-black">
                    Congrats!
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1">
                    +50 XP Ready to claim
                  </p>
                </div>
              </div>

              {rewards.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <ShoppingBag size={14} className="text-neutral-300" />
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-neutral-300 italic">
                      Marketplace Preview
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {rewards.map((reward, i) => (
                      <div
                        key={i}
                        className="bg-white p-4 rounded-2xl border border-neutral-100 flex flex-col gap-1 shadow-sm"
                      >
                        <span className="text-[10px] font-bold uppercase truncate text-black">
                          {reward.label}
                        </span>
                        <span className="text-[9px] font-black text-reward">
                          {reward.cost} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleOAuthSignIn}
                className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-[11px] flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all cursor-pointer border-none"
              >
                Save my 50 XP now <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="text-center py-4 space-y-6 relative z-10">
              {claimStatus === "success" ? (
                <div className="space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto text-black shadow-[0_0_30px_#ccf381] shadow-accent/30">
                    <CheckCircle2 size={48} />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-primary">
                      +50 XP Earned!
                    </h2>
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mt-3">
                      Visit the marketplace to redeem
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/customer/${venueId}`)}
                    className="w-full py-5 bg-black text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all cursor-pointer border-none"
                  >
                    Redeem Rewards
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-neutral-200 border border-neutral-200">
                    <Lock size={32} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic uppercase leading-none text-black">
                      XP Already Claimed.
                    </h2>
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-2">
                      Check back in 12 hours
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/customer/${venueId}`)}
                    className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all cursor-pointer border-none"
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
