import { Check, X } from "lucide-react";

const advantages = {
  "With Conceev Health": [
    "Transparent fixed pricing",
    "Dedicated care coordinator",
    "Vetted partner hospitals",
    "Free second opinion",
    "EMI options available",
    "Insurance claim assistance",
  ],
  "Without Conceev Health": [
    "Unpredictable costs",
    "Navigate alone",
    "Unknown quality",
    "No expert guidance",
    "Full payment upfront",
    "Handle paperwork yourself",
  ],
};

const AdvantageSection = () => (
  <section className="py-16 md:py-20 bg-secondary/30">
    <div className="container mx-auto px-4">
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
        The Conceev Advantage
      </h2>
      <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
        See the difference when you choose Conceev Health for your healthcare journey.
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        {/* With */}
        <div className="bg-card rounded-2xl border-2 border-primary p-6">
          <h3 className="font-serif text-lg font-bold text-primary mb-4">With Conceev Health</h3>
          <ul className="space-y-3">
            {advantages["With Conceev Health"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                <div className="p-0.5 rounded-full bg-green-success/10">
                  <Check className="h-4 w-4 text-green-success" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
        {/* Without */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-serif text-lg font-bold text-muted-foreground mb-4">Without Conceev Health</h3>
          <ul className="space-y-3">
            {advantages["Without Conceev Health"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="p-0.5 rounded-full bg-destructive/10">
                  <X className="h-4 w-4 text-destructive" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

export default AdvantageSection;
