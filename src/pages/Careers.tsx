import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Heart, Users, TrendingUp, Lightbulb, Stethoscope, FileText,
  Megaphone, Code2, MapPin, Briefcase, ArrowRight, CheckCircle2,
  Send, Mail, UserCheck, ClipboardList, BadgeCheck, Sparkles,
  HeartHandshake, Building2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Data ───────────────────────────────────────────────────────────────────────

const WHY_JOIN = [
  {
    icon: Heart,
    title: "Meaningful Impact",
    desc: "Work on solutions that help patients access better healthcare and support women's health journeys.",
  },
  {
    icon: Users,
    title: "Collaborative Culture",
    desc: "Be part of a team that values innovation, collaboration, and continuous learning.",
  },
  {
    icon: TrendingUp,
    title: "Growth Opportunities",
    desc: "Gain exposure to the rapidly evolving health-tech ecosystem and grow your professional career.",
  },
  {
    icon: Sparkles,
    title: "Mission-Driven Work",
    desc: "Every project you contribute to directly improves patient access to healthcare services.",
  },
];

const ROLES = [
  {
    icon: UserCheck,
    title: "Healthcare Coordinators",
    desc: "Support patient journeys, consultations, and treatment coordination.",
  },
  {
    icon: FileText,
    title: "Medical Content Specialists",
    desc: "Create educational content related to gynecology, maternity, and fertility.",
  },
  {
    icon: Megaphone,
    title: "Digital Marketing Specialists",
    desc: "Help reach patients through digital campaigns and healthcare awareness initiatives.",
  },
  {
    icon: Code2,
    title: "Product & Technology Professionals",
    desc: "Develop and improve the Conceev Health platform.",
  },
];

const JOBS = [
  {
    title: "Patient Care Coordinator",
    dept: "Patient Support",
    location: "Hyderabad",
    type: "Full-time",
    desc: "Help guide patients through consultations, treatment coordination, and follow-up support.",
  },
  {
    title: "Healthcare Marketing Executive",
    dept: "Marketing",
    location: "Bangalore",
    type: "Full-time",
    desc: "Support marketing initiatives to promote healthcare services and build awareness about Conceev Health.",
  },
  {
    title: "Frontend Developer",
    dept: "Technology",
    location: "Remote / Hybrid",
    type: "Full-time",
    desc: "Help build and enhance the Conceev Health platform to improve patient and partner experiences.",
  },
];

const HIRING_STEPS = [
  {
    num: "01",
    icon: ClipboardList,
    title: "Application Submission",
    desc: "Submit your application through the Conceev Health careers page.",
  },
  {
    num: "02",
    icon: FileText,
    title: "Initial Screening",
    desc: "Our recruitment team reviews your application and schedules an introductory conversation.",
  },
  {
    num: "03",
    icon: Users,
    title: "Interview Process",
    desc: "Candidates may go through one or more interviews depending on the role.",
  },
  {
    num: "04",
    icon: BadgeCheck,
    title: "Offer & Onboarding",
    desc: "Successful candidates receive an offer and begin their journey with Conceev Health.",
  },
];

// ─── Resume Form ────────────────────────────────────────────────────────────────

interface ResumeForm {
  name: string;
  email: string;
  phone: string;
  role: string;
  message: string;
}

const INITIAL: ResumeForm = { name: "", email: "", phone: "", role: "", message: "" };

const ResumeSection = ({ title, subtitle, buttonLabel }: { title: string; subtitle: string; buttonLabel: string }) => {
  const { toast } = useToast();
  const [form, setForm] = useState<ResumeForm>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof ResumeForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("leads").insert({
        name: form.name,
        phone: form.phone,
        city: "",
        procedure_interest: `Career Application – ${form.role || "General"} | ${form.message}`,
        source_page: "careers",
        email: form.email,
      });
      if (error) throw error;
    },
    onSuccess: () => setSubmitted(true),
    onError: (e: any) =>
      toast({ title: "Submission failed", description: e.message, variant: "destructive" }),
  });

  if (submitted) {
    return (
      <div className="bg-card rounded-2xl border border-border p-10 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="font-serif text-xl font-bold text-foreground mb-2">
          Resume Received!
        </h3>
        <p className="text-muted-foreground text-sm">
          Thank you for your interest. We'll reach out if a relevant opportunity arises.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-8 max-w-lg mx-auto">
      <h3 className="font-serif text-xl font-bold text-foreground mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm mb-6">{subtitle}</p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Full Name *</Label>
            <Input placeholder="Your name" value={form.name} onChange={set("name")} className="rounded-xl" />
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Phone *</Label>
            <Input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={set("phone")} className="rounded-xl" />
          </div>
        </div>
        <div>
          <Label className="text-xs font-semibold mb-1.5 block">Email *</Label>
          <Input type="email" placeholder="you@email.com" value={form.email} onChange={set("email")} className="rounded-xl" />
        </div>
        <div>
          <Label className="text-xs font-semibold mb-1.5 block">Role / Department Interest</Label>
          <Input placeholder="e.g. Healthcare Coordinator, Developer…" value={form.role} onChange={set("role")} className="rounded-xl" />
        </div>
        <div>
          <Label className="text-xs font-semibold mb-1.5 block">Tell us about yourself</Label>
          <textarea
            rows={3}
            placeholder="Brief introduction, experience, or why you want to join…"
            value={form.message}
            onChange={set("message")}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
        <Button
          className="w-full rounded-full gap-2"
          disabled={!form.name || !form.phone || !form.email || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          <Send className="h-4 w-4" />
          {mutation.isPending ? "Submitting…" : buttonLabel}
        </Button>
      </div>
    </div>
  );
};

// ─── Page ───────────────────────────────────────────────────────────────────────

const Careers = () => {
  const [locationFilter, setLocationFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  const locations = ["All", ...Array.from(new Set(JOBS.map((j) => j.location)))];
  const depts = ["All", ...Array.from(new Set(JOBS.map((j) => j.dept)))];

  const filteredJobs = JOBS.filter(
    (j) =>
      (locationFilter === "All" || j.location === locationFilter) &&
      (deptFilter === "All" || j.dept === deptFilter)
  );

  const scrollToForm = () => {
    document.getElementById("resume-form")?.scrollIntoView({ behavior: "smooth" });
  };

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
                <Briefcase className="h-3.5 w-3.5" /> Careers at Conceev Health
              </span>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5">
                Build the Future of Women's Healthcare With Us
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Join Conceev Health and be part of a mission-driven team working to make gynecology,
                maternity, and fertility care more accessible and transparent for patients across
                India.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  className="rounded-full gap-2"
                  onClick={() =>
                    document.getElementById("open-positions")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  View Open Positions <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="rounded-full" onClick={scrollToForm}>
                  Submit Your Resume
                </Button>
              </div>
            </div>

            {/* Right: illustration */}
            <div className="hidden md:flex items-center justify-center">
              <div className="w-full max-w-sm aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center shadow-xl relative">
                <div className="text-center p-8">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    <HeartHandshake className="h-12 w-12 text-primary" />
                  </div>
                  <p className="font-serif text-2xl font-bold text-foreground">Join Our Team</p>
                  <p className="text-muted-foreground mt-2 text-sm">Make a difference in women's healthcare</p>
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-card border border-border rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Mission-driven</span>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Growing fast</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Why Join ─────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              Why Join Conceev Health
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {WHY_JOIN.map((item) => (
              <div
                key={item.title}
                className="bg-card rounded-2xl border border-border p-7 hover:shadow-lg hover:border-primary/30 transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Work Environment ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            {/* Left: illustration */}
            <div className="hidden md:flex items-center justify-center">
              <div className="w-full max-w-sm aspect-[4/3] rounded-3xl bg-gradient-to-br from-secondary to-secondary/40 flex items-center justify-center shadow-md">
                <div className="text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="h-10 w-10 text-primary" />
                  </div>
                  <p className="font-serif text-xl font-bold text-foreground">Innovation First</p>
                  <p className="text-muted-foreground mt-1 text-sm">Healthcare × Technology</p>
                </div>
              </div>
            </div>
            {/* Right: text */}
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
                Work Culture
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-5">
                A Team That Cares About Healthcare Innovation
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  At Conceev Health, we believe that healthcare technology can transform the way
                  patients discover and access treatments. Our team works at the intersection of
                  healthcare, technology, and patient care coordination.
                </p>
                <p>
                  We encourage open communication, innovative thinking, and a shared commitment to
                  improving healthcare accessibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Who We're Looking For ────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              Join Our Growing Team
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We are looking for passionate professionals who want to contribute to improving
              healthcare access.
            </p>
          </div>
          <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-8">
            Roles Typically Required
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {ROLES.map((r) => (
              <div
                key={r.title}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <r.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">{r.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Open Positions ───────────────────────────────────────────────── */}
      <section id="open-positions" className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              Current Open Positions
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <div className="flex gap-2 flex-wrap justify-center">
              <span className="text-xs font-semibold text-muted-foreground self-center mr-1">Location:</span>
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocationFilter(loc)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all ${
                    locationFilter === loc
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <span className="text-xs font-semibold text-muted-foreground self-center mr-1">Department:</span>
              {depts.map((d) => (
                <button
                  key={d}
                  onClick={() => setDeptFilter(d)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all ${
                    deptFilter === d
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Job cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {filteredJobs.map((job) => (
              <div
                key={job.title}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm leading-tight">{job.title}</h3>
                    <p className="text-xs text-primary font-medium mt-0.5">{job.dept}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{job.desc}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full font-medium">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full font-medium">
                    {job.type}
                  </span>
                </div>
                <Button size="sm" className="rounded-full gap-1.5 w-full" onClick={scrollToForm}>
                  Apply Now <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {filteredJobs.length === 0 && (
              <div className="col-span-3 text-center py-10 text-muted-foreground text-sm">
                No positions match your filters. Try a different combination.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 6. Hiring Process ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              Our Hiring Process
            </h2>
          </div>

          {/* Desktop: horizontal */}
          <div className="hidden md:flex items-start gap-0 max-w-4xl mx-auto">
            {HIRING_STEPS.map((step, i) => (
              <div key={step.num} className="flex-1 flex flex-col items-center text-center px-4 relative">
                {i < HIRING_STEPS.length - 1 && (
                  <div className="absolute top-7 left-1/2 w-full h-0.5 bg-primary/20 z-0" />
                )}
                <div className="w-14 h-14 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center mb-4 z-10">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary mb-1">Step {step.num}</span>
                <h4 className="font-semibold text-foreground text-sm mb-2">{step.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile: vertical */}
          <div className="md:hidden space-y-4 max-w-lg mx-auto">
            {HIRING_STEPS.map((step) => (
              <div key={step.num} className="flex gap-4 bg-card rounded-xl border border-border p-5">
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

      {/* ── 7. Internships ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Internship Programs
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            We also offer internship opportunities for students and fresh graduates interested in
            healthcare technology, marketing, and patient coordination.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Internships help candidates gain exposure to the health-tech industry and real-world
            healthcare operations.
          </p>
          <Button className="rounded-full gap-2" onClick={scrollToForm}>
            Apply for Internship <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ── 8. Diversity & Inclusion ────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary/10 via-background to-secondary/20 border border-border rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
              Inclusive Workplace
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Conceev Health believes in building an inclusive workplace that values diversity of
              perspectives, backgrounds, and experiences.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We welcome individuals who are passionate about making healthcare more accessible and
              equitable.
            </p>
          </div>
        </div>
      </section>

      {/* ── 9. Submit Resume ────────────────────────────────────────────────── */}
      <section id="resume-form" className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              Send Us Your Resume
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Even if you don't see a suitable position listed, we are always interested in
              connecting with talented individuals who want to contribute to healthcare innovation.
            </p>
          </div>
          <ResumeSection
            title="Submit Your Application"
            subtitle="Submit your resume and we will contact you if relevant opportunities arise."
            buttonLabel="Submit Resume"
          />
        </div>
      </section>

      {/* ── 10. Final CTA ───────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Be Part of a Mission That Matters
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Join Conceev Health and help shape the future of women's healthcare access.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              size="lg"
              className="rounded-full gap-2"
              onClick={() =>
                document.getElementById("open-positions")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Open Positions <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full" onClick={scrollToForm}>
              Apply Now
            </Button>
          </div>
        </div>
      </section>

      {/* ── 11. Contact ─────────────────────────────────────────────────────── */}
      <section className="py-14 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm mb-4">For career-related queries:</p>
          <a
            href="mailto:careers@conceevhealth.com"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            careers@conceevhealth.com
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
