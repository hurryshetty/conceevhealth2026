import { cn } from "@/lib/utils";
import type { FertilityPackage } from "@/data/fertilityPackages";

/**
 * Price presentation for fertility packages.
 *
 * Handles two states deliberately:
 *   • `confirmed`   — renders the real price, any compare-at price and savings.
 *   • `placeholder` — renders "Pricing on request" instead of inventing a number.
 *
 * The commercial team can move a package from one state to the other purely
 * through data; no component change is required.
 */

const formatAmount = (amount: number, currency = "INR"): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

interface PriceBlockProps {
  pkg: FertilityPackage;
  size?: "sm" | "lg";
  className?: string;
  /** Hides the supporting caption in tight layouts such as the sticky bar. */
  compact?: boolean;
}

const PriceBlock = ({ pkg, size = "sm", className, compact = false }: PriceBlockProps) => {
  const isPlaceholder = pkg.price_status === "placeholder" || pkg.price === null;
  const savings =
    !isPlaceholder && pkg.compare_at_price && pkg.price !== null
      ? pkg.compare_at_price - pkg.price
      : 0;

  if (isPlaceholder) {
    return (
      <div className={cn("min-w-0", className)}>
        <p
          className={cn(
            "font-semibold text-foreground",
            size === "lg" ? "text-2xl" : "text-lg"
          )}
        >
          {pkg.price_placeholder_label}
        </p>
        {!compact && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Our care team shares full pricing before you book.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span
          className={cn(
            "font-bold text-foreground tabular-nums",
            size === "lg" ? "text-4xl" : "text-2xl"
          )}
        >
          {formatAmount(pkg.price!, pkg.currency)}
        </span>
        {pkg.compare_at_price !== null && pkg.compare_at_price > pkg.price! && (
          <span
            className={cn(
              "text-muted-foreground line-through tabular-nums",
              size === "lg" ? "text-lg" : "text-sm"
            )}
          >
            {formatAmount(pkg.compare_at_price, pkg.currency)}
          </span>
        )}
        {savings > 0 && (
          <span className="text-xs font-semibold text-green-success bg-green-success/10 border border-green-success/20 px-2 py-0.5 rounded-full">
            Save {formatAmount(savings, pkg.currency)}
          </span>
        )}
      </div>
      {!compact && pkg.discount_label && (
        <p className="text-xs text-muted-foreground mt-1">{pkg.discount_label}</p>
      )}
    </div>
  );
};

export default PriceBlock;
