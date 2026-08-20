import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Clock,
  Compass,
  Eye,
  HeartHandshake,
  Quote,
  Route,
  Scale,
  Search,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  BENEFITS,
  HEALTH_INSIGHTS,
  JOURNEY_STAGES,
  PATIENT_STORIES,
} from "@/data/homepageContent";
import { useInView } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

/**
 * The three brand-voice sections: the healthcare journey, why Conceev, and
 * patient stories — plus the health insights rail.
 *
 * These are deliberately typographic rather than card-driven. They are the
 * places the page slows down and speaks, so they lean on scale and whitespace.
 */

const ICONS: Record<string, LucideIcon> = {
  Search,
  Scale,
  CalendarCheck,
  HeartHandshake,
  BadgeCheck,
  Compass,
  Eye,
  Route,
};

// ─── Healthcare journey ────────────────────────────────────────────────────────

export const HealthcareJourney = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="bg-white py-20 sm:py-28" aria-labelledby="journey-heading">
      <div ref={ref} className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="max-w-[46ch]">
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-conceev-red">
            How Conceev works
          </p>
          <h2
            id="journey-heading"
            className="text-[32px] font-bold leading-[1.08] text-conceev-black sm:text-[44px]"
          >
            From first question to continuing care.
          </h2>
        </div>

        <ol className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-8">
          {/*
            Connector. Inset to the centre of the first and last markers — a
            full-bleed rule overshot past the final step and ran to the
            container edge. Vertical on mobile, horizontal from md up.
          */}
          <span
            className="absolute left-[27px] top-4 bottom-4 w-px bg-conceev-black/[0.12] md:left-[12.5%] md:right-[12.5%] md:top-[28px] md:bottom-auto md:h-px md:w-auto"
            aria-hidden="true"
          />
          {JOURNEY_STAGES.map((stage, i) => {
            const Icon = ICONS[stage.icon] ?? Search;
            return (
              <li
                key={stage.id}
                className={cn("relative flex gap-5 md:block", inView && "animate-rise-in")}
                style={inView ? { animationDelay: `${i * 90}ms`, opacity: 0 } : undefined}
              >
                {/* Ring sits on the connector; the white fill masks the line. */}
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-conceev-black/[0.12] bg-white text-conceev-red ring-4 ring-white md:mb-7">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 pb-2 md:pb-0">
                  <p className="text-[12px] font-semibold tracking-[0.18em] text-conceev-red">
                    {stage.index}
                  </p>
                  <h3 className="mt-2 text-[21px] font-semibold text-conceev-black">
                    {stage.title}
                  </h3>
                  <p className="mt-2.5 max-w-[30ch] text-[14px] leading-[1.6] text-conceev-black/60">
                    {stage.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

// ─── Why Conceev ───────────────────────────────────────────────────────────────

export const WhyConceev = () => (
  <section className="bg-conceev-black py-20 sm:py-28" aria-labelledby="why-heading">
    <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
      <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-conceev-red">
            Why Conceev Health
          </p>
          <h2
            id="why-heading"
            className="max-w-[14ch] text-[36px] font-bold leading-[1.05] text-white sm:text-[48px]"
          >
            Healthcare should feel simple.
          </h2>
          <p className="mt-5 max-w-[38ch] text-[16px] leading-[1.65] text-white/55">
            Most of the difficulty in healthcare is not medical. It is finding the right
            person, understanding the options, and knowing what happens next.
          </p>
        </div>

        <ul className="divide-y divide-white/[0.09] border-y border-white/[0.09]">
          {BENEFITS.map((benefit) => {
            const Icon = ICONS[benefit.icon] ?? BadgeCheck;
            return (
              <li key={benefit.id} className="group flex items-start gap-6 py-7">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-conceev-green transition-colors duration-300 group-hover:bg-conceev-red group-hover:text-white">
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[20px] font-semibold text-white sm:text-[22px]">
                    {benefit.title}
                  </h3>
                  <p className="mt-1.5 max-w-[52ch] text-[15px] leading-[1.6] text-white/55">
                    {benefit.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  </section>
);

// ─── Patient stories ───────────────────────────────────────────────────────────

export const PatientStories = () => (
  <section className="bg-white py-20 sm:py-28" aria-labelledby="stories-heading">
    <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
      <div className="max-w-[46ch]">
        <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-conceev-red">
          Patient stories
        </p>
        <h2
          id="stories-heading"
          className="text-[32px] font-bold leading-[1.08] text-conceev-black sm:text-[44px]"
        >
          Real people. Real healthcare journeys.
        </h2>
      </div>

      <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
        {PATIENT_STORIES.map((story) => (
          <li key={story.name} className="flex flex-col">
            <Quote
              className="h-7 w-7 rotate-180 text-conceev-red/25"
              aria-hidden="true"
            />
            <blockquote className="mt-5 flex-1 text-[19px] font-medium leading-[1.45] text-conceev-black">
              {story.quote}
            </blockquote>

            <div className="mt-7 flex items-center gap-4 border-t border-conceev-black/[0.09] pt-6">
              <img
                src={story.image}
                alt={`Portrait of ${story.name}`}
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                className="h-12 w-12 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-conceev-black">{story.name}</p>
                <p className="truncate text-[12px] text-conceev-grey-mid">
                  {story.journey} · {story.location}
                </p>
              </div>
              <span
                className="ml-auto flex shrink-0 items-center gap-1 text-[13px] font-semibold text-conceev-black tabular-nums"
                role="img"
                aria-label={`Rated ${story.rating} out of 5`}
              >
                <Star className="h-3.5 w-3.5 fill-conceev-red text-conceev-red" aria-hidden="true" />
                {story.rating}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

// ─── Health insights ───────────────────────────────────────────────────────────

export const HealthInsights = () => (
  <section className="bg-conceev-offwhite py-20 sm:py-28" aria-labelledby="insights-heading">
    <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-[46ch]">
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-conceev-red">
            Health insights
          </p>
          <h2
            id="insights-heading"
            className="text-[32px] font-bold leading-[1.08] text-conceev-black sm:text-[44px]"
          >
            Understand your health better.
          </h2>
        </div>
        <Link
          to="/faqs"
          className="group inline-flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-conceev-black transition-colors hover:text-conceev-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
        >
          All insights
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>

      <ul className="mt-12 flex snap-rail gap-4 overflow-x-auto scrollbar-hide pb-2 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-4">
        {HEALTH_INSIGHTS.map((article) => (
          <li key={article.id} className="w-[78vw] shrink-0 sm:w-[46vw] md:w-auto">
            <Link
              to={article.to}
              className="group flex h-full flex-col rounded-[20px] border border-conceev-black/[0.08] bg-white p-6 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-conceev-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-conceev-red">
                {article.category}
              </p>
              <h3 className="mt-3 text-[18px] font-semibold leading-[1.3] text-conceev-black">
                {article.title}
              </h3>
              <p className="mt-2.5 flex-1 text-[14px] leading-[1.55] text-conceev-black/65">
                {article.excerpt}
              </p>
              <p className="mt-6 flex items-center gap-1.5 text-[12px] text-conceev-grey-mid">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {article.readingMinutes} min read
                <ArrowRight
                  className="ml-auto h-4 w-4 text-conceev-black transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
