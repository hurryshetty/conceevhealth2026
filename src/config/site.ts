/**
 * Central site configuration.
 *
 * Contact details were previously hardcoded in several components. Anything that
 * needs the WhatsApp number, support phone or canonical origin should read it
 * from here so it can be changed in one place.
 */

export const SITE = {
  name: "Conceev Health",
  /** Canonical origin used for <link rel="canonical"> and og:url. */
  origin:
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_ORIGIN) ||
    "https://www.conceevhealth.com",
  supportEmail: "care@conceevhealth.com",
  /** E.164 without the leading "+" — the format wa.me expects. */
  whatsappNumber: "919876543210",
  phoneNumber: "+919876543210",
  phoneDisplay: "+91 98765 43210",
  defaultOgImage: "/images/og-default.jpg",
} as const;

/**
 * Dialling codes offered on public lead forms.
 * Shared by LeadFormModal and the fertility package booking flow.
 */
export const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", name: "India", maxLen: 10 },
  { code: "+1", flag: "🇺🇸", name: "US", maxLen: 10 },
  { code: "+44", flag: "🇬🇧", name: "UK", maxLen: 11 },
  { code: "+971", flag: "🇦🇪", name: "UAE", maxLen: 9 },
  { code: "+65", flag: "🇸🇬", name: "SG", maxLen: 8 },
] as const;

/**
 * Builds a wa.me link with a pre-filled message.
 * The message is always passed in by the caller so package names are never
 * hardcoded at the link level.
 */
export const whatsappLink = (message: string): string =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
