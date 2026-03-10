import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import {
  CheckCircle2, ArrowRight, Phone, Users, FileText, TrendingUp,
  Building2, ShieldCheck, Stethoscope, Baby, Heart,
  ClipboardList, UserCheck, BadgeCheck, Banknote, ChevronRight,
  Send, Star,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RegistrationForm {
  hospital_name: string;
  hospital_type: string;
  city: string;
  area: string;
  contact_name: string;
  designation: string;
  mobile: string;
  email: string;
  specialties: string[];
  beds: string;
  icu: string;
  ot: string;
  doctor_name: string;
  doctor_specialization: string;
  doctor_experience: string;
}

const emptyForm: RegistrationForm = {
  hospital_name: "", hospital_type: "", city: "", area: "",
  contact_name: "", designation: "", mobile: "", email: "",
  specialties: [], beds: "", icu: "", ot: "",
  doctor_name: "", doctor_specialization: "", doctor_experience: "",
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const HOSPITAL_TYPES = [
  "Multispeciality Hospital",
  "Fertility Clinic",
  "Maternity Hospital",
  "Women's Care Hospital",
  "Nursing Home",
  "Surgical Centre",
];

const SPECIALTY_OPTIONS = ["Gynecology", "Maternity", "Fertility"];

const WHY_POINTS = [
  {
    icon: UserCheck,
    title: "Verified Surgical Patients",
    desc: "Receive patients actively looking for IVF, laparoscopic surgeries, hysterectomy, maternity packages, and fertility procedures.",
  },
  {
    icon: Users,
    title: "Dedicated Patient Coordinators",
    desc: "Our coordinators manage appointment scheduling, treatment explanation, package guidance, and follow-up communication.",
  },
  {
    icon: Banknote,
    title: "Transparent Billing & Settlement",
    desc: "Receive patient treatment details, package values, monthly settlement reports, and clear revenue tracking.",
  },
  {
    icon: TrendingUp,
    title: "No Marketing Spend Required",
    desc: "Conceev Health handles digital marketing, patient acquisition, lead qualification, and onboarding. Hospitals focus on clinical care.",
  },
];

const SPECIALTIES_DATA = [
  {
    icon: Stethoscope,
    title: "Gynecology",
    items: ["Fibroids treatment", "Endometriosis surgery", "Hysterectomy", "PCOS management"],
  },
  {
    icon: Baby,
    title: "Maternity",
    items: ["Pregnancy packages", "High-risk pregnancy care", "Delivery packages"],
  },
  {
    icon: Heart,
    title: "Fertility",
    items: ["IVF", "IUI", "Fertility evaluations", "Male infertility treatments"],
  },
];

const STEPS = [
  { step: "01", title: "Register on Platform", desc: "Hospital submits the partnership registration form." },
  { step: "02", title: "Credential Verification", desc: "Our team verifies hospital credentials and specialties." },
  { step: "03", title: "Get Listed", desc: "Hospital is listed on Conceev Health for relevant packages." },
  { step: "04", title: "Receive Cases", desc: "Patients select packages and Conceev Health assigns cases." },
  { step: "05", title: "Treat & Settle", desc: "Hospital provides treatment and receives monthly settlement." },
];

const EXPECTATIONS = [
  "Qualified doctors and specialists",
  "Transparent treatment pricing",
  "Quality surgical infrastructure",
  "Good patient care standards",
];

const AFTER_STEPS = [
  "Our partnership team will review your hospital profile",
  "We will schedule a verification call",
  "Your hospital will be onboarded to Conceev Health platform",
  "You will start receiving patient referrals",
];

// ─── Main Component ────────────────────────────────────────────────────────────

const HospitalPartnership = () => {
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<RegistrationForm>(emptyForm);
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof RegistrationForm, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleSpecialty = (s: string) =>
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter((x) => x !== s)
        : [...f.specialties, s],
    }));

  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const submitMutation = useMutation({
    mutationFn: async (f: RegistrationForm) => {
      const summary = [
        `Hospital: ${f.hospital_name}`,
        `Type: ${f.hospital_type}`,
        `Area: ${f.area}`,
        `Email: ${f.email}`,
        `Designation: ${f.designation}`,
        `Specialties: ${f.specialties.join(", ") || "—"}`,
        `Beds: ${f.beds}`,
        `ICU: ${f.icu}`,
        `OT: ${f.ot}`,
        f.doctor_name ? `Doctor: ${f.doctor_name} (${f.doctor_specialization}, ${f.doctor_experience})` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const { error } = await supabase.from("leads").insert({
        name: f.contact_name,
        phone: f.mobile,
        city: f.city,
        procedure_interest: summary,
        source_page: "hospital-partnership",
        lead_type: "hospital_enquiry",
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
    if (!form.hospital_name || !form.city || !form.contact_name || !form.mobile) {
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
            Partnership Request Submitted!
          </h1>
          <p className="text-muted-foreground max-w-md mb-2">
            Thank you for registering <span className="font-semibold text-foreground">{form.hospital_name}</span>.
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
            <Building2 className="h-3.5 w-3.5" /> Hospital Partnership Program
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-6">
            Partner With Conceev Health &<br className="hidden md:block" />
            <span className="text-primary"> Receive Verified Surgical Patients</span>
          </h1>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto">
            Join our network of trusted hospitals for Gynecology, Maternity, and Fertility treatments and receive curated patient referrals through our platform.
          </p>

          {/* Key points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-10 text-left">
            {[
              "Increase patient flow without spending on marketing",
              "Receive pre-qualified patients looking for surgical packages",
              "Transparent billing and monthly settlements",
              "Dedicated patient coordinators for smooth case management",
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
              Register Your Hospital <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full gap-2 px-8 text-base border-white/40 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <a href="tel:+919876543210">
                <Phone className="h-5 w-5" /> Talk to Partnership Team
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
              A Curated Surgical Care Platform
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conceev Health connects patients with trusted hospitals offering specialised surgical packages in Gynecology, Maternity, and Fertility. Patients choose packages based on location, affordability, and hospital reputation — and Conceev Health coordinates the entire journey.
            </p>
          </div>

          {/* Flow diagram */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
            {[
              { icon: Users, label: "Patient", sub: "Searches for treatment" },
              null,
              { icon: Building2, label: "Conceev Health", sub: "Coordinates & assigns", highlight: true },
              null,
              { icon: ShieldCheck, label: "Hospital", sub: "Receives verified case" },
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
            Our team manages patient enquiries, consultation coordination, and package assignment to ensure hospitals receive genuine surgical cases.
          </p>
        </div>
      </section>

      {/* ── 3. Why Partner ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Hospitals Partner With Conceev Health
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
              Specialties We Currently Promote
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Hospitals can partner with us for treatments across these specialties.
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
              How The Partnership Works
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

      {/* ── 6. What We Expect ────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            What We Expect From Partner Hospitals
          </h2>
          <p className="text-muted-foreground mb-10">
            To maintain high patient trust, we partner with hospitals that provide:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {EXPECTATIONS.map((e) => (
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
              Register Your Hospital
            </h2>
            <p className="text-muted-foreground">
              Fill in your details and our partnership team will get in touch within 1–2 business days.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-6">
            {/* Hospital Details */}
            <div>
              <h3 className="font-bold text-base text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> Hospital Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Hospital Name <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.hospital_name}
                    onChange={(e) => set("hospital_name", e.target.value)}
                    placeholder="e.g. Conceev Women's Hospital"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Hospital Type <span className="text-destructive">*</span></Label>
                  <Select value={form.hospital_type || "__none"} onValueChange={(v) => set("hospital_type", v === "__none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Select...</SelectItem>
                      {HOSPITAL_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Area / Location</Label>
                  <Input
                    value={form.area}
                    onChange={(e) => set("area", e.target.value)}
                    placeholder="e.g. Koramangala, Indiranagar"
                  />
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div>
              <h3 className="font-bold text-base text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" /> Contact Person
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Contact Person Name <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.contact_name}
                    onChange={(e) => set("contact_name", e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Designation</Label>
                  <Input
                    value={form.designation}
                    onChange={(e) => set("designation", e.target.value)}
                    placeholder="e.g. Hospital Administrator"
                  />
                </div>
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
                    placeholder="admin@hospital.com"
                  />
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div>
              <h3 className="font-bold text-base text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" /> Specialties Available
              </h3>
              <div className="flex flex-wrap gap-3">
                {SPECIALTY_OPTIONS.map((s) => (
                  <label
                    key={s}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                      form.specialties.includes(s)
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={form.specialties.includes(s)}
                      onChange={() => toggleSpecialty(s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            {/* Infrastructure */}
            <div>
              <h3 className="font-bold text-base text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" /> Infrastructure
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Number of Beds</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.beds}
                    onChange={(e) => set("beds", e.target.value)}
                    placeholder="e.g. 50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>ICU Availability</Label>
                  <Select value={form.icu || "__none"} onValueChange={(v) => set("icu", v === "__none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Select...</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Operation Theatre</Label>
                  <Select value={form.ot || "__none"} onValueChange={(v) => set("ot", v === "__none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Select...</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Doctor Details */}
            <div>
              <h3 className="font-bold text-base text-foreground mb-1 flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-primary" /> Doctor Details
              </h3>
              <p className="text-xs text-muted-foreground mb-4 pb-2 border-b border-border">Optional — add the primary doctor for this hospital</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Doctor Name</Label>
                  <Input
                    value={form.doctor_name}
                    onChange={(e) => set("doctor_name", e.target.value)}
                    placeholder="Dr. Priya Sharma"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Specialization</Label>
                  <Input
                    value={form.doctor_specialization}
                    onChange={(e) => set("doctor_specialization", e.target.value)}
                    placeholder="e.g. IVF Specialist"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Years of Experience</Label>
                  <Input
                    value={form.doctor_experience}
                    onChange={(e) => set("doctor_experience", e.target.value)}
                    placeholder="e.g. 10 Years"
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
              {submitMutation.isPending ? "Submitting..." : "Submit Partnership Request"}
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
            Growing Network of Women's Healthcare Hospitals
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Conceev Health is building a trusted network of hospitals across India that provide high-quality and affordable surgical care for women. Join us and be part of this mission.
          </p>
        </div>
      </section>

      {/* ── 10. Final CTA ────────────────────────────────────────────────── */}
      <section className="py-20 bg-navy text-primary-foreground">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Become a Conceev Health Partner Hospital
          </h2>
          <p className="text-primary-foreground/80 mb-10 text-lg">
            Expand your hospital's reach and receive verified surgical patients through our platform.
          </p>
          <Button
            size="lg"
            className="rounded-full gap-2 px-10 text-base"
            onClick={scrollToForm}
          >
            Register Your Hospital Today <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </div>
  );
};

export default HospitalPartnership;
