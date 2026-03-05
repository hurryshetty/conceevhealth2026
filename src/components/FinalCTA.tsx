import { useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import LeadFormModal from "./LeadFormModal";

const FinalCTA = () => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <section id="contact" className="bg-navy py-16 md:py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
          Get the Right Treatment at the Right Price
        </h2>
        <p className="text-primary-foreground/70 mb-8 max-w-lg mx-auto">
          Speak to our care team today. Limited partner hospital slots available.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="rounded-full text-base px-8 bg-primary hover:bg-primary/90" onClick={() => setFormOpen(true)}>
            Book Free Consultation
          </Button>
          <Button size="lg" variant="outline" className="rounded-full text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
            <Phone className="h-4 w-4 mr-2" /> Call Now
          </Button>
        </div>
      </div>
      <LeadFormModal open={formOpen} onOpenChange={setFormOpen} />
    </section>
  );
};

export default FinalCTA;
