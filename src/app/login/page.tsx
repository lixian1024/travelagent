import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginScreen from "@/components/LoginScreen";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign in | China Travel Agent",
  description: "Sign in to keep your trip context available across devices.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const configured = isSupabaseConfigured();
  const providers = {
    google: false,
    facebook: false,
  };

  if (configured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (data?.claims) redirect("/app");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
        },
        next: { revalidate: 300 },
      }
    );

    if (response.ok) {
      const settings = (await response.json()) as {
        external?: { google?: boolean; facebook?: boolean };
      };
      providers.google = settings.external?.google ?? false;
      providers.facebook = settings.external?.facebook ?? false;
    }
  }

  const { error } = await searchParams;
  return (
    <LoginScreen
      configured={configured}
      initialError={error}
      providers={providers}
    />
  );
}
