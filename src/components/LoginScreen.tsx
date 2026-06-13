"use client";

import { ArrowLeft, LoaderCircle, LockKeyhole, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Provider = "google" | "facebook";

const providerDetails: Record<
  Provider,
  { label: string; mark: string; markClass: string }
> = {
  google: {
    label: "Continue with Google",
    mark: "G",
    markClass: "text-[#4285f4]",
  },
  facebook: {
    label: "Continue with Meta",
    mark: "f",
    markClass: "bg-[#0866ff] text-white rounded-full",
  },
};

export default function LoginScreen({
  configured,
  initialError,
  providers,
}: {
  configured: boolean;
  initialError?: string;
  providers: { google: boolean; facebook: boolean };
}) {
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState(initialError ?? "");

  async function signIn(provider: Provider) {
    if (!configured) {
      setError("Connect a Supabase project before starting OAuth.");
      return;
    }

    setPending(provider);
    setError("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/app`;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        scopes: provider === "facebook" ? "email,public_profile" : undefined,
      },
    });

    if (authError) {
      setPending(null);
      setError(authError.message);
    }
  }

  return (
    <main className="min-h-dvh bg-[#e7e2d8]">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-paper px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(20px,env(safe-area-inset-top))] shadow-[0_0_80px_rgba(19,18,15,0.12)]">
        <Link href="/" className="flex h-10 w-10 items-center justify-center border border-ink/15">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to home</span>
        </Link>

        <div className="mt-10">
          <span className="flex h-12 w-12 items-center justify-center bg-cinnabar font-display text-2xl font-black text-white">
            中
          </span>
          <p className="mt-8 text-[9px] font-bold uppercase tracking-[0.18em] text-cinnabar">
            One account · every trip
          </p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.92] tracking-[-0.04em] text-ink">
            Keep your China context with you.
          </h1>
          <p className="mt-5 text-sm leading-6 text-ink/55">
            Sign in once to keep your itinerary, verified setup, offline cards, and
            Agent history available across devices.
          </p>
        </div>

        <div className="mt-9 space-y-3">
          {(Object.keys(providerDetails) as Provider[]).map((provider) => {
            const detail = providerDetails[provider];
            const isPending = pending === provider;
            const providerEnabled = providers[provider];
            return (
              <button
                key={provider}
                type="button"
                disabled={Boolean(pending) || !providerEnabled}
                onClick={() => signIn(provider)}
                className="grid min-h-14 w-full grid-cols-[36px_1fr_36px] items-center border border-ink/15 bg-white px-4 text-sm font-bold text-ink transition hover:border-ink disabled:opacity-60"
              >
                <span className={`flex h-7 w-7 items-center justify-center font-bold ${detail.markClass}`}>
                  {detail.mark}
                </span>
                <span>
                  {detail.label}
                  {!providerEnabled && configured ? " · Not enabled" : ""}
                </span>
                {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 border border-cinnabar/30 bg-[#fff3ed] p-4 text-xs leading-5 text-cinnabar">
            {error}
          </div>
        )}

        {!configured && (
          <div className="mt-4 border border-[#9a6b19]/25 bg-[#fff7e3] p-4">
            <p className="text-xs font-bold text-[#7b5515]">Auth setup required</p>
            <p className="mt-1 text-[10px] leading-4 text-[#7b5515]/70">
              Add the Supabase URL and publishable key to enable these providers.
            </p>
          </div>
        )}

        <div className="mt-auto pt-10">
          <div className="space-y-3 border-t border-ink/10 pt-6">
            {[
              [ShieldCheck, "OAuth tokens stay in secure session cookies"],
              [MapPin, "Trip context syncs only after sign-in"],
              [LockKeyhole, "You can sign out and clear this device anytime"],
            ].map(([Icon, copy]) => {
              const TrustIcon = Icon as typeof ShieldCheck;
              return (
                <div key={copy as string} className="flex items-center gap-3 text-[10px] font-semibold text-ink/45">
                  <TrustIcon className="h-3.5 w-3.5 text-[#34735a]" />
                  {copy as string}
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-center text-[9px] leading-4 text-ink/35">
            By continuing, you agree to the Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  );
}
