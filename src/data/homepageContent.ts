/**
 * Editorial content for the 2026 homepage.
 *
 * Everything the homepage renders is either (a) live data from Supabase —
 * doctors, specialities, hospitals, packages — or (b) declared here. No copy
 * lives inside components.
 *
 * ── Provenance ──────────────────────────────────────────────────────────────
 *  ▸ TESTIMONIALS and HEADLINE_STATS are carried over verbatim from the current
 *    live homepage (src/components/Testimonials.tsx, TrustMetrics.tsx). They are
 *    existing approved marketing content — nothing new has been invented, and no
 *    quote, name, rating or figure has been altered.
 *
 *  ▸ HEALTH_INSIGHTS is a clearly-marked PLACEHOLDER set. There is no articles
 *    table in the database yet, so rather than inventing medical article copy
 *    these entries carry `isPlaceholder: true`, link to existing real pages, and
 *    are filtered out the moment a real content source is wired up.
 */

import testimonialPriya from "@/assets/testimonial-priya.jpg";
import testimonialAnanya from "@/assets/testimonial-ananya.jpg";
import testimonialDeepa from "@/assets/testimonial-deepa.jpg";

// ─── Navigation ────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  to: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Find Doctors", to: "/doctors" },
  { label: "Specialities", to: "/packages" },
  { label: "Treatments", to: "/packages" },
  { label: "Hospitals", to: "/hospitals" },
  { label: "Health Packages", to: "/fertility-packages" },
  { label: "Health Insights", to: "/faqs" },
];

// ─── Headline statistics ───────────────────────────────────────────────────────

export interface HeadlineStat {
  /** Numeric portion, counted up on reveal. */
  value: number;
  /** Rendered after the number, e.g. "+" or "★". */
  suffix?: string;
  label: string;
}

/**
 * Carried over verbatim from the current homepage's trust metrics.
 *
 * These are network-level marketing claims and are deliberately NOT replaced
 * with live table counts: the database currently publishes 7 doctors and holds
 * 17 hospital locations, which describes what is listed on the site, not the
 * size of the partner network. Swapping one for the other would misstate the
 * business in either direction. Confirm the real figures before launch.
 */
export const HEADLINE_STATS: HeadlineStat[] = [
  { value: 500, suffix: "+", label: "Patients served" },
  { value: 50, suffix: "+", label: "Specialist doctors" },
  { value: 10, suffix: "+", label: "Partner hospitals" },
  { value: 4.8, suffix: "★", label: "Average patient rating" },
];

// ─── Healthcare journey ────────────────────────────────────────────────────────

export interface JourneyStage {
  id: string;
  index: string;
  title: string;
  description: string;
  icon: string;
}

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: "discover",
    index: "01",
    title: "Discover",
    description: "Find the right doctor, speciality or hospital for what you need.",
    icon: "Search",
  },
  {
    id: "compare",
    index: "02",
    title: "Compare",
    description: "Understand your options, side by side, with nothing hidden.",
    icon: "Scale",
  },
  {
    id: "connect",
    index: "03",
    title: "Connect",
    description: "Book or request a consultation in a few minutes.",
    icon: "CalendarCheck",
  },
  {
    id: "care",
    index: "04",
    title: "Care",
    description: "Continue your healthcare journey with a team that stays with you.",
    icon: "HeartHandshake",
  },
];

// ─── Why Conceev ───────────────────────────────────────────────────────────────

export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const BENEFITS: Benefit[] = [
  {
    id: "verified",
    title: "Verified healthcare",
    description: "Every doctor and hospital on Conceev is checked before they are listed.",
    icon: "BadgeCheck",
  },
  {
    id: "discovery",
    title: "Easy discovery",
    description: "Find the right healthcare option in minutes, not weeks of phone calls.",
    icon: "Compass",
  },
  {
    id: "transparent",
    title: "Transparent information",
    description: "Clear inclusions and clear pricing, so you can decide with confidence.",
    icon: "Eye",
  },
  {
    id: "booking",
    title: "Convenient booking",
    description: "Request a consultation online, and a care coordinator confirms the rest.",
    icon: "CalendarCheck",
  },
  {
    id: "one-journey",
    title: "One healthcare journey",
    description: "Discover, connect and manage your care in a single place.",
    icon: "Route",
  },
];

// ─── Patient stories ───────────────────────────────────────────────────────────

export interface PatientStory {
  quote: string;
  name: string;
  location: string;
  journey: string;
  rating: number;
  image: string;
}

/** Verbatim from the current live homepage. Not newly written. */
export const PATIENT_STORIES: PatientStory[] = [
  {
    quote:
      "Conceev Health made my IVF journey smooth and stress-free. The coordinator was amazing throughout!",
    name: "Priya S.",
    location: "Whitefield, Bangalore",
    journey: "Fertility · IVF",
    rating: 4.8,
    image: testimonialPriya,
  },
  {
    quote:
      "Transparent pricing and no surprises. I knew exactly what I was paying for my hysterectomy. The team was incredibly supportive.",
    name: "Ananya R.",
    location: "Kukatpally, Hyderabad",
    journey: "Gynaecology · Hysterectomy",
    rating: 4.7,
    image: testimonialAnanya,
  },
  {
    quote:
      "Found the best hospital near me within a day. The care manager was with me from consultation to discharge.",
    name: "Deepa M.",
    location: "HSR Layout, Bangalore",
    journey: "Surgery · Care coordination",
    rating: 4.9,
    image: testimonialDeepa,
  },
];

// ─── Health insights ───────────────────────────────────────────────────────────

export interface InsightArticle {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  readingMinutes: number;
  to: string;
  /**
   * PLACEHOLDER marker. No articles table exists yet, so rather than inventing
   * medical article copy these point at real existing pages. Replace with a real
   * content source and drop the flag.
   */
  isPlaceholder: boolean;
}

export const HEALTH_INSIGHTS: InsightArticle[] = [
  {
    id: "fertility-packages",
    category: "Fertility",
    title: "Which fertility assessment is right for you?",
    excerpt:
      "Compare what each assessment covers, who it suits, and what your results may tell you.",
    readingMinutes: 4,
    to: "/fertility-packages",
    isPlaceholder: true,
  },
  {
    id: "egg-freezing",
    category: "Fertility Preservation",
    title: "Understanding egg freezing before you decide",
    excerpt:
      "What an ovarian reserve assessment can indicate, and the questions worth asking first.",
    readingMinutes: 5,
    to: "/fertility-packages/egg-freezing-readiness-check",
    isPlaceholder: true,
  },
  {
    id: "couples",
    category: "Women's Health",
    title: "Why fertility is a conversation for two",
    excerpt:
      "Assessing both partners together gives you one shared picture instead of half of one.",
    readingMinutes: 3,
    to: "/fertility-packages/couples-fertility-assessment",
    isPlaceholder: true,
  },
  {
    id: "faqs",
    category: "Preventive Care",
    title: "Questions patients ask before booking",
    excerpt:
      "Straight answers on consultations, costs, coordinators and what to expect on the day.",
    readingMinutes: 6,
    to: "/faqs",
    isPlaceholder: true,
  },
];

// ─── Footer ────────────────────────────────────────────────────────────────────

export interface FooterColumn {
  heading: string;
  links: NavItem[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Discover",
    links: [
      { label: "Doctors", to: "/doctors" },
      { label: "Hospitals", to: "/hospitals" },
      { label: "Specialities", to: "/packages" },
      { label: "Treatments", to: "/packages" },
      { label: "Health Packages", to: "/fertility-packages" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Health Insights", to: "/faqs" },
      { label: "FAQs", to: "/faqs" },
      { label: "Patient Stories", to: "/about-us" },
      { label: "Healthcare Guides", to: "/faqs" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", to: "/about-us" },
      { label: "Contact", to: "/contact-us" },
      { label: "Careers", to: "/careers" },
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms", to: "/terms-and-conditions" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Centre", to: "/faqs" },
      { label: "Contact Support", to: "/contact-us" },
      { label: "Medical Disclaimer", to: "/medical-disclaimer" },
      { label: "Refund Policy", to: "/refund-policy" },
    ],
  },
];

/** Official Conceev Digital tagline. Do not reword. */
export const BRAND_TAGLINE = "GATEWAY TO DIGITAL TRANSFORMATION";
