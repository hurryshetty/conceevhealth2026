/**
 * Fertility package data model + seed catalogue.
 *
 * ────────────────────────────────────────────────────────────────────────────
 *  IMPORTANT — content governance
 * ────────────────────────────────────────────────────────────────────────────
 *  ▸ No package content is hardcoded inside React components. Everything the
 *    listing and detail pages render comes from this shape, which mirrors the
 *    `fertility_packages` table (see supabase/migrations). Once the migration is
 *    applied and rows are published, the database becomes the source of truth
 *    and this file only serves as the fallback / seed catalogue.
 *
 *  ▸ COMMERCIAL PLACEHOLDERS. Every package below ships with `price: null` and
 *    `price_status: "placeholder"`. No price has been invented. The UI renders a
 *    "pricing on request" state until real numbers are set in the admin/DB.
 *
 *  ▸ CLINICAL PLACEHOLDERS. Inclusions reflect only the scope supplied by the
 *    Conceev clinical/commercial brief. Items the brief flagged as "where
 *    clinically appropriate" are encoded as `conditional`, never as guaranteed.
 *    Every package carries `content_status: "pending_clinical_review"` until a
 *    clinician signs it off.
 *
 *  ▸ MEDICAL LANGUAGE. Copy uses "may help assess", "can provide insight into",
 *    "helps your specialist evaluate". No outcome, success-rate or pregnancy
 *    guarantee appears anywhere in this file, and none should be added.
 */

// ─── Intents (drives the "What are you looking for?" selector) ─────────────────

export type IntentId =
  | "understand"
  | "plan-pregnancy"
  | "both-partners"
  | "egg-freezing"
  | "second-opinion"
  | "speak-expert"
  | "preconception";

export interface FertilityIntent {
  id: IntentId;
  label: string;
  description: string;
  /** lucide-react icon name, resolved via getFertilityIcon(). */
  icon: string;
}

export const FERTILITY_INTENTS: FertilityIntent[] = [
  {
    id: "understand",
    label: "Understand my fertility",
    description: "Get a baseline picture of where things stand today.",
    icon: "Compass",
  },
  {
    id: "plan-pregnancy",
    label: "Plan for pregnancy",
    description: "You're trying, or about to start trying.",
    icon: "CalendarHeart",
  },
  {
    id: "both-partners",
    label: "Check both partners",
    description: "Assess her and him together, in one visit.",
    icon: "Users",
  },
  {
    id: "egg-freezing",
    label: "Explore egg freezing",
    description: "Understand your options before you decide.",
    icon: "Snowflake",
  },
  {
    id: "second-opinion",
    label: "Get a second opinion",
    description: "Review existing reports or a proposed plan.",
    icon: "FileSearch",
  },
  {
    id: "speak-expert",
    label: "Speak with a fertility expert",
    description: "Ask questions before committing to anything.",
    icon: "MessageCircleHeart",
  },
  {
    id: "preconception",
    label: "Prepare my body for pregnancy",
    description: "Preconception health, lifestyle and nutrition.",
    icon: "Sprout",
  },
];

// ─── Core types ────────────────────────────────────────────────────────────────

export type PackageAudience = "individual" | "couple" | "either";
export type AvailabilityType = "in_clinic" | "at_home" | "online" | "hybrid";
export type PriceStatus = "confirmed" | "placeholder";
export type ContentStatus = "clinically_approved" | "pending_clinical_review";

/** Tri-state so "where clinically appropriate" is never shown as guaranteed. */
export type ComparisonValue = boolean | "conditional" | string | null;

export interface InclusionItem {
  id: string;
  label: string;
  /** One plain-language sentence. Avoid jargon; explain, don't diagnose. */
  description: string;
  icon: string;
  /** True when the brief marked this "where clinically appropriate". */
  conditional?: boolean;
}

export interface InclusionGroup {
  id: string;
  title: string;
  subtitle?: string;
  /** Visual treatment for couples packages: her / him / together. */
  variant?: "her" | "him" | "together" | "default";
  items: InclusionItem[];
}

export interface IdealForItem {
  title: string;
  description: string;
  icon: string;
}

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PackageVariant {
  id: string;
  label: string;
  description: string;
}

export interface PackageSeo {
  title: string;
  description: string;
  keywords: string[];
  og_title: string;
  og_description: string;
  og_image: string | null;
  /** Only `Service` is asserted — no Product/Offer markup without real pricing. */
  schema_type: "Service" | "MedicalTest";
}

export interface FertilityPackage {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  short_description: string;
  long_description: string;
  hero_title: string;
  hero_description: string;
  audience: PackageAudience;
  /** Short label used on cards, e.g. "Women exploring egg freezing". */
  ideal_for_label: string;
  ideal_for: IdealForItem[];
  intents: IntentId[];

  // Commercials — see the placeholder note at the top of this file.
  price: number | null;
  compare_at_price: number | null;
  price_status: PriceStatus;
  discount_label: string | null;
  currency: string;
  /** Shown instead of a number while price_status is "placeholder". */
  price_placeholder_label: string;

  status: "published" | "draft";
  featured: boolean;
  badge: string | null;
  duration: string | null;
  availability_type: AvailabilityType;
  locations: string[];
  variants: PackageVariant[];

  inclusions: InclusionGroup[];
  exclusions: string[];
  what_you_learn: string[];
  how_it_works: HowItWorksStep[];
  faqs: FaqItem[];
  comparison: Record<string, ComparisonValue>;

  icon: string;
  content_status: ContentStatus;
  seo: PackageSeo;
  display_order: number;
}

// ─── Comparison matrix definition ──────────────────────────────────────────────

export interface ComparisonRow {
  key: string;
  label: string;
  /** "text" rows render the raw string; others render a tri-state indicator. */
  type: "text" | "state";
  hint?: string;
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  { key: "ideal_for", label: "Ideal for", type: "text" },
  { key: "female_assessment", label: "Female assessment", type: "state" },
  { key: "male_assessment", label: "Male assessment", type: "state" },
  {
    key: "amh",
    label: "AMH / ovarian reserve",
    type: "state",
    hint: "A blood marker that may help indicate ovarian reserve.",
  },
  { key: "hormonal_evaluation", label: "Hormonal evaluation", type: "state" },
  {
    key: "ultrasound_afc",
    label: "Ultrasound / antral follicle count",
    type: "state",
    hint: "A scan that can help your specialist assess follicle numbers.",
  },
  { key: "semen_analysis", label: "Semen analysis", type: "state" },
  { key: "specialist_consultation", label: "Fertility specialist consultation", type: "state" },
  { key: "results_review", label: "Results review with an expert", type: "state" },
  { key: "personalised_plan", label: "Personalised next-step plan", type: "state" },
  { key: "availability", label: "In-clinic / at-home", type: "text" },
  { key: "locations", label: "Available in", type: "text" },
];

// ─── Shared content ────────────────────────────────────────────────────────────

/** Placeholder locations — replace once the commercial team confirms coverage. */
const DEFAULT_LOCATIONS = ["Bangalore", "Hyderabad"];

const AVAILABILITY_LABEL: Record<AvailabilityType, string> = {
  in_clinic: "In-clinic",
  at_home: "At-home",
  online: "Online",
  hybrid: "In-clinic or at-home",
};

export const availabilityLabel = (type: AvailabilityType): string =>
  AVAILABILITY_LABEL[type];

const STANDARD_STEPS: HowItWorksStep[] = [
  {
    step: "01",
    title: "Choose your package",
    description:
      "Pick the assessment that matches where you are today. Not sure? Our care team can help you decide.",
  },
  {
    step: "02",
    title: "Book your appointment",
    description:
      "Share your details and a care coordinator confirms your slot, location and any preparation you need.",
  },
  {
    step: "03",
    title: "Complete your assessment",
    description:
      "Attend your visit. Your coordinator tells you exactly what to expect before you arrive.",
  },
  {
    step: "04",
    title: "Meet your expert",
    description:
      "A fertility specialist reviews your results with you and explains the next steps worth discussing.",
  },
];

/**
 * FAQs common to every assessment package. Package-specific FAQs are appended.
 * Operational specifics (turnaround, fasting) are intentionally left to the care
 * coordinator rather than stated as fact before the clinical team confirms them.
 */
const SHARED_FAQS: FaqItem[] = [
  {
    question: "Do I need a doctor's referral to book?",
    answer:
      "No referral is needed. You can book any assessment directly, and a fertility specialist reviews your results with you afterwards.",
  },
  {
    question: "Do I need to fast before my tests?",
    answer:
      "It depends on which investigations are included for you. Your care coordinator confirms any fasting or cycle-day requirements when your appointment is scheduled, so you are never left guessing.",
  },
  {
    question: "When will I receive my results?",
    answer:
      "Turnaround varies by investigation and by lab. Your coordinator gives you an expected timeline at the time of booking and lets you know as soon as your results are ready for review.",
  },
  {
    question: "How long does the appointment take?",
    answer:
      "Your coordinator shares the expected duration for your specific appointment when you book, along with the location and anything you need to bring.",
  },
  {
    question: "Can I add additional tests?",
    answer:
      "Yes. If your specialist feels further evaluation may be useful, additional investigations can be discussed and arranged. Any additional cost is confirmed with you before anything is carried out.",
  },
  {
    question: "Does this package include treatment?",
    answer:
      "No. These are assessment and consultation packages. They may help you and your specialist understand your situation and decide what to consider next — any treatment is quoted and consented to separately.",
  },
  {
    question: "Does this package guarantee pregnancy?",
    answer:
      "No. No assessment can guarantee pregnancy, and no test can detect every possible fertility factor. These packages are designed to give you and your specialist clearer information to work from.",
  },
  {
    question: "Can I book a consultation after receiving my results?",
    answer:
      "Yes. A results review with a fertility specialist is part of every assessment package, and you can book further consultations at any point.",
  },
];

const EXPERT_CARE_GROUP: InclusionGroup = {
  id: "expert-care",
  title: "Expert care",
  subtitle: "The part that turns numbers into a plan.",
  variant: "default",
  items: [
    {
      id: "specialist-consultation",
      label: "Fertility specialist consultation",
      description: "Time with a specialist to talk through your history and your questions.",
      icon: "Stethoscope",
    },
    {
      id: "results-review",
      label: "Results review",
      description: "Your results explained in plain language, not handed over as a printout.",
      icon: "ClipboardCheck",
    },
    {
      id: "next-steps",
      label: "Personalised next-step recommendation",
      description: "A clear view of what may be worth considering, and what can wait.",
      icon: "Route",
    },
  ],
};

const STANDARD_EXCLUSIONS = [
  "Fertility treatment (IVF, IUI, ICSI) — quoted separately if you choose to proceed",
  "Medication and prescriptions",
  "Investigations beyond those listed, unless agreed with you in advance",
  "Treatment at partner hospitals arranged under a separate care plan",
];

// ─── Seed catalogue ────────────────────────────────────────────────────────────

export const FERTILITY_PACKAGES: FertilityPackage[] = [
  // ── 1. Fertility Health Check ───────────────────────────────────────────────
  {
    id: "seed-fertility-health-check",
    slug: "fertility-health-check",
    name: "Fertility Health Check",
    category: "Fertility Assessment",
    tagline: "Start with a baseline",
    short_description:
      "A first look at your reproductive health, reviewed with a fertility specialist.",
    long_description:
      "If you have never had your fertility looked at, this is the place to begin. The Fertility Health Check combines a consultation, an ovarian reserve assessment and relevant blood investigations, then puts the results in front of a fertility specialist who explains what they may mean for you. It is a starting point, not a verdict — and it is designed for women who simply want to know where they stand.",
    hero_title: "Know where your fertility stands today",
    hero_description:
      "A baseline fertility assessment with specialist interpretation, so you're working from information rather than guesswork.",
    audience: "individual",
    ideal_for_label: "Women wanting a fertility baseline",
    ideal_for: [
      {
        title: "You want to understand your fertility",
        description: "Not because something is wrong — because you'd rather know.",
        icon: "Compass",
      },
      {
        title: "You're thinking about pregnancy",
        description: "Now, or somewhere in the next few years.",
        icon: "CalendarHeart",
      },
      {
        title: "You've never been assessed before",
        description: "And you want a clear, unhurried starting point.",
        icon: "Sparkles",
      },
      {
        title: "You want a baseline to track",
        description: "Something to compare against if you reassess later.",
        icon: "TrendingUp",
      },
    ],
    intents: ["understand", "plan-pregnancy"],
    price: null,
    compare_at_price: null,
    price_status: "placeholder",
    discount_label: null,
    currency: "INR",
    price_placeholder_label: "Pricing on request",
    status: "published",
    featured: false,
    badge: "Best first step",
    duration: "Single visit",
    availability_type: "in_clinic",
    locations: DEFAULT_LOCATIONS,
    variants: [],
    inclusions: [
      {
        id: "female-fertility",
        title: "Female fertility",
        subtitle: "Your baseline reproductive assessment.",
        variant: "default",
        items: [
          {
            id: "amh",
            label: "AMH / ovarian reserve assessment",
            description:
              "A blood marker that may help indicate how many eggs remain available — one part of the fertility picture, not the whole of it.",
            icon: "FlaskConical",
          },
          {
            id: "repro-health",
            label: "Basic reproductive health evaluation",
            description:
              "A structured review of your cycle, history and symptoms with a fertility specialist.",
            icon: "HeartPulse",
          },
          {
            id: "bloods",
            label: "Relevant blood investigations",
            description:
              "Blood work selected for your situation, so you're not paying for tests you don't need.",
            icon: "TestTube",
          },
        ],
      },
      EXPERT_CARE_GROUP,
    ],
    exclusions: STANDARD_EXCLUSIONS,
    what_you_learn: [
      "An indication of your ovarian reserve",
      "How your cycle and history fit into the wider fertility picture",
      "Whether any of your results may warrant further evaluation",
      "Which next steps are worth discussing with your specialist",
      "What a realistic timeline could look like for you",
    ],
    how_it_works: STANDARD_STEPS,
    faqs: [
      {
        question: "Who is this package for?",
        answer:
          "Women who want a baseline understanding of their reproductive health — whether they're planning pregnancy soon, thinking about it for later, or simply want to know where they stand.",
      },
      {
        question: "When in my cycle should I book?",
        answer:
          "Some fertility investigations are best done on specific cycle days. Your care coordinator asks about your cycle when you book and schedules your appointment accordingly.",
      },
      ...SHARED_FAQS,
    ],
    comparison: {
      ideal_for: "A first fertility baseline",
      female_assessment: true,
      male_assessment: false,
      amh: true,
      hormonal_evaluation: "conditional",
      ultrasound_afc: false,
      semen_analysis: false,
      specialist_consultation: true,
      results_review: true,
      personalised_plan: true,
      availability: "In-clinic",
      locations: DEFAULT_LOCATIONS.join(", "),
    },
    icon: "Compass",
    content_status: "pending_clinical_review",
    seo: {
      title: "Fertility Health Check in Bangalore & Hyderabad | Conceev Health",
      description:
        "A baseline fertility assessment with AMH, relevant blood investigations and a fertility specialist review. Understand your reproductive health with Conceev Health.",
      keywords: [
        "fertility health check",
        "fertility test bangalore",
        "AMH test",
        "ovarian reserve test",
        "fertility assessment hyderabad",
      ],
      og_title: "Fertility Health Check | Conceev Health",
      og_description:
        "Understand your fertility baseline with specialist-reviewed testing at Conceev Health.",
      og_image: null,
      schema_type: "Service",
    },
    display_order: 1,
  },

  // ── 2. Complete Fertility Assessment ────────────────────────────────────────
  {
    id: "seed-complete-fertility-assessment",
    slug: "complete-fertility-assessment",
    name: "Complete Fertility Assessment",
    category: "Fertility Assessment",
    tagline: "A deeper evaluation",
    short_description:
      "A more comprehensive look at your reproductive health, hormones and fertility status.",
    long_description:
      "Where the Fertility Health Check gives you a baseline, the Complete Fertility Assessment goes further. It adds a broader hormonal evaluation and, where clinically appropriate, thyroid-related fertility markers, metabolic assessment and an ultrasound with antral follicle count. Everything is reviewed by a fertility specialist who builds you a personalised fertility roadmap rather than handing over a stack of numbers.",
    hero_title: "A deeper look at your reproductive health",
    hero_description:
      "Our most comprehensive individual assessment, combining ovarian reserve, hormonal evaluation and specialist review into one personalised fertility roadmap.",
    audience: "individual",
    ideal_for_label: "Women wanting a comprehensive evaluation",
    ideal_for: [
      {
        title: "You've been trying to conceive",
        description: "And you want a fuller picture than a single marker can give.",
        icon: "CalendarHeart",
      },
      {
        title: "Your cycle has changed",
        description: "Irregularity, new symptoms, or something that doesn't feel right.",
        icon: "Activity",
      },
      {
        title: "A basic check raised questions",
        description: "You want the broader evaluation that answers them.",
        icon: "FileSearch",
      },
      {
        title: "You're planning IVF or IUI",
        description: "And want a thorough assessment before deciding anything.",
        icon: "Route",
      },
    ],
    intents: ["understand", "plan-pregnancy", "second-opinion"],
    price: null,
    compare_at_price: null,
    price_status: "placeholder",
    discount_label: null,
    currency: "INR",
    price_placeholder_label: "Pricing on request",
    status: "published",
    featured: true,
    badge: "Most Popular",
    duration: "Single visit",
    availability_type: "in_clinic",
    locations: DEFAULT_LOCATIONS,
    variants: [],
    inclusions: [
      {
        id: "female-fertility",
        title: "Female fertility",
        subtitle: "A broader reproductive and hormonal evaluation.",
        variant: "default",
        items: [
          {
            id: "ovarian-reserve",
            label: "Ovarian reserve assessment",
            description:
              "May help indicate the number of eggs still available to you.",
            icon: "FlaskConical",
          },
          {
            id: "hormonal",
            label: "Hormonal evaluation",
            description:
              "A wider hormone panel that can provide insight into ovulation and cycle regulation.",
            icon: "TestTube",
          },
          {
            id: "thyroid",
            label: "Thyroid-related fertility markers",
            description:
              "Included where clinically appropriate — thyroid function can influence cycles and conception.",
            icon: "Waves",
            conditional: true,
          },
          {
            id: "metabolic",
            label: "Metabolic assessment",
            description:
              "Included where clinically appropriate, as metabolic health can be relevant to fertility.",
            icon: "Activity",
            conditional: true,
          },
          {
            id: "ultrasound",
            label: "Ultrasound / antral follicle count",
            description:
              "A scan that helps your specialist assess follicle numbers, where included in your plan.",
            icon: "Scan",
            conditional: true,
          },
        ],
      },
      {
        ...EXPERT_CARE_GROUP,
        items: [
          EXPERT_CARE_GROUP.items[0],
          {
            id: "doctor-review",
            label: "Doctor review",
            description:
              "A fertility specialist interprets your full set of results together, not in isolation.",
            icon: "ClipboardCheck",
          },
          {
            id: "roadmap",
            label: "Personalised fertility roadmap",
            description:
              "What your results may mean, what to consider next, and on what timeline.",
            icon: "Route",
          },
        ],
      },
    ],
    exclusions: STANDARD_EXCLUSIONS,
    what_you_learn: [
      "An indication of your ovarian reserve",
      "How your hormonal health may be affecting your cycle",
      "Key fertility factors relevant to your situation",
      "Whether further evaluation may be useful",
      "Which next steps to discuss with your specialist",
    ],
    how_it_works: STANDARD_STEPS,
    faqs: [
      {
        question: "How is this different from the Fertility Health Check?",
        answer:
          "The Fertility Health Check gives you a baseline: ovarian reserve, relevant bloods and a specialist review. The Complete Fertility Assessment adds a broader hormonal evaluation and — where clinically appropriate — thyroid-related markers, metabolic assessment and an ultrasound with antral follicle count, finishing with a personalised fertility roadmap.",
      },
      {
        question: "Which tests will actually be included for me?",
        answer:
          "Your specialist confirms the exact investigations based on your history, cycle and symptoms. Items marked 'where clinically appropriate' are included only when they may add something useful for you.",
      },
      ...SHARED_FAQS,
    ],
    comparison: {
      ideal_for: "A comprehensive individual evaluation",
      female_assessment: true,
      male_assessment: false,
      amh: true,
      hormonal_evaluation: true,
      ultrasound_afc: "conditional",
      semen_analysis: false,
      specialist_consultation: true,
      results_review: true,
      personalised_plan: true,
      availability: "In-clinic",
      locations: DEFAULT_LOCATIONS.join(", "),
    },
    icon: "Microscope",
    content_status: "pending_clinical_review",
    seo: {
      title: "Complete Fertility Assessment | Conceev Health",
      description:
        "A comprehensive fertility evaluation covering ovarian reserve, hormonal assessment and specialist review, ending with a personalised fertility roadmap.",
      keywords: [
        "complete fertility assessment",
        "comprehensive fertility test",
        "hormonal evaluation fertility",
        "antral follicle count",
        "fertility roadmap",
      ],
      og_title: "Complete Fertility Assessment | Conceev Health",
      og_description:
        "A deeper look at your reproductive health, reviewed by a fertility specialist.",
      og_image: null,
      schema_type: "Service",
    },
    display_order: 2,
  },

  // ── 3. Couples Fertility Assessment ─────────────────────────────────────────
  {
    id: "seed-couples-fertility-assessment",
    slug: "couples-fertility-assessment",
    name: "Couples Fertility Assessment",
    category: "Couples Assessment",
    tagline: "Fertility takes two",
    short_description:
      "Assess both partners together, so you're not solving half the picture.",
    long_description:
      "Fertility is rarely a one-person question, yet it is often investigated as though it were. This assessment looks at both partners in parallel — a female fertility assessment on one side, a semen analysis and male fertility evaluation on the other — then brings the two together in a single consultation with a fertility specialist. You leave with one shared understanding and one shared plan.",
    hero_title: "Fertility takes two. Start by understanding both sides.",
    hero_description:
      "A parallel assessment for both partners, reviewed together in one consultation with a fertility specialist.",
    audience: "couple",
    ideal_for_label: "Couples assessing together",
    ideal_for: [
      {
        title: "You're trying to conceive",
        description: "And want to understand both sides rather than one.",
        icon: "Users",
      },
      {
        title: "You've been trying for a while",
        description: "Without a clear explanation so far.",
        icon: "Clock",
      },
      {
        title: "You're planning ahead together",
        description: "You don't have to be struggling to get checked.",
        icon: "CalendarHeart",
      },
      {
        title: "You want one shared plan",
        description: "Not two separate appointments and two separate reports.",
        icon: "Route",
      },
    ],
    intents: ["both-partners", "plan-pregnancy", "understand"],
    price: null,
    compare_at_price: null,
    price_status: "placeholder",
    discount_label: null,
    currency: "INR",
    price_placeholder_label: "Pricing on request",
    status: "published",
    featured: true,
    badge: "Best for Couples",
    duration: "Single visit for both partners",
    availability_type: "in_clinic",
    locations: DEFAULT_LOCATIONS,
    variants: [],
    inclusions: [
      {
        id: "for-her",
        title: "For her",
        subtitle: "Female fertility assessment",
        variant: "her",
        items: [
          {
            id: "female-assessment",
            label: "Female fertility assessment",
            description:
              "A structured review of your cycle, history and reproductive health with a specialist.",
            icon: "HeartPulse",
          },
          {
            id: "ovarian-reserve",
            label: "Ovarian reserve assessment",
            description: "May help indicate how many eggs remain available.",
            icon: "FlaskConical",
          },
          {
            id: "hormonal",
            label: "Relevant hormonal evaluation",
            description:
              "Hormone testing selected for your situation, which can provide insight into ovulation.",
            icon: "TestTube",
          },
          {
            id: "ultrasound",
            label: "Ultrasound / antral follicle count",
            description:
              "A scan to help assess follicle numbers, where applicable to your assessment.",
            icon: "Scan",
            conditional: true,
          },
        ],
      },
      {
        id: "for-him",
        title: "For him",
        subtitle: "Male fertility assessment",
        variant: "him",
        items: [
          {
            id: "semen-analysis",
            label: "Semen analysis",
            description:
              "Looks at count, motility and morphology — the most direct male fertility investigation.",
            icon: "Microscope",
          },
          {
            id: "male-evaluation",
            label: "Male fertility evaluation",
            description:
              "A clinical review of history and lifestyle factors that may be relevant.",
            icon: "ClipboardCheck",
          },
          {
            id: "additional-male",
            label: "Additional tests",
            description:
              "Further male investigations where clinically appropriate, agreed with you first.",
            icon: "TestTube",
            conditional: true,
          },
        ],
      },
      {
        id: "together",
        title: "Together",
        subtitle: "One consultation, one plan",
        variant: "together",
        items: [
          {
            id: "joint-consultation",
            label: "Fertility specialist consultation",
            description: "You attend together, so nothing gets relayed second-hand.",
            icon: "Stethoscope",
          },
          {
            id: "joint-review",
            label: "Results review",
            description:
              "Both sets of results explained side by side, in plain language.",
            icon: "ClipboardCheck",
          },
          {
            id: "couple-plan",
            label: "Couple-focused next-step plan",
            description: "One shared plan you both understand and agree on.",
            icon: "Route",
          },
        ],
      },
    ],
    exclusions: STANDARD_EXCLUSIONS,
    what_you_learn: [
      "An indication of her ovarian reserve and hormonal health",
      "What his semen analysis may suggest about male fertility factors",
      "How both sets of results fit together",
      "Whether further evaluation may be useful for either partner",
      "Which next steps to discuss as a couple with your specialist",
    ],
    how_it_works: [
      STANDARD_STEPS[0],
      {
        step: "02",
        title: "Book one appointment for both",
        description:
          "Your coordinator schedules both partners into the same visit and confirms any preparation each of you needs.",
      },
      {
        step: "03",
        title: "Attend together",
        description:
          "Her assessment and his assessment happen in the same visit, so you're not making two separate trips.",
      },
      {
        step: "04",
        title: "Review as a couple",
        description:
          "A fertility specialist takes you both through the combined results and what may be worth considering next.",
      },
    ],
    faqs: [
      {
        question: "Do we both need to attend the same appointment?",
        answer:
          "It's designed that way, and it's usually simpler. If one of you can't make the scheduled slot, your care coordinator can arrange the two assessments separately and still bring the results together for a joint review.",
      },
      {
        question: "Does this mean we need IVF?",
        answer:
          "No. This is an assessment, not a treatment pathway. It's designed to help you both understand where you stand, and treatment is only discussed if and when it becomes relevant to you.",
      },
      {
        question: "Can my partner come with me?",
        answer:
          "Yes — this package is built around both partners attending together, and the consultation is designed for the two of you.",
      },
      ...SHARED_FAQS,
    ],
    comparison: {
      ideal_for: "Couples assessing both sides together",
      female_assessment: true,
      male_assessment: true,
      amh: true,
      hormonal_evaluation: true,
      ultrasound_afc: "conditional",
      semen_analysis: true,
      specialist_consultation: true,
      results_review: true,
      personalised_plan: true,
      availability: "In-clinic",
      locations: DEFAULT_LOCATIONS.join(", "),
    },
    icon: "Users",
    content_status: "pending_clinical_review",
    seo: {
      title: "Couples Fertility Assessment | Conceev Health",
      description:
        "Assess both partners in one visit — female fertility assessment, semen analysis and a joint fertility specialist consultation with a shared next-step plan.",
      keywords: [
        "couples fertility test",
        "couple fertility assessment",
        "semen analysis bangalore",
        "male fertility test",
        "fertility check for couples",
      ],
      og_title: "Couples Fertility Assessment | Conceev Health",
      og_description:
        "Fertility takes two. Assess both partners together and leave with one shared plan.",
      og_image: null,
      schema_type: "Service",
    },
    display_order: 3,
  },

  // ── 4. Egg Freezing Readiness Check ─────────────────────────────────────────
  {
    id: "seed-egg-freezing-readiness-check",
    slug: "egg-freezing-readiness-check",
    name: "Egg Freezing Readiness Check",
    category: "Fertility Preservation",
    tagline: "Information before commitment",
    short_description:
      "Understand your fertility before deciding whether to freeze your eggs.",
    long_description:
      "The first step in egg freezing isn't freezing your eggs — it's finding out whether it makes sense for you. This check combines an AMH test and, where applicable, an ultrasound with antral follicle count, then gives you an unhurried conversation with a fertility specialist about suitability, what the process would actually involve, and what it would cost and take. No injections. No commitment. Just the information you'd want before deciding.",
    hero_title: "Understand your fertility before you decide about freezing",
    hero_description:
      "An assessment and specialist conversation designed to inform your decision — not to push you toward one.",
    audience: "individual",
    ideal_for_label: "Women considering egg freezing",
    ideal_for: [
      {
        title: "You're considering egg freezing",
        description: "But want facts before you commit to anything.",
        icon: "Snowflake",
      },
      {
        title: "You're not ready for children yet",
        description: "And want to understand your options for later.",
        icon: "Clock",
      },
      {
        title: "You want to know if it's suitable",
        description: "Egg freezing isn't the right answer for everyone.",
        icon: "FileSearch",
      },
      {
        title: "You want the real cost and timeline",
        description: "Discussed openly, before you make a decision.",
        icon: "Receipt",
      },
    ],
    intents: ["egg-freezing", "understand"],
    price: null,
    compare_at_price: null,
    price_status: "placeholder",
    discount_label: null,
    currency: "INR",
    price_placeholder_label: "Pricing on request",
    status: "published",
    featured: false,
    badge: "No commitment",
    duration: "Single visit",
    availability_type: "in_clinic",
    locations: DEFAULT_LOCATIONS,
    variants: [],
    inclusions: [
      {
        id: "assessment",
        title: "Your assessment",
        subtitle: "The two measures most relevant to this decision.",
        variant: "default",
        items: [
          {
            id: "amh",
            label: "AMH",
            description:
              "A blood marker that may help indicate ovarian reserve — a key input when considering egg freezing.",
            icon: "FlaskConical",
          },
          {
            id: "afc",
            label: "Antral follicle count / ultrasound",
            description:
              "A scan that helps your specialist assess follicle numbers, where applicable.",
            icon: "Scan",
            conditional: true,
          },
        ],
      },
      {
        id: "the-conversation",
        title: "The conversation",
        subtitle: "Where the decision actually gets made.",
        variant: "default",
        items: [
          {
            id: "specialist-consultation",
            label: "Fertility specialist consultation",
            description: "Unhurried time with a specialist to ask anything you want.",
            icon: "Stethoscope",
          },
          {
            id: "suitability",
            label: "Egg-freezing suitability discussion",
            description:
              "An honest view of whether egg freezing may be appropriate for your situation.",
            icon: "ClipboardCheck",
          },
          {
            id: "next-steps",
            label: "Expected next steps",
            description: "What the process would involve if you chose to go ahead.",
            icon: "Route",
          },
          {
            id: "cost-timeline",
            label: "Cost and timeline discussion",
            description: "What it would cost and how long it would take, discussed openly.",
            icon: "Receipt",
          },
        ],
      },
    ],
    exclusions: [
      "The egg freezing cycle itself — quoted separately if you choose to proceed",
      "Stimulation medication and injections",
      "Egg storage fees",
      ...STANDARD_EXCLUSIONS.slice(2),
    ],
    what_you_learn: [
      "An indication of your ovarian reserve today",
      "Whether egg freezing may be appropriate for your situation",
      "What the process would realistically involve",
      "What it would cost and how long it would take",
      "Whether waiting, proceeding or reassessing later may make more sense for you",
    ],
    how_it_works: [
      STANDARD_STEPS[0],
      STANDARD_STEPS[1],
      {
        step: "03",
        title: "Complete your assessment",
        description:
          "Your AMH test and, where applicable, your scan — in a single visit. No injections and no commitment.",
      },
      {
        step: "04",
        title: "Decide with a specialist",
        description:
          "Talk through your results, suitability, cost and timeline before deciding anything.",
      },
    ],
    faqs: [
      {
        question: "Does booking this mean I'm committing to freezing my eggs?",
        answer:
          "No. That's the point of it. This check exists so you can make the decision with information rather than without it, and choosing not to proceed is a completely normal outcome.",
      },
      {
        question: "Does this package guarantee a successful egg freezing outcome?",
        answer:
          "No. This is an assessment and consultation only. It may help you and your specialist understand your ovarian reserve and whether egg freezing is worth considering — it cannot predict or guarantee any future outcome, including future pregnancy.",
      },
      {
        question: "Am I too young or too old for this?",
        answer:
          "There's no single right age. Your specialist discusses how your age and results fit together and what that may mean for the timing of any decision.",
      },
      ...SHARED_FAQS,
    ],
    comparison: {
      ideal_for: "Deciding whether to freeze your eggs",
      female_assessment: true,
      male_assessment: false,
      amh: true,
      hormonal_evaluation: "conditional",
      ultrasound_afc: "conditional",
      semen_analysis: false,
      specialist_consultation: true,
      results_review: true,
      personalised_plan: true,
      availability: "In-clinic",
      locations: DEFAULT_LOCATIONS.join(", "),
    },
    icon: "Snowflake",
    content_status: "pending_clinical_review",
    seo: {
      title: "Egg Freezing Readiness Check | Conceev Health",
      description:
        "Understand your fertility before deciding whether to freeze your eggs. AMH, antral follicle count where applicable, and an unhurried fertility specialist consultation.",
      keywords: [
        "egg freezing check",
        "egg freezing readiness",
        "AMH test egg freezing",
        "egg freezing consultation bangalore",
        "fertility preservation",
      ],
      og_title: "Egg Freezing Readiness Check | Conceev Health",
      og_description:
        "The first step to freezing isn't freezing. It's finding out where you stand today.",
      og_image: null,
      schema_type: "Service",
    },
    display_order: 4,
  },

  // ── 5. Fertility Expert Consultation ────────────────────────────────────────
  {
    id: "seed-fertility-expert-consultation",
    slug: "fertility-expert-consultation",
    name: "Fertility Expert Consultation",
    category: "Consultation",
    tagline: "Ask before you commit",
    short_description:
      "Time with a fertility expert to make sense of where you are and what comes next.",
    long_description:
      "Sometimes what you need isn't another test — it's someone to sit down and explain things properly. This consultation gives you unhurried time with a fertility expert to talk through your history, understand reports you already have, or think out loud about a plan someone has proposed. You choose whether that's a fertility specialist, a fertility counsellor, or a second opinion on an existing recommendation.",
    hero_title: "Talk to someone who can explain it properly",
    hero_description:
      "Unhurried time with a fertility expert — to understand your reports, weigh your options, or get a second opinion before you commit.",
    audience: "either",
    ideal_for_label: "Anyone with fertility questions",
    ideal_for: [
      {
        title: "You're trying to conceive",
        description: "And want expert input on where to go from here.",
        icon: "CalendarHeart",
      },
      {
        title: "You're considering IVF or IUI",
        description: "And want to understand the options before deciding.",
        icon: "Route",
      },
      {
        title: "You're confused by your reports",
        description: "And want them explained in language that makes sense.",
        icon: "FileSearch",
      },
      {
        title: "You want a second opinion",
        description: "On a diagnosis, a plan, or a quote you've been given.",
        icon: "MessageCircleHeart",
      },
    ],
    intents: ["speak-expert", "second-opinion", "understand", "egg-freezing"],
    price: null,
    compare_at_price: null,
    price_status: "placeholder",
    discount_label: null,
    currency: "INR",
    price_placeholder_label: "Pricing on request",
    status: "published",
    featured: false,
    badge: null,
    duration: "Single consultation",
    availability_type: "hybrid",
    locations: DEFAULT_LOCATIONS,
    variants: [
      {
        id: "doctor",
        label: "Doctor consultation",
        description:
          "A fertility specialist, for clinical questions and treatment options.",
      },
      {
        id: "counsellor",
        label: "Fertility counsellor / coach",
        description:
          "For the emotional side, decision-making support and lifestyle questions.",
      },
      {
        id: "second-opinion",
        label: "Second opinion",
        description:
          "A fresh clinical review of existing reports or a proposed treatment plan.",
      },
    ],
    inclusions: [
      {
        id: "consultation",
        title: "Your consultation",
        subtitle: "Choose the kind of expert you need.",
        variant: "default",
        items: [
          {
            id: "expert-time",
            label: "Time with a fertility expert",
            description:
              "A specialist, a counsellor, or a second-opinion review — your choice at booking.",
            icon: "Stethoscope",
          },
          {
            id: "report-review",
            label: "Review of your existing reports",
            description:
              "Bring what you already have and have it explained in plain language.",
            icon: "FileSearch",
          },
          {
            id: "questions",
            label: "Your questions, answered",
            description: "No question is too basic. That's what the time is for.",
            icon: "MessageCircleHeart",
          },
          {
            id: "next-steps",
            label: "A clear view of next steps",
            description:
              "What may be worth considering, what can wait, and what to ask next.",
            icon: "Route",
          },
        ],
      },
    ],
    exclusions: [
      "Investigations and tests — arranged separately if recommended",
      ...STANDARD_EXCLUSIONS,
    ],
    what_you_learn: [
      "What your existing results may indicate",
      "Which options are realistically open to you",
      "What a proposed treatment plan actually involves",
      "Which questions are worth asking before committing",
      "Whether further evaluation may be useful",
    ],
    how_it_works: [
      {
        step: "01",
        title: "Choose your expert",
        description:
          "A fertility specialist, a fertility counsellor, or a second opinion on an existing plan.",
      },
      {
        step: "02",
        title: "Book your slot",
        description:
          "Share your details and a care coordinator confirms your appointment, online or in-clinic.",
      },
      {
        step: "03",
        title: "Send anything you have",
        description:
          "Existing reports or scans help, but they're not required — you can book with nothing at all.",
      },
      {
        step: "04",
        title: "Talk it through",
        description:
          "Unhurried time to ask your questions and leave with a clear sense of what comes next.",
      },
    ],
    faqs: [
      {
        question: "Do I need test results before booking?",
        answer:
          "No. You can book with nothing at all. If you do have previous reports or scans, bringing them means your expert can be more specific.",
      },
      {
        question: "Will I be pushed toward treatment?",
        answer:
          "No. The purpose of this consultation is to help you understand your situation. If treatment is worth considering, your expert explains why — and choosing to wait or do nothing is always a valid outcome.",
      },
      {
        question: "Can I do this online?",
        answer:
          "Yes. Consultations can be arranged online or in-clinic. Let your care coordinator know which you'd prefer when you book.",
      },
      {
        question: "What's the difference between the doctor and the counsellor?",
        answer:
          "A fertility specialist covers the clinical side — results, investigations and treatment options. A fertility counsellor or coach focuses on the decision-making and emotional side, and on lifestyle questions. Many people find both useful at different points.",
      },
      ...SHARED_FAQS.slice(1),
    ],
    comparison: {
      ideal_for: "Questions, reports or a second opinion",
      female_assessment: false,
      male_assessment: false,
      amh: false,
      hormonal_evaluation: false,
      ultrasound_afc: false,
      semen_analysis: false,
      specialist_consultation: true,
      results_review: true,
      personalised_plan: true,
      availability: "Online or in-clinic",
      locations: DEFAULT_LOCATIONS.join(", "),
    },
    icon: "MessageCircleHeart",
    content_status: "pending_clinical_review",
    seo: {
      title: "Speak to a Fertility Expert | Conceev Health",
      description:
        "Book unhurried time with a fertility specialist or counsellor. Understand your reports, weigh your options, or get a second opinion before you commit to treatment.",
      keywords: [
        "fertility consultation",
        "speak to fertility expert",
        "fertility second opinion",
        "IVF second opinion india",
        "online fertility consultation",
      ],
      og_title: "Speak to a Fertility Expert | Conceev Health",
      og_description:
        "Unhurried time with a fertility expert, to understand where you are and what comes next.",
      og_image: null,
      schema_type: "Service",
    },
    display_order: 5,
  },

  // ── 6. Preconception & Fertility Wellness ───────────────────────────────────
  {
    id: "seed-preconception-fertility-wellness",
    slug: "preconception-fertility-wellness",
    name: "Preconception & Fertility Wellness",
    category: "Preconception Care",
    tagline: "Prepare before you try",
    short_description:
      "For planning pregnancy well — not because something is wrong.",
    long_description:
      "Most preparation for pregnancy happens after a positive test. This package moves it earlier. It combines a preconception assessment, relevant investigations and a consultation covering lifestyle, nutrition and fertility optimisation — aimed at people who are planning pregnancy and want to go in prepared, whether or not they have any fertility concern at all.",
    hero_title: "Prepare your body before you start trying",
    hero_description:
      "A preconception assessment and expert guidance on lifestyle, nutrition and fertility optimisation — for planning well, not for fixing a problem.",
    audience: "either",
    ideal_for_label: "People planning pregnancy",
    ideal_for: [
      {
        title: "You're planning pregnancy",
        description: "In the next few months or the next year.",
        icon: "Sprout",
      },
      {
        title: "You want to prepare properly",
        description: "Rather than start figuring it out after a positive test.",
        icon: "CalendarHeart",
      },
      {
        title: "You have no known fertility problem",
        description: "You don't need one to benefit from preparing well.",
        icon: "Sparkles",
      },
      {
        title: "You want lifestyle guidance",
        description: "Nutrition and habits, grounded in your own assessment.",
        icon: "Apple",
      },
    ],
    intents: ["preconception", "plan-pregnancy", "understand"],
    price: null,
    compare_at_price: null,
    price_status: "placeholder",
    discount_label: null,
    currency: "INR",
    price_placeholder_label: "Pricing on request",
    status: "published",
    featured: false,
    badge: "Best for Planning",
    duration: "Single visit",
    availability_type: "hybrid",
    locations: DEFAULT_LOCATIONS,
    variants: [],
    inclusions: [
      {
        id: "assessment",
        title: "Preconception assessment",
        subtitle: "A health check aimed at the months before you try.",
        variant: "default",
        items: [
          {
            id: "preconception-assessment",
            label: "Preconception assessment",
            description:
              "A structured review of your health, history and readiness for pregnancy.",
            icon: "ClipboardCheck",
          },
          {
            id: "investigations",
            label: "Relevant investigations",
            description:
              "Tests selected for your situation, so nothing unnecessary is added.",
            icon: "TestTube",
            conditional: true,
          },
        ],
      },
      {
        id: "guidance",
        title: "Guidance & optimisation",
        subtitle: "Practical things you can act on.",
        variant: "default",
        items: [
          {
            id: "lifestyle",
            label: "Lifestyle discussion",
            description:
              "Sleep, stress, activity and habits that may be worth adjusting before you try.",
            icon: "Activity",
          },
          {
            id: "nutrition",
            label: "Nutrition guidance",
            description: "Dietary guidance shaped around your own assessment.",
            icon: "Apple",
          },
          {
            id: "optimisation",
            label: "Fertility optimisation guidance",
            description:
              "Evidence-informed steps that may support your reproductive health.",
            icon: "Sprout",
          },
          {
            id: "doctor-consultation",
            label: "Doctor consultation",
            description: "Time with a clinician to bring it all together into a plan.",
            icon: "Stethoscope",
          },
        ],
      },
    ],
    exclusions: STANDARD_EXCLUSIONS,
    what_you_learn: [
      "How your current health may relate to planning a pregnancy",
      "Which lifestyle factors may be worth addressing first",
      "What nutritional guidance applies to your situation",
      "Whether any result may warrant further evaluation",
      "A realistic sense of how to prepare over the coming months",
    ],
    how_it_works: STANDARD_STEPS,
    faqs: [
      {
        question: "Is this for people who already have a fertility problem?",
        answer:
          "Not specifically. This package is built for people planning pregnancy who may have no fertility concern at all. If your assessment does surface something worth looking at, your clinician explains what further evaluation may be useful.",
      },
      {
        question: "How far ahead should I book this?",
        answer:
          "Preparation generally benefits from time. Your clinician discusses a sensible timeline for your situation during the consultation.",
      },
      {
        question: "Can my partner be assessed too?",
        answer:
          "Yes. If you'd both like to be assessed, the Couples Fertility Assessment is designed for that — your care coordinator can help you decide which fits better.",
      },
      ...SHARED_FAQS,
    ],
    comparison: {
      ideal_for: "Preparing before you start trying",
      female_assessment: true,
      male_assessment: "conditional",
      amh: "conditional",
      hormonal_evaluation: "conditional",
      ultrasound_afc: false,
      semen_analysis: false,
      specialist_consultation: true,
      results_review: true,
      personalised_plan: true,
      availability: "In-clinic or online",
      locations: DEFAULT_LOCATIONS.join(", "),
    },
    icon: "Sprout",
    content_status: "pending_clinical_review",
    seo: {
      title: "Preconception & Fertility Wellness Package | Conceev Health",
      description:
        "Plan pregnancy well with a preconception assessment, relevant investigations and expert guidance on lifestyle, nutrition and fertility optimisation.",
      keywords: [
        "preconception care",
        "preconception checkup india",
        "planning pregnancy health check",
        "fertility wellness package",
        "pre pregnancy test",
      ],
      og_title: "Preconception & Fertility Wellness | Conceev Health",
      og_description:
        "Prepare your body before you start trying, with a preconception assessment and expert guidance.",
      og_image: null,
      schema_type: "Service",
    },
    display_order: 6,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

export const getPackageBySlug = (
  slug: string,
  catalogue: FertilityPackage[] = FERTILITY_PACKAGES
): FertilityPackage | undefined => catalogue.find((pkg) => pkg.slug === slug);

/**
 * Orders the catalogue for a selected intent: matching packages first (keeping
 * their configured display order), everything else after. Returns the catalogue
 * untouched when no intent is selected.
 */
export const sortByIntent = (
  packages: FertilityPackage[],
  intent: IntentId | null
): FertilityPackage[] => {
  const ordered = [...packages].sort((a, b) => a.display_order - b.display_order);
  if (!intent) return ordered;
  return [
    ...ordered.filter((pkg) => pkg.intents.includes(intent)),
    ...ordered.filter((pkg) => !pkg.intents.includes(intent)),
  ];
};

export const isRecommended = (pkg: FertilityPackage, intent: IntentId | null): boolean =>
  Boolean(intent && pkg.intents.includes(intent));

/** Flattens every inclusion item, e.g. to count investigations on a card. */
export const flattenInclusions = (pkg: FertilityPackage): InclusionItem[] =>
  pkg.inclusions.flatMap((group) => group.items);
