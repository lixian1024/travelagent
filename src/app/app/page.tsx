import type { Metadata } from "next";
import TravelAgentApp from "@/components/TravelAgentApp";

export const metadata: Metadata = {
  title: "My Trip | China Travel Agent",
  description: "Your context-aware local travel agent for China.",
};

export default function AppPage() {
  return <TravelAgentApp />;
}
