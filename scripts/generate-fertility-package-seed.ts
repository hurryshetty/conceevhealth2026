/**
 * Generates the seed INSERT statements for `public.fertility_packages` from the
 * canonical catalogue in src/data/fertilityPackages.ts.
 *
 * Keeping the SQL generated rather than hand-written means the database seed and
 * the application fallback can never drift apart.
 *
 * Usage:
 *   npx vite-node scripts/generate-fertility-package-seed.ts > seed.sql
 *
 * The output is already embedded in
 * supabase/migrations/20260820_fertility_packages.sql — re-run this and replace
 * that block whenever the catalogue changes.
 */

import { FERTILITY_PACKAGES } from "../src/data/fertilityPackages";

const sqlText = (value: string | null): string =>
  value === null ? "NULL" : `'${value.replace(/'/g, "''")}'`;

const sqlJson = (value: unknown): string =>
  `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;

const sqlTextArray = (values: string[]): string =>
  values.length === 0
    ? "'{}'::text[]"
    : `ARRAY[${values.map((v) => sqlText(v)).join(", ")}]::text[]`;

const rows = FERTILITY_PACKAGES.map((pkg) =>
  [
    sqlText(pkg.slug),
    sqlText(pkg.name),
    sqlText(pkg.category),
    sqlText(pkg.tagline),
    sqlText(pkg.short_description),
    sqlText(pkg.long_description),
    sqlText(pkg.hero_title),
    sqlText(pkg.hero_description),
    sqlText(pkg.audience),
    sqlText(pkg.ideal_for_label),
    sqlJson(pkg.ideal_for),
    sqlTextArray(pkg.intents),
    pkg.price === null ? "NULL" : String(pkg.price),
    pkg.compare_at_price === null ? "NULL" : String(pkg.compare_at_price),
    sqlText(pkg.price_status),
    sqlText(pkg.discount_label),
    sqlText(pkg.currency),
    sqlText(pkg.price_placeholder_label),
    sqlText(pkg.status),
    String(pkg.featured),
    sqlText(pkg.badge),
    sqlText(pkg.duration),
    sqlText(pkg.availability_type),
    sqlTextArray(pkg.locations),
    sqlJson(pkg.variants),
    sqlJson(pkg.inclusions),
    sqlTextArray(pkg.exclusions),
    sqlTextArray(pkg.what_you_learn),
    sqlJson(pkg.how_it_works),
    sqlJson(pkg.faqs),
    sqlJson(pkg.comparison),
    sqlText(pkg.icon),
    sqlText(pkg.content_status),
    sqlJson(pkg.seo),
    String(pkg.display_order),
  ].join(", ")
);

const columns = [
  "slug", "name", "category", "tagline", "short_description", "long_description",
  "hero_title", "hero_description", "audience", "ideal_for_label", "ideal_for",
  "intents", "price", "compare_at_price", "price_status", "discount_label",
  "currency", "price_placeholder_label", "status", "featured", "badge", "duration",
  "availability_type", "locations", "variants", "inclusions", "exclusions",
  "what_you_learn", "how_it_works", "faqs", "comparison", "icon", "content_status",
  "seo", "display_order",
];

process.stdout.write(
  `INSERT INTO public.fertility_packages (\n  ${columns.join(", ")}\n) VALUES\n` +
    rows.map((row) => `(${row})`).join(",\n") +
    "\nON CONFLICT (slug) DO NOTHING;\n"
);
