import { ArrowRight, MapPin, ShieldCheck, Star } from "lucide-react";
import heroImage from "@/assets/hero-doctor-patient.jpg";
import { HEADLINE_STATS } from "@/data/homepageContent";
import { useCountUp, useInView } from "@/hooks/useReveal";

/**
 * Hero + trust strip.
 *
 * Asymmetric: editorial copy on the left, a single large image on the right at
 * roughly 45% of the composition. Brand indicators are anchored to the image
 * frame rather than floating as generic cards, so they read as part of the
 * photograph's composition.
 *
 * Background is warm off-white with one soft red glow — the trustworthy option
 * of the two directions in the brief, rather than the dark hero.
 */

interface HeroProps {
  onFindDoctor: () => void;
  onExplore: () => void;
}

const Stat = ({
  value,
  suffix,
  label,
  active,
}: {
  value: number;
  suffix?: string;
  label: string;
  active: boolean;
}) => {
  const display = useCountUp(value, active);
  return (
    <div className="px-6 py-5 text-center sm:px-8 sm:text-left">
      <p className="text-[30px] font-bold leading-none text-conceev-black tabular-nums sm:text-[38px]">
        {display}
        {suffix && <span className="text-conceev-red">{suffix}</span>}
      </p>
      <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.14em] text-conceev-grey-mid">
        {label}
      </p>
    </div>
  );
};

const Hero = ({ onFindDoctor, onExplore }: HeroProps) => {
  const { ref: statsRef, inView: statsInView } = useInView<HTMLDivElement>();

  return (
    <section className="relative overflow-hidden bg-conceev-offwhite">
      {/* Soft brand glow — one source, low opacity, never a colourful wash. */}
      <div
        className="pointer-events-none absolute -right-[10%] -top-[30%] h-[720px] w-[720px] rounded-full bg-conceev-red/[0.07] blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-[15%] top-[40%] h-[520px] w-[520px] rounded-full bg-conceev-blue/[0.04] blur-[130px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="grid items-center gap-12 pb-16 pt-14 lg:grid-cols-[1fr_0.82fr] lg:gap-16 lg:pb-24 lg:pt-20">
          {/* ── Copy ──────────────────────────────────────────────────────── */}
          <div className="animate-rise-in">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-conceev-black/10 bg-white/70 px-3.5 py-1.5 text-[12px] font-medium tracking-[0.02em] text-conceev-black/70">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-conceev-green" />
              </span>
              Verified doctors, hospitals and treatments
            </p>

            <h1 className="max-w-[15ch] text-[40px] font-bold leading-[1.04] text-conceev-black sm:text-[54px] lg:text-[62px]">
              Better healthcare starts with better choices.
            </h1>

            <p className="mt-6 max-w-[46ch] text-[16px] leading-[1.65] text-conceev-black/60 sm:text-[17px]">
              Discover trusted doctors, hospitals, treatments and healthcare services — all
              in one simple experience.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onFindDoctor}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-conceev-red px-7 py-3.5 text-[15px] font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-conceev-red-deep active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
              >
                Find a Doctor
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={onExplore}
                className="inline-flex items-center justify-center rounded-xl border border-conceev-black/15 bg-white px-7 py-3.5 text-[15px] font-semibold text-conceev-black transition-colors duration-200 hover:border-conceev-black/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
              >
                Explore Healthcare
              </button>
            </div>
          </div>

          {/* ── Editorial image ───────────────────────────────────────────── */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-[24px] bg-conceev-grey/20">
              <img
                src={heroImage}
                alt="A doctor in consultation with a patient at a Conceev Health partner clinic"
                width={720}
                height={820}
                loading="eager"
                decoding="async"
                className="aspect-[4/5] w-full object-cover sm:aspect-[5/5] lg:aspect-[4/5]"
              />
              {/* Grounding scrim so the anchored indicator stays legible. */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-conceev-black/55 to-transparent"
                aria-hidden="true"
              />

              {/* Availability — anchored inside the frame. */}
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl bg-white/95 px-4 py-3 backdrop-blur-sm">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[13px] font-semibold text-conceev-black">
                    <span className="h-1.5 w-1.5 rounded-full bg-conceev-green" aria-hidden="true" />
                    Appointments available today
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] text-conceev-grey-mid">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    Bangalore &amp; Hyderabad
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-lg bg-conceev-black px-2.5 py-1.5">
                  <Star className="h-3 w-3 fill-white text-white" aria-hidden="true" />
                  <span className="text-[12px] font-semibold text-white tabular-nums">4.8</span>
                </div>
              </div>
            </div>

            {/* Verification — deliberately breaks the frame edge. */}
            <div className="absolute -left-3 top-8 hidden items-center gap-2.5 rounded-xl border border-conceev-black/[0.07] bg-white py-2.5 pl-3 pr-4 shadow-[0_8px_28px_-16px_rgba(25,23,23,0.4)] sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-conceev-red/10">
                <ShieldCheck className="h-4 w-4 text-conceev-red" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[12px] font-semibold leading-tight text-conceev-black">
                  Credentials verified
                </p>
                <p className="text-[11px] leading-tight text-conceev-grey-mid">
                  Every listed specialist
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Trust strip ─────────────────────────────────────────────────── */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 border-y border-conceev-black/[0.09] sm:grid-cols-4 sm:divide-x sm:divide-conceev-black/[0.09]"
        >
          {HEADLINE_STATS.map((stat) => (
            <Stat key={stat.label} {...stat} active={statsInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
