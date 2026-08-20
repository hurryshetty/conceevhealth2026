import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getFertilityIcon } from "@/lib/icons";
import { useSpecialties } from "@/hooks/useSpecialties";
import { useInView } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

/**
 * Speciality discovery, as an editorial grid rather than a repeating card wall:
 * one large feature tile, four medium tiles, and the remainder as a minimal
 * link list.
 *
 * Categories come from the live `specialties` table. The brief also listed
 * Cardiology, Orthopaedics, Dermatology, Pediatrics, Dental and Mental Wellness
 * — none of those exist in the database, which currently holds only women's
 * health and fertility specialities. Rather than render dead links, this section
 * shows what the platform actually offers; adding the rest is a data change, not
 * a code change.
 */

/** Presentation for known specialities. Unknown names fall back gracefully. */
const SPECIALITY_META: Record<string, { blurb: string; icon: string }> = {
  "Female Fertility": {
    blurb: "Ovarian reserve, hormonal health and reproductive assessment.",
    icon: "HeartPulse",
  },
  "IVF & ART": {
    blurb: "Assisted reproduction, from first consultation to treatment.",
    icon: "FlaskConical",
  },
  "Male Infertility": {
    blurb: "Semen analysis and male fertility evaluation.",
    icon: "Microscope",
  },
  "Fertility Preservation": {
    blurb: "Egg freezing readiness and preservation planning.",
    icon: "Snowflake",
  },
  "Fertility Surgeries": {
    blurb: "Laparoscopic and hysteroscopic procedures.",
    icon: "Stethoscope",
  },
  "Third-Party Reproduction": {
    blurb: "Donor and surrogacy pathways, explained clearly.",
    icon: "Users",
  },
  "Sperm Retrieval": {
    blurb: "Surgical sperm retrieval options and counselling.",
    icon: "TestTube",
  },
  Wellness: {
    blurb: "Preconception health, nutrition and lifestyle care.",
    icon: "Sprout",
  },
};

/** Internal/non-patient-facing categories are kept off the homepage. */
const HIDDEN = new Set(["Training Courses", "Other Issues"]);

const ExploreHealthcare = () => {
  const { data: specialties = [], isLoading } = useSpecialties();
  const { ref, inView } = useInView<HTMLDivElement>();

  const visible = specialties.filter((s) => !HIDDEN.has(s.name));
  const featured = visible.slice(0, 4);
  const remainder = visible.slice(4);

  return (
    <section className="bg-conceev-offwhite py-20 sm:py-28" aria-labelledby="explore-heading">
      <div ref={ref} className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="max-w-[52ch]">
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-conceev-red">
            Explore healthcare
          </p>
          <h2
            id="explore-heading"
            className="text-[32px] font-bold leading-[1.08] text-conceev-black sm:text-[44px]"
          >
            Healthcare, made easier.
          </h2>
          <p className="mt-4 text-[16px] leading-[1.65] text-conceev-black/60">
            Find the right care for every stage of your health journey.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-12 grid gap-4 lg:grid-cols-3" aria-busy="true">
            <div className="h-[380px] animate-pulse rounded-[20px] bg-conceev-grey/25 lg:row-span-2" />
            <div className="h-[180px] animate-pulse rounded-[20px] bg-conceev-grey/25" />
            <div className="h-[180px] animate-pulse rounded-[20px] bg-conceev-grey/25" />
            <span className="sr-only">Loading specialities</span>
          </div>
        ) : (
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {/* Feature tile */}
            <Link
              to="/fertility-packages"
              className={cn(
                "group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-[20px] bg-conceev-black p-7 lg:row-span-2 lg:min-h-[440px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2",
                inView && "animate-rise-in"
              )}
            >
              <img
                src="/images/ivf-hero-family.jpg.jpeg"
                alt=""
                loading="lazy"
                decoding="async"
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-conceev-black via-conceev-black/70 to-conceev-black/10"
                aria-hidden="true"
              />
              <div className="relative">
                <p className="mb-3 inline-block rounded-md bg-conceev-red px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                  Most sought after
                </p>
                <h3 className="text-[26px] font-bold leading-[1.15] text-white sm:text-[30px]">
                  Women&rsquo;s Health &amp; Fertility
                </h3>
                <p className="mt-3 max-w-[36ch] text-[14px] leading-[1.6] text-white/70">
                  Assessments, expert consultations and treatment pathways built around where
                  you are today.
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white">
                  Explore packages
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>

            {/* Medium tiles */}
            {featured.map((speciality) => {
              const meta = SPECIALITY_META[speciality.name];
              const Icon = getFertilityIcon(meta?.icon);
              return (
                <Link
                  key={speciality.id}
                  to={`/packages?specialty=${speciality.slug}`}
                  className="group flex flex-col justify-between rounded-[20px] border border-conceev-black/[0.08] bg-white p-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-conceev-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-conceev-red/[0.08]">
                    <Icon className="h-5 w-5 text-conceev-red" aria-hidden="true" />
                  </span>
                  <div className="mt-8">
                    <h3 className="flex items-start justify-between gap-3 text-[18px] font-semibold leading-tight text-conceev-black">
                      {speciality.name}
                      <ArrowUpRight
                        className="mt-0.5 h-4 w-4 shrink-0 text-conceev-grey-mid transition-[transform,color] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-conceev-red"
                        aria-hidden="true"
                      />
                    </h3>
                    {meta?.blurb && (
                      <p className="mt-2 text-[13px] leading-[1.55] text-conceev-black/65">
                        {meta.blurb}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}

            {/* Minimal links for the remaining specialities */}
            {remainder.length > 0 && (
              <div className="rounded-[20px] border border-conceev-black/[0.08] bg-white p-6 lg:col-span-2">
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-conceev-grey-mid">
                  More specialities
                </p>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                  {remainder.map((speciality) => (
                    <li key={speciality.id}>
                      <Link
                        to={`/packages?specialty=${speciality.slug}`}
                        className="group inline-flex items-center gap-1.5 text-[15px] font-medium text-conceev-black/75 transition-colors hover:text-conceev-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
                      >
                        {speciality.name}
                        <ArrowUpRight
                          className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ExploreHealthcare;
