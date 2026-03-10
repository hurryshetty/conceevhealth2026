import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Phone, Mail, MessageCircle, MapPin, Clock, Send,
  CheckCircle2, HeartHandshake, Building2, Stethoscope,
  ArrowRight, HelpCircle, Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Contact cards data ────────────────────────────────────────────────────────

const CONTACT_CARDS = [
  {
    icon: Phone,
    title: "Patient Support",
    desc: "For consultation requests, treatment guidance, or appointment assistance.",
    items: [
      { icon: Phone, label: "+91 XXXXX XXXXX", href: "tel:+91XXXXXXXXXX" },
      { icon: Mail, label: "support@conceevhealth.com", href: "mailto:support@conceevhealth.com" },
    ],
  },
  {
    icon: Stethoscope,
    title: "Doctor Partnerships",
    desc: "Doctors interested in joining the Conceev Health network.",
    items: [
      { icon: Mail, label: "doctors@conceevhealth.com", href: "mailto:doctors@conceevhealth.com" },
    ],
  },
  {
    icon: Building2,
    title: "Hospital Partnerships",
    desc: "Hospitals interested in collaborating with Conceev Health.",
    items: [
      { icon: Mail, label: "hospitals@conceevhealth.com", href: "mailto:hospitals@conceevhealth.com" },
    ],
  },
];

const SUBJECTS = [
  "Patient Consultation",
  "Doctor Partnership",
  "Hospital Partnership",
  "General Enquiry",
  "Careers",
];

// ─── Form ───────────────────────────────────────────────────────────────────────

interface ContactForm {
  name: string;
  phone: string;
  email: string;
  city: string;
  subject: string;
  message: string;
}

const INITIAL: ContactForm = {
  name: "", phone: "", email: "", city: "", subject: "", message: "",
};

// ─── Page ───────────────────────────────────────────────────────────────────────

const ContactUs = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<ContactForm>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  const set =
    (k: keyof ContactForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("leads").insert({
        name: form.name,
        phone: form.phone,
        city: form.city,
        procedure_interest: `[${form.subject}] ${form.message}`,
        source_page: "contact-us",
        email: form.email,
        lead_type: form.subject === "Doctor Partnership" ? "doctor_enquiry"
          : form.subject === "Hospital Partnership" ? "hospital_enquiry"
          : form.subject === "Careers" ? "career_enquiry"
          : "patient_enquiry",
      });
      if (error) throw error;
    },
    onSuccess: () => setSubmitted(true),
    onError: (e: any) =>
      toast({ title: "Submission failed", description: e.message, variant: "destructive" }),
  });

  const valid = form.name && form.phone && form.email && form.subject;

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
                <MessageCircle className="h-3.5 w-3.5" /> Contact Us
              </span>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5">
                Get in Touch With Conceev Health
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Have questions about treatments, partnerships, or consultations? Our team is here
                to help you with the information and support you need.
              </p>
            </div>

            {/* Right: illustration */}
            <div className="hidden md:flex items-center justify-center">
              <div className="w-full max-w-sm aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center shadow-xl relative">
                <div className="text-center p-8">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    <HeartHandshake className="h-12 w-12 text-primary" />
                  </div>
                  <p className="font-serif text-2xl font-bold text-foreground">We're Here</p>
                  <p className="text-muted-foreground mt-2 text-sm">Ready to assist you</p>
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-card border border-border rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Call Support</span>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Mon–Sat, 9AM–7PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Contact Cards ────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground text-center mb-10">
            Contact Information
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {CONTACT_CARDS.map((card) => (
              <div
                key={card.title}
                className="bg-card rounded-2xl border border-border p-7 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <card.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{card.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
                <ul className="space-y-2 mt-auto">
                  {card.items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                      >
                        <item.icon className="h-4 w-4 text-primary shrink-0" />
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Contact Form ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
            {/* Left: form */}
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
                Send Us a Message
              </h2>
              <p className="text-muted-foreground mb-8">
                Fill out the form below and our team will get back to you shortly.
              </p>

              {submitted ? (
                <div className="bg-card rounded-2xl border border-border p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                    Message Received!
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Thank you for contacting Conceev Health. Our team will reach out to you shortly.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-5 rounded-full"
                    onClick={() => { setForm(INITIAL); setSubmitted(false); }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border p-7 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold mb-1.5 block">Full Name *</Label>
                      <Input
                        placeholder="Your name"
                        value={form.name}
                        onChange={set("name")}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold mb-1.5 block">Mobile Number *</Label>
                      <Input
                        placeholder="+91 XXXXX XXXXX"
                        value={form.phone}
                        onChange={set("phone")}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold mb-1.5 block">Email Address *</Label>
                      <Input
                        type="email"
                        placeholder="you@email.com"
                        value={form.email}
                        onChange={set("email")}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold mb-1.5 block">City</Label>
                      <Input
                        placeholder="Your city"
                        value={form.city}
                        onChange={set("city")}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Subject *</Label>
                    <Select
                      value={form.subject}
                      onValueChange={(v) => setForm((p) => ({ ...p, subject: v }))}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Message</Label>
                    <textarea
                      rows={4}
                      placeholder="Tell us how we can help you…"
                      value={form.message}
                      onChange={set("message")}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                  </div>
                  <Button
                    className="w-full rounded-full gap-2"
                    disabled={!valid || mutation.isPending}
                    onClick={() => mutation.mutate()}
                  >
                    <Send className="h-4 w-4" />
                    {mutation.isPending ? "Submitting…" : "Submit Enquiry"}
                  </Button>
                </div>
              )}
            </div>

            {/* Right: support info */}
            <div className="space-y-6 pt-2">
              {/* Quick contact */}
              <div className="bg-card rounded-2xl border border-border p-7">
                <h3 className="font-semibold text-foreground mb-4">Quick Contact</h3>
                <div className="space-y-4">
                  <a
                    href="tel:+91XXXXXXXXXX"
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Call Us</p>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        +91 XXXXX XXXXX
                      </p>
                    </div>
                  </a>
                  <a
                    href="https://wa.me/91XXXXXXXXXX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors shrink-0">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">WhatsApp</p>
                      <p className="text-sm font-medium text-foreground group-hover:text-green-600 transition-colors">
                        Chat with us on WhatsApp
                      </p>
                    </div>
                  </a>
                  <a
                    href="mailto:support@conceevhealth.com"
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email Us</p>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        support@conceevhealth.com
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Support hours */}
              <div className="bg-card rounded-2xl border border-border p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Support Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monday – Saturday</span>
                    <span className="font-medium text-foreground">9:00 AM – 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium text-foreground">Closed</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border mt-2">
                    Emergency queries may be responded to based on availability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Office Location ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground text-center mb-10">
            Our Office
          </h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
            {/* Address card */}
            <div className="bg-card rounded-2xl border border-border p-7">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Conceev Health</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    [Office Address]<br />
                    Hyderabad / Bangalore<br />
                    India
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-border flex flex-wrap gap-3">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <MapPin className="h-3.5 w-3.5" /> Open in Google Maps
                </a>
              </div>
            </div>

            {/* Map embed placeholder */}
            <div className="rounded-2xl overflow-hidden border border-border h-64 md:h-full min-h-[200px] bg-secondary flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Map embed coming soon</p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-1 inline-block"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Support Hours (summary strip) ────────────────────────────────── */}
      <section className="py-10 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div>
              <Clock className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Mon – Sat</p>
              <p className="font-semibold text-foreground text-sm">9:00 AM – 7:00 PM</p>
            </div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div>
              <Phone className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Call Us</p>
              <a href="tel:+91XXXXXXXXXX" className="font-semibold text-foreground text-sm hover:text-primary transition-colors">
                +91 XXXXX XXXXX
              </a>
            </div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div>
              <MessageCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">WhatsApp</p>
              <a
                href="https://wa.me/91XXXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground text-sm hover:text-green-600 transition-colors"
              >
                Chat with us
              </a>
            </div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div>
              <Mail className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Email</p>
              <a href="mailto:support@conceevhealth.com" className="font-semibold text-foreground text-sm hover:text-primary transition-colors">
                support@conceevhealth.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FAQ Shortcut ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 via-background to-secondary/20 border border-border rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
              Need Quick Answers?
            </h2>
            <p className="text-muted-foreground mb-6">
              Before contacting support, you may find answers in our Frequently Asked Questions
              section.
            </p>
            <Button className="rounded-full gap-2" asChild>
              <Link to="/faqs">
                Visit FAQ Page <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 7. Partnership CTA ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              Interested in Partnering With Conceev Health?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Doctors and hospitals can join our growing healthcare network to connect with patients
              looking for trusted treatment options.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="rounded-full gap-2" asChild>
              <Link to="/register-as-doctor">
                <Stethoscope className="h-4 w-4" /> Register as Doctor
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full gap-2" asChild>
              <Link to="/register-your-hospital">
                <Building2 className="h-4 w-4" /> Register Hospital
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 8. Final Help ───────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            We're Here to Help
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Whether you are looking for treatment information, hospital partnerships, or
            collaboration opportunities, the Conceev Health team is ready to assist you.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
