import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import {
  CheckCircle2, ArrowRight, Phone, Users, TrendingUp,
  Stethoscope, Baby, Heart, UserCheck, BadgeCheck,
  ChevronRight, Send, Star, Globe, ShieldCheck, Building2,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RegistrationForm {
  doctor_name: string;
  specializations: string[];
  experience: string;
  hospital_name: string;
  city: string;
  area: string;
  mobile: string;
  email: string;
  registration_number: string;
  qualification: string;
}

const emptyForm: RegistrationForm = {
  doctor_name: "", specializations: [], experience: "",
  hospital_name: "", city: "", area: "",
  mobile: "", email: "", registration_number: "", qualification: "",
};

const SPECIALIZATION_OPTIONS = ["Gynecology", "Obstetrics", "Fertility Specialist"];

// ─── Data ──────────────────────────────────────────────────────────────────────

const WHY_POINTS = [
  {
    icon: UserCheck,
    title: "Verified Patient Referrals",
    desc: "Receive patients actively looking for IVF, fertility treatments, laparoscopic surgeries, pregnancy care, and gynecological treatments — all enquiries verified and coordinated by our team.",
  },
  {
    icon: Users,
    title: "Dedicated Patient Coordination Team",
    desc: "Our coordinators manage patient enquiries, appointment scheduling, treatment guidance, and follow-up communication — so you can focus purely on clinical care.",
  },
  {
    icon: Globe,
    title: "Expand Your Reach",
    desc: "Reach patients across different cities, build a stronger digital presence, and increase your surgical case volume through the Conceev Health platform.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Collaboration",
    desc: "Work seamlessly with partner hospitals and Conceev Health coordinators through structured treatment packages, ensuring a smooth patient journey from enquiry to treatment.",
  },
];

const SPECIALTIES_DATA = [
  {
    icon: Stethoscope,
    title: "Gynecology Specialists",
    items: ["Fibroid treatment", "Endometriosis treatment", "Hysterectomy", "PCOS management"],
  },
  {
    icon: Heart,
    title: "Fertility Specialists",
    items: ["IVF", "IUI", "Fertility evaluations", "Male infertility treatments"],
  },
  {
    icon: Baby,
    title: "Obstetrics / Maternity",
    items: ["Pregnancy care", "High-risk pregnancy management", "Delivery planning", "Postpartum care"],
  },
];

const STEPS = [
  { step: "01", title: "Register on Platform", desc: "Doctor submits the partnership registration form." },
  { step: "02", title: "Credential Verification", desc: "Our team verifies your qualifications and experience." },
  { step: "03", title: "Profile Listed", desc: "Your doctor profile goes live on Conceev Health." },
  { step: "04", title: "Receive Consultations", desc: "Patients send consultation requests through the platform." },
  { step: "05", title: "Treat at Partner Hospitals", desc: "Treatment is performed at partnered hospitals." },
];

const ELIGIBILITY = [
  "Recognised medical qualifications",
  "Minimum clinical experience in specialty treatments",
  "Strong patient care approach",
  "Association with reputed hospitals or clinics",
];

const AFTER_STEPS = [
  "Conceev Health team reviews your profile",
  "Credential verification is performed",
  "Doctor profile is approved and listed",
  "You start receiving patient consultation requests",
];

// ─── Main Component ────────────────────────────────────────────────────────────

const DoctorPartnership = () => {
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<RegistrationForm>(emptyForm);
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof RegistrationForm, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleSpec = (s: string) =>
    setForm((f) => ({
      ...f,
      specializations: f.specializations.includes(s)
        ? f.specializations.filter((x) => x !== s)
        : [...f.specializations, s],
    }));

  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const submitMutation = useMutation({
    mutationFn: async (f: RegistrationForm) => {
      const summary = [
        `Doctor: ${f.doctor_name}`,
        `Specializations: ${f.specializations.join(", ") || "—"}`,
        `Experience: ${f.experience}`,
        `Hospital/Clinic: ${f.hospital_name}`,
        `Area: ${f.area}`,
        `Email: ${f.email}`,
        `Qualification: ${f.qualification}`,
        f.registration_number ? `Reg No: ${f.registration_number}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const { error } = await supabase.from("leads").insert({
        name: f.doctor_name,
        phone: f.mobile,
        city: f.city,
        procedure_interest: summary,
        source_page: "doctor-partnership",
        lead_type: "doctor_enquiry",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (e: any) =>
      toast({ title: "Submission failed", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.doctor_name || !form.city || !form.mobile) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    submitMutation.mutate(form);
  };

  // ── Success state ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen pb-14 md:pb-0">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-3">
            Registration Submitted!
          </h1>
          <p className="text-muted-foreground max-w-md mb-2">
            Thank you, <span className="font-semibold text-foreground">{form.doctor_name}</span>.
          </p>
          <p className="text-muted-foreground max-w-md mb-8">
            Our partnership team will review your profile and reach out within 1–2 business days to schedule a verification call.
          </p>
          <div className="space-y-3 text-left max-w-sm w-full bg-secondary/50 rounded-xl p-5 mb-8">
            {AFTER_STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground">{s}</p>
              </div>
            ))}
          </div>
          <Link to="/">
            <Button variant="outline" className="rounded-full gap-2">
              Back to Home <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pb-14 md:pb-0">
      <Navbar />

      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-navy text-primary-foreground py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wide">
            <BadgeCheck className="h-3.5 w-3.5" /> Doctor Partnership Program
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-6">
            Join Conceev Health &<br className="hidden md:block" />
            <span className="text-primary"> Connect With Verified Patients</span>
          </h1>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto">
            Partner with Conceev Health and receive curated patient referrals for Gynecology, Fertility, and Maternity treatments through our trusted healthcare network.
          </p>

          {/* Key points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-10 text-left">
            {[
              "Receive verified patient consultations",
              "Increase your clinical visibility",
              "Focus on patient care while we manage patient acquisition",
              "Work with reputed hospitals and coordinated care teams",
            ].map((p) => (
              <div key={p} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-primary-foreground/90">{p}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="rounded-full gap-2 px-8 text-base"
              onClick={scrollToForm}
            >
              Register as a Doctor <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full gap-2 px-8 text-base border-white/40 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <a href="tel:+919876543210">
                <Phone className="h-5 w-5" /> Talk to Our Partnership Team
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 2. About ─────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              A Platform Connecting Patients With Trusted Specialists
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conceev Health is a curated healthcare platform that connects patients with experienced doctors and hospitals for specialised treatments in Gynecology, Maternity, and Fertility. Our mission is to make quality women's healthcare accessible and affordable.
            </p>
          </div>

          {/* Flow diagram */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
            {[
              { icon: Users, label: "Patient", sub: "Searches for specialist" },
              null,
              { icon: Building2, label: "Conceev Health", sub: "Coordinates & connects", highlight: true },
              null,
              { icon: BadgeCheck, label: "Doctor", sub: "Receives verified case" },
            ].map((item, i) =>
              item === null ? (
                <ChevronRight key={i} className="h-8 w-8 text-primary shrink-0 rotate-90 sm:rotate-0" />
              ) : (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-3 px-8 py-6 rounded-2xl text-center ${
                    item.highlight
                      ? "bg-primary text-primary-foreground shadow-lg scale-105"
                      : "bg-secondary/60 text-foreground"
                  }`}
                >
                  <item.icon className={`h-8 w-8 ${item.highlight ? "text-primary-foreground" : "text-primary"}`} />
                  <div>
                    <p className="font-bold text-base">{item.label}</p>
                    <p className={`text-xs mt-0.5 ${item.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{item.sub}</p>
                  </div>
                </div>
              )
            )}
          </div>

          <p className="text-center text-muted-foreground text-sm mt-8 max-w-xl mx-auto">
            Patients searching for IVF, maternity care, and gynaecological surgeries are guided to the most suitable doctors through our platform.
          </p>
        </div>
      </section>

      {/* ── 3. Why Join ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Doctors Join Conceev Health
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {WHY_POINTS.map((p, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <p.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Specialties ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Specialties We Are Looking For
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We are actively onboarding specialists across these areas of women's healthcare.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {SPECIALTIES_DATA.map((s) => (
              <div key={s.title} className="bg-card rounded-2xl border border-border p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif font-bold text-lg text-foreground mb-3">{s.title}</h3>
                <ul className="space-y-2">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. How It Works ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Doctor Partnership Works
            </h2>
          </div>
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-5 bg-card rounded-2xl border border-border p-5">
                <span className="font-serif text-3xl font-bold text-primary/20 w-12 shrink-0 leading-none">
                  {s.step}
                </span>
                <div className="pt-1">
                  <p className="font-bold text-foreground">{s.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Eligibility ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Eligibility Criteria
          </h2>
          <p className="text-muted-foreground mb-10">
            We partner with doctors who meet the following standards:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {ELIGIBILITY.map((e) => (
              <div key={e} className="flex items-center gap-3 bg-secondary/60 rounded-xl px-5 py-4">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span className="text-sm font-medium text-foreground">{e}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Registration Form ─────────────────────────────────────────── */}
      <section ref={formRef} id="register" className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              Join Conceev Health Network
            </h2>
            <p className="text-muted-foreground">
              Fill in your details and our team will get in touch within 1–2 business days.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-6">

            {/* Doctor Details */}
            <div>
              <h3 className="font-bold text-base text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-primary" /> Doctor Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Doctor Name <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.doctor_name}
                    onChange={(e) => set("doctor_name", e.target.value)}
                    placeholder="Dr. Priya Sharma"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Years of Experience</Label>
                  <Input
                    value={form.experience}
                    onChange={(e) => set("experience", e.target.value)}
                    placeholder="e.g. 10 Years"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Highest Qualification</Label>
                  <Input
                    value={form.qualification}
                    onChange={(e) => set("qualification", e.target.value)}
                    placeholder="e.g. MBBS, MS (OBG), DNB"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Medical Registration Number</Label>
                  <Input
                    value={form.registration_number}
                    onChange={(e) => set("registration_number", e.target.value)}
                    placeholder="e.g. KMC/12345"
                  />
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div>
              <h3 className="font-bold text-base text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" /> Specialization
              </h3>
              <div className="flex flex-wrap gap-3">
                {SPECIALIZATION_OPTIONS.map((s) => (
                  <label
                    key={s}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                      form.specializations.includes(s)
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={form.specializations.includes(s)}
                      onChange={() => toggleSpec(s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            {/* Practice Details */}
            <div>
              <h3 className="font-bold text-base text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> Practice Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Hospital / Clinic Name</Label>
                  <Input
                    value={form.hospital_name}
                    onChange={(e) => set("hospital_name", e.target.value)}
                    placeholder="e.g. Conceev Women's Hospital"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>City <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="e.g. Bangalore"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Area / Location</Label>
                  <Input
                    value={form.area}
                    onChange={(e) => set("area", e.target.value)}
                    placeholder="e.g. Koramangala"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-base text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" /> Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Mobile Number <span className="text-destructive">*</span></Label>
                  <Input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => set("mobile", e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="doctor@clinic.com"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={submitMutation.isPending}
              className="w-full rounded-full gap-2 text-base"
            >
              <Send className="h-5 w-5" />
              {submitMutation.isPending ? "Submitting..." : "Submit Doctor Registration"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By submitting, you agree to be contacted by Conceev Health's partnership team.
            </p>
          </form>
        </div>
      </section>

      {/* ── 8. After Registration ────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Happens After Registration
          </h2>
          <p className="text-muted-foreground mb-10">
            Once you submit the registration form, here's what to expect:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {AFTER_STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-4 bg-secondary/60 rounded-xl p-5">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Trust Section ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
            Join a Growing Network of Women's Healthcare Specialists
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Conceev Health is building a trusted network of doctors committed to providing high-quality care for women's health treatments across India. Join us and be part of this mission.
          </p>
        </div>
      </section>

      {/* ── 10. Final CTA ────────────────────────────────────────────────── */}
      <section className="py-20 bg-navy text-primary-foreground">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Become a Conceev Health Partner Doctor
          </h2>
          <p className="text-primary-foreground/80 mb-10 text-lg">
            Join our network and connect with patients looking for trusted specialists in Gynecology, Maternity, and Fertility care.
          </p>
          <Button
            size="lg"
            className="rounded-full gap-2 px-10 text-base"
            onClick={scrollToForm}
          >
            Register as a Doctor Today <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </div>
  );
};

export default DoctorPartnership;
