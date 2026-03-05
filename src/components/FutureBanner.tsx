import { Zap, Shield, HeartHandshake, Clock, Stethoscope, Users } from "lucide-react";

const features = [
  { icon: Zap, title: "Quick Scheduling", desc: "Surgery booked within 3-7 days" },
  { icon: Shield, title: "Trusted Network", desc: "10+ vetted partner hospitals" },
  { icon: HeartHandshake, title: "End-to-End Support", desc: "Dedicated care manager throughout" },
];


const FutureBanner = () => (
  <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-16 md:py-24">
    {/* Decorative background elements */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
    </div>

    <div className="container mx-auto px-4 relative z-10">
      {/* Heading */}
      <div className="text-center mb-14">
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
          Welcome to the Future<br className="hidden md:block" /> of Surgical Care
        </h2>
        <p className="text-primary-foreground/70 max-w-xl mx-auto text-sm md:text-base">
          Transparent pricing, top hospitals, and compassionate support — all in one place.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="text-center group"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm mx-auto flex items-center justify-center mb-4 group-hover:bg-primary-foreground/25 group-hover:scale-110 transition-all duration-300">
              <Icon className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="font-serif font-bold text-base md:text-lg text-primary-foreground mb-1">{title}</h3>
            <p className="text-sm text-primary-foreground/60">{desc}</p>
          </div>
        ))}
      </div>

    </div>
  </section>
);

export default FutureBanner;
