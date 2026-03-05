import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import LeadFormModal from "@/components/LeadFormModal";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { Check, HeartPulse, Shield, CreditCard, TrendingUp, Phone } from "lucide-react";

const benefits = [
  { icon: HeartPulse, text: "Experienced Fertility Specialists" },
  { icon: Shield, text: "Transparent Cost Structure" },
  { icon: CreditCard, text: "EMI Options Available" },
  { icon: TrendingUp, text: "High Success Rate Centres" },
];

const inclusions = ["Consultation & Evaluation", "Ovarian Stimulation", "Egg Retrieval", "Embryo Transfer", "Medications", "Follow-up Visits"];

const IVFBangalore = () => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-light via-background to-secondary py-16 md:py-24">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block text-xs font-bold text-primary bg-blue-light px-3 py-1 rounded-full">IVF Treatment</span>
              <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
                IVF Treatment Package in <span className="text-primary">Bangalore & Hyderabad</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Start your parenthood journey with trusted fertility specialists and transparent pricing.
              </p>
              <div className="space-y-3">
                {benefits.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-foreground">{text}</span>
                  </div>
                ))}
              </div>
              <p className="text-3xl font-bold text-primary font-serif">Starting From ₹1,20,000*</p>
              <Button size="lg" className="rounded-2xl text-base px-8" onClick={() => setFormOpen(true)}>
                Check IVF Packages Near Me
              </Button>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="aspect-square w-full max-w-sm rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-border">
                <HeartPulse className="h-24 w-24 text-primary/30" />
              </div>
            </div>
          </div>
        </section>

        {/* Package Details */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-serif text-3xl font-bold text-center mb-8">What's Included</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {inclusions.map((item) => (
                <div key={item} className="flex items-center gap-3 bg-card rounded-xl border border-border p-4">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FAQSection />

        {/* Bottom CTA */}
        <section className="bg-gradient-to-r from-primary to-accent py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl font-bold text-primary-foreground mb-4">
              Ready to Start Your IVF Journey?
            </h2>
            <p className="text-primary-foreground/80 mb-8">Book a free consultation with our fertility experts.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" className="rounded-2xl px-8" onClick={() => setFormOpen(true)}>
                Book Free Consultation
              </Button>
              <Button size="lg" variant="outline" className="rounded-2xl px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Phone className="h-4 w-4 mr-2" /> Call Now
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
      <LeadFormModal open={formOpen} onOpenChange={setFormOpen} sourcePage="ivf-bangalore" />
    </div>
  );
};

export default IVFBangalore;
