import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Shield, Building2, HeartHandshake, Sparkles, Star, Activity } from "lucide-react";
import LeadFormModal from "./LeadFormModal";
import heroImage from "@/assets/hero-doctor-patient.jpg";

const HeroSection = () => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <section className="relative bg-navy text-primary-foreground overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy opacity-90" />
      <div className="absolute top-20 -left-32 w-96 h-96 rounded-full bg-blue-glow/10 blur-3xl" />
      <div className="absolute bottom-10 right-0 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--primary-foreground)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Trusted by 500+ Women Across India</span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              India's Most Trusted Women's Surgery Experts
            </h1>

            <p className="text-lg text-primary-foreground/70 max-w-xl">
              Affordable, transparent surgery packages in Bangalore & Hyderabad with trusted hospital partners.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                className="rounded-full text-base px-8 bg-primary hover:bg-primary/90"
                onClick={() => setFormOpen(true)}
              >
                Get Free Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/packages">
                  <Search className="h-4 w-4 mr-2" /> View Packages
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-primary-foreground/10">
              {[
                { icon: Shield, label: "Transparent Pricing" },
                { icon: Building2, label: "10+ Partner Hospitals" },
                { icon: HeartHandshake, label: "Dedicated Coordinator" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-primary-foreground/70">
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image with floating stats */}
          <div className="relative flex justify-center md:justify-end animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative w-full max-w-lg lg:max-w-xl">
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-primary-foreground/10">
                <img
                  src={heroImage}
                  alt="Doctor consulting with patient at Conceev Health"
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
              </div>

              {/* Floating stat: Surgeries */}
              <div className="absolute -top-4 -right-4 md:top-4 md:-right-6 bg-card text-card-foreground rounded-xl px-4 py-3 shadow-lg animate-float flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-lg font-bold leading-none">500+</p>
                  <p className="text-xs text-muted-foreground">Surgeries</p>
                </div>
              </div>

              {/* Floating stat: Rating */}
              <div className="absolute -bottom-4 -left-4 md:bottom-6 md:-left-6 bg-card text-card-foreground rounded-xl px-4 py-3 shadow-lg animate-float flex items-center gap-2" style={{ animationDelay: "1s" }}>
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                <div>
                  <p className="text-lg font-bold leading-none">4.9</p>
                  <p className="text-xs text-muted-foreground">Patient Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <LeadFormModal open={formOpen} onOpenChange={setFormOpen} />
    </section>
  );
};

export default HeroSection;
