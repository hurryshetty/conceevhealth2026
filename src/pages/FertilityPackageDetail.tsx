import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Home,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { SITE } from "@/config/site";
import { ANALYTICS_EVENTS, captureAttribution, trackEvent } from "@/lib/analytics";
import {
  availabilityLabel,
  flattenInclusions,
  type FertilityPackage,
} from "@/data/fertilityPackages";
import {
  useFertilityPackage,
  useFertilityPackages,
  usePackageTestimonials,
} from "@/hooks/useFertilityPackages";
import { getFertilityIcon } from "@/lib/icons";
import PriceBlock from "@/components/fertility/PriceBlock";
import WhatsAppPackageButton from "@/components/fertility/WhatsAppPackageButton";
import StickyPackageBar from "@/components/fertility/StickyPackageBar";
import PackageBookingModal from "@/components/fertility/PackageBookingModal";
import PackageSectionNav from "@/components/fertility/PackageSectionNav";
import ExpertsSection from "@/components/fertility/ExpertsSection";
import PackageTestimonials from "@/components/fertility/PackageTestimonials";
import {
  HowItWorks,
  IsThisForYou,
  PackageFaqs,
  PackageInclusions,
  ResultsJourney,
  SectionHeading,
  WhatYouLearn,
} from "@/components/fertility/PackageSections";

/** Order matches the page; ids are set on the corresponding <section>. */
const DETAIL_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "who-its-for", label: "Who it's for" },
  { id: "whats-included", label: "What's included" },
  { id: "what-youll-learn", label: "What you'll learn" },
  { id: "how-it-works", label: "How it works" },
  { id: "your-results", label: "Your results" },
  { id: "experts", label: "Experts" },
  { id: "faqs", label: "FAQs" },
];

const FertilityPackageDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: pkg, isLoading } = useFertilityPackage(slug);
  const { data: allPackages = [] } = useFertilityPackages();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSource, setBookingSource] = useState("hero");

  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    if (!pkg) return;
    trackEvent(ANALYTICS_EVENTS.PACKAGE_VIEW, {
      package_slug: pkg.slug,
      package_name: pkg.name,
      category: pkg.category,
    });
  }, [pkg]);

  // ── Loading / not found ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 py-24" aria-busy="true">
          <div className="h-8 w-48 rounded-full bg-card animate-pulse mb-6" />
          <div className="h-14 w-full max-w-xl rounded-2xl bg-card animate-pulse mb-4" />
          <div className="h-40 w-full rounded-2xl bg-card animate-pulse" />
          <span className="sr-only">Loading package</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-background">
        <Seo
          title="Package not found | Conceev Health"
          description="This fertility package could not be found."
          noIndex
        />
        <Navbar />
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 py-24 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            We couldn't find that package
          </h1>
          <p className="text-muted-foreground mb-8">
            It may have been renamed or is no longer offered.
          </p>
          <Button variant="outline" className="rounded-full gap-2" asChild>
            <Link to="/fertility-packages">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Browse all fertility packages
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const Icon = getFertilityIcon(pkg.icon);
  const inclusionCount = flattenInclusions(pkg).length;
  const related = allPackages
    .filter((other) => other.slug !== pkg.slug)
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 3);

  const openBooking = (source: string) => {
    setBookingSource(source);
    setBookingOpen(true);
    trackEvent(ANALYTICS_EVENTS.PACKAGE_CTA_CLICK, {
      package_slug: pkg.slug,
      package_name: pkg.name,
      cta: "book_package",
      source,
    });
  };

  const canonicalPath = `/fertility-packages/${pkg.slug}`;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={pkg.seo.title}
        description={pkg.seo.description}
        canonicalPath={canonicalPath}
        keywords={pkg.seo.keywords}
        ogTitle={pkg.seo.og_title}
        ogDescription={pkg.seo.og_description}
        ogImage={pkg.seo.og_image ?? undefined}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Fertility Packages", path: "/fertility-packages" },
          { name: pkg.name, path: canonicalPath },
        ]}
        faqs={pkg.faqs.map((faq) => ({ question: faq.question, answer: faq.answer }))}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": pkg.seo.schema_type,
            name: pkg.name,
            description: pkg.short_description,
            url: `${SITE.origin}${canonicalPath}`,
            serviceType: pkg.category,
            provider: {
              "@type": "MedicalOrganization",
              name: SITE.name,
              url: SITE.origin,
            },
            areaServed: pkg.locations.map((loc) => ({ "@type": "City", name: loc })),
            // Offer markup is emitted only when a confirmed price exists, so no
            // placeholder pricing is ever published to search engines.
            ...(pkg.price_status === "confirmed" && pkg.price !== null
              ? {
                  offers: {
                    "@type": "Offer",
                    price: pkg.price,
                    priceCurrency: pkg.currency,
                    availability: "https://schema.org/InStock",
                    url: `${SITE.origin}${canonicalPath}`,
                  },
                }
              : {}),
          },
        ]}
      />

      <Navbar />

      {/* Bottom padding leaves room for the mobile sticky bar. */}
      <main className="pb-28 md:pb-0">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.06] via-background to-background border-b border-border">
          <div
            className="pointer-events-none absolute -top-28 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8 py-10 sm:py-16">
            <nav aria-label="Breadcrumb" className="mb-7">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <li>
                  <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                    <Home className="h-3.5 w-3.5" aria-hidden="true" /> Home
                  </Link>
                </li>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                <li>
                  <Link to="/fertility-packages" className="hover:text-foreground transition-colors">
                    Fertility Packages
                  </Link>
                </li>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                <li aria-current="page" className="font-medium text-foreground">
                  {pkg.name}
                </li>
              </ol>
            </nav>

            <div className="grid lg:grid-cols-[1fr_380px] gap-10 lg:gap-14 items-start">
              {/* Left: content */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {pkg.category}
                  </span>
                  {pkg.badge && (
                    <span className="text-[11px] font-semibold uppercase tracking-wide bg-navy/5 text-navy border border-navy/15 px-2.5 py-1 rounded-full">
                      {pkg.badge}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.12] text-foreground">
                  {pkg.hero_title}
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mt-4 max-w-2xl">
                  {pkg.hero_description}
                </p>

                <ul className="flex flex-wrap gap-x-6 gap-y-2.5 mt-7 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                    {availabilityLabel(pkg.availability_type)}
                  </li>
                  {pkg.duration && (
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                      {pkg.duration}
                    </li>
                  )}
                  {pkg.locations.length > 0 && (
                    <li className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                      {pkg.locations.join(" · ")}
                    </li>
                  )}
                </ul>

                {/* Mobile-only inline CTAs; also the sticky bar's reveal anchor. */}
                <div id="package-hero-cta" className="flex flex-col sm:flex-row gap-3 mt-8 lg:hidden">
                  <Button size="lg" className="rounded-full" onClick={() => openBooking("hero")}>
                    Book Package
                  </Button>
                  <WhatsAppPackageButton pkg={pkg} source="hero" />
                </div>
              </div>

              {/* Right: premium summary card */}
              <aside className="lg:sticky lg:top-24">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Package summary
                  </p>
                  <PriceBlock pkg={pkg} size="lg" className="mb-5" />

                  <div className="hidden lg:flex flex-col gap-2.5 mb-5">
                    <Button size="lg" className="rounded-full" onClick={() => openBooking("summary_card")}>
                      Book Package
                    </Button>
                    <WhatsAppPackageButton pkg={pkg} source="summary_card" />
                  </div>

                  <dl className="space-y-3 border-t border-border pt-5 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-muted-foreground">Inclusions</dt>
                      <dd className="font-medium text-foreground text-right">
                        {inclusionCount} item{inclusionCount === 1 ? "" : "s"}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-muted-foreground">Ideal for</dt>
                      <dd className="font-medium text-foreground text-right">
                        {pkg.ideal_for_label}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-muted-foreground">Availability</dt>
                      <dd className="font-medium text-foreground text-right">
                        {availabilityLabel(pkg.availability_type)}
                      </dd>
                    </div>
                    {pkg.locations.length > 0 && (
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-muted-foreground">Locations</dt>
                        <dd className="font-medium text-foreground text-right">
                          {pkg.locations.join(", ")}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {pkg.variants.length > 0 && (
                    <div className="border-t border-border pt-5 mt-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                        Choose at booking
                      </p>
                      <ul className="space-y-2">
                        {pkg.variants.map((variant) => (
                          <li key={variant.id} className="flex items-start gap-2.5 text-sm">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                            <span>
                              <span className="font-medium text-foreground">{variant.label}</span>
                              <span className="block text-xs text-muted-foreground mt-0.5">
                                {variant.description}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-5 mt-5">
                    Nothing is booked or charged until our care team confirms your appointment
                    and full pricing with you.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ── Overview ──────────────────────────────────────────────────────── */}
        <PackageSectionNav sections={DETAIL_SECTIONS} />

        <section id="overview" className="scroll-mt-32 py-12 sm:py-16" aria-labelledby="overview-heading">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
            <SectionHeading id="overview-heading" eyebrow="Overview" title={pkg.tagline} />
            <p className="max-w-3xl text-base leading-relaxed text-foreground/80">
              {pkg.long_description}
            </p>
          </div>
        </section>

        {/* ── Is this right for me ──────────────────────────────────────────── */}
        <section id="who-its-for" className="scroll-mt-32 border-y border-border bg-secondary/[0.04] py-12 sm:py-16" aria-labelledby="ideal-for-heading">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
            <SectionHeading
              id="ideal-for-heading"
              eyebrow="Is this right for me?"
              title="This package is for you if&hellip;"
            />
            <IsThisForYou items={pkg.ideal_for} />
          </div>
        </section>

        {/* ── What's included ───────────────────────────────────────────────── */}
        <section id="whats-included" className="scroll-mt-32 py-12 sm:py-20" aria-labelledby="inclusions-heading">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
            <SectionHeading
              id="inclusions-heading"
              eyebrow="What's included"
              title="Exactly what you're paying for"
              description="Every item explained in plain language, so nothing is a surprise on the day."
            />
            <PackageInclusions groups={pkg.inclusions} />

            {pkg.exclusions.length > 0 && (
              <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6 max-w-3xl">
                <h3 className="font-semibold text-foreground mb-3">Not included</h3>
                <ul className="space-y-2">
                  {pkg.exclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-6 max-w-3xl leading-relaxed">
              Final inclusions are confirmed by your fertility specialist and may vary based on
              your clinical assessment. Anything additional is discussed and agreed with you
              before it is carried out.
            </p>
          </div>
        </section>

        {/* ── What you'll learn ─────────────────────────────────────────────── */}
        <section id="what-youll-learn" className="scroll-mt-32 border-y border-border bg-secondary/[0.04] py-12 sm:py-16" aria-labelledby="learn-heading">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
            <SectionHeading
              id="learn-heading"
              eyebrow="What you'll learn"
              title="After your assessment, you may better understand&hellip;"
              description="Tests are only useful if they tell you something. Here's what this assessment is designed to shed light on."
            />
            <WhatYouLearn items={pkg.what_you_learn} />
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────────────── */}
        <section id="how-it-works" className="scroll-mt-32 py-12 sm:py-20" aria-labelledby="steps-heading">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
            <SectionHeading id="steps-heading" eyebrow="How it works" title="From booking to next steps" />
            <HowItWorks steps={pkg.how_it_works} />
          </div>
        </section>

        {/* ── Results experience ────────────────────────────────────────────── */}
        <section id="your-results" className="scroll-mt-32 border-y border-border bg-secondary/[0.04] py-12 sm:py-16" aria-labelledby="results-heading">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
            <SectionHeading
              id="results-heading"
              eyebrow="After your assessment"
              title="Your results are only the beginning"
              description="A report on its own rarely helps. What matters is someone sitting down and explaining what it may mean for you."
            />
            <ResultsJourney />
          </div>
        </section>

        {/* ── Experts ───────────────────────────────────────────────────────── */}
        <section id="experts" className="scroll-mt-32 py-12 sm:py-20" aria-labelledby="detail-experts-heading">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
            <SectionHeading
              id="detail-experts-heading"
              eyebrow="Your care team"
              title="Meet your fertility experts"
            />
            <ExpertsSection />
          </div>
        </section>

        {/* ── Testimonials (rendered only when approved entries exist) ──────── */}
        <TestimonialsSection packageId={pkg.id} />

        {/* ── FAQs ──────────────────────────────────────────────────────────── */}
        <section id="faqs" className="scroll-mt-32 border-y border-border bg-secondary/[0.04] py-12 sm:py-20" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
            <SectionHeading
              id="faq-heading"
              eyebrow="Questions"
              title="Everything people ask before booking"
            />
            <PackageFaqs faqs={pkg.faqs} />
          </div>
        </section>

        {/* ── Related packages ──────────────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="scroll-mt-32 py-12 sm:py-20" aria-labelledby="related-heading">
            <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
              <SectionHeading
                id="related-heading"
                eyebrow="Also worth considering"
                title="Other fertility packages"
              />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map((other) => (
                  <RelatedPackageCard key={other.id} pkg={other} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Final CTA ─────────────────────────────────────────────────────── */}
        <section className="py-12 sm:py-20">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
            <div className="relative overflow-hidden rounded-[24px] bg-conceev-gradient px-6 py-12 sm:px-14 sm:py-16">
              <div
                className="pointer-events-none absolute -right-20 -top-24 h-[420px] w-[420px] rounded-full bg-white/[0.06] blur-[100px]"
                aria-hidden="true"
              />
              <div className="relative max-w-[32ch]">
                <h2 className="text-[30px] font-bold leading-[1.06] text-white sm:text-[42px]">
                  Ready when you are.
                </h2>
                {/* /85 — the ramp reaches pure red, where less fails AA. */}
                <p className="mt-4 max-w-[44ch] text-[15px] leading-[1.65] text-white/85 sm:text-[16px]">
                  Book the {pkg.name}, or message us first if you'd rather ask a few
                  questions.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => openBooking("final_cta")}
                    className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-white px-7 py-3.5 text-[15px] font-semibold text-conceev-black transition-transform duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-conceev-black"
                  >
                    Book Package
                  </button>
                  <Link
                    to="/fertility-packages"
                    className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-white/30 px-7 py-3.5 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-conceev-black"
                  >
                    Explore all packages
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Medical note ──────────────────────────────────────────────────── */}
        <section className="py-10 border-t border-border">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
            <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
              This package may help you and your fertility specialist assess your reproductive
              health and identify areas that could warrant further evaluation. It does not
              diagnose or treat any condition on its own, cannot detect every fertility factor,
              and does not guarantee a pregnancy or any other outcome.
            </p>
          </div>
        </section>
      </main>

      <Footer />

      <StickyPackageBar pkg={pkg} onBook={() => openBooking("sticky_bar")} />

      <PackageBookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        pkg={pkg}
        source={bookingSource}
      />
    </div>
  );
};

// ─── Sub-components ────────────────────────────────────────────────────────────

/**
 * Testimonials section.
 *
 * The heading and section padding must disappear along with the list when no
 * approved testimonials exist, so the section owns the same query as the list.
 * React Query dedupes by key, so this costs no extra request.
 */
const TestimonialsSection = ({ packageId }: { packageId: string }) => {
  const { data: testimonials = [], isLoading } = usePackageTestimonials(packageId);
  if (isLoading || testimonials.length === 0) return null;

  return (
    <section className="py-12 sm:py-20" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <SectionHeading
          id="testimonials-heading"
          eyebrow="In their words"
          title="What patients say"
        />
        <PackageTestimonials packageId={packageId} />
      </div>
    </section>
  );
};

const RelatedPackageCard = ({ pkg }: { pkg: FertilityPackage }) => {
  const Icon = getFertilityIcon(pkg.icon);
  return (
    <Link
      to={`/fertility-packages/${pkg.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-1">
        {pkg.category}
      </p>
      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
        {pkg.name}
      </h3>
      <p className="text-sm text-muted-foreground mt-2 flex-1 leading-relaxed">
        {pkg.short_description}
      </p>
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-4">
        View package <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </Link>
  );
};

export default FertilityPackageDetail;
