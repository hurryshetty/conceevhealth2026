import { useCallback, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Seo from "@/components/Seo";
import { SITE } from "@/config/site";
import LeadFormModal from "@/components/LeadFormModal";
import SiteHeader from "@/components/homepage/SiteHeader";
import Hero from "@/components/homepage/Hero";
import HealthcareSearch from "@/components/homepage/HealthcareSearch";
import ExploreHealthcare from "@/components/homepage/ExploreHealthcare";
import FeaturedDoctors from "@/components/homepage/FeaturedDoctors";
import FeaturedHospitals from "@/components/homepage/FeaturedHospitals";
import HealthPackages from "@/components/homepage/HealthPackages";
import {
  HealthcareJourney,
  HealthInsights,
  PatientStories,
  WhyConceev,
} from "@/components/homepage/BrandSections";
import SiteFooter, { FinalCta } from "@/components/homepage/SiteFooter";

/**
 * Conceev Health homepage — 2026 redesign.
 *
 * Runs on the Conceev Digital palette (black / Conceev red / off-white, with
 * green and blue as controlled accents) and the brand type face, both scoped to
 * this page via the `conceev-2026` class and the `conceev-*` Tailwind scale.
 * The global design tokens are untouched, so the other 30-plus pages, the admin
 * console and the role dashboards keep their current styling.
 *
 * Every doctor, hospital, speciality and package rendered here is live Supabase
 * data. Editorial copy lives in src/data/homepageContent.ts, not in components.
 */

const HomepageRedesign = () => {
  const [leadOpen, setLeadOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const doctorsRef = useRef<HTMLDivElement>(null);

  // While this is served from a preview path it must not be indexed, and must
  // not claim "/" as its canonical. Promoting it to the root route clears both.
  const { pathname } = useLocation();
  const isLive = pathname === "/";

  const scrollTo = useCallback((node: HTMLElement | null) => {
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const focusSearch = useCallback(() => {
    scrollTo(searchRef.current);
    // Wait for the smooth scroll to settle before taking focus.
    window.setTimeout(() => {
      document.getElementById("healthcare-search")?.focus();
    }, 420);
  }, [scrollTo]);

  return (
    <div className="conceev-2026 min-h-screen bg-white font-brand antialiased">
      <Seo
        title="Conceev Health — Find Trusted Doctors, Hospitals & Treatments in India"
        description="Discover verified doctors, hospitals, treatments and health packages across Bangalore and Hyderabad. Transparent information, convenient booking and a care team that stays with you."
        canonicalPath={isLive ? "/" : pathname}
        noIndex={!isLive}
        keywords={[
          "find doctors india",
          "trusted hospitals bangalore",
          "health packages hyderabad",
          "fertility specialists",
          "book doctor appointment",
        ]}
        ogTitle="Better healthcare starts with better choices | Conceev Health"
        ogDescription="Discover trusted doctors, hospitals, treatments and healthcare services — all in one simple experience."
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "MedicalOrganization",
            name: SITE.name,
            url: SITE.origin,
            email: SITE.supportEmail,
            telephone: SITE.phoneNumber,
            areaServed: ["Bangalore", "Hyderabad"].map((name) => ({ "@type": "City", name })),
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE.name,
            url: SITE.origin,
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE.origin}/packages?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          },
        ]}
      />

      {/* Keyboard users land here first. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-conceev-black focus:px-4 focus:py-2.5 focus:text-[14px] focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <SiteHeader onOpenSearch={focusSearch} onBook={() => setLeadOpen(true)} />

      <main id="main">
        <Hero onFindDoctor={() => scrollTo(doctorsRef.current)} onExplore={focusSearch} />

        <HealthcareSearch ref={searchRef} />

        <ExploreHealthcare />

        <div ref={doctorsRef} className="scroll-mt-20">
          <FeaturedDoctors onBook={() => setLeadOpen(true)} />
        </div>

        <HealthcareJourney />

        <FeaturedHospitals onBook={() => setLeadOpen(true)} />

        <HealthPackages onBook={() => setLeadOpen(true)} />

        <WhyConceev />

        <PatientStories />

        <HealthInsights />

        <FinalCta onFindDoctor={() => scrollTo(doctorsRef.current)} />
      </main>

      <SiteFooter />

      {/* Mobile sticky booking CTA. */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-conceev-black/10 bg-white/95 p-3 backdrop-blur-md sm:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={() => setLeadOpen(true)}
          className="w-full rounded-xl bg-conceev-red px-5 py-3.5 text-[15px] font-semibold text-white active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
        >
          Book Appointment
        </button>
      </div>
      {/* Reserve room so the sticky bar never covers the footer. */}
      <div className="h-[76px] sm:hidden" aria-hidden="true" />

      <LeadFormModal open={leadOpen} onOpenChange={setLeadOpen} sourcePage="homepage-2026" />
    </div>
  );
};

export default HomepageRedesign;
