import { Card, CardContent } from "@/components/ui/card";
import { Target, Heart, Lightbulb, Shield } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Patient-First",
    description: "Every feature is designed to improve patient experience and outcomes.",
  },
  {
    icon: Shield,
    title: "Security & Trust",
    description: "Enterprise-grade security with role-based access and data protection.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Continuously evolving with modern technology to meet healthcare needs.",
  },
  {
    icon: Target,
    title: "Results-Driven",
    description: "Measurable impact on practice growth, efficiency, and patient satisfaction.",
  },
];

export default function About() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-navy to-navy-light text-white py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">About Coneev Health</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            We are building the future of healthcare management — a platform where technology meets
            compassionate care.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-serif mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                Coneev Health, a product by Conceev Digital, was created to address the unique
                challenges healthcare practices face in managing their operations digitally.
              </p>
              <p className="text-muted-foreground">
                From lead tracking and appointment scheduling to billing and team collaboration, we
                provide an integrated platform that eliminates the need for multiple disconnected tools.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-blue-light rounded-2xl p-8 text-center">
              <div className="text-5xl font-bold text-primary mb-2">2026</div>
              <p className="text-muted-foreground">Founded in Hyderabad, India</p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-navy">2+</div>
                  <p className="text-sm text-muted-foreground">Organizations</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-navy">5+</div>
                  <p className="text-sm text-muted-foreground">Providers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="container">
          <h2 className="text-3xl font-bold font-serif text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="text-center border-border/50">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
