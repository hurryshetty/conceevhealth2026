import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, ChevronDown, MapPin } from "lucide-react";
import { useLocations } from "@/hooks/useLocations";
import { cn } from "@/lib/utils";

/**
 * Hospital discovery, filtered by city.
 *
 * The `locations` table has no image column, so these are typographic tiles with
 * a branded monogram rather than cards fronted by unrelated stock photography.
 * When hospital imagery is added to the schema it drops straight into the frame.
 *
 * Below `md` the grid becomes a horizontal snap rail.
 */

interface FeaturedHospitalsProps {
  onBook: (hospitalName: string) => void;
}

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

const FeaturedHospitals = ({ onBook }: FeaturedHospitalsProps) => {
  const { data: locations = [], isLoading } = useLocations();

  const cities = useMemo(
    () =>
      Array.from(
        new Set(locations.map((l) => l.city_name).filter((c): c is string => Boolean(c)))
      ).sort(),
    [locations]
  );

  const [city, setCity] = useState<string | null>(null);
  const activeCity = city ?? cities[0] ?? null;

  const visible = useMemo(
    () =>
      (activeCity ? locations.filter((l) => l.city_name === activeCity) : locations).slice(0, 5),
    [locations, activeCity]
  );

  if (!isLoading && locations.length === 0) return null;

  return (
    <section className="bg-conceev-offwhite py-20 sm:py-28" aria-labelledby="hospitals-heading">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[46ch]">
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-conceev-red">
              Featured hospitals
            </p>
            <h2
              id="hospitals-heading"
              className="text-[32px] font-bold leading-[1.08] text-conceev-black sm:text-[44px]"
            >
              Trusted hospitals near you.
            </h2>
            {activeCity && (
              <p className="mt-4 flex flex-wrap items-center gap-2 text-[16px] text-conceev-black/60">
                <span>Hospitals in</span>
                <span className="relative inline-flex items-center">
                  <select
                    value={activeCity}
                    onChange={(e) => setCity(e.target.value)}
                    aria-label="Choose a city"
                    className="cursor-pointer appearance-none rounded-lg border border-conceev-black/15 bg-white py-1.5 pl-3 pr-8 text-[15px] font-semibold text-conceev-black outline-none focus-visible:ring-2 focus-visible:ring-conceev-red"
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-conceev-grey-mid"
                    aria-hidden="true"
                  />
                </span>
              </p>
            )}
          </div>

          <Link
            to="/hospitals"
            className="group inline-flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-conceev-black transition-colors hover:text-conceev-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
          >
            View all hospitals
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-12 grid gap-4 md:grid-cols-3" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[220px] animate-pulse rounded-[20px] bg-conceev-grey/25" />
            ))}
            <span className="sr-only">Loading hospitals</span>
          </div>
        ) : (
          <ul
            className={cn(
              "mt-12 flex snap-rail gap-4 overflow-x-auto scrollbar-hide pb-2",
              "md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3"
            )}
          >
            {visible.map((hospital) => (
              <li
                key={hospital.id}
                className="group flex w-[78vw] shrink-0 flex-col rounded-[20px] border border-conceev-black/[0.08] bg-white p-6 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-conceev-black/20 sm:w-[46vw] md:w-auto"
              >
                <div className="flex items-start gap-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-conceev-black text-[15px] font-bold text-white"
                    aria-hidden="true"
                  >
                    {initials(hospital.name) || <Building2 className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[17px] font-semibold leading-tight text-conceev-black">
                      {hospital.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-[13px] text-conceev-grey-mid">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {[hospital.areas?.[0], hospital.city_name].filter(Boolean).join(", ")}
                      </span>
                    </p>
                  </div>
                </div>

                {hospital.surgeries?.length > 0 && (
                  <div className="mt-5 border-t border-conceev-black/[0.07] pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-conceev-grey-mid">
                      Key services
                    </p>
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                      {hospital.surgeries.slice(0, 3).map((service) => (
                        <li
                          key={service}
                          className="rounded-md bg-conceev-offwhite px-2.5 py-1 text-[12px] font-medium text-conceev-black/70"
                        >
                          {service}
                        </li>
                      ))}
                      {hospital.surgeries.length > 3 && (
                        <li className="px-1 py-1 text-[12px] font-medium text-conceev-red">
                          +{hospital.surgeries.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="mt-auto pt-5">
                  <button
                    type="button"
                    onClick={() => onBook(hospital.name)}
                    className="w-full rounded-xl border border-conceev-black/15 px-4 py-2.5 text-[14px] font-semibold text-conceev-black transition-colors hover:border-conceev-red hover:text-conceev-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
                  >
                    Request appointment
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default FeaturedHospitals;
