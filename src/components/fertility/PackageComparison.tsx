import { useRef } from "react";
import { Link } from "react-router-dom";
import { Check, CircleDot, Info, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  COMPARISON_ROWS,
  type ComparisonValue,
  type FertilityPackage,
} from "@/data/fertilityPackages";
import PriceBlock from "@/components/fertility/PriceBlock";

/**
 * Package comparison.
 *
 * Desktop renders a real semantic <table> with a sticky first column. Below the
 * `md` breakpoint the table is replaced entirely by horizontally snapping cards
 * — a wide table squeezed into 320px is unreadable, so it is not attempted.
 *
 * Every state is conveyed by an icon *and* screen-reader text, never by colour
 * alone.
 */

interface PackageComparisonProps {
  packages: FertilityPackage[];
  onBook: (pkg: FertilityPackage) => void;
  /** Fired once per meaningful interaction, for the comparison_interaction event. */
  onInteract?: (detail: string) => void;
}

// ─── Tri-state indicator ───────────────────────────────────────────────────────

const StateCell = ({ value }: { value: ComparisonValue }) => {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
        <Check className="h-4 w-4 text-green-success" aria-hidden="true" />
        <span className="sr-only">Included</span>
      </span>
    );
  }
  if (value === "conditional") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-foreground/70">
        <CircleDot className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
        <span>Where clinically appropriate</span>
      </span>
    );
  }
  if (value === false || value === null || value === undefined) {
    return (
      <span className="inline-flex items-center text-sm text-muted-foreground">
        <Minus className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </span>
    );
  }
  return <span className="text-sm text-foreground/80">{String(value)}</span>;
};

// ─── Component ─────────────────────────────────────────────────────────────────

const PackageComparison = ({ packages, onBook, onInteract }: PackageComparisonProps) => {
  const interacted = useRef(false);

  const noteInteraction = (detail: string) => {
    if (interacted.current) return;
    interacted.current = true;
    onInteract?.(detail);
  };

  if (packages.length === 0) return null;

  return (
    <div className="w-full">
      {/* ── Desktop: semantic table ──────────────────────────────────────── */}
      <div
        className="hidden md:block overflow-x-auto rounded-2xl border border-border bg-card"
        onScroll={() => noteInteraction("table_scroll")}
      >
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Comparison of Conceev Health fertility packages by what each one includes.
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 bg-card border-b border-border p-4 align-bottom min-w-[190px]"
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Compare
                </span>
              </th>
              {packages.map((pkg) => (
                <th
                  key={pkg.id}
                  scope="col"
                  className="border-b border-l border-border p-4 align-bottom min-w-[210px]"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-1">
                    {pkg.category}
                  </p>
                  <Link
                    to={`/fertility-packages/${pkg.slug}`}
                    onClick={() => noteInteraction(`open_${pkg.slug}`)}
                    className="font-serif text-base font-bold text-foreground hover:text-primary transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {pkg.name}
                  </Link>
                  <PriceBlock pkg={pkg} compact className="mt-2" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.key}>
                {/* The sticky column must stay opaque, so rows use fine borders
                    rather than zebra striping, which the column would break. */}
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-card border-b border-border p-4 text-sm font-medium text-foreground align-top"
                >
                  <span className="inline-flex items-start gap-1.5">
                    {row.label}
                    {row.hint && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => noteInteraction(`hint_${row.key}`)}
                            className="text-muted-foreground hover:text-foreground rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={`What is ${row.label}?`}
                          >
                            <Info className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">{row.hint}</TooltipContent>
                      </Tooltip>
                    )}
                  </span>
                </th>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="border-b border-l border-border p-4 align-top">
                    <StateCell value={pkg.comparison[row.key] ?? null} />
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row" className="sticky left-0 z-10 bg-card p-4">
                <span className="sr-only">Book</span>
              </th>
              {packages.map((pkg) => (
                <td key={pkg.id} className="border-l border-border p-4">
                  <Button
                    size="sm"
                    className="w-full rounded-full"
                    onClick={() => {
                      noteInteraction(`book_${pkg.slug}`);
                      onBook(pkg);
                    }}
                  >
                    Book {pkg.name}
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Mobile: horizontally snapping cards ──────────────────────────── */}
      <div className="md:hidden">
        <div
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-2"
          onScroll={() => noteInteraction("cards_scroll")}
        >
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="snap-start shrink-0 w-[85vw] max-w-sm rounded-2xl border border-border bg-card p-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-1">
                {pkg.category}
              </p>
              <Link
                to={`/fertility-packages/${pkg.slug}`}
                onClick={() => noteInteraction(`open_${pkg.slug}`)}
                className="font-serif text-lg font-bold text-foreground"
              >
                {pkg.name}
              </Link>
              <PriceBlock pkg={pkg} compact className="mt-2 mb-4" />

              <dl className="divide-y divide-border border-y border-border">
                {COMPARISON_ROWS.map((row) => (
                  <div key={row.key} className="flex items-start justify-between gap-4 py-2.5">
                    <dt className="text-xs font-medium text-muted-foreground shrink-0 max-w-[52%]">
                      {row.label}
                    </dt>
                    <dd className="text-right">
                      <StateCell value={pkg.comparison[row.key] ?? null} />
                    </dd>
                  </div>
                ))}
              </dl>

              <Button
                size="sm"
                className="w-full rounded-full mt-4"
                onClick={() => {
                  noteInteraction(`book_${pkg.slug}`);
                  onBook(pkg);
                }}
              >
                Book {pkg.name}
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Swipe to compare packages
        </p>
      </div>

      <p className="text-xs text-muted-foreground mt-4 max-w-3xl">
        Items marked <span className="font-medium text-foreground">where clinically appropriate</span>{" "}
        are included when your specialist considers them useful for your situation. Final
        inclusions are confirmed with you before your appointment.
      </p>
    </div>
  );
};

export default PackageComparison;
