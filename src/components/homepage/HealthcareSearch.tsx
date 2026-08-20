import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronDown, FlaskConical, Loader2, MapPin, Package, Search, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useLocations } from "@/hooks/useLocations";

/**
 * Primary healthcare discovery module.
 *
 * A real typeahead, not a decorative form: it queries doctors, specialities,
 * hospitals and treatments in Supabase and navigates straight to the matched
 * record. The category chips narrow which tables are searched.
 */

type Category = "all" | "doctor" | "speciality" | "hospital" | "treatment";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "doctor", label: "Doctor" },
  { id: "speciality", label: "Speciality" },
  { id: "hospital", label: "Hospital" },
  { id: "treatment", label: "Treatment" },
];

interface Suggestion {
  type: Exclude<Category, "all">;
  label: string;
  sub: string;
  to: string;
}

const TYPE_ICON: Record<Suggestion["type"], typeof Stethoscope> = {
  doctor: Stethoscope,
  speciality: FlaskConical,
  hospital: Building2,
  treatment: Package,
};

const TYPE_LABEL: Record<Suggestion["type"], string> = {
  doctor: "Doctors",
  speciality: "Specialities",
  hospital: "Hospitals",
  treatment: "Treatments",
};

const HealthcareSearch = forwardRef<HTMLDivElement>((_props, ref) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("All locations");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { data: locations = [] } = useLocations();
  const cities = Array.from(
    new Set(locations.map((l) => l.city_name).filter((c): c is string => Boolean(c)))
  ).sort();

  useEffect(() => {
    const onClickAway = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  const runSearch = useCallback(
    async (term: string, cat: Category, city: string) => {
      const q = term.trim();
      if (q.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const wants = (t: Category) => cat === "all" || cat === t;

      try {
        const [doctors, specialities, hospitals, treatments] = await Promise.all([
          wants("doctor")
            ? supabase
                .from("doctors")
                .select("name, slug, designation, cities")
                .eq("is_published", true)
                .ilike("name", `%${q}%`)
                .limit(4)
            : Promise.resolve({ data: [] }),
          wants("speciality")
            ? supabase.from("specialties").select("name, slug").ilike("name", `%${q}%`).limit(3)
            : Promise.resolve({ data: [] }),
          wants("hospital")
            ? supabase
                .from("locations")
                .select("name, cities(name)")
                .eq("is_published", true)
                .ilike("name", `%${q}%`)
                .limit(3)
            : Promise.resolve({ data: [] }),
          wants("treatment")
            ? supabase
                .from("packages")
                .select("title, slug, description")
                .eq("is_published", true)
                .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
                .limit(4)
            : Promise.resolve({ data: [] }),
        ]);

        const matchesCity = (values: string[] | null | undefined) =>
          city === "All locations" || (values ?? []).some((v) => v === city);

        const combined: Suggestion[] = [
          ...((doctors.data ?? []) as { name: string; slug: string; designation: string | null; cities: string[] | null }[])
            .filter((d) => matchesCity(d.cities))
            .map((d) => ({
              type: "doctor" as const,
              label: d.name,
              sub: d.designation || "Specialist",
              to: `/doctors/${d.slug}`,
            })),
          ...((specialities.data ?? []) as { name: string; slug: string }[]).map((s) => ({
            type: "speciality" as const,
            label: s.name,
            sub: "Speciality",
            to: `/packages?specialty=${s.slug}`,
          })),
          ...((hospitals.data ?? []) as { name: string; cities: { name: string } | null }[])
            .filter((h) => city === "All locations" || h.cities?.name === city)
            .map((h) => ({
              type: "hospital" as const,
              label: h.name,
              sub: h.cities?.name || "Partner hospital",
              to: "/hospitals",
            })),
          ...((treatments.data ?? []) as { title: string; slug: string }[]).map((t) => ({
            type: "treatment" as const,
            label: t.title,
            sub: "Treatment package",
            to: `/packages/${t.slug}`,
          })),
        ];

        setResults(combined);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleChange = (value: string) => {
    setQuery(value);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value, category, location), 260);
  };

  const handleCategory = (next: Category) => {
    setCategory(next);
    if (query.trim().length >= 2) runSearch(query, next, location);
    inputRef.current?.focus();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (results.length > 0) {
      navigate(results[0].to);
      return;
    }
    // Nothing matched yet — hand the query to the fuller catalogue page.
    navigate(`/packages?q=${encodeURIComponent(query.trim())}`);
  };

  const grouped = (["doctor", "speciality", "hospital", "treatment"] as const)
    .map((type) => ({ type, items: results.filter((r) => r.type === type) }))
    .filter((g) => g.items.length > 0);

  return (
    <section ref={ref} className="scroll-mt-24 bg-white py-16 sm:py-20" aria-labelledby="search-heading">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <h2
          id="search-heading"
          className="max-w-[18ch] text-[28px] font-bold leading-[1.12] text-conceev-black sm:text-[38px]"
        >
          What healthcare are you looking for?
        </h2>

        <div ref={containerRef} className="relative mt-8">
          {/* Category chips */}
          <div
            role="group"
            aria-label="Filter search by type"
            className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide"
          >
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCategory(c.id)}
                aria-pressed={category === c.id}
                className={cn(
                  "shrink-0 rounded-lg px-4 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2",
                  category === c.id
                    ? "bg-conceev-black text-white"
                    : "bg-conceev-offwhite text-conceev-black/60 hover:text-conceev-black"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col overflow-hidden rounded-2xl border border-conceev-black/12 bg-white transition-shadow focus-within:border-conceev-black/25 focus-within:shadow-[0_10px_40px_-24px_rgba(25,23,23,0.5)] md:flex-row md:items-center"
          >
            <div className="flex flex-1 items-center gap-3 px-5 py-4">
              <Search className="h-[18px] w-[18px] shrink-0 text-conceev-grey-mid" aria-hidden="true" />
              <input
                ref={inputRef}
                id="healthcare-search"
                type="search"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => setOpen(true)}
                placeholder="Search doctors, specialities, hospitals or treatments"
                aria-label="Search doctors, specialities, hospitals or treatments"
                aria-autocomplete="list"
                aria-expanded={open && (results.length > 0 || query.length >= 2)}
                className="w-full min-w-0 bg-transparent text-[15px] text-conceev-black outline-none placeholder:text-conceev-grey-mid"
              />
            </div>

            <div className="h-px w-full bg-conceev-black/10 md:h-8 md:w-px" aria-hidden="true" />

            <div className="relative flex items-center gap-2 px-5 py-4 md:py-0">
              <MapPin className="h-[18px] w-[18px] shrink-0 text-conceev-grey-mid" aria-hidden="true" />
              <select
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (query.trim().length >= 2) runSearch(query, category, e.target.value);
                }}
                aria-label="Your location"
                className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-[15px] text-conceev-black outline-none md:w-[150px]"
              >
                <option value="All locations">Your location</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-5 h-4 w-4 text-conceev-grey-mid"
                aria-hidden="true"
              />
            </div>

            <div className="p-2.5 md:pl-0">
              <button
                type="submit"
                className="w-full rounded-xl bg-conceev-red px-8 py-3.5 text-[15px] font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-conceev-red-deep active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2 md:w-auto md:py-3"
              >
                Search
              </button>
            </div>
          </form>

          {/* Suggestions */}
          {open && query.trim().length >= 2 && (
            <div
              role="listbox"
              aria-label="Search suggestions"
              className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[380px] overflow-y-auto rounded-2xl border border-conceev-black/10 bg-white py-2 shadow-[0_24px_70px_-30px_rgba(25,23,23,0.5)]"
            >
              {loading && (
                <p className="flex items-center gap-2 px-5 py-3 text-[14px] text-conceev-grey-mid">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Searching&hellip;
                </p>
              )}
              {!loading && grouped.length === 0 && (
                <p className="px-5 py-3 text-[14px] text-conceev-grey-mid">
                  Nothing matched &ldquo;{query.trim()}&rdquo;. Try a doctor, speciality or treatment name.
                </p>
              )}
              {!loading &&
                grouped.map((group) => {
                  const Icon = TYPE_ICON[group.type];
                  return (
                    <div key={group.type}>
                      <p className="px-5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-conceev-grey-mid">
                        {TYPE_LABEL[group.type]}
                      </p>
                      {group.items.map((item) => (
                        <button
                          key={`${item.type}-${item.to}-${item.label}`}
                          type="button"
                          role="option"
                          aria-selected={false}
                          onClick={() => {
                            setOpen(false);
                            navigate(item.to);
                          }}
                          className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-conceev-offwhite focus-visible:bg-conceev-offwhite focus-visible:outline-none"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-conceev-red" aria-hidden="true" />
                          <span className="min-w-0">
                            <span className="block truncate text-[14px] font-medium text-conceev-black">
                              {item.label}
                            </span>
                            <span className="block truncate text-[12px] text-conceev-grey-mid">
                              {item.sub}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

HealthcareSearch.displayName = "HealthcareSearch";

export default HealthcareSearch;
