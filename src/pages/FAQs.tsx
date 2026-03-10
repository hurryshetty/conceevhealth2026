import { useState, useMemo } from "react";
import { Search, MessageCircle, Phone, Mail, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── FAQ Data ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "General",
  "Patient & Treatment",
  "Packages & Pricing",
  "Doctors & Hospitals",
  "Doctor Partnership",
  "Hospital Partnership",
  "Safety & Privacy",
] as const;

type Category = (typeof CATEGORIES)[number];

interface FAQ {
  q: string;
  a: string;
  category: Category;
}

const FAQS: FAQ[] = [
  // ── General ──
  {
    category: "General",
    q: "What is Conceev Health?",
    a: "Conceev Health is a healthcare platform that connects patients with trusted hospitals and doctors for specialized treatments in gynecology, maternity, and fertility. The platform helps patients discover affordable surgical packages and guides them through their treatment journey.",
  },
  {
    category: "General",
    q: "How does Conceev Health work?",
    a: "Patients can explore treatment options on Conceev Health and submit an enquiry for consultation. Our care team reviews the request and connects the patient with suitable doctors and hospitals based on location, specialty, and treatment requirements.",
  },
  {
    category: "General",
    q: "Is Conceev Health a hospital?",
    a: "No. Conceev Health is not a hospital. It is a healthcare coordination platform that works with partner hospitals and experienced doctors to help patients find suitable treatments.",
  },
  {
    category: "General",
    q: "Which specialties does Conceev Health focus on?",
    a: "Currently, Conceev Health focuses on women's healthcare specialties including Gynecology, Maternity, and Fertility treatments.",
  },
  {
    category: "General",
    q: "Which cities does Conceev Health operate in?",
    a: "Conceev Health initially operates in cities like Hyderabad and Bangalore and aims to expand to more locations across India.",
  },

  // ── Patient & Treatment ──
  {
    category: "Patient & Treatment",
    q: "How do I book a consultation?",
    a: "You can book a consultation by submitting an enquiry form on the Conceev Health website. Our team will contact you to understand your concerns and connect you with the appropriate doctor or hospital.",
  },
  {
    category: "Patient & Treatment",
    q: "Do I need a referral to consult a doctor?",
    a: "No referral is required. Patients can directly request a consultation through the platform.",
  },
  {
    category: "Patient & Treatment",
    q: "Can I choose the hospital or doctor?",
    a: "Yes. Our team will suggest suitable hospitals and doctors, but patients can discuss preferences during the consultation process.",
  },
  {
    category: "Patient & Treatment",
    q: "What types of treatments are available?",
    a: "Treatments include services related to fertility treatments such as IVF and IUI, gynecological surgeries, pregnancy and maternity care, and women's reproductive health treatments.",
  },
  {
    category: "Patient & Treatment",
    q: "Will Conceev Health assist during the treatment process?",
    a: "Yes. Conceev Health patient coordinators assist with appointment scheduling, understanding treatment options, coordination with hospitals, and follow-up support.",
  },

  // ── Packages & Pricing ──
  {
    category: "Packages & Pricing",
    q: "What are treatment packages?",
    a: "Treatment packages are structured healthcare plans that include consultation, procedures, and hospital services related to specific treatments.",
  },
  {
    category: "Packages & Pricing",
    q: "Are packages affordable?",
    a: "Conceev Health works with partner hospitals to offer competitive and transparent treatment packages so patients can access quality healthcare at reasonable costs.",
  },
  {
    category: "Packages & Pricing",
    q: "Will I know the treatment cost before proceeding?",
    a: "Yes. Our team will explain the treatment package and estimated cost before you proceed with the treatment.",
  },
  {
    category: "Packages & Pricing",
    q: "Are there hidden charges?",
    a: "Conceev Health aims to maintain transparency in treatment packages. However, certain medical conditions or additional procedures may involve extra costs, which will be explained beforehand.",
  },

  // ── Doctors & Hospitals ──
  {
    category: "Doctors & Hospitals",
    q: "Are the doctors verified?",
    a: "Yes. Doctors listed on Conceev Health go through a verification process that checks qualifications, experience, and specialization before their profiles are approved.",
  },
  {
    category: "Doctors & Hospitals",
    q: "How are hospitals selected?",
    a: "Hospitals are selected based on factors such as infrastructure and facilities, doctor expertise, patient care standards, and treatment experience.",
  },
  {
    category: "Doctors & Hospitals",
    q: "Can I see doctor profiles before consultation?",
    a: "Yes. Patients can view doctor profiles including specialization, experience, and associated hospitals.",
  },
  {
    category: "Doctors & Hospitals",
    q: "Do all treatments happen at partner hospitals?",
    a: "Yes. Treatments are carried out at trusted partner hospitals associated with Conceev Health.",
  },

  // ── Doctor Partnership ──
  {
    category: "Doctor Partnership",
    q: "How can doctors join Conceev Health?",
    a: "Doctors can register through the Doctor Registration page on the Conceev Health website by submitting their professional details and credentials.",
  },
  {
    category: "Doctor Partnership",
    q: "What is the verification process for doctors?",
    a: "The Conceev Health team reviews the doctor's qualifications, medical registration details, and experience before approving the profile.",
  },
  {
    category: "Doctor Partnership",
    q: "Do doctors receive patient referrals?",
    a: "Yes. Doctors who join Conceev Health may receive consultation opportunities based on their specialization, location, and treatment relevance.",
  },
  {
    category: "Doctor Partnership",
    q: "Is there any cost for doctors to register?",
    a: "Registration details may vary depending on partnership models. Doctors can discuss collaboration terms with the Conceev Health partnership team.",
  },

  // ── Hospital Partnership ──
  {
    category: "Hospital Partnership",
    q: "How can hospitals partner with Conceev Health?",
    a: "Hospitals can apply through the Hospital Registration page on the Conceev Health website by submitting hospital details and specialties offered.",
  },
  {
    category: "Hospital Partnership",
    q: "What is the hospital verification process?",
    a: "The Conceev Health team evaluates hospital infrastructure, doctor expertise, treatment specialties, and patient care standards before onboarding.",
  },
  {
    category: "Hospital Partnership",
    q: "Will hospitals receive patient referrals?",
    a: "Yes. Partner hospitals may receive patients who are seeking treatments offered by their specialists and facilities.",
  },
  {
    category: "Hospital Partnership",
    q: "How are treatment packages structured?",
    a: "Treatment packages are designed collaboratively with partner hospitals to ensure transparency and affordability for patients.",
  },

  // ── Safety & Privacy ──
  {
    category: "Safety & Privacy",
    q: "Is my personal information secure?",
    a: "Yes. Conceev Health takes privacy seriously and ensures that patient information is handled securely and shared only with relevant healthcare providers.",
  },
  {
    category: "Safety & Privacy",
    q: "Will my medical details remain confidential?",
    a: "Yes. Patient medical details are treated confidentially and shared only with doctors or hospitals involved in the treatment process.",
  },
  {
    category: "Safety & Privacy",
    q: "Can I request deletion of my data?",
    a: "Yes. Patients can contact the Conceev Health support team to request removal of their data from the system.",
  },
];

// ─── FAQ Page ──────────────────────────────────────────────────────────────────

const FAQs = () => {
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return FAQS.filter((f) => {
      const matchesCategory = activeCategory === "All" || f.category === activeCategory;
      const matchesSearch =
        !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  // Group filtered by category for display
  const grouped = useMemo(() => {
    const map = new Map<Category, FAQ[]>();
    for (const f of filtered) {
      if (!map.has(f.category)) map.set(f.category, []);
      map.get(f.category)!.push(f);
    }
    return map;
  }, [filtered]);

  const tabs: (Category | "All")[] = ["All", ...CATEGORIES];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Find answers to common questions about Conceev Health, treatments, doctor
            consultations, and hospital partnerships.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your question…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-10 h-12 rounded-full text-sm shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 md:py-14">
        {/* ── Category Tabs ─────────────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap mb-10 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveCategory(tab)}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                activeCategory === tab
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── FAQ Content ───────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No questions match your search.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-full"
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
            >
              Clear Search
            </Button>
          </div>
        ) : activeCategory === "All" && !search ? (
          /* Show all categories grouped */
          <div className="space-y-10 max-w-3xl mx-auto">
            {CATEGORIES.map((cat) => {
              const items = grouped.get(cat);
              if (!items || items.length === 0) return null;
              return (
                <div key={cat}>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
                    {cat}
                  </h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {items.map((f, i) => (
                      <AccordionItem
                        key={i}
                        value={`${cat}-${i}`}
                        className="bg-card border border-border rounded-xl px-5 data-[state=open]:border-primary/30 transition-colors"
                      >
                        <AccordionTrigger className="text-sm font-semibold text-foreground text-left hover:no-underline py-4">
                          {f.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                          {f.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              );
            })}
          </div>
        ) : (
          /* Flat list for filtered / single category */
          <div className="max-w-3xl mx-auto">
            {activeCategory !== "All" && (
              <h2 className="font-serif text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
                {activeCategory}
              </h2>
            )}
            <Accordion type="single" collapsible className="space-y-2">
              {filtered.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-card border border-border rounded-xl px-5 data-[state=open]:border-primary/30 transition-colors"
                >
                  <AccordionTrigger className="text-sm font-semibold text-foreground text-left hover:no-underline py-4">
                    {f.q}
                    {activeCategory === "All" && (
                      <span className="ml-auto mr-3 text-[10px] font-normal bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full shrink-0">
                        {f.category}
                      </span>
                    )}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* ── Contact Support ───────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/20 border border-border rounded-2xl p-8 text-center">
            <MessageCircle className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
              Still Have Questions?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              If you couldn't find the answer you were looking for, our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:support@conceevhealth.com"
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                support@conceevhealth.com
              </a>
              <span className="hidden sm:block text-muted-foreground">·</span>
              <a
                href="tel:+91XXXXXXXXXX"
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                +91 XXXXX XXXXX
              </a>
            </div>
            <div className="mt-6">
              <Button className="rounded-full" asChild>
                <a href="#contact">Book a Consultation</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQs;
