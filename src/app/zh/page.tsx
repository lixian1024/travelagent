import AgentDemo from "@/components/AgentDemo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import {
  ContextAndServicesSection,
  HumanGuideSection,
  JourneySection,
} from "@/components/ProductStory";

export default function ChineseHome() {
  return (
    <>
      <Header lang="zh" />
      <main>
        <Hero lang="zh" />
        <JourneySection lang="zh" />
        <AgentDemo lang="zh" />
        <ContextAndServicesSection lang="zh" />
        <HumanGuideSection lang="zh" />
      </main>
      <Footer lang="zh" />
    </>
  );
}
