import { Link } from "react-router-dom";
import { RefreshCw, Mail, Globe, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LAST_UPDATED = "March 2026";

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: (
      <>
        <p>
          This Refund &amp; Cancellation Policy outlines the terms under which cancellations and refunds may
          be processed for services facilitated through Conceev Health.
        </p>
        <p>
          Conceev Health operates as a healthcare facilitation platform that connects patients with partnered
          hospitals and healthcare providers offering medical consultations, procedures, and treatment packages.
        </p>
        <p>By using Conceev Health services, you agree to the terms described in this policy.</p>
      </>
    ),
  },
  {
    id: "role",
    title: "2. Role of Conceev Health",
    content: (
      <>
        <p>Conceev Health acts solely as a facilitator connecting patients with hospitals and doctors.</p>
        <p>
          Medical services, consultations, procedures, and surgeries are provided directly by the healthcare
          provider. Therefore:
        </p>
        <ul>
          <li>
            Refunds related to medical procedures are subject to the policies of the respective hospital or
            healthcare provider.
          </li>
          <li>
            Conceev Health may assist in coordinating refund or cancellation requests but does not control
            hospital refund decisions unless otherwise specified.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "consultation-cancellation",
    title: "3. Consultation Cancellation",
    content: (
      <>
        <p>If a patient wishes to cancel a consultation arranged through Conceev Health:</p>
        <ul>
          <li>The cancellation request must be made prior to the scheduled appointment time.</li>
          <li>Rescheduling may be allowed depending on the availability of the hospital or doctor.</li>
        </ul>
        <p>In most cases, consultation fees (if any) may be:</p>
        <ul>
          <li>Adjusted for rescheduling, or</li>
          <li>Refunded based on the hospital's cancellation policy.</li>
        </ul>
      </>
    ),
  },
  {
    id: "surgery-cancellation",
    title: "4. Surgery or Treatment Package Cancellation",
    content: (
      <>
        <p>If a patient cancels a surgery or treatment package booking, refund eligibility will depend on:</p>
        <ul>
          <li>Hospital policies</li>
          <li>Stage of treatment process</li>
          <li>Diagnostic tests already conducted</li>
          <li>Administrative charges</li>
        </ul>

        <h3>Before Hospital Admission</h3>
        <p>Patients may be eligible for:</p>
        <ul>
          <li>Full refund, or</li>
          <li>Partial refund after deducting administrative costs.</li>
        </ul>

        <h3>After Diagnostic Tests or Pre-Surgery Procedures</h3>
        <p>Certain costs related to the following may not be refundable:</p>
        <ul>
          <li>Lab tests</li>
          <li>Diagnostics</li>
          <li>Hospital booking charges</li>
        </ul>

        <h3>After Hospital Admission or Procedure Initiation</h3>
        <p>Refunds may not be applicable once the treatment process has begun.</p>
      </>
    ),
  },
  {
    id: "refund-processing",
    title: "5. Refund Processing",
    content: (
      <>
        <p>If a refund is approved by the hospital or healthcare provider:</p>
        <ul>
          <li>Conceev Health will assist in coordinating the refund process.</li>
          <li>Refunds will be processed through the original payment method whenever possible.</li>
        </ul>
        <p>
          Refund processing timelines may vary but generally take{" "}
          <strong>7 to 15 business days</strong> depending on the payment provider and hospital processing
          time.
        </p>
      </>
    ),
  },
  {
    id: "gateway-charges",
    title: "6. Payment Gateway Charges",
    content: (
      <>
        <p>If payments are made through payment gateways or digital payment platforms, transaction processing fees charged by these providers may be non-refundable.</p>
      </>
    ),
  },
  {
    id: "hospital-cancellation",
    title: "7. Cancellation by Hospital or Doctor",
    content: (
      <>
        <p>
          In rare circumstances where a hospital or doctor cancels a consultation or treatment due to doctor
          unavailability, medical reasons, or operational constraints, patients may be offered:
        </p>
        <ul>
          <li>Rescheduling options, or</li>
          <li>A refund depending on the situation.</li>
        </ul>
        <p>
          Conceev Health will assist in coordinating alternative hospitals or doctors if required.
        </p>
      </>
    ),
  },
  {
    id: "non-refundable",
    title: "8. Non-Refundable Situations",
    content: (
      <>
        <p>Refunds may not be applicable in situations including but not limited to:</p>
        <ul>
          <li>Failure of the patient to attend the scheduled consultation</li>
          <li>Incomplete medical documentation provided by the patient</li>
          <li>Cancellation after treatment has started</li>
          <li>Non-compliance with hospital admission procedures</li>
        </ul>
      </>
    ),
  },
  {
    id: "request-process",
    title: "9. Refund Request Process",
    content: (
      <>
        <p>To request a cancellation or refund, patients should contact Conceev Health through email, phone, or our customer support channels.</p>
        <p>Please include the following details:</p>
        <ul>
          <li>Patient name</li>
          <li>Contact number</li>
          <li>Appointment or treatment details</li>
          <li>Reason for cancellation</li>
        </ul>
        <p>Our patient coordination team will assist in reviewing the request with the concerned hospital.</p>
      </>
    ),
  },
  {
    id: "policy-changes",
    title: "10. Policy Changes",
    content: (
      <>
        <p>
          Conceev Health reserves the right to modify this Refund &amp; Cancellation Policy at any time. Any
          updates will be published on this page with the updated revision date.
        </p>
      </>
    ),
  },
];

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-rose-50/30 pt-24 pb-14 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Refund &amp; Cancellation Policy</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
              <RefreshCw className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-3">
                Refund &amp; Cancellation Policy
              </h1>
              <p className="text-muted-foreground text-base max-w-2xl">
                This policy outlines the terms under which cancellations and refunds may be processed for
                services facilitated through Conceev Health.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Last Updated: <span className="font-medium text-foreground">{LAST_UPDATED}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
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
                11. Contact Us
              </a>
            </nav>
          </aside>

          {/* Main content */}
          <article className="prose prose-slate max-w-none
            prose-headings:font-serif prose-headings:text-foreground
            prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
            prose-h3:text-base prose-h3:font-semibold prose-h3:text-foreground prose-h3:mt-6 prose-h3:mb-2
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

            {/* Section 11 — Contact */}
            <section id="contact" className="scroll-mt-24">
              <h2>11. Contact Us</h2>
              <p>For refund or cancellation requests, please contact:</p>
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

export default RefundPolicy;
