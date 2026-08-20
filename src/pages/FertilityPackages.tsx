import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MapPin, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { SITE } from "@/config/site";
import { cn } from "@/lib/utils";
import { ANALYTICS_EVENTS, captureAttribution, trackEvent } from "@/lib/analytics";
import {
  sortByIntent,
  isRecommended,
  type FertilityPackage,
  type IntentId,
} from "@/data/fertilityPackages";
import { useFertilityPackages } from "@/hooks/useFertilityPackages";
import IntentSelector from "@/components/fertility/IntentSelector";
import PackageCard from "@/components/fertility/PackageCard";
import PackageComparison from "@/components/fertility/PackageComparison";
import PackageRecommender from "@/components/fertility/PackageRecommender";
import PackageBookingModal from "@/components/fertility/PackageBookingModal";
import ExpertsSection from "@/components/fertility/ExpertsSection";
import { HowItWorks, SectionHeading } from "@/components/fertility/PackageSections";

const CONSULTATION_SLUG = "fertility-expert-consultation";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Choose your package",
    description:
      "Tell us what you're looking for and we'll point you to the right starting assessment.",
  },
  {
    step: "02",
    title: "Book your appointment",
    description:
      "A care coordinator confirms your slot, your location and any preparation you need.",
  },
  {
    step: "03",
    title: "Complete your assessment",
    description:
      "Attend your visit knowing exactly what will happen and how long it will take.",
  },
  {
    step: "04",
    title: "Understand your next steps",
    description:
      "A fertility specialist explains your results and what may be worth considering next.",
  },
];

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "Specialist-reviewed results" },
  { icon: Stethoscope, label: "Fertility experts, not call centres" },
  { icon: Sparkles, label: "Transparent, itemised inclusions" },
];

const FertilityPackages = () => {
  const { data: packages = [], isLoading } = useFertilityPackages();
  const [intent, setIntent] = useState<IntentId | null>(null);
  const [cityFilter, setCityFilter] = useState("All locations");
  const [bookingPackage, setBookingPackage] = useState<FertilityPackage | null>(null);
  const [bookingSource, setBookingSource] = useState("listing_card");
  const [recommenderOpen, setRecommenderOpen] = useState(false);

  useEffect(() => {
    captureAttribution();
  }, []);

  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    packages.forEach((pkg) => pkg.locations.forEach((loc) => cities.add(loc)));
    return ["All locations", ...Array.from(cities).sort()];
  }, [packages]);

  const visible = useMemo(() => {
    const filtered =
      cityFilter === "All locations"
        ? packages
        : packages.filter((pkg) => pkg.locations.includes(cityFilter));
    return sortByIntent(filtered, intent);
  }, [packages, cityFilter, intent]);

  const recommendedCount = intent
    ? visible.filter((pkg) => isRecommended(pkg, intent)).length
    : 0;

  const openBooking = (pkg: FertilityPackage, source: string) => {
    setBookingSource(source);
    setBookingPackage(pkg);
    trackEvent(ANALYTICS_EVENTS.PACKAGE_CTA_CLICK, {
      package_slug: pkg.slug,
      package_name: pkg.name,
      cta: "book_package",
      source,
    });
  };

  const handleIntentChange = (next: IntentId | null) => {
    setIntent(next);
    if (next) {
      trackEvent(ANALYTICS_EVENTS.PACKAGE_INTENT_SELECTION, { intent: next });
    }
  };

  const handleCityFilter = (city: string) => {
    setCityFilter(city);
    trackEvent(ANALYTICS_EVENTS.PACKAGE_FILTER, { filter: "location", value: city });
  };

  const talkToExpert = (source: string) => {
    const consultation =
      packages.find((pkg) => pkg.slug === CONSULTATION_SLUG) ?? packages[0];
    trackEvent(ANALYTICS_EVENTS.CONSULTATION_CLICK, {
      source,
      package_slug: consultation?.slug ?? null,
    });
    if (consultation) {
      setBookingSource(source);
      setBookingPackage(consultation);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Fertility Packages & Assessments | Conceev Health"
        description="Personalised fertility assessments and expert-led care from Conceev Health — fertility health checks, complete assessments, couples testing, egg freezing readiness and specialist consultations."
        canonicalPath="/fertility-packages"
        keywords={[
          "fertility packages",
          "fertility test india",
          "fertility assessment bangalore",
          "couples fertility check",
          "egg freezing consultation",
          "AMH test",
        ]}
        ogTitle="Your fertility journey starts with clarity | Conceev Health"
        ogDescription="Compare fertility assessments designed around where you are today — planning, trying, preserving, or simply looking for answers."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Fertility Packages", path: "/fertility-packages" },
        ]}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Fertility Packages",
            description:
              "Fertility assessment and consultation packages from Conceev Health.",
            url: `${SITE.origin}/fertility-packages`,
            hasPart: packages.map((pkg) => ({
              "@type": "Service",
              name: pkg.name,
              description: pkg.short_description,
              url: `${SITE.origin}/fertility-packages/${pkg.slug}`,
              serviceType: pkg.category,
              provider: { "@type": "Organization", name: SITE.name },
            })),
          },
        ]}
      />

      <Navbar />

      <main>
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.06] via-background to-background">
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-navy/5 blur-3xl"
            aria-hidden="true"
          />

          <div className="container relative mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                Fertility care, made understandable
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] text-foreground">
                Your fertility journey starts with clarity
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mt-5 max-w-2xl">
                Personalised fertility assessments and expert-led care designed around where
                you are today — whether you're planning, trying, preserving, or simply
                looking for answers.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button
                  size="lg"
                  className="rounded-full gap-2"
                  onClick={() => setRecommenderOpen(true)}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Find My Fertility Package
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full gap-2"
                  onClick={() => talkToExpert("hero")}
                >
                  Talk to a Fertility Expert
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>

              <ul className="flex flex-wrap gap-x-6 gap-y-2.5 mt-10">
                {TRUST_POINTS.map((point) => (
                  <li
                    key={point.label}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <point.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    {point.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Intent selector ───────────────────────────────────────────────── */}
        <section className="py-14 md:py-16 border-t border-border" aria-labelledby="intent-selector-heading">
          <div className="container mx-auto px-4">
            <IntentSelector value={intent} onChange={handleIntentChange} />
          </div>
        </section>

        {/* ── Package grid ──────────────────────────────────────────────────── */}
        <section className="pb-16 md:pb-20" aria-labelledby="packages-heading">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
              <div>
                <h2 id="packages-heading" className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                  {intent && recommendedCount > 0 ? "Recommended for you" : "All fertility packages"}
                </h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                  {intent && recommendedCount > 0
                    ? `${recommendedCount} package${recommendedCount === 1 ? "" : "s"} matched to what you're looking for, followed by everything else.`
                    : "Every package includes time with a fertility specialist and a clear view of your next steps."}
                </p>
              </div>

              {cityOptions.length > 2 && (
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Filter packages by location"
                >
                  {cityOptions.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleCityFilter(city)}
                      aria-pressed={cityFilter === city}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        cityFilter === city
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {city !== "All locations" && (
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                      )}
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[26rem] rounded-2xl border border-border bg-card animate-pulse"
                  />
                ))}
                <span className="sr-only">Loading fertility packages</span>
              </div>
            ) : visible.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">
                No packages available in {cityFilter} yet. Try another location, or talk to a
                fertility expert about what's possible near you.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visible.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    recommended={isRecommended(pkg, intent)}
                    onBook={(p) => openBooking(p, "listing_card")}
                    onViewDetails={(p) =>
                      trackEvent(ANALYTICS_EVENTS.PACKAGE_CTA_CLICK, {
                        package_slug: p.slug,
                        package_name: p.name,
                        cta: "view_details",
                        source: "listing_card",
                      })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Comparison ────────────────────────────────────────────────────── */}
        {packages.length > 1 && (
          <section className="py-16 md:py-20 bg-secondary/[0.04] border-y border-border" aria-labelledby="comparison-heading">
            <div className="container mx-auto px-4">
              <SectionHeading
                id="comparison-heading"
                eyebrow="Side by side"
                title="Which package is right for you?"
                description="Compare what each assessment covers, so you know exactly what you're choosing between."
              />
              <PackageComparison
                packages={packages}
                onBook={(pkg) => openBooking(pkg, "comparison")}
                onInteract={(detail) =>
                  trackEvent(ANALYTICS_EVENTS.COMPARISON_INTERACTION, { detail })
                }
              />
            </div>
          </section>
        )}

        {/* ── How it works ──────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20" aria-labelledby="how-it-works-heading">
          <div className="container mx-auto px-4">
            <SectionHeading
              id="how-it-works-heading"
              eyebrow="How it works"
              title="Four steps, no guesswork"
              description="From choosing a package to understanding what comes next, you always know what's happening and why."
            />
            <HowItWorks steps={HOW_IT_WORKS} />
          </div>
        </section>

        {/* ── Experts ───────────────────────────────────────────────────────── */}
        <section className="pb-16 md:pb-20" aria-labelledby="experts-heading">
          <div className="container mx-auto px-4">
            <SectionHeading
              id="experts-heading"
              eyebrow="Your care team"
              title="Meet your fertility experts"
              description="Every assessment is reviewed by a specialist who takes the time to explain what your results may mean."
            />
            <ExpertsSection />
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────────── */}
        <section className="bg-navy text-primary-foreground py-16 md:py-20">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Not sure where to start?
            </h2>
            <p className="text-primary-foreground/70 leading-relaxed mb-8">
              Talk to a fertility expert and find the right next step for you. No commitment,
              no pressure — just a conversation about where you are.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="rounded-full"
                onClick={() => talkToExpert("final_cta")}
              >
                Talk to an Expert
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                onClick={() => setRecommenderOpen(true)}
              >
                Explore Packages
              </Button>
            </div>
          </div>
        </section>

        {/* ── Medical note ──────────────────────────────────────────────────── */}
        <section className="py-10 border-t border-border">
          <div className="container mx-auto px-4">
            <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
              Fertility assessments may help you and your specialist understand your
              reproductive health and decide what to consider next. No assessment can detect
              every fertility factor or guarantee a pregnancy. Final inclusions and pricing
              are confirmed by our clinical and care teams before your appointment.
            </p>
          </div>
        </section>
      </main>

      <Footer />

      <PackageRecommender
        open={recommenderOpen}
        onOpenChange={setRecommenderOpen}
        packages={packages}
        onBook={(pkg) => openBooking(pkg, "recommender")}
        onComplete={(slug, answers) =>
          trackEvent(ANALYTICS_EVENTS.PACKAGE_INTENT_SELECTION, {
            source: "recommender",
            recommended_slug: slug,
            ...answers,
          })
        }
      />

      <PackageBookingModal
        open={bookingPackage !== null}
        onOpenChange={(open) => !open && setBookingPackage(null)}
        pkg={bookingPackage}
        source={bookingSource}
      />
    </div>
  );
};

export default FertilityPackages;
