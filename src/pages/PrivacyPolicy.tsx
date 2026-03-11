import { Link } from "react-router-dom";
import { Shield, Mail, Phone, Globe, ChevronRight } from "lucide-react";
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
          Welcome to <strong>Conceev Health</strong>.
        </p>
        <p>
          Conceev Health ("Conceev", "we", "our", or "us") operates a healthcare facilitation platform that helps
          patients discover, compare, and access curated healthcare and surgical packages in specialties such as
          Gynecology, Maternity, Fertility, and related services through partnered hospitals and doctors.
        </p>
        <p>
          Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard
          your information when you visit our website, use our services, or interact with us.
        </p>
        <p>
          By accessing or using Conceev Health's website or services, you agree to the collection and use of
          information in accordance with this policy.
        </p>
      </>
    ),
  },
  {
    id: "scope",
    title: "2. Scope of This Policy",
    content: (
      <>
        <p>This Privacy Policy applies to:</p>
        <ul>
          <li>Visitors of the Conceev Health website</li>
          <li>Patients submitting enquiries or booking consultations</li>
          <li>Doctors and hospitals registering on the platform</li>
          <li>Users interacting with our services via phone, email, or digital platforms</li>
        </ul>
      </>
    ),
  },
  {
    id: "information-collected",
    title: "3. Information We Collect",
    content: (
      <>
        <p>We may collect the following types of information.</p>

        <h3>3.1 Personal Information</h3>
        <p>Information that identifies you as an individual. Examples include:</p>
        <ul>
          <li>Name</li>
          <li>Phone number</li>
          <li>Email address</li>
          <li>Age / Date of birth</li>
          <li>Gender</li>
          <li>City / Location</li>
          <li>Address</li>
        </ul>

        <h3>3.2 Health-Related Information (Sensitive Personal Data)</h3>
        <p>
          Since Conceev Health facilitates medical treatments and surgical packages, we may collect health-related
          information including:
        </p>
        <ul>
          <li>Medical condition or treatment requirement</li>
          <li>Surgery interest or specialty enquiry</li>
          <li>Fertility or maternity related information</li>
          <li>Previous medical reports (if voluntarily shared)</li>
          <li>Diagnostic reports or prescriptions</li>
        </ul>
        <p>This information is collected only to help connect you with the appropriate healthcare provider.</p>

        <h3>3.3 Technical Information</h3>
        <p>When you use our website, we may automatically collect:</p>
        <ul>
          <li>IP address</li>
          <li>Browser type</li>
          <li>Device information</li>
          <li>Operating system</li>
          <li>Access times</li>
          <li>Pages visited</li>
          <li>Website interaction data</li>
        </ul>

        <h3>3.4 Communication Data</h3>
        <p>Information collected through:</p>
        <ul>
          <li>Enquiry forms</li>
          <li>WhatsApp conversations</li>
          <li>Phone calls</li>
          <li>Emails</li>
          <li>Appointment booking requests</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "4. How We Use Your Information",
    content: (
      <>
        <p>We use the information collected for the following purposes.</p>

        <h3>4.1 Service Delivery</h3>
        <ul>
          <li>Connect patients with relevant hospitals and doctors</li>
          <li>Facilitate consultation or surgery bookings</li>
          <li>Assist in treatment coordination</li>
          <li>Provide curated surgical packages</li>
        </ul>

        <h3>4.2 Communication</h3>
        <p>We may contact you to:</p>
        <ul>
          <li>Respond to enquiries</li>
          <li>Schedule consultations</li>
          <li>Provide treatment guidance</li>
          <li>Share appointment details</li>
          <li>Update you regarding healthcare services</li>
        </ul>

        <h3>4.3 Platform Improvement</h3>
        <p>Information may be used to:</p>
        <ul>
          <li>Improve website functionality</li>
          <li>Analyse user behavior</li>
          <li>Enhance platform experience</li>
          <li>Develop better healthcare services</li>
        </ul>

        <h3>4.4 Marketing &amp; Updates</h3>
        <p>We may send:</p>
        <ul>
          <li>Healthcare awareness information</li>
          <li>Service updates</li>
          <li>Promotional offers</li>
          <li>Relevant treatment packages</li>
        </ul>
        <p>Users may opt out of marketing communications anytime.</p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "5. Sharing of Information",
    content: (
      <>
        <p>Conceev Health may share your information with trusted partners only when necessary to deliver services.</p>

        <h3>5.1 Hospitals and Doctors</h3>
        <p>Your enquiry information may be shared with partnered hospitals, healthcare providers, and medical specialists to review your case, provide consultation, and coordinate treatment.</p>

        <h3>5.2 Patient Coordinators</h3>
        <p>Conceev Health Patient Coordinators may access your information to assist you in treatment selection, coordinate between hospital and patient, and guide you throughout the process.</p>

        <h3>5.3 Diagnostic &amp; Healthcare Service Partners</h3>
        <p>We may share information with diagnostic centers, labs, and treatment partners only when required for healthcare facilitation.</p>

        <h3>5.4 Payment or Financing Partners</h3>
        <p>If you opt for financing or payment assistance, information may be shared with payment gateways, EMI providers, and insurance partners.</p>

        <h3>5.5 Legal Authorities</h3>
        <p>We may disclose information if required by law, by government authorities, or to protect legal rights.</p>
      </>
    ),
  },
  {
    id: "security",
    title: "6. Data Security",
    content: (
      <>
        <p>
          We implement reasonable administrative, technical, and physical safeguards to protect your personal
          information.
        </p>
        <p>Security measures include:</p>
        <ul>
          <li>Restricted data access</li>
          <li>Secure servers</li>
          <li>Encrypted communication where applicable</li>
          <li>Internal access controls</li>
        </ul>
        <p>However, no internet transmission can be guaranteed to be completely secure.</p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "7. Cookies and Tracking Technologies",
    content: (
      <>
        <p>Our website may use cookies and tracking tools to:</p>
        <ul>
          <li>Improve website performance</li>
          <li>Analyse traffic</li>
          <li>Personalise user experience</li>
        </ul>
        <p>
          Users may disable cookies in their browser settings, though certain website features may be affected.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "8. Data Retention",
    content: (
      <>
        <p>We retain personal information only as long as necessary for:</p>
        <ul>
          <li>Service delivery</li>
          <li>Legal compliance</li>
          <li>Operational requirements</li>
        </ul>
        <p>After this period, data may be securely deleted or anonymised.</p>
      </>
    ),
  },
  {
    id: "user-rights",
    title: "9. User Rights",
    content: (
      <>
        <p>Under applicable data protection laws, users may have the right to:</p>
        <ul>
          <li>Request access to their personal data</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of personal data</li>
          <li>Withdraw consent for data processing</li>
        </ul>
        <p>
          Requests can be made by contacting us at the details provided in Section 14.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "10. Children's Privacy",
    content: (
      <>
        <p>Our services are not directed toward individuals under 18 years of age.</p>
        <p>If a minor's information is submitted, it must be done by a parent or legal guardian.</p>
      </>
    ),
  },
  {
    id: "third-party",
    title: "11. Third-Party Links",
    content: (
      <>
        <p>
          Our website may contain links to third-party websites, including hospitals or service partners. We are not
          responsible for the privacy practices of those external websites.
        </p>
        <p>Users are encouraged to review their privacy policies separately.</p>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "12. Platform Disclaimer",
    content: (
      <>
        <p>Conceev Health does not provide medical advice or treatment.</p>
        <p>
          We act solely as a facilitator connecting patients with healthcare providers. All medical services are
          provided directly by hospitals and doctors, who are responsible for treatment decisions.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "13. Changes to This Privacy Policy",
    content: (
      <>
        <p>Conceev Health may update this Privacy Policy periodically.</p>
        <p>
          Updated policies will be posted on our website with the latest revision date. Users are encouraged to
          review this page regularly.
        </p>
      </>
    ),
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-rose-50/30 pt-24 pb-14 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Privacy Policy</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-3">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground text-base">
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
                14. Contact Us
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

            {/* Section 14 — Contact */}
            <section id="contact" className="scroll-mt-24">
              <h2>14. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or how your information is handled, please
                contact us.
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

export default PrivacyPolicy;
