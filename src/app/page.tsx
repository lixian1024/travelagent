import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TripPlannerForm from "@/components/TripPlannerForm";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TripPlannerForm />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
