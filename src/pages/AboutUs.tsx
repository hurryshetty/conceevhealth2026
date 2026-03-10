import { Link } from "react-router-dom";
import {
  Heart, Baby, FlaskConical, ArrowRight, CheckCircle2,
  Users, Building2, ShieldCheck, ClipboardList, Stethoscope,
  Star, Phone, Mail, MapPin, UserCheck, BadgeCheck,
  TrendingUp, HeartHandshake, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Data ───────────────────────────────────────────────────────────────────────

const SPECIALTIES = [
  {
    icon: Stethoscope,
    title: "Gynecology",
    desc: "Treatment and surgical care for various women's health conditions including fibroids, endometriosis, PCOS, and other gynecological concerns.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Baby,
    title: "Maternity",
    desc: "Support for pregnancy care, delivery planning, and maternity services through trusted hospitals and experienced obstetricians.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: FlaskConical,
    title: "Fertility",
    desc: "Comprehensive fertility treatment options including IVF, IUI, fertility evaluations, and assisted reproductive services.",
    color: "bg-teal-50 text-teal-600",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Patient Enquiry",
    desc: "Patients submit consultation requests for specific treatments or concerns.",
    icon: ClipboardList,
  },
  {
    num: "02",
    title: "Case Understanding",
    desc: "Our team understands patient needs, preferences, and location.",
    icon: Users,
  },
  {
    num: "03",
    title: "Hospital & Doctor Matching",
    desc: "Patients are connected with suitable doctors and partner hospitals.",
    icon: Building2,
  },
  {
    num: "04",
    title: "Treatment Coordination",
    desc: "Our care coordinators help manage appointments and treatment planning.",
    icon: UserCheck,
  },
  {
    num: "05",
    title: "Ongoing Support",
    desc: "Patients receive continued assistance throughout the treatment journey.",
    icon: HeartHandshake,
  },
];

const COMMITMENTS = [
  {
    icon: ClipboardList,
    title: "Guided Healthcare Journey",
    desc: "Our coordinators help patients understand treatment options clearly.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Healthcare Providers",
    desc: "We collaborate with trusted doctors and hospitals.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Treatment Information",
    desc: "Patients receive clear guidance about available treatment packages.",
  },
  {
    icon: Heart,
    title: "Patient-Centric Support",
    desc: "Our focus is to ensure a smooth and supportive healthcare experience.",
  },
];

const NETWORK_POINTS = [
  "Clinical expertise",
  "Hospital infrastructure",
  "Patient care standards",
  "Treatment experience",
];

// ─── Page ───────────────────────────────────────────────────────────────────────

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: text */}
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
                <Sparkles className="h-3.5 w-3.5" /> About Conceev Health
              </span>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5">
                Transforming Women's Healthcare Access
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                Conceev Health is a healthcare coordination platform dedicated to helping patients
                find trusted hospitals and experienced doctors for gynecology, maternity, and
                fertility treatments.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                We simplify the healthcare journey by connecting patients with curated treatment
                packages and verified healthcare providers.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="rounded-full gap-2" asChild>
                  <Link to="/packages">
                    Explore Treatments <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="rounded-full" asChild>
                  <a href="#contact">Book a Consultation</a>
                </Button>
              </div>
            </div>

            {/* Right: illustration placeholder */}
            <div className="relative hidden md:flex items-center justify-center">
              <div className="w-full max-w-sm aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center shadow-xl">
                <div className="text-center p-8">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-12 w-12 text-primary" />
                  </div>
                  <p className="font-serif text-2xl font-bold text-foreground">Care First</p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Connecting patients with the right care
                  </p>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-card border border-border rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Verified Doctors</span>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Partner Hospitals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Our Story ────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: illustration */}
            <div className="relative hidden md:flex items-center justify-center order-2 md:order-1">
              <div className="w-full max-w-sm aspect-[4/3] rounded-3xl bg-gradient-to-br from-secondary to-secondary/40 flex items-center justify-center shadow-md">
                <div className="text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-10 w-10 text-primary" />
                  </div>
                  <p className="font-serif text-xl font-bold text-foreground">Our Journey</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Built on a vision of accessible healthcare
                  </p>
                </div>
              </div>
            </div>

            {/* Right: text */}
            <div className="order-1 md:order-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
                Our Story
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-5">
                Why Conceev Health Was Created
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Accessing specialized healthcare services can often be confusing and overwhelming
                  for patients. Many people struggle to find the right doctor, understand treatment
                  options, and compare hospital facilities.
                </p>
                <p>
                  Conceev Health was founded with the vision of making quality women's healthcare
                  accessible, transparent, and well-coordinated.
                </p>
                <p>
                  Our platform bridges the gap between patients and healthcare providers by creating
                  a trusted ecosystem where patients can easily discover the most suitable treatment
                  options and hospitals.
                </p>
                <p>
                  Through careful curation of hospitals and doctors, we aim to ensure that every
                  patient receives reliable guidance and quality care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 & 4. Mission + Vision ─────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Mission */}
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Star className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To simplify access to specialized women's healthcare by connecting patients with
                trusted doctors and hospitals through transparent treatment packages and coordinated
                care.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To build one of India's most trusted healthcare platforms that empowers patients to
                make informed decisions while ensuring access to high-quality treatment and
                compassionate care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Specialties ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              Specialties We Focus On
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {SPECIALTIES.map((s) => (
              <div
                key={s.title}
                className="bg-card rounded-2xl border border-border p-7 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl ${s.color} bg-opacity-20 flex items-center justify-center mb-5`}>
                  <s.icon className="h-7 w-7" />
                </div>
                <h3 className="font-serif font-bold text-lg text-foreground mb-3">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. How It Works ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              Our Care Coordination Model
            </h2>
          </div>

          {/* Desktop: horizontal flow */}
          <div className="hidden md:flex items-start gap-0 max-w-5xl mx-auto">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex-1 flex flex-col items-center text-center px-4 relative">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="absolute top-7 left-1/2 w-full h-0.5 bg-primary/20 z-0" />
                )}
                <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4 z-10 bg-card">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary mb-1">Step {step.num}</span>
                <h4 className="font-semibold text-foreground text-sm mb-2">{step.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile: vertical list */}
          <div className="md:hidden space-y-4 max-w-lg mx-auto">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="flex gap-4 bg-card rounded-xl border border-border p-5"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="text-xs font-bold text-primary">Step {step.num}</span>
                  <h4 className="font-semibold text-foreground text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Partner Network ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
                Our Network
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-5">
                Trusted Doctors and Hospitals
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Conceev Health collaborates with experienced doctors and well-equipped hospitals to
                ensure that patients receive quality care in a safe and supportive environment.
              </p>
              <p className="text-muted-foreground mb-5 font-medium text-sm">
                We carefully evaluate healthcare providers based on:
              </p>
              <ul className="space-y-3">
                {NETWORK_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 mt-8">
                <Button className="rounded-full gap-2" asChild>
                  <Link to="/doctors">
                    <Stethoscope className="h-4 w-4" /> View Doctors
                  </Link>
                </Button>
                <Button variant="outline" className="rounded-full gap-2" asChild>
                  <Link to="/hospitals">
                    <Building2 className="h-4 w-4" /> View Hospitals
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Partner Hospitals", value: "50+", icon: Building2 },
                { label: "Expert Doctors", value: "100+", icon: Stethoscope },
                { label: "Cities Covered", value: "2+", icon: MapPin },
                { label: "Specialties", value: "3", icon: Heart },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card rounded-2xl border border-border p-6 text-center hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-serif text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Patient Commitment ───────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              What Patients Can Expect
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {COMMITMENTS.map((c) => (
              <div
                key={c.title}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <c.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">{c.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Growing Ecosystem ────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
            <TrendingUp className="h-3.5 w-3.5" /> Expanding Network
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-5">
            Building a Trusted Healthcare Network
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Conceev Health is continuously expanding its network of hospitals and doctors to provide
            access to quality healthcare services across multiple cities.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our goal is to create a reliable platform where patients can confidently connect with
            the right healthcare providers.
          </p>
        </div>
      </section>

      {/* ── 10. Join Network ────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Join the Conceev Health Network
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Doctors */}
            <div className="bg-card rounded-2xl border border-border p-8 flex flex-col items-start gap-5 hover:shadow-lg hover:border-primary/30 transition-all">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-foreground mb-2">For Doctors</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Join Conceev Health to connect with patients looking for specialized treatment and
                  expand your clinical reach.
                </p>
              </div>
              <Button className="rounded-full mt-auto gap-2" asChild>
                <Link to="/register-as-doctor">
                  Register as a Doctor <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Hospitals */}
            <div className="bg-card rounded-2xl border border-border p-8 flex flex-col items-start gap-5 hover:shadow-lg hover:border-primary/30 transition-all">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-foreground mb-2">For Hospitals</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Partner with Conceev Health to receive verified patient referrals and collaborate
                  with a growing healthcare network.
                </p>
              </div>
              <Button className="rounded-full mt-auto gap-2" asChild>
                <Link to="/register-your-hospital">
                  Register Your Hospital <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. Contact ─────────────────────────────────────────────────────── */}
      <section id="contact" className="py-16 md:py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
            Get in Touch
          </h2>
          <p className="text-muted-foreground mb-10">
            For patient assistance or partnership enquiries, feel free to contact our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="mailto:support@conceevhealth.com"
              className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-primary transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground font-normal">Patient Support</p>
                <p>support@conceevhealth.com</p>
              </div>
            </a>
            <a
              href="mailto:partners@conceevhealth.com"
              className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-primary transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                <HeartHandshake className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground font-normal">Partnerships</p>
                <p>partners@conceevhealth.com</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── 12. Final CTA ───────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simplifying Healthcare Journeys for Women
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Conceev Health is committed to making specialized healthcare easier to access through
            trusted doctors, hospitals, and coordinated care.
          </p>
          <Button size="lg" className="rounded-full gap-2" asChild>
            <a href="#contact">
              Start Your Consultation <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
