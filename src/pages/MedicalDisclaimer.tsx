import { Link } from "react-router-dom";
import { AlertTriangle, Mail, Globe, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LAST_UPDATED = "March 2026";

const sections = [
  {
    id: "general",
    title: "1. General Information",
    content: (
      <>
        <p>
          The information provided on the Conceev Health website and associated platforms is for general
          informational and educational purposes only.
        </p>
        <p>
          Conceev Health operates as a healthcare facilitation platform that connects patients with partnered
          hospitals, doctors, and healthcare providers offering medical services.
        </p>
        <p>
          The content available on the website, including text, graphics, treatment information, and healthcare
          packages, is intended to help users understand healthcare options and make informed decisions.
        </p>
        <p>
          It should <strong>not</strong> be considered medical advice, diagnosis, or treatment.
        </p>
      </>
    ),
  },
  {
    id: "no-medical-advice",
    title: "2. No Medical Advice",
    content: (
      <>
        <p>Conceev Health does not provide medical advice.</p>
        <p>
          All medical decisions, diagnoses, and treatment plans should be made only by qualified healthcare
          professionals, including doctors and hospitals.
        </p>
        <p>Users should always seek professional medical advice before:</p>
        <ul>
          <li>Starting any medical treatment</li>
          <li>Undergoing surgery</li>
          <li>Changing medications</li>
          <li>Making healthcare decisions</li>
        </ul>
        <p>
          Do not disregard professional medical advice or delay seeking treatment because of information found
          on this website.
        </p>
      </>
    ),
  },
  {
    id: "platform-role",
    title: "3. Platform Role",
    content: (
      <>
        <p>
          Conceev Health is <strong>not</strong> a hospital, clinic, diagnostic center, or healthcare provider.
        </p>
        <p>
          The platform acts solely as a facilitator that connects patients with independent hospitals and
          doctors. Our role may include:
        </p>
        <ul>
          <li>Providing information about treatment options</li>
          <li>Helping patients connect with hospitals and specialists</li>
          <li>Assisting with appointment scheduling</li>
          <li>Coordinating patient support services</li>
        </ul>
        <p>All medical services are delivered directly by healthcare providers.</p>
      </>
    ),
  },
  {
    id: "provider-responsibility",
    title: "4. Doctor and Hospital Responsibility",
    content: (
      <>
        <p>Doctors, hospitals, and healthcare providers listed on the platform are independent entities.</p>
        <p>They are solely responsible for:</p>
        <ul>
          <li>Medical consultations</li>
          <li>Diagnosis and treatment</li>
          <li>Surgical procedures</li>
          <li>Post-treatment care</li>
          <li>Clinical outcomes</li>
        </ul>
        <p>Conceev Health does not control or influence medical decisions made by healthcare providers.</p>
      </>
    ),
  },
  {
    id: "outcomes",
    title: "5. Treatment Outcomes",
    content: (
      <>
        <p>Medical outcomes can vary from patient to patient.</p>
        <p>Conceev Health does not guarantee:</p>
        <ul>
          <li>Treatment success</li>
          <li>Surgical results</li>
          <li>Recovery timelines</li>
          <li>Medical outcomes</li>
        </ul>
        <p>
          All risks associated with medical procedures should be discussed directly with the treating doctor
          or hospital.
        </p>
      </>
    ),
  },
  {
    id: "packages-pricing",
    title: "6. Treatment Packages and Pricing",
    content: (
      <>
        <p>
          Treatment packages displayed on the Conceev Health platform are intended to provide general
          information and indicative pricing.
        </p>
        <p>Actual treatment costs may vary depending on:</p>
        <ul>
          <li>Patient medical condition</li>
          <li>Hospital policies</li>
          <li>Doctor recommendations</li>
          <li>Additional diagnostic tests or procedures</li>
        </ul>
        <p>Final pricing and treatment plans will be determined by the hospital or healthcare provider.</p>
      </>
    ),
  },
  {
    id: "emergency",
    title: "7. Emergency Situations",
    content: (
      <>
        <p>
          The Conceev Health platform is <strong>not intended for emergency medical situations</strong>.
        </p>
        <p>If you are experiencing a medical emergency, please immediately contact:</p>
        <ul>
          <li>Your nearest hospital</li>
          <li>Emergency medical services</li>
          <li>A licensed healthcare professional</li>
        </ul>
        <p>Do not rely on the Conceev Health website for emergency medical assistance.</p>
      </>
    ),
  },
  {
    id: "external-links",
    title: "8. External Links and Third-Party Services",
    content: (
      <>
        <p>
          The website may contain links to third-party websites or services including hospitals, diagnostic
          centers, and healthcare partners.
        </p>
        <p>
          Conceev Health does not control or guarantee the accuracy, safety, or reliability of information on
          external websites. Users should review the policies of those third-party services independently.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "9. Limitation of Liability",
    content: (
      <>
        <p>To the fullest extent permitted by law, Conceev Health shall not be held responsible for:</p>
        <ul>
          <li>Medical advice provided by healthcare professionals</li>
          <li>Treatment decisions made by doctors or hospitals</li>
          <li>Clinical outcomes of procedures</li>
          <li>Complications arising from medical treatments</li>
          <li>Healthcare provider performance</li>
        </ul>
        <p>
          By using the platform, users acknowledge that Conceev Health's role is limited to facilitating
          connections between patients and healthcare providers.
        </p>
      </>
    ),
  },
  {
    id: "user-responsibility",
    title: "10. User Responsibility",
    content: (
      <>
        <p>Users are responsible for:</p>
        <ul>
          <li>Verifying hospital and doctor information</li>
          <li>Discussing treatment options directly with healthcare providers</li>
          <li>Understanding risks associated with medical procedures</li>
        </ul>
        <p>
          Conceev Health encourages patients to make well-informed healthcare decisions in consultation with
          qualified professionals.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "11. Changes to This Disclaimer",
    content: (
      <>
        <p>
          Conceev Health reserves the right to update or modify this Medical Disclaimer at any time. Updates
          will be posted on this page with the revised date.
        </p>
      </>
    ),
  },
];

const MedicalDisclaimer = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-amber-50/60 via-background to-rose-50/30 pt-24 pb-14 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Medical Disclaimer</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 mt-1">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-3">
                Medical Disclaimer
              </h1>
              <p className="text-muted-foreground text-base max-w-2xl">
                Please read this disclaimer carefully before using the Conceev Health platform or relying on
                any information presented on this website.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Last Updated: <span className="font-medium text-foreground">{LAST_UPDATED}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Notice Banner ─────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Important:</strong> This website does not provide medical advice. The information on this
            platform is for informational purposes only. Always consult a qualified healthcare professional
            for medical decisions.
          </p>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="grid lg:grid-cols-[240px_1fr] gap-12 items-start">

          {/* Sticky sidebar TOC */}
          <aside className="hidden lg:block sticky top-24">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Contents
            </p>
            <nav className="space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors py-0.5 leading-snug"
                >
                  {s.title}
                </a>
              ))}
              <a
                href="#contact"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors py-0.5 leading-snug"
              >
                12. Contact Us
              </a>
            </nav>
          </aside>

          {/* Main content */}
          <article className="prose prose-slate max-w-none
            prose-headings:font-serif prose-headings:text-foreground
            prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-3
            prose-ul:text-muted-foreground prose-ul:my-3 prose-ul:space-y-1
            prose-li:leading-relaxed
            prose-strong:text-foreground
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline">

            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2>{s.title}</h2>
                {s.content}
              </section>
            ))}

            {/* Section 12 — Contact */}
            <section id="contact" className="scroll-mt-24">
              <h2>12. Contact Us</h2>
              <p>
                If you have questions regarding this Medical Disclaimer, please contact:
              </p>
              <div className="not-prose mt-6 rounded-2xl border border-border bg-secondary/40 p-6 space-y-4">
                <p className="font-serif text-lg font-semibold text-foreground">Conceev Health</p>
                <div className="space-y-3">
                  <a
                    href="mailto:support@conceevhealth.com"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                    </span>
                    support@conceevhealth.com
                  </a>
                  <a
                    href="https://www.conceevhealth.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Globe className="h-3.5 w-3.5 text-primary" />
                    </span>
                    www.conceevhealth.com
                  </a>
                </div>
              </div>
            </section>

          </article>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MedicalDisclaimer;
