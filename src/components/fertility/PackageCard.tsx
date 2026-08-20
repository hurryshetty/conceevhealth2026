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
        "group relative flex flex-col rounded-2xl border bg-card p-6 sm:p-7 transition-all duration-300",
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
            <span className="text-[11px] font-semibold uppercase tracking-wide bg-navy/5 text-navy border border-navy/15 px-2.5 py-1 rounded-full">
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
          <h3 className="font-serif text-xl font-bold leading-snug text-foreground">
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

      <p className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-foreground/70 bg-secondary/10 border border-border rounded-full px-3 py-1 mb-5">
        <span className="text-muted-foreground">Ideal for</span>
        {pkg.ideal_for_label}
      </p>

      {/* ── Inclusions ─────────────────────────────────────────────────────── */}
      <ul className="space-y-2.5 mb-5">
        {visible.map((item) => (
          <li key={item.id} className="flex items-start gap-2.5 text-sm text-foreground/85">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="leading-snug">
              {item.label}
              {item.conditional && (
                <span className="text-muted-foreground"> (where clinically appropriate)</span>
              )}
            </span>
          </li>
        ))}
        {remaining > 0 && (
          <li className="pl-[26px] text-sm font-medium text-primary">
            + {remaining} more included
          </li>
        )}
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
