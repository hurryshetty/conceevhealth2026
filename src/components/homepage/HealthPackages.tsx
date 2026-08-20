import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useFertilityPackages } from "@/hooks/useFertilityPackages";
import { flattenInclusions } from "@/data/fertilityPackages";
import { getFertilityIcon } from "@/lib/icons";

/**
 * Health packages.
 *
 * Driven by the live `fertility_packages` table. Pricing is presented calmly —
 * no struck-through figures or discount flashes — and packages still carrying a
 * placeholder price render "Pricing on request" rather than an invented number.
 *
 * The brief also listed Men's Health, Executive Health and Senior Health. Those
 * packages do not exist yet; this section renders whatever is published, so they
 * appear automatically once they are created.
 */

interface HealthPackagesProps {
  onBook: (packageName: string) => void;
}

const HealthPackages = ({ onBook }: HealthPackagesProps) => {
  const { data: packages = [], isLoading } = useFertilityPackages();
  const visible = packages.slice(0, 3);

  if (!isLoading && visible.length === 0) return null;

  return (
    <section className="bg-white py-20 sm:py-28" aria-labelledby="packages-heading">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[42ch]">
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-conceev-red">
              Health packages
            </p>
            <h2
              id="packages-heading"
              className="text-[32px] font-bold leading-[1.08] text-conceev-black sm:text-[44px]"
            >
              Take care of your health before it becomes a concern.
            </h2>
          </div>
          <Link
            to="/fertility-packages"
            className="group inline-flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-conceev-black transition-colors hover:text-conceev-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
          >
            All packages
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-12 grid gap-5 md:grid-cols-3" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[340px] animate-pulse rounded-[20px] bg-conceev-grey/25" />
            ))}
            <span className="sr-only">Loading health packages</span>
          </div>
        ) : (
          <ul className="mt-12 flex snap-rail gap-4 overflow-x-auto scrollbar-hide pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {visible.map((pkg) => {
              const Icon = getFertilityIcon(pkg.icon);
              const inclusions = flattenInclusions(pkg);
              const hasPrice = pkg.price_status === "confirmed" && pkg.price !== null;
              return (
                <li
                  key={pkg.id}
                  className="flex w-[80vw] shrink-0 flex-col rounded-[20px] border border-conceev-black/[0.08] bg-white p-7 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-conceev-black/20 sm:w-[48vw] md:w-auto"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-conceev-red/[0.08]">
                      <Icon className="h-5 w-5 text-conceev-red" aria-hidden="true" />
                    </span>
                    {pkg.badge && (
                      <span className="rounded-md border border-conceev-black/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-conceev-black/60">
                        {pkg.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-6 text-[20px] font-semibold leading-tight text-conceev-black">
                    <Link
                      to={`/fertility-packages/${pkg.slug}`}
                      className="rounded-sm transition-colors hover:text-conceev-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
                    >
                      {pkg.name}
                    </Link>
                  </h3>
                  <p className="mt-1.5 text-[13px] text-conceev-grey-mid">
                    Ideal for {pkg.ideal_for_label.toLowerCase()}
                  </p>

                  <ul className="mt-5 space-y-2 border-t border-conceev-black/[0.07] pt-5">
                    {inclusions.slice(0, 3).map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-2.5 text-[14px] leading-snug text-conceev-black/70"
                      >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-conceev-green" aria-hidden="true" />
                        {item.label}
                      </li>
                    ))}
                    {inclusions.length > 3 && (
                      <li className="pl-6 text-[13px] font-medium text-conceev-red">
                        +{inclusions.length - 3} more included
                      </li>
                    )}
                  </ul>

                  <div className="mt-auto pt-7">
                    <p className="text-[12px] uppercase tracking-[0.14em] text-conceev-grey-mid">
                      {hasPrice ? "Starting from" : "Pricing"}
                    </p>
                    <p className="mt-1 text-[24px] font-bold text-conceev-black">
                      {hasPrice
                        ? new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: pkg.currency,
                            maximumFractionDigits: 0,
                          }).format(pkg.price!)
                        : pkg.price_placeholder_label}
                    </p>
                    <button
                      type="button"
                      onClick={() => onBook(pkg.name)}
                      className="mt-5 w-full rounded-xl bg-conceev-black px-4 py-3 text-[14px] font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-conceev-ink active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
                    >
                      Book Package
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

export default HealthPackages;
