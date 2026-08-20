import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  Facebook,
  HeartHandshake,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { BRAND_TAGLINE, FOOTER_COLUMNS } from "@/data/homepageContent";
import { SITE, whatsappLink } from "@/config/site";

/**
 * Final CTA + footer.
 *
 * The CTA uses the brand gradient (left-to-right, ~60°, black → Conceev red).
 * The footer carries the official Conceev Digital tagline verbatim.
 */

interface FinalCtaProps {
  onFindDoctor: () => void;
}

/** Restates promises already made on the page — nothing new is claimed here. */
const CTA_ASSURANCES = [
  {
    title: "Verified healthcare",
    description: "Every doctor and hospital is checked before they are listed.",
    Icon: BadgeCheck,
  },
  {
    title: "Transparent information",
    description: "Clear inclusions and clear pricing, before you commit.",
    Icon: Eye,
  },
  {
    title: "A coordinator on every booking",
    description: "Someone confirms your appointment and stays with you.",
    Icon: HeartHandshake,
  },
] as const;

export const FinalCta = ({ onFindDoctor }: FinalCtaProps) => (
  <section className="bg-white pb-20 sm:pb-28" aria-labelledby="final-cta-heading">
    <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
      <div className="relative overflow-hidden rounded-[24px] bg-conceev-gradient px-7 py-14 sm:px-14 sm:py-16">
        {/* Restrained depth — one soft light source, no colourful wash. */}
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-[420px] w-[420px] rounded-full bg-white/[0.06] blur-[100px]"
          aria-hidden="true"
        />

        {/* Two columns so the panel is not two-thirds empty on desktop. */}
        <div className="relative grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-20">
          <div>
            <h2
              id="final-cta-heading"
              className="max-w-[16ch] text-[34px] font-bold leading-[1.06] text-white sm:text-[46px]"
            >
              Your health deserves better care.
            </h2>
            {/*
              The brand ramp reaches pure Conceev red, where anything below
              white/85 drops under 4.5:1. Held at /85 so the copy stays legible
              wherever the text lands on the gradient at any viewport width.
            */}
            <p className="mt-5 max-w-[44ch] text-[16px] leading-[1.65] text-white/85">
              Find trusted doctors, hospitals and healthcare services with Conceev Health.
            </p>

            {/* whitespace-nowrap: these were breaking to "Find a / Doctor". */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={onFindDoctor}
                className="group inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-7 py-3.5 text-[15px] font-semibold text-conceev-black transition-transform duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-conceev-black"
              >
                Find a Doctor
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>
              <Link
                to="/hospitals"
                className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-white/30 px-7 py-3.5 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-conceev-black"
              >
                Explore Hospitals
              </Link>
            </div>
          </div>

          {/* Reassurance column — same promises made earlier on the page. */}
          <ul className="divide-y divide-white/[0.14] border-y border-white/[0.14]">
            {CTA_ASSURANCES.map(({ title, description, Icon }) => (
              <li key={title} className="flex items-start gap-4 py-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.12] text-white">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-[13px] leading-[1.55] text-white/85">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const SOCIALS = [
  { label: "Conceev Health on Instagram", href: "https://instagram.com", Icon: Instagram },
  { label: "Conceev Health on LinkedIn", href: "https://linkedin.com", Icon: Linkedin },
  { label: "Conceev Health on Facebook", href: "https://facebook.com", Icon: Facebook },
];

const SiteFooter = () => (
  <footer className="bg-conceev-black" aria-labelledby="footer-heading">
    <h2 id="footer-heading" className="sr-only">
      Conceev Health site links and contact details
    </h2>

    <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
      <div className="grid gap-12 border-b border-white/[0.09] py-16 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-8">
        {/* Brand lockup: wordmark + tagline, per Identity Guidelines pg. 4 and 8.
            min-w enforces the 1.5in minimum width; the padding is the clear
            space rule (at least the height of the letter "C" on every side). */}
        <div className="max-w-[34ch]">
          <div className="inline-block min-w-[144px] py-[15px] pr-[15px]">
            <p className="text-[21px] font-bold leading-none text-white">
              Conceev<span className="text-conceev-red">Health</span>
            </p>
            {/* Official tagline — never reworded, and never set in title case. */}
            <p className="mt-2 text-[10px] font-semibold uppercase leading-none tracking-[0.24em] text-conceev-red">
              {BRAND_TAGLINE}
            </p>
          </div>
          <p className="mt-4 text-[14px] leading-[1.65] text-white/55">
            A healthcare platform for discovering trusted doctors, hospitals and treatments —
            with transparent information and a care team that stays with you.
          </p>

          <ul className="mt-7 space-y-2.5 text-[14px]">
            <li>
              <a
                href={`tel:${SITE.phoneNumber}`}
                className="inline-flex items-center gap-2.5 rounded-sm text-white/55 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {SITE.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.supportEmail}`}
                className="inline-flex items-center gap-2.5 rounded-sm text-white/55 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {SITE.supportEmail}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink("Hi Conceev Health, I'd like to know more about your services.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-sm text-white/55 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>

        {/* Link columns */}
        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/55">
              {column.heading}
            </p>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="rounded-sm text-[14px] text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Base bar */}
      <div className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        {/* The tagline is not repeated here: the guidelines tie it to the brand
            lockup and say nothing may be added before or after it, so it sits
            once, directly under the wordmark above. */}
        <p className="text-[13px] text-white/55">
          © {new Date().getFullYear()} Conceev Health. All rights reserved.
        </p>

        <ul className="flex items-center gap-2">
          {SOCIALS.map(({ label, href, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white/55 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
