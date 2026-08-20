import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  FERTILITY_PACKAGES,
  type FertilityPackage,
} from "@/data/fertilityPackages";
import { useDoctors, type DoctorData } from "@/hooks/useDoctors";

/**
 * Data access for the fertility packages module.
 *
 * `fertility_packages` is the source of truth and is populated — the migration
 * in supabase/migrations/20260820_fertility_packages.sql has been applied and
 * the six launch packages are seeded and published.
 *
 * The fallback to the bundled catalogue in src/data/fertilityPackages.ts is kept
 * deliberately: it holds identical content, so a database outage, a paused
 * project or a failed request degrades to a fully rendered page instead of an
 * empty one. It is a resilience path, not a migration stopgap.
 */

// ─── Row mapping ───────────────────────────────────────────────────────────────

type PackageRow = Record<string, unknown>;

const asArray = <T,>(value: unknown, fallback: T[]): T[] =>
  Array.isArray(value) ? (value as T[]) : fallback;

const asObject = (value: unknown): Record<string, never> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, never>)
    : ({} as Record<string, never>);

const mapRow = (row: PackageRow): FertilityPackage => {
  const seo = asObject(row.seo);
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name ?? ""),
    category: String(row.category ?? ""),
    tagline: String(row.tagline ?? ""),
    short_description: String(row.short_description ?? ""),
    long_description: String(row.long_description ?? ""),
    hero_title: String(row.hero_title ?? row.name ?? ""),
    hero_description: String(row.hero_description ?? row.short_description ?? ""),
    audience: (row.audience as FertilityPackage["audience"]) ?? "individual",
    ideal_for_label: String(row.ideal_for_label ?? ""),
    ideal_for: asArray(row.ideal_for, []),
    intents: asArray(row.intents, []),
    price: row.price === null || row.price === undefined ? null : Number(row.price),
    compare_at_price:
      row.compare_at_price === null || row.compare_at_price === undefined
        ? null
        : Number(row.compare_at_price),
    price_status: (row.price_status as FertilityPackage["price_status"]) ?? "placeholder",
    discount_label: (row.discount_label as string) ?? null,
    currency: String(row.currency ?? "INR"),
    price_placeholder_label: String(row.price_placeholder_label ?? "Pricing on request"),
    status: (row.status as FertilityPackage["status"]) ?? "published",
    featured: Boolean(row.featured),
    badge: (row.badge as string) ?? null,
    duration: (row.duration as string) ?? null,
    availability_type:
      (row.availability_type as FertilityPackage["availability_type"]) ?? "in_clinic",
    locations: asArray(row.locations, []),
    variants: asArray(row.variants, []),
    inclusions: asArray(row.inclusions, []),
    exclusions: asArray(row.exclusions, []),
    what_you_learn: asArray(row.what_you_learn, []),
    how_it_works: asArray(row.how_it_works, []),
    faqs: asArray(row.faqs, []),
    comparison: asObject(row.comparison),
    icon: String(row.icon ?? "Sparkles"),
    content_status:
      (row.content_status as FertilityPackage["content_status"]) ??
      "pending_clinical_review",
    seo: {
      title: String(seo.title ?? row.name ?? ""),
      description: String(seo.description ?? row.short_description ?? ""),
      keywords: asArray<string>(seo.keywords, []),
      og_title: String(seo.og_title ?? seo.title ?? row.name ?? ""),
      og_description: String(seo.og_description ?? seo.description ?? ""),
      og_image: (seo.og_image as string) ?? null,
      schema_type: (seo.schema_type as FertilityPackage["seo"]["schema_type"]) ?? "Service",
    },
    display_order: Number(row.display_order ?? 0),
  };
};

const seedCatalogue = () =>
  FERTILITY_PACKAGES.filter((pkg) => pkg.status === "published").sort(
    (a, b) => a.display_order - b.display_order
  );

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export const useFertilityPackages = () =>
  useQuery({
    queryKey: ["fertility-packages"],
    // The catalogue changes rarely; avoid refetching on every mount.
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<FertilityPackage[]> => {
      const { data, error } = await supabase
        .from("fertility_packages")
        .select("*")
        .eq("status", "published")
        .order("display_order");

      if (error || !data || (data as PackageRow[]).length === 0) {
        return seedCatalogue();
      }
      return (data as PackageRow[]).map(mapRow);
    },
  });

export const useFertilityPackage = (slug: string | undefined) =>
  useQuery({
    queryKey: ["fertility-package", slug],
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<FertilityPackage | null> => {
      const { data, error } = await supabase
        .from("fertility_packages")
        .select("*")
        .eq("slug", slug!)
        .eq("status", "published")
        .maybeSingle();

      if (error || !data) {
        return seedCatalogue().find((pkg) => pkg.slug === slug) ?? null;
      }
      return mapRow(data as PackageRow);
    },
  });

// ─── Testimonials ──────────────────────────────────────────────────────────────

export interface PackageTestimonial {
  id: string;
  display_name: string;
  age: number | null;
  journey: string | null;
  rating: number;
  quote: string;
}

/**
 * Returns approved testimonials for a package.
 *
 * No placeholder or sample testimonials are bundled — if nothing has been
 * approved for this package, this returns an empty array and the testimonial
 * section does not render at all.
 */
export const usePackageTestimonials = (packageId: string | undefined) =>
  useQuery({
    queryKey: ["fertility-package-testimonials", packageId],
    enabled: Boolean(packageId),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<PackageTestimonial[]> => {
      const { data, error } = await supabase
        .from("fertility_package_testimonials")
        .select("*")
        .eq("package_id", packageId!)
        .eq("is_approved", true)
        .order("display_order");

      if (error || !data) return [];
      return (data as PackageRow[]).map((row) => ({
        id: String(row.id),
        display_name: String(row.display_name ?? ""),
        age: row.age === null || row.age === undefined ? null : Number(row.age),
        journey: (row.journey as string) ?? null,
        rating: Number(row.rating ?? 5),
        quote: String(row.quote ?? ""),
      }));
    },
  });

// ─── Experts ───────────────────────────────────────────────────────────────────

const FERTILITY_TERMS = [
  "fertility",
  "ivf",
  "iui",
  "reproductive",
  "infertility",
  "icsi",
  "egg freezing",
];

const mentionsFertility = (values: (string | null | undefined)[]): boolean =>
  values.some((value) =>
    value ? FERTILITY_TERMS.some((term) => value.toLowerCase().includes(term)) : false
  );

/**
 * Fertility experts, drawn from the existing published `doctors` records.
 *
 * No credentials are fabricated here — the section renders whatever the doctors
 * module already holds, and renders nothing when there are no matches.
 */
export const useFertilityExperts = (limit = 3) => {
  const query = useDoctors();
  const doctors: DoctorData[] = query.data ?? [];

  const matched = doctors.filter((doctor) =>
    mentionsFertility([
      ...(doctor.specializations ?? []),
      ...(doctor.surgeries ?? []),
      doctor.designation,
    ])
  );

  return { ...query, experts: matched.slice(0, limit) };
};
