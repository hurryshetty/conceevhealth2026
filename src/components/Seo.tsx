import { useEffect } from "react";
import { SITE } from "@/config/site";

/**
 * Dependency-free document-head manager.
 *
 * The app is a client-rendered Vite SPA with no head library, so this component
 * writes title / meta / canonical / JSON-LD directly and removes everything it
 * created on unmount. Every tag it owns carries `data-seo="managed"` so a route
 * change can never leave a stale description or canonical behind.
 */

export interface BreadcrumbEntry {
  name: string;
  /** Path relative to the site origin, e.g. "/fertility-packages". */
  path: string;
}

export interface SeoFaqEntry {
  question: string;
  answer: string;
}

interface SeoProps {
  title: string;
  description: string;
  /** Path relative to the site origin. Defaults to the current pathname. */
  canonicalPath?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  /** Rendered as BreadcrumbList structured data. */
  breadcrumbs?: BreadcrumbEntry[];
  /** Rendered as FAQPage structured data. Omitted when empty. */
  faqs?: SeoFaqEntry[];
  /** Any additional JSON-LD graphs (Service, MedicalTest, Organization…). */
  structuredData?: Record<string, unknown>[];
  /** Set on pages that should not be indexed (e.g. thin/duplicate variants). */
  noIndex?: boolean;
}

const MANAGED = "data-seo";

const absolute = (path: string): string => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE.origin.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
};

const upsertMeta = (
  attr: "name" | "property",
  key: string,
  content: string | undefined
) => {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.setAttribute(MANAGED, "created");
    document.head.appendChild(el);
  } else if (!el.hasAttribute(MANAGED)) {
    // Pre-existing static tag from index.html — remember the original value so
    // it can be restored when this page unmounts.
    el.setAttribute(MANAGED, "restore");
    el.setAttribute("data-seo-original", el.getAttribute("content") ?? "");
  }
  el.setAttribute("content", content);
};

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    el.setAttribute(MANAGED, "created");
    document.head.appendChild(el);
  } else if (!el.hasAttribute(MANAGED)) {
    el.setAttribute(MANAGED, "restore");
    el.setAttribute("data-seo-original", el.getAttribute("href") ?? "");
  }
  el.setAttribute("href", href);
};

const addJsonLd = (data: Record<string, unknown>) => {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute(MANAGED, "created");
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
};

const cleanup = () => {
  document.head.querySelectorAll(`[${MANAGED}="created"]`).forEach((el) => el.remove());
  document.head.querySelectorAll(`[${MANAGED}="restore"]`).forEach((el) => {
    const original = el.getAttribute("data-seo-original") ?? "";
    if (el.tagName === "LINK") el.setAttribute("href", original);
    else el.setAttribute("content", original);
    el.removeAttribute(MANAGED);
    el.removeAttribute("data-seo-original");
  });
};

const Seo = ({
  title,
  description,
  canonicalPath,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  breadcrumbs,
  faqs,
  structuredData,
  noIndex = false,
}: SeoProps) => {
  // Arrays/objects are re-created by the caller on every render, so the effect is
  // keyed on their serialised form to avoid an infinite re-write loop.
  const breadcrumbKey = JSON.stringify(breadcrumbs ?? null);
  const faqKey = JSON.stringify(faqs ?? null);
  const structuredKey = JSON.stringify(structuredData ?? null);
  const keywordKey = (keywords ?? []).join(",");

  useEffect(() => {
    const previousTitle = document.title;
    const path = canonicalPath ?? window.location.pathname;
    const canonicalUrl = absolute(path);

    document.title = title;

    upsertMeta("name", "description", description);
    if (keywordKey) upsertMeta("name", "keywords", keywordKey);
    upsertMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");

    upsertLink("canonical", canonicalUrl);

    upsertMeta("property", "og:title", ogTitle || title);
    upsertMeta("property", "og:description", ogDescription || description);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:site_name", SITE.name);
    upsertMeta("property", "og:image", absolute(ogImage || SITE.defaultOgImage));

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", ogTitle || title);
    upsertMeta("name", "twitter:description", ogDescription || description);
    upsertMeta("name", "twitter:image", absolute(ogImage || SITE.defaultOgImage));

    if (breadcrumbs?.length) {
      addJsonLd({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: crumb.name,
          item: absolute(crumb.path),
        })),
      });
    }

    if (faqs?.length) {
      addJsonLd({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      });
    }

    structuredData?.forEach(addJsonLd);

    return () => {
      cleanup();
      document.title = previousTitle;
    };
  }, [
    title,
    description,
    canonicalPath,
    keywordKey,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    noIndex,
    breadcrumbKey,
    faqKey,
    structuredKey,
    breadcrumbs,
    faqs,
    structuredData,
  ]);

  return null;
};

export default Seo;
