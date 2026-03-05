import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import LeadFormModal from "@/components/LeadFormModal";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { Check, Stethoscope, Shield, CreditCard, Clock, Phone } from "lucide-react";

const benefits = [
  { icon: Stethoscope, text: "Expert Gynecology Surgeons" },
  { icon: Shield, text: "Transparent Fixed Pricing" },
  { icon: CreditCard, text: "EMI & Insurance Support" },
  { icon: Clock, text: "Fast Recovery with Laparoscopic Options" },
];

const inclusions = ["Surgeon Fees", "OT & Anaesthesia", "Hospital Room (2-3 days)", "Nursing & Monitoring", "Medications", "Post-Op Follow-up"];

const HysterectomyHyderabad = () => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-secondary via-background to-blue-light py-16 md:py-24">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block text-xs font-bold text-accent bg-secondary px-3 py-1 rounded-full">Gynecology Surgery</span>
              <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
                Hysterectomy Package in <span className="text-accent">Hyderabad & Bangalore</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Safe, affordable hysterectomy with experienced surgeons and full transparency.
              </p>
              <div className="space-y-3">
                {benefits.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-accent" />
                    <span className="text-foreground">{text}</span>
                  </div>
                ))}
              </div>
              <p className="text-3xl font-bold text-accent font-serif">Starting From ₹85,000*</p>
              <Button size="lg" className="rounded-2xl text-base px-8 bg-accent hover:bg-accent/90" onClick={() => setFormOpen(true)}>
                Check Hysterectomy Packages
              </Button>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="aspect-square w-full max-w-sm rounded-3xl bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center border border-border">
                <Stethoscope className="h-24 w-24 text-accent/30" />
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
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FAQSection />

        {/* Bottom CTA */}
        <section className="bg-gradient-to-r from-accent to-primary py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl font-bold text-primary-foreground mb-4">
              Ready for Expert Gynecology Care?
            </h2>
            <p className="text-primary-foreground/80 mb-8">Speak to our care coordinator today.</p>
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
      <LeadFormModal open={formOpen} onOpenChange={setFormOpen} sourcePage="hysterectomy-hyderabad" />
    </div>
  );
};

export default HysterectomyHyderabad;
