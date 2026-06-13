import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TravelAgentApp from "@/components/TravelAgentApp";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Trip | China Travel Agent",
  description: "Your context-aware local travel agent for China.",
};

export default async function AppPage() {
  const authConfigured = isSupabaseConfigured();

  if (!authConfigured) {
    return <TravelAgentApp authConfigured={false} user={null} />;
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const metadata = user.user_metadata;

  return (
    <TravelAgentApp
      authConfigured
      user={{
        id: user.id,
        email: user.email ?? "",
        name:
          metadata.full_name ??
          metadata.name ??
          user.email?.split("@")[0] ??
          "Traveler",
        avatarUrl: metadata.avatar_url ?? metadata.picture ?? "",
        provider: user.app_metadata.provider ?? "",
      }}
    />
  );
}
