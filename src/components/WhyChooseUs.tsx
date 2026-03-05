import { Shield, Clock, HeartHandshake, IndianRupee, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-doctor-patient.jpg";

const features = [
  {
    icon: Clock,
    title: "Easy Scheduling",
    desc: "Book your surgery within 3–7 days. No long queues, no wait.",
    color: "from-primary/20 to-primary/10",
    iconBg: "bg-primary",
  },
  {
    icon: IndianRupee,
    title: "Fixed Pricing",
    desc: "Transparent costs with zero hidden charges. Know before you go.",
    color: "from-green-success/20 to-green-success/10",
    iconBg: "bg-green-success",
  },
  {
    icon: Shield,
    title: "Trusted Hospitals",
    desc: "Only NABH-accredited & vetted partner hospitals near you.",
    color: "from-accent/20 to-accent/10",
    iconBg: "bg-accent",
  },
  {
    icon: HeartHandshake,
    title: "Dedicated Coordinator",
    desc: "Personal support from first consult through full recovery.",
    color: "from-destructive/20 to-destructive/10",
    iconBg: "bg-destructive",
  },
];

const WhyChooseUs = () => (
  <section id="why-us" className="py-20 md:py-28 bg-background relative overflow-hidden">
    {/* Subtle background decoration */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
    <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

    <div className="container mx-auto px-4 relative z-10">
      {/* Header */}
      <div className="text-center mb-14 max-w-2xl mx-auto">
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 tracking-wide">
          WHY CONCEEV HEALTH
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight">
          Surgery Made <span className="text-primary">Simple & Safe</span>
        </h2>
        <p className="mt-4 text-muted-foreground text-base md:text-lg">
          We handle everything — from finding the right doctor to post-surgery care — so you can focus on healing.
        </p>
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-5 gap-8 items-stretch">
        {/* Image side — spans 2 cols */}
        <div className="lg:col-span-2 relative group">
          <div className="rounded-2xl overflow-hidden shadow-xl h-full min-h-[340px] relative">
            <img
              src={heroImage}
              alt="Doctor consulting patient at Conceev Health"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay card */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-6">
              <p className="text-white font-serif text-xl font-semibold">5,000+ Successful Surgeries</p>
              <p className="text-white/80 text-sm mt-1">Across 15+ cities in India</p>
            </div>
          </div>
        </div>

        {/* Feature cards — spans 3 cols, 2x2 grid */}
        <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc, color, iconBg }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="relative z-10">
                <div className={`${iconBg} w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground text-base mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                <ArrowRight className="h-4 w-4 text-primary mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
