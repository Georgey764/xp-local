// app/auth/callback/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server"; // optional but cleaner

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  // Optional: better error page + fallback
  const redirectOnError = `${
    requestUrl.origin
  }/auth/error?message=${encodeURIComponent("Authentication failed")}`;

  if (code) {
    const supabase = await createClient(); // assumes it uses cookies() internally

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Code exchange failed:", error.message);
      return NextResponse.redirect(redirectOnError);
    }
  }

  // Always redirect — even when no code (defensive)
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
