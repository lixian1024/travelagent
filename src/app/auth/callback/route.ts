import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const providerError = searchParams.get("error_description") ?? searchParams.get("error");
  const next = searchParams.get("next");
  const destination = next?.startsWith("/") ? next : "/app";

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(
      new URL("/login?error=Supabase%20is%20not%20configured", origin)
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(destination, origin));
    }

    console.error("Supabase OAuth code exchange failed", {
      code: error.code,
      message: error.message,
      status: error.status,
    });

    const message = error.code
      ? `${error.code}: ${error.message}`
      : error.message;

    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, origin)
    );
  }

  if (providerError) {
    console.error("OAuth provider returned an error", providerError);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(providerError)}`, origin)
    );
  }

  return NextResponse.redirect(
    new URL("/login?error=OAuth%20callback%20did%20not%20include%20an%20authorization%20code", origin)
  );
}
