import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import SpecialtiesGrid from "@/components/SpecialtiesGrid";
import TrustMetrics from "@/components/TrustMetrics";
import PartnersAndDoctors from "@/components/PartnersAndDoctors";
import FutureBanner from "@/components/FutureBanner";
import PromoCards from "@/components/PromoCards";
import Testimonials from "@/components/Testimonials";
import InsuranceSection from "@/components/InsuranceSection";
import CityCoverage from "@/components/CityCoverage";
import FAQSection from "@/components/FAQSection";
import AdvantageSection from "@/components/AdvantageSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";

const Index = () => (
  <div className="min-h-screen pb-14 md:pb-0">
    <Navbar />
    <main>
      <HeroSection />
      <TrustMetrics />
      <WhyChooseUs />
      <SpecialtiesGrid />
      <PartnersAndDoctors />
      <FutureBanner />
      <PromoCards />
      <Testimonials />
      <InsuranceSection />
      <CityCoverage />
      <FAQSection />
      <AdvantageSection />
      <FinalCTA />
    </main>
    <Footer />
    <WhatsAppButton />
    <MobileBottomBar />
  </div>
);

export default Index;
