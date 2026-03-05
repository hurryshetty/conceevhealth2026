import { Shield, Check } from "lucide-react";

const insurers = ["Star Health", "HDFC Ergo", "ICICI Lombard", "Bajaj Allianz", "Max Bupa", "New India Assurance"];

const InsuranceSection = () => (
  <section className="py-16 md:py-20 bg-background">
    <div className="container mx-auto px-4">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl border border-primary/20 p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="p-3 rounded-xl bg-primary/10 inline-block mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              Save with Insurance
            </h2>
            <p className="text-muted-foreground mb-4">
              We work with all major health insurance providers. Our team handles the paperwork so you can focus on recovery.
            </p>
            <ul className="space-y-2">
              {["Cashless treatment available", "Claim assistance included", "Pre-authorization support"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-green-success shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {insurers.map((name) => (
              <div key={name} className="px-4 py-3 bg-card rounded-xl border border-border text-sm font-medium text-muted-foreground shadow-sm">
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default InsuranceSection;
