import { describe, expect, it } from "vitest";
import {
  COMPARISON_ROWS,
  FERTILITY_INTENTS,
  FERTILITY_PACKAGES,
  flattenInclusions,
  getPackageBySlug,
  isRecommended,
  sortByIntent,
  type FertilityPackage,
} from "./fertilityPackages";

/**
 * Guardrails for the fertility catalogue.
 *
 * The medical-content and commercial-placeholder rules in the brief are easy to
 * violate accidentally when copy is edited later, so they are asserted here
 * rather than left to review.
 */

const published = FERTILITY_PACKAGES.filter((pkg) => pkg.status === "published");

/**
 * Every field that makes an assertion to the patient.
 *
 * FAQ *questions* are excluded on purpose: "Does this package guarantee
 * pregnancy?" asks something, it does not claim it. The answers stay in scope,
 * which is where an unqualified claim would actually do harm.
 */
const assertiveCopy = (pkg: FertilityPackage): string =>
  [
    pkg.name,
    pkg.tagline,
    pkg.short_description,
    pkg.long_description,
    pkg.hero_title,
    pkg.hero_description,
    ...pkg.ideal_for.flatMap((item) => [item.title, item.description]),
    ...pkg.what_you_learn,
    ...pkg.how_it_works.flatMap((step) => [step.title, step.description]),
    ...pkg.faqs.map((faq) => faq.answer),
    ...flattenInclusions(pkg).flatMap((item) => [item.label, item.description]),
  ].join(" ");

describe("fertility package catalogue", () => {
  it("has unique slugs", () => {
    const slugs = FERTILITY_PACKAGES.map((pkg) => pkg.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("uses SEO-friendly slugs", () => {
    FERTILITY_PACKAGES.forEach((pkg) => {
      expect(pkg.slug, pkg.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });
  });

  it("ships no invented pricing", () => {
    // Until the commercial team confirms real numbers, every package must stay
    // in the placeholder state. Flipping one to "confirmed" requires a price.
    FERTILITY_PACKAGES.forEach((pkg) => {
      if (pkg.price_status === "placeholder") {
        expect(pkg.price, pkg.name).toBeNull();
        expect(pkg.price_placeholder_label.length, pkg.name).toBeGreaterThan(0);
      } else {
        expect(pkg.price, pkg.name).not.toBeNull();
      }
    });
  });

  it("marks clinical content as pending review until sign-off", () => {
    FERTILITY_PACKAGES.forEach((pkg) => {
      expect(["clinically_approved", "pending_clinical_review"]).toContain(
        pkg.content_status
      );
    });
  });

  it("makes no guaranteed-outcome claims", () => {
    const banned = [
      /guarantee[sd]?\s+(a\s+)?pregnan/i,
      /guarantee[sd]?\s+(ivf\s+)?success/i,
      /guarantee[sd]?\s+egg quality/i,
      /prevents?\s+infertility/i,
      /detects?\s+all\s+fertility/i,
      /increases?\s+fertility\s+by\s+\d/i,
      /\d+%\s+success/i,
    ];

    FERTILITY_PACKAGES.forEach((pkg) => {
      const copy = assertiveCopy(pkg);
      banned.forEach((pattern) => {
        // Answers legitimately say "cannot guarantee", so only flag a phrase
        // that is not negated by the words immediately before it.
        const match = copy.match(pattern);
        if (!match) return;
        const context = copy.slice(Math.max(0, match.index! - 40), match.index!);
        expect(
          /\b(no|not|cannot|can't|never|does not|doesn't)\b/i.test(context),
          `${pkg.name}: unqualified claim "${match[0]}"`
        ).toBe(true);
      });
    });
  });

  it("phrases every FAQ question as a question", () => {
    published.forEach((pkg) => {
      pkg.faqs.forEach((faq) => {
        expect(faq.question.trim().endsWith("?"), `${pkg.name}: "${faq.question}"`).toBe(true);
        expect(faq.answer.trim().length, `${pkg.name}: "${faq.question}"`).toBeGreaterThan(30);
      });
    });
  });

  it("gives every published package the content the detail page renders", () => {
    published.forEach((pkg) => {
      expect(pkg.ideal_for.length, pkg.name).toBeGreaterThan(0);
      expect(pkg.inclusions.length, pkg.name).toBeGreaterThan(0);
      expect(pkg.what_you_learn.length, pkg.name).toBeGreaterThan(0);
      expect(pkg.how_it_works.length, pkg.name).toBeGreaterThanOrEqual(3);
      expect(pkg.faqs.length, pkg.name).toBeGreaterThan(0);
      expect(pkg.locations.length, pkg.name).toBeGreaterThan(0);
    });
  });

  it("gives every published package unique SEO metadata", () => {
    const titles = published.map((pkg) => pkg.seo.title);
    const descriptions = published.map((pkg) => pkg.seo.description);

    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);

    published.forEach((pkg) => {
      expect(pkg.seo.title.length, pkg.name).toBeGreaterThan(15);
      expect(pkg.seo.description.length, pkg.name).toBeGreaterThan(50);
      expect(pkg.seo.keywords.length, pkg.name).toBeGreaterThan(0);
    });
  });

  it("answers every comparison row for every published package", () => {
    published.forEach((pkg) => {
      COMPARISON_ROWS.forEach((row) => {
        expect(
          pkg.comparison[row.key],
          `${pkg.name} is missing comparison row "${row.key}"`
        ).toBeDefined();
      });
    });
  });

  it("offers at least one package for every selectable intent", () => {
    FERTILITY_INTENTS.forEach((intent) => {
      const matches = published.filter((pkg) => pkg.intents.includes(intent.id));
      expect(matches.length, `no package matches intent "${intent.id}"`).toBeGreaterThan(0);
    });
  });

  it("splits couples packages into her / him / together groups", () => {
    published
      .filter((pkg) => pkg.audience === "couple")
      .forEach((pkg) => {
        const variants = pkg.inclusions.map((group) => group.variant);
        expect(variants, pkg.name).toContain("her");
        expect(variants, pkg.name).toContain("him");
        expect(variants, pkg.name).toContain("together");
      });
  });
});

describe("intent sorting", () => {
  it("returns display order when no intent is chosen", () => {
    const sorted = sortByIntent(published, null);
    expect(sorted.map((pkg) => pkg.display_order)).toEqual(
      [...published].map((pkg) => pkg.display_order).sort((a, b) => a - b)
    );
  });

  it("moves matching packages to the front without dropping any", () => {
    const sorted = sortByIntent(published, "egg-freezing");
    expect(sorted).toHaveLength(published.length);
    expect(sorted[0].intents).toContain("egg-freezing");

    const firstNonMatch = sorted.findIndex((pkg) => !pkg.intents.includes("egg-freezing"));
    sorted.slice(firstNonMatch).forEach((pkg) => {
      expect(pkg.intents).not.toContain("egg-freezing");
    });
  });

  it("flags recommended packages only for a matching intent", () => {
    const couples = getPackageBySlug("couples-fertility-assessment")!;
    expect(isRecommended(couples, "both-partners")).toBe(true);
    expect(isRecommended(couples, "egg-freezing")).toBe(false);
    expect(isRecommended(couples, null)).toBe(false);
  });
});

describe("getPackageBySlug", () => {
  it("finds a known package and returns undefined otherwise", () => {
    expect(getPackageBySlug("fertility-health-check")?.name).toBe("Fertility Health Check");
    expect(getPackageBySlug("not-a-real-package")).toBeUndefined();
  });
});
