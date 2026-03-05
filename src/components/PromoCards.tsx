import { Shield, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const PromoCards = () => (
  <section className="py-16 md:py-20 bg-background">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Insurance Card */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20 p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 shrink-0">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">Making your Insurance work harder</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We work with all major insurance providers to maximize your coverage and minimize out-of-pocket costs.
              </p>
              <Button variant="outline" size="sm" className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Check Coverage
              </Button>
            </div>
          </div>
        </div>

        {/* EMI Card */}
        <div className="bg-gradient-to-br from-green-success/5 to-green-success/10 rounded-2xl border border-green-success/20 p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-green-success/10 shrink-0">
              <CreditCard className="h-8 w-8 text-green-success" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">Get well now, pay later with 0% EMI</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Flexible payment plans so you can focus on your health without financial stress. No-cost EMI available.
              </p>
              <Button variant="outline" size="sm" className="rounded-full border-green-success text-green-success hover:bg-green-success hover:text-primary-foreground">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default PromoCards;
