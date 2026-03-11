import { Link } from "react-router-dom";
import { FileText, Mail, Globe, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LAST_UPDATED = "March 2026";

const sections = [
  {
    id: "about",
    title: "1. About Conceev Health",
    content: (
      <>
        <p>
          Conceev Health is a healthcare facilitation platform that helps patients discover and access curated
          healthcare and surgical packages in specialties such as:
        </p>
        <ul>
          <li>Gynecology</li>
          <li>Maternity</li>
          <li>Fertility</li>
          <li>Related medical services</li>
        </ul>
        <p>
          Conceev Health connects patients with partner hospitals and doctors based on treatment requirements and
          location. Conceev Health acts as a facilitator between patients and healthcare providers.
        </p>
      </>
    ),
  },
  {
    id: "acceptance",
    title: "2. Acceptance of Terms",
    content: (
      <>
        <p>By accessing the Conceev Health website or services, you confirm that:</p>
        <ul>
          <li>You are at least 18 years old, or</li>
          <li>You are using the platform under the supervision of a parent or legal guardian.</li>
        </ul>
        <p>Your continued use of the platform constitutes acceptance of these Terms.</p>
      </>
    ),
  },
  {
    id: "services",
    title: "3. Services Provided",
    content: (
      <>
        <p>Conceev Health provides the following services:</p>
        <ul>
          <li>Healthcare package discovery</li>
          <li>Treatment guidance and consultation coordination</li>
          <li>Connecting patients with hospitals and doctors</li>
          <li>Patient coordination support</li>
          <li>Information about medical procedures and treatments</li>
        </ul>
        <p>Conceev Health does not provide medical treatment directly.</p>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "4. Platform Role Disclaimer",
    content: (
      <>
        <p>
          Conceev Health is <strong>not a healthcare provider</strong>. The platform acts solely as a facilitator
          that connects patients with independent hospitals and medical professionals.
        </p>
        <p>
          All medical advice, diagnosis, and treatment decisions are the responsibility of the doctor or hospital
          providing the care.
        </p>
        <p>Conceev Health is not responsible for:</p>
        <ul>
          <li>Medical outcomes</li>
          <li>Treatment decisions</li>
          <li>Hospital services</li>
          <li>Doctor consultations</li>
        </ul>
      </>
    ),
  },
  {
    id: "user-responsibilities",
    title: "5. User Responsibilities",
    content: (
      <>
        <p>Users agree to:</p>
        <ul>
          <li>Provide accurate and truthful information when submitting enquiries or registering</li>
          <li>Use the platform only for lawful purposes</li>
          <li>Not misuse the website or services</li>
        </ul>
        <p>Users must not:</p>
        <ul>
          <li>Submit false medical information</li>
          <li>Attempt unauthorized access to the platform</li>
          <li>Use the platform for fraudulent activities</li>
        </ul>
      </>
    ),
  },
  {
    id: "enquiries",
    title: "6. Patient Enquiries and Consultations",
    content: (
      <>
        <p>When a patient submits an enquiry:</p>
        <ul>
          <li>The information may be reviewed by Conceev Health patient coordinators.</li>
          <li>The enquiry may be shared with relevant partner hospitals or doctors.</li>
          <li>The hospital or doctor may contact the patient for consultation.</li>
        </ul>
        <p>
          Submission of an enquiry does not guarantee treatment availability or booking confirmation.
        </p>
      </>
    ),
  },
  {
    id: "packages",
    title: "7. Treatment Packages",
    content: (
      <>
        <p>Conceev Health may display curated treatment packages from partner hospitals. Package information may include:</p>
        <ul>
          <li>Procedure details</li>
          <li>Indicative pricing</li>
          <li>Hospital options</li>
          <li>Doctor profiles</li>
        </ul>
        <p>However:</p>
        <ul>
          <li>Actual pricing may vary</li>
          <li>Final treatment decisions are made by the hospital or doctor</li>
          <li>Package availability may change</li>
        </ul>
        <p>Conceev Health is not responsible for changes made by hospitals or healthcare providers.</p>
      </>
    ),
  },
  {
    id: "listings",
    title: "8. Doctor and Hospital Listings",
    content: (
      <>
        <p>Hospitals and doctors may register on the platform. To maintain quality standards:</p>
        <ul>
          <li>Profiles may undergo verification</li>
          <li>Conceev Health reserves the right to approve or reject listings</li>
        </ul>
        <p>Profiles that are not verified may not be displayed publicly on the platform.</p>
      </>
    ),
  },
  {
    id: "payments",
    title: "9. Payments",
    content: (
      <>
        <p>In some cases, payments may be processed through:</p>
        <ul>
          <li>Partner hospitals</li>
          <li>Third-party payment providers</li>
          <li>Financing partners</li>
        </ul>
        <p>
          Conceev Health may facilitate the payment process but does not directly control hospital billing or
          treatment charges unless specified.
        </p>
      </>
    ),
  },
  {
    id: "cancellation",
    title: "10. Cancellation and Refunds",
    content: (
      <>
        <p>Cancellation or refund policies depend on:</p>
        <ul>
          <li>The hospital providing the treatment</li>
          <li>The type of service booked</li>
        </ul>
        <p>Patients should review the hospital's specific policies before proceeding with treatment.</p>
        <p>Conceev Health is not responsible for refund disputes between patients and hospitals.</p>
      </>
    ),
  },
  {
    id: "privacy",
    title: "11. Privacy and Data Protection",
    content: (
      <>
        <p>
          Use of the platform is also governed by our{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>.
        </p>
        <p>
          By using Conceev Health services, users consent to the collection and sharing of information with
          hospitals and doctors as necessary to facilitate healthcare services.
        </p>
      </>
    ),
  },
  {
    id: "ip",
    title: "12. Intellectual Property",
    content: (
      <>
        <p>All content on the Conceev Health website including:</p>
        <ul>
          <li>Logos</li>
          <li>Graphics</li>
          <li>Text</li>
          <li>Images</li>
          <li>Website design</li>
        </ul>
        <p>are the property of Conceev Health and may not be reproduced without permission.</p>
      </>
    ),
  },
  {
    id: "third-party",
    title: "13. Third-Party Services",
    content: (
      <>
        <p>The Conceev Health platform may include links to third-party services including:</p>
        <ul>
          <li>Hospitals</li>
          <li>Doctors</li>
          <li>Diagnostic centers</li>
          <li>Payment gateways</li>
        </ul>
        <p>Conceev Health does not control or guarantee services provided by third-party entities.</p>
      </>
    ),
  },
  {
    id: "liability",
    title: "14. Limitation of Liability",
    content: (
      <>
        <p>To the fullest extent permitted by law, Conceev Health shall not be liable for:</p>
        <ul>
          <li>Medical negligence by healthcare providers</li>
          <li>Treatment outcomes</li>
          <li>Hospital service quality</li>
          <li>Delays or cancellations by hospitals</li>
          <li>Financial disputes between patients and hospitals</li>
        </ul>
        <p>
          Users agree that Conceev Health's role is limited to facilitating connections between patients and
          healthcare providers.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "15. Suspension or Termination of Access",
    content: (
      <>
        <p>Conceev Health reserves the right to suspend or terminate access to the platform if:</p>
        <ul>
          <li>A user violates these Terms</li>
          <li>Fraudulent activity is detected</li>
          <li>Misuse of services occurs</li>
        </ul>
      </>
    ),
  },
  {
    id: "changes",
    title: "16. Changes to Terms",
    content: (
      <>
        <p>Conceev Health may update these Terms periodically.</p>
        <p>
          Changes will be posted on the website with an updated revision date. Continued use of the platform
          after updates indicates acceptance of the revised Terms.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "17. Governing Law",
    content: (
      <>
        <p>
          These Terms shall be governed by and interpreted in accordance with the laws of India. Any disputes
          arising from the use of the platform shall be subject to the jurisdiction of courts located in
          Hyderabad / Bangalore.
        </p>
      </>
    ),
  },
];

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-rose-50/30 pt-24 pb-14 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Terms & Conditions</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-3">
                Terms &amp; Conditions
              </h1>
              <p className="text-muted-foreground text-base max-w-2xl">
                Welcome to Conceev Health. These Terms and Conditions govern your use of the Conceev Health
                website, platform, and services. By accessing or using our platform, you agree to comply with
                these Terms.
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
          {/* Main content */}
          <article className="prose prose-slate max-w-none
            prose-headings:font-serif prose-headings:text-foreground
            prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
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

            {/* Section 18 — Contact */}
            <section id="contact" className="scroll-mt-24">
              <h2>18. Contact Information</h2>
              <p>
                For questions regarding these Terms &amp; Conditions, please contact:
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

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
