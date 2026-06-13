import AgentDemo from "@/components/AgentDemo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import {
  ContextAndServicesSection,
  HumanGuideSection,
  JourneySection,
} from "@/components/ProductStory";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <JourneySection />
        <AgentDemo />
        <ContextAndServicesSection />
        <HumanGuideSection />
      </main>
      <Footer />
    </>
  );
}
