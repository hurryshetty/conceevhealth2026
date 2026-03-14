import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import LeadFormModal from "@/components/LeadFormModal";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Phone, MessageCircle, ClipboardList, Microscope,
  Pill, Syringe, FlaskConical, ArrowRightLeft, Heart,
  TestTube2, CheckCircle2, Star, Shield, TrendingUp,
  Users, Building2, BadgeCheck, UserCheck, HeartHandshake,
  Baby, Activity, Award, ChevronRight, Stethoscope,
  CalendarCheck, Zap, AlarmClock,
} from "lucide-react";

const PHONE = "+919000000000";
const PHONE_DISPLAY = "+91 90000 00000";
const WHATSAPP_MSG = encodeURIComponent("Hi, I'm interested in the Complete IVF Package. Please share details.");

// ── Data ─────────────────────────────────────────────────────────────────────

const inclusions = [
  "Doctor Consultation", "Fertility Testing", "Ovarian Stimulation",
  "Egg Retrieval", "Embryo Transfer", "Follow-up Care",
];

const packageSteps = [
  {
    icon: Stethoscope,
    title: "Initial Fertility Consultation",
    items: [
      "Consultation with experienced fertility specialist",
      "Review of medical history and fertility evaluation",
      "Personalized treatment plan",
    ],
  },
  {
    icon: Microscope,
    title: "Fertility Tests & Diagnostics",
    items: [
      "Hormone testing",
      "Ultrasound scans",
      "Semen analysis",
      "Basic fertility investigations",
    ],
  },
  {
    icon: Pill,
    title: "Ovarian Stimulation",
    items: [
      "Fertility medications to stimulate egg production",
      "Monitoring through scans and blood tests",
    ],
  },
  {
    icon: Syringe,
    title: "Egg Retrieval (Ovum Pickup)",
    items: [
      "Minor procedure performed under sedation",
      "Eggs are collected from ovaries in a safe clinical setting",
    ],
  },
  {
    icon: FlaskConical,
    title: "Fertilization & Embryo Development",
    items: [
      "Eggs are fertilized with sperm in a laboratory",
      "Embryos are monitored and cultured for several days",
    ],
  },
  {
    icon: ArrowRightLeft,
    title: "Embryo Transfer",
    items: [
      "Healthy embryo transferred into the uterus",
      "Painless procedure performed by fertility specialist",
    ],
  },
  {
    icon: Heart,
    title: "Luteal Phase Support",
    items: [
      "Hormonal medications to support pregnancy",
      "Follow-up care after embryo transfer",
    ],
  },
  {
    icon: TestTube2,
    title: "Pregnancy Test",
    items: [
      "Beta HCG blood test to confirm pregnancy",
    ],
  },
];

const whyChoosePackage = [
  {
    icon: UserCheck,
    title: "Trusted Fertility Specialists",
    desc: "Treatment performed by experienced IVF doctors and fertility experts.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Building2,
    title: "Advanced IVF Laboratories",
    desc: "Procedures carried out in modern fertility labs with advanced technology.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: BadgeCheck,
    title: "Transparent IVF Pricing",
    desc: "Complete IVF package starting from ₹1,25,000/- with clear cost structure.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: HeartHandshake,
    title: "End-to-End Patient Support",
    desc: "Dedicated coordinators to guide you from consultation to pregnancy confirmation.",
    color: "bg-orange-50 text-orange-600",
  },
];

const processSteps = [
  { step: "01", icon: CalendarCheck, title: "Book Consultation", desc: "Discuss your fertility concerns with a specialist." },
  { step: "02", icon: Microscope, title: "Fertility Evaluation", desc: "Complete diagnostic tests to understand the cause of infertility." },
  { step: "03", icon: Pill, title: "Start IVF Treatment", desc: "Ovarian stimulation and monitoring." },
  { step: "04", icon: FlaskConical, title: "Egg Retrieval & Fertilization", desc: "Eggs are collected and fertilized in the lab." },
  { step: "05", icon: ArrowRightLeft, title: "Embryo Transfer", desc: "Healthy embryo transferred to uterus." },
  { step: "06", icon: Baby, title: "Pregnancy Confirmation", desc: "Blood test confirms pregnancy." },
];

const successFactors = [
  { label: "Age of the Woman", icon: Users },
  { label: "Egg Quality", icon: Star },
  { label: "Sperm Quality", icon: Activity },
  { label: "Underlying Fertility Conditions", icon: Stethoscope },
];

const whyConceev = [
  { icon: Award, title: "Experienced Fertility Specialists", desc: "We work with leading IVF doctors and fertility experts with proven success rates." },
  { icon: Building2, title: "Trusted Partner Hospitals", desc: "Treatment is performed at top fertility hospitals equipped with advanced IVF laboratories." },
  { icon: Shield, title: "Transparent Pricing", desc: "Our IVF packages are clear, affordable, and designed to avoid hidden costs." },
  { icon: Heart, title: "Personalized Fertility Care", desc: "Each patient receives a customized treatment plan based on medical needs." },
  { icon: HeartHandshake, title: "End-to-End Support", desc: "From consultation to pregnancy confirmation, our coordinators guide you throughout the journey." },
];

const faqs = [
  { q: "How long does IVF treatment take?", a: "A typical IVF cycle takes 4–6 weeks from start to embryo transfer, including stimulation, monitoring, retrieval, and transfer." },
  { q: "Is IVF painful?", a: "Most procedures are minimally invasive and performed under sedation. Some patients may experience mild discomfort during stimulation or after retrieval, but pain is generally well-managed." },
  { q: "What is the success rate of IVF?", a: "Success rates typically range from 40% to 60% depending on age, egg quality, sperm quality, and the underlying cause of infertility. Our partner centres maintain consistently high success rates." },
  { q: "Can IVF guarantee pregnancy?", a: "IVF significantly improves the chances of pregnancy but cannot guarantee success in every case. Multiple factors influence outcomes, and your specialist will discuss realistic expectations during consultation." },
  { q: "What does the ₹1,25,000 package include?", a: "The package covers doctor consultations, fertility tests, ovarian stimulation monitoring, egg retrieval, fertilization, embryo transfer, and follow-up care. Medications may be additional — please confirm with our coordinators." },
  { q: "Are there EMI options available?", a: "Yes, flexible EMI options are available to help you manage the cost of treatment. Our team will help you explore the best financing option." },
];

const candidates = [
  { icon: AlarmClock, text: "Have been trying to conceive for more than 1 year" },
  { icon: Zap, text: "Have blocked or damaged fallopian tubes" },
  { icon: Users, text: "Have low sperm count or male infertility" },
  { icon: Activity, text: "Have ovulation disorders such as PCOS" },
  { icon: TrendingUp, text: "Have failed previous fertility treatments" },
  { icon: Stethoscope, text: "Have unexplained infertility" },
];

// ── Component ─────────────────────────────────────────────────────────────────

const IVFPackageLanding = () => {
  const [formOpen, setFormOpen] = useState(false);

  const handleCall = () => { window.location.href = `tel:${PHONE}`; };
  const handleWhatsApp = () => { window.open(`https://wa.me/${PHONE.replace("+", "")}?text=${WHATSAPP_MSG}`, "_blank"); };

  return (
    <div className="min-h-screen pb-14 md:pb-0">
      <Navbar />

      <main>
        {/* ── Section 1: Hero ─────────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/20 py-16 md:py-24 overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

          <div className="container mx-auto px-4 relative">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: copy */}
              <div className="space-y-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Complete IVF Package
                </span>

                <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-foreground">
                  Start Your Journey to Parenthood with{" "}
                  <span className="text-primary">Advanced IVF Care</span>
                </h1>

                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-3xl md:text-4xl font-bold text-primary">₹1,25,000/-</span>
                  <span className="text-muted-foreground text-sm">Complete IVF Package</span>
                </div>

                <p className="text-muted-foreground text-base leading-relaxed">
                  Comprehensive fertility care from consultation to pregnancy confirmation — all under expert medical supervision.
                </p>

                {/* Inclusion chips */}
                <div className="flex flex-wrap gap-2">
                  {inclusions.map((item) => (
                    <span key={item} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      <CheckCircle2 className="h-3 w-3" /> {item}
                    </span>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button size="lg" className="rounded-full gap-2 shadow-lg" onClick={() => setFormOpen(true)}>
                    <CalendarCheck className="h-4 w-4" /> Book Free Consultation
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full gap-2" onClick={handleCall}>
                    <Phone className="h-4 w-4" /> Call Now
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full gap-2 border-green-500 text-green-600 hover:bg-green-50" onClick={handleWhatsApp}>
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </Button>
                </div>
              </div>

              {/* Right: couple + baby image */}
              <div className="hidden md:flex justify-center">
                <div className="relative w-full max-w-md">
                  {/* Main image */}
                  <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
                    <img
                      src="https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=800&q=80"
                      alt="Happy couple holding their newborn baby — IVF success"
                      className="w-full h-full object-cover object-center"
                    />
                    {/* Gradient overlay at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-3xl" />
                  </div>

                  {/* Floating price badge — bottom left */}
                  <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-2xl shadow-xl px-5 py-4">
                    <p className="text-xs text-muted-foreground font-medium">All-Inclusive Package</p>
                    <p className="font-serif text-2xl font-bold text-primary leading-tight">₹1,25,000/-</p>
                    <p className="text-xs text-green-600 font-semibold mt-0.5">EMI Available</p>
                  </div>

                  {/* Floating success badge — top right */}
                  <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-2xl shadow-xl px-4 py-3 text-center">
                    <p className="font-bold text-lg leading-tight">40–60%</p>
                    <p className="text-xs text-primary-foreground/80 leading-tight">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Quick Consultation Strip ─────────────────────────── */}
        <section className="bg-primary py-10">
          <div className="container mx-auto px-4">
            <p className="text-center text-primary-foreground/80 text-sm font-medium mb-6 uppercase tracking-wide">
              Quick Consultation Options
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {[
                { icon: Phone, label: "Book via Phone Call", sub: "Speak to a fertility advisor", action: handleCall, bg: "bg-white/10 hover:bg-white/20" },
                { icon: ClipboardList, label: "Quick Enquiry", sub: "Fill a short form — we'll call back", action: () => setFormOpen(true), bg: "bg-white/20 hover:bg-white/30 ring-2 ring-white/40" },
                { icon: MessageCircle, label: "Book via WhatsApp", sub: "Chat instantly on WhatsApp", action: handleWhatsApp, bg: "bg-white/10 hover:bg-white/20" },
              ].map(({ icon: Icon, label, sub, action, bg }) => (
                <button
                  key={label}
                  onClick={action}
                  className={`${bg} rounded-2xl p-5 text-left text-primary-foreground transition-all duration-200 cursor-pointer`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-base leading-tight">{label}</p>
                  <p className="text-xs text-primary-foreground/70 mt-1">{sub}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 3: What's Included ──────────────────────────────────── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                Complete Package
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Complete IVF Package – What's Included
              </h2>
              <p className="text-muted-foreground mt-3">
                Our Complete IVF Treatment Package includes all the essential steps required for a successful IVF cycle.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {packageSteps.map((s, i) => (
                <div
                  key={s.title}
                  className="bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">Step {String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm leading-tight mb-3">{s.title}</h3>
                  <ul className="space-y-1.5">
                    {s.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button size="lg" className="rounded-full gap-2" onClick={() => setFormOpen(true)}>
                <CalendarCheck className="h-4 w-4" /> Book Free Consultation
              </Button>
            </div>
          </div>
        </section>

        {/* ── Section 4: Why Choose Our IVF Package ───────────────────────── */}
        <section className="py-16 md:py-20 bg-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                Our Advantage
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Why Choose Our IVF Package
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {whyChoosePackage.map((c) => (
                <div
                  key={c.title}
                  className="bg-card rounded-2xl border border-border p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 rounded-2xl ${c.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <c.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm leading-tight mb-2">{c.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 5: How the IVF Process Works ────────────────────────── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                IVF Process
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                How the IVF Process Works
              </h2>
            </div>

            {/* Desktop: horizontal flow */}
            <div className="hidden lg:grid grid-cols-6 gap-4 max-w-6xl mx-auto">
              {processSteps.map((s, i) => (
                <div key={s.step} className="relative flex flex-col items-center text-center">
                  {/* Connector line */}
                  {i < processSteps.length - 1 && (
                    <div className="absolute top-6 left-[calc(50%+28px)] right-[-50%] h-px bg-border z-0" />
                  )}
                  <div className="relative z-10 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg mb-3">
                    {s.step}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-xs leading-tight mb-1">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Mobile: vertical timeline */}
            <div className="lg:hidden space-y-4 max-w-md mx-auto">
              {processSteps.map((s, i) => (
                <div key={s.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-md shrink-0">
                      {s.step}
                    </div>
                    {i < processSteps.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <s.icon className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm">{s.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button size="lg" className="rounded-full gap-2" onClick={() => setFormOpen(true)}>
                Start Your IVF Journey <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* ── Section 6: IVF Success Rate ─────────────────────────────────── */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                Success Rates
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                IVF Success Rate
              </h2>
              <p className="text-muted-foreground mt-3">
                IVF success depends on multiple factors. Our partner fertility centers maintain high IVF success rates with advanced laboratory technologies and experienced doctors.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-3xl mx-auto mb-12">
              {[
                { val: "40–60%", label: "Average Success Rate" },
                { val: "8,000+", label: "IVF Cycles Supported" },
                { val: "50+", label: "Partner Fertility Centres" },
                { val: "98%", label: "Patient Satisfaction" },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-2xl border border-border p-5 text-center shadow-sm">
                  <p className="font-serif text-3xl font-bold text-primary">{s.val}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Factors */}
            <div className="max-w-2xl mx-auto">
              <p className="text-sm font-semibold text-foreground text-center mb-4">
                Factors That Influence IVF Success
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {successFactors.map((f) => (
                  <div key={f.label} className="bg-card rounded-xl border border-border px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <f.icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xs font-medium text-foreground leading-tight">{f.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              {[
                { icon: Shield, label: "Safe & Regulated" },
                { icon: BadgeCheck, label: "ICMR Compliant Centers" },
                { icon: Award, label: "Award-Winning Specialists" },
                { icon: Star, label: "Top Rated Fertility Care" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground shadow-sm">
                  <b.icon className="h-4 w-4 text-primary" /> {b.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 7: Why Choose Conceev Health ────────────────────────── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                About Us
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Why Choose Conceev Health for IVF
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {whyConceev.map((c, i) => (
                <div
                  key={c.title}
                  className={`bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <c.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{c.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 8: FAQ ───────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 bg-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                FAQs
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="max-w-2xl mx-auto">
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="bg-card border border-border rounded-xl px-5 data-[state=open]:border-primary/30 data-[state=open]:shadow-sm"
                  >
                    <AccordionTrigger className="text-left font-semibold text-sm hover:no-underline py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ── Section 9: Who is a Good Candidate ──────────────────────────── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                IVF Candidacy
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Who is a Good Candidate for IVF?
              </h2>
              <p className="text-muted-foreground mt-3">
                IVF treatment may be recommended for couples who:
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {candidates.map((c) => (
                <div
                  key={c.text}
                  className="flex items-center gap-4 bg-card rounded-xl border border-border p-4 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground leading-tight">{c.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button size="lg" className="rounded-full gap-2" onClick={() => setFormOpen(true)}>
                <CalendarCheck className="h-4 w-4" /> Check Your Eligibility — Free Consultation
              </Button>
            </div>
          </div>
        </section>

        {/* ── Section 10: Final CTA ────────────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08),_transparent_60%)] pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
              <Baby className="h-8 w-8 text-white" />
            </div>

            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              Book Your IVF Consultation Today
            </h2>

            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-2">
              Take the first step towards parenthood with expert fertility care.
            </p>
            <p className="text-primary-foreground/70 text-base max-w-xl mx-auto mb-10">
              Our team will help you find the best IVF doctors and hospitals near you.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={handleCall}
                className="bg-white text-primary hover:bg-white/90 rounded-full gap-2 shadow-lg min-w-[220px]"
              >
                <Phone className="h-4 w-4" />
                Call Now: {PHONE_DISPLAY}
              </Button>
              <Button
                size="lg"
                onClick={() => setFormOpen(true)}
                className="bg-white/10 border border-white/30 text-white hover:bg-white/20 rounded-full gap-2 min-w-[220px]"
              >
                <CalendarCheck className="h-4 w-4" />
                Book Free Consultation
              </Button>
              <Button
                size="lg"
                onClick={handleWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white rounded-full gap-2 min-w-[220px]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp for Quick Assistance
              </Button>
            </div>

            {/* Trust line */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-primary-foreground/60 text-sm">
              {["Free Consultation", "No Hidden Charges", "Expert IVF Doctors", "Pan-India Network"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {t}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />

      <LeadFormModal open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
};

export default IVFPackageLanding;
