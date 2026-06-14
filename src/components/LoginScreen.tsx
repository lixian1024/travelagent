"use client";

import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Provider = "google";
type EmailStep = "email" | "code" | "password";
type AuthMode = "signin" | "signup";

const providerDetails: Record<
  Provider,
  { label: string; mark: string; markClass: string }
> = {
  google: {
    label: "Sign in with Google",
    mark: "G",
    markClass: "text-[#4285f4]",
  },
};

function createTemporaryPassword() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("");
}

export default function LoginScreen({
  configured,
  initialError,
  providers,
}: {
  configured: boolean;
  initialError?: string;
  providers: { google: boolean };
}) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [pending, setPending] = useState<Provider | null>(null);
  const [signInPending, setSignInPending] = useState(false);
  const [emailPending, setEmailPending] = useState<EmailStep | null>(null);
  const [emailStep, setEmailStep] = useState<EmailStep>("email");
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState(initialError ?? "");
  const [notice, setNotice] = useState("");

  async function signIn(provider: Provider) {
    if (!configured) {
      setError("Connect a Supabase project before starting OAuth.");
      return;
    }

    setPending(provider);
    setError("");
    setNotice("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/app`;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (authError) {
      setPending(null);
      setError(authError.message);
    }
  }

  async function signInWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = signInEmail.trim().toLowerCase();

    if (!configured) {
      setError("Connect a Supabase project before signing in.");
      return;
    }

    if (!normalizedEmail || !signInPassword) {
      setError("Enter your email and password.");
      return;
    }

    setSignInPending(true);
    setError("");
    setNotice("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: signInPassword,
    });

    setSignInPending(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    window.location.assign("/app");
  }

  function openSignUp() {
    setMode("signup");
    setError("");
    setNotice("");
  }

  function openSignIn() {
    setMode("signin");
    setError("");
    setNotice("");
  }

  async function sendEmailCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!configured) {
      setError("Connect a Supabase project before starting email registration.");
      return;
    }

    if (!normalizedEmail) {
      setError("Enter your email address first.");
      return;
    }

    setEmailPending("email");
    setError("");
    setNotice("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/app`;
    const { data, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: createTemporaryPassword(),
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    setEmailPending(null);

    if (authError) {
      setError(authError.message);
      return;
    }

    setEmail(normalizedEmail);
    if (data.session) {
      setEmailStep("password");
      setNotice("Email verified. Create a password to finish your account.");
      return;
    }

    setCode("");
    setEmailStep("code");
    setNotice("Verification code sent. Check your inbox and enter the code here.");
  }

  async function resendSignupCode() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Enter your email address first.");
      return;
    }

    setEmailPending("email");
    setError("");
    setNotice("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/app`;
    const { error: authError } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    setEmailPending(null);

    if (authError) {
      setError(authError.message);
      return;
    }

    setNotice("A new verification code was sent.");
  }

  async function verifyEmailCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const token = code.trim();

    if (!normalizedEmail || !token) {
      setError("Enter the email and verification code.");
      return;
    }

    setEmailPending("code");
    setError("");
    setNotice("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token,
      type: "signup",
    });

    setEmailPending(null);

    if (authError) {
      setError(authError.message);
      return;
    }

    setEmailStep("password");
    setNotice("Email verified. Create a password to finish your account.");
  }

  async function createPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setEmailPending("password");
    setError("");
    setNotice("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({ password });

    setEmailPending(null);

    if (authError) {
      setError(authError.message);
      return;
    }

    window.location.assign("/app");
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

        {mode === "signin" ? (
          <>
            <form className="mt-9 space-y-3" onSubmit={signInWithEmail}>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/45">
                  Email
                </span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={signInEmail}
                  onChange={(event) => setSignInEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 min-h-12 w-full border border-ink/15 bg-white px-3 text-base font-bold text-ink outline-none transition focus:border-ink"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/45">
                  Password
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={signInPassword}
                  onChange={(event) => setSignInPassword(event.target.value)}
                  placeholder="Your password"
                  className="mt-2 min-h-12 w-full border border-ink/15 bg-white px-3 text-base font-bold text-ink outline-none transition focus:border-ink"
                />
              </label>
              <button
                type="submit"
                disabled={signInPending || !configured}
                className="grid min-h-12 w-full grid-cols-[24px_1fr_24px] items-center bg-ink px-4 text-sm font-bold text-white transition hover:bg-ink/90 disabled:opacity-60"
              >
                <span />
                <span>Sign in</span>
                {signInPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
              </button>
            </form>

            <div className="mt-4 space-y-3">
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

            <div className="mt-4 border border-ink/15 bg-white p-4">
              <p className="text-xs font-bold text-ink">No account yet?</p>
              <button
                type="button"
                onClick={openSignUp}
                className="mt-3 min-h-12 w-full border border-cinnabar bg-paper px-4 text-sm font-bold text-cinnabar transition hover:bg-[#fff3ed]"
              >
                Sign Up
              </button>
            </div>
          </>
        ) : (
          <section className="mt-9 border border-ink/15 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center bg-[#e8f4ee] text-[#34735a]">
                {emailStep === "password" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cinnabar">
                  Sign Up
                </p>
                <h2 className="font-display text-2xl font-black leading-none text-ink">
                  Create an account
                </h2>
              </div>
            </div>

            {emailStep === "email" && (
              <form className="mt-4 space-y-3" onSubmit={sendEmailCode}>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/45">
                    Email
                  </span>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 min-h-12 w-full border border-ink/15 bg-paper px-3 text-base font-bold text-ink outline-none transition focus:border-ink"
                  />
                </label>
                <button
                  type="submit"
                  disabled={Boolean(emailPending) || !configured}
                  className="grid min-h-12 w-full grid-cols-[24px_1fr_24px] items-center bg-ink px-4 text-sm font-bold text-white transition hover:bg-ink/90 disabled:opacity-60"
                >
                  <span />
                  <span>Send verification code</span>
                  {emailPending === "email" && <LoaderCircle className="h-4 w-4 animate-spin" />}
                </button>
              </form>
            )}

            {emailStep === "code" && (
              <form className="mt-4 space-y-3" onSubmit={verifyEmailCode}>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/45">
                    Verification code
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="Enter email code"
                    className="mt-2 min-h-12 w-full border border-ink/15 bg-paper px-3 text-base font-bold text-ink outline-none transition focus:border-ink"
                  />
                </label>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <button
                    type="submit"
                    disabled={Boolean(emailPending)}
                    className="grid min-h-12 grid-cols-[24px_1fr_24px] items-center bg-ink px-4 text-sm font-bold text-white transition hover:bg-ink/90 disabled:opacity-60"
                  >
                    <span />
                    <span>Verify code</span>
                    {emailPending === "code" && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(emailPending)}
                    onClick={() => void resendSignupCode()}
                    className="min-h-12 border border-ink/15 px-4 text-xs font-bold text-ink transition hover:border-ink disabled:opacity-60"
                  >
                    Resend
                  </button>
                </div>
              </form>
            )}

            {emailStep === "password" && (
              <form className="mt-4 space-y-3" onSubmit={createPassword}>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/45">
                    Password
                  </span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    className="mt-2 min-h-12 w-full border border-ink/15 bg-paper px-3 text-base font-bold text-ink outline-none transition focus:border-ink"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/45">
                    Confirm password
                  </span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                    placeholder="Repeat password"
                    className="mt-2 min-h-12 w-full border border-ink/15 bg-paper px-3 text-base font-bold text-ink outline-none transition focus:border-ink"
                  />
                </label>
                <button
                  type="submit"
                  disabled={Boolean(emailPending)}
                  className="grid min-h-12 w-full grid-cols-[24px_1fr_24px] items-center bg-ink px-4 text-sm font-bold text-white transition hover:bg-ink/90 disabled:opacity-60"
                >
                  <span />
                  <span>Finish registration</span>
                  {emailPending === "password" && <LoaderCircle className="h-4 w-4 animate-spin" />}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={openSignIn}
              className="mt-4 min-h-11 w-full border border-ink/15 px-4 text-xs font-bold text-ink transition hover:border-ink"
            >
              Back to Sign in
            </button>
          </section>
        )}

        {mode === "signup" && emailStep !== "email" && (
          <button
            type="button"
            onClick={() => {
              setEmailStep("email");
              setCode("");
              setPassword("");
              setPasswordConfirm("");
              setError("");
              setNotice("");
            }}
            className="mt-3 min-h-10 w-full text-xs font-bold text-ink/45"
          >
            Use a different email
          </button>
        )}

        {notice && (
          <div className="mt-4 border border-[#34735a]/25 bg-[#edf7f1] p-4 text-xs leading-5 text-[#285f49]">
            {notice}
          </div>
        )}

        {error && (
          <div className="mt-4 border border-cinnabar/30 bg-[#fff3ed] p-4 text-xs leading-5 text-cinnabar">
            {error}
          </div>
        )}

        {!configured && (
          <div className="mt-4 border border-[#9a6b19]/25 bg-[#fff7e3] p-4">
            <p className="text-xs font-bold text-[#7b5515]">Auth setup required</p>
            <p className="mt-1 text-[10px] leading-4 text-[#7b5515]/70">
              Add the Supabase URL and publishable key to enable Google and email registration.
            </p>
          </div>
        )}

        <div className="mt-auto pt-10">
          <div className="space-y-3 border-t border-ink/10 pt-6">
            {[
              [ShieldCheck, "Auth sessions stay in secure session cookies"],
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
