/**
 * Prints the same integrity metrics the seeded `fertility_packages` rows report,
 * so the database can be diffed against the source catalogue after seeding.
 *
 * Usage: npx vite-node scripts/verify-seed-parity.ts
 */
import { COMPARISON_ROWS, FERTILITY_PACKAGES } from "../src/data/fertilityPackages";

const rows = [...FERTILITY_PACKAGES]
  .sort((a, b) => a.display_order - b.display_order)
  .map((p) => ({
    slug: p.slug,
    display_order: p.display_order,
    status: p.status,
    price: p.price,
    price_status: p.price_status,
    content_status: p.content_status,
    audience: p.audience,
    intents: p.intents.length,
    locations: p.locations.length,
    exclusions: p.exclusions.length,
    learn: p.what_you_learn.length,
    ideal_for: p.ideal_for.length,
    inc_groups: p.inclusions.length,
    inc_items: p.inclusions.reduce((n, g) => n + g.items.length, 0),
    steps: p.how_it_works.length,
    faqs: p.faqs.length,
    variants: p.variants.length,
    cmp_keys: Object.keys(p.comparison).length,
    long_len: p.long_description.length,
    seo_title: p.seo.title,
  }));

console.log(JSON.stringify(rows, null, 1));
console.log("comparison rows expected:", COMPARISON_ROWS.length);
