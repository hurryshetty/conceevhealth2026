import { Link } from "react-router-dom";
import { ArrowRight, Check, MapPin, Sparkles, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFertilityIcon } from "@/lib/icons";
import {
  availabilityLabel,
  flattenInclusions,
  type FertilityPackage,
} from "@/data/fertilityPackages";
import PriceBlock from "@/components/fertility/PriceBlock";

interface PackageCardProps {
  pkg: FertilityPackage;
  /** Adds the "Recommended for you" treatment after an intent is selected. */
  recommended?: boolean;
  onBook: (pkg: FertilityPackage) => void;
  onViewDetails?: (pkg: FertilityPackage) => void;
  className?: string;
}

const MAX_VISIBLE_INCLUSIONS = 5;
/** Fewer on phones so two cards can be compared without a full-screen scroll. */
const MOBILE_VISIBLE_INCLUSIONS = 3;

const PackageCard = ({
  pkg,
  recommended = false,
  onBook,
  onViewDetails,
  className,
}: PackageCardProps) => {
  const Icon = getFertilityIcon(pkg.icon);
  const allInclusions = flattenInclusions(pkg);
  const visible = allInclusions.slice(0, MAX_VISIBLE_INCLUSIONS);
  const remaining = allInclusions.length - visible.length;
  const detailPath = `/fertility-packages/${pkg.slug}`;

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-card p-5 sm:p-7 transition-all duration-300",
        "hover:shadow-lg focus-within:shadow-lg",
        recommended
          ? "border-primary/50 ring-1 ring-primary/20 shadow-sm"
          : "border-border hover:border-primary/30",
        className
      )}
    >
      {/* ── Badges ─────────────────────────────────────────────────────────── */}
      {(pkg.badge || recommended) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {recommended && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Recommended for you
            </span>
          )}
          {pkg.badge && (
            <span className="rounded-full border border-conceev-black/12 bg-conceev-offwhite px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-conceev-black/70">
              {pkg.badge}
            </span>
          )}
        </div>
      )}

      {/* ── Identity ───────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3.5 mb-3">
        <span
          className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-1">
            {pkg.category}
          </p>
          <h3 className="text-xl font-bold leading-snug text-foreground">
            {/* The internal link crawlers follow through to the detail page. */}
            <Link
              to={detailPath}
              onClick={() => onViewDetails?.(pkg)}
              className="rounded-sm outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {pkg.name}
            </Link>
          </h3>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground mb-4">
        {pkg.short_description}
      </p>

      <p className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-secondary/10 px-3 py-1 text-xs font-medium text-foreground/70">
        <span className="text-muted-foreground">Ideal for</span>
        {pkg.ideal_for_label}
      </p>

      {/*
        ── Inclusions ──────────────────────────────────────────────────────
        Three shown on mobile, five from sm up. Listing five on a phone made
        each card about a screen tall, so two packages could never be
        compared without scrolling. The counter carries the remainder.
      */}
      <ul className="mb-5 space-y-2.5">
        {visible.map((item, i) => (
          <li
            key={item.id}
            className={cn(
              "flex items-start gap-2.5 text-sm text-foreground/85",
              i >= MOBILE_VISIBLE_INCLUSIONS && "hidden sm:flex"
            )}
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="leading-snug">
              {item.label}
              {item.conditional && (
                <span className="text-muted-foreground"> (where clinically appropriate)</span>
              )}
            </span>
          </li>
        ))}
        <li className="pl-[26px] text-sm font-medium text-primary">
          <span className="sm:hidden">
            {allInclusions.length - MOBILE_VISIBLE_INCLUSIONS > 0 &&
              `+ ${allInclusions.length - MOBILE_VISIBLE_INCLUSIONS} more included`}
          </span>
          <span className="hidden sm:inline">
            {remaining > 0 && `+ ${remaining} more included`}
          </span>
        </li>
      </ul>

      {/* ── Meta ───────────────────────────────────────────────────────────── */}
      <dl className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Stethoscope className="h-3.5 w-3.5" aria-hidden="true" />
          <dt className="sr-only">Assessment items</dt>
          <dd>
            {allInclusions.length} inclusion{allInclusions.length === 1 ? "" : "s"}
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Availability</dt>
          <dd>{availabilityLabel(pkg.availability_type)}</dd>
        </div>
        {pkg.locations.length > 0 && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            <dt className="sr-only">Locations</dt>
            <dd>{pkg.locations.join(" · ")}</dd>
          </div>
        )}
      </dl>

      {/* ── Price + actions ────────────────────────────────────────────────── */}
      <div className="mt-5 pt-5 border-t border-border">
        <PriceBlock pkg={pkg} className="mb-4" />
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Button
            className="flex-1 rounded-full"
            onClick={() => onBook(pkg)}
            aria-label={`Book the ${pkg.name} package`}
          >
            Book Package
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-full gap-1.5"
            asChild
          >
            <Link to={detailPath} onClick={() => onViewDetails?.(pkg)}>
              View details
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
};

export default PackageCard;
