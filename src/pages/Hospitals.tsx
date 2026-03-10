import { useState, useMemo } from "react";
import { Search, Building2, MapPin, X, ArrowUpDown, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadFormModal from "@/components/LeadFormModal";
import { useLocations } from "@/hooks/useLocations";
import { useCities } from "@/hooks/useLocations";

const Hospitals = () => {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [areaFilter, setAreaFilter] = useState<string | null>(null);
  const [surgeryFilter, setSurgeryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("default");
  const [formOpen, setFormOpen] = useState(false);

  const { data: locations = [] } = useLocations();
  const { data: cities = [] } = useCities();

  // Derive filter options from data
  const allCities = useMemo(
    () => [...new Set(locations.map((l) => l.city_name).filter(Boolean))].sort() as string[],
    [locations]
  );

  const allAreas = useMemo(() => {
    const base = locations
      .filter((l) => !cityFilter || l.city_name === cityFilter)
      .flatMap((l) => l.areas || []);
    return [...new Set(base)].sort();
  }, [locations, cityFilter]);

  const allSurgeries = useMemo(
    () => [...new Set(locations.flatMap((l) => l.surgeries || []))].sort(),
    [locations]
  );

  const filtered = useMemo(() => {
    let result = locations.filter((l) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        (l.areas || []).some((a) => a.toLowerCase().includes(q)) ||
        (l.surgeries || []).some((s) => s.toLowerCase().includes(q));
      const matchesCity = !cityFilter || l.city_name === cityFilter;
      const matchesArea = !areaFilter || (l.areas || []).includes(areaFilter);
      const matchesSurgery = !surgeryFilter || (l.surgeries || []).includes(surgeryFilter);
      return matchesSearch && matchesCity && matchesArea && matchesSurgery;
    });

    if (sortBy === "name-az") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "name-za") result = [...result].sort((a, b) => b.name.localeCompare(a.name));

    return result;
  }, [locations, search, cityFilter, areaFilter, surgeryFilter, sortBy]);

  const activeFilters = [cityFilter, areaFilter, surgeryFilter].filter(Boolean).length;
  const clearAll = () => {
    setSearch("");
    setCityFilter(null);
    setAreaFilter(null);
    setSurgeryFilter(null);
  };

  const handleCityChange = (v: string) => {
    setCityFilter(v === "all" ? null : v);
    setAreaFilter(null); // reset area when city changes
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-3">
            Our Partner Hospitals
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse {locations.length}+ trusted hospitals across our network for Gynecology, Maternity, and Fertility treatments.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <Select value={cityFilter ?? ""} onValueChange={handleCityChange}>
              <SelectTrigger className="w-[160px] rounded-full">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {allCities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={areaFilter ?? ""} onValueChange={(v) => setAreaFilter(v === "all" ? null : v)}>
              <SelectTrigger className="w-[180px] rounded-full">
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {allAreas.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={surgeryFilter ?? ""} onValueChange={(v) => setSurgeryFilter(v === "all" ? null : v)}>
              <SelectTrigger className="w-[220px] rounded-full">
                <SelectValue placeholder="Treatment / Surgery" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Treatments</SelectItem>
                {allSurgeries.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            {activeFilters > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hospital or treatment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>
        </div>

        {/* Count + sort */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> hospital{filtered.length !== 1 ? "s" : ""}
          </p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] rounded-full">
              <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="name-az">Name: A to Z</SelectItem>
              <SelectItem value="name-za">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hospital cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((h) => (
            <div
              key={h.id}
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-bold text-foreground text-base leading-tight">{h.name}</h3>
                  {h.city_name && (
                    <Badge variant="outline" className="text-xs gap-1 mt-1.5">
                      <MapPin className="h-3 w-3" /> {h.city_name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Areas */}
              {(h.areas || []).length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Areas Served
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {h.areas.slice(0, 3).map((a) => (
                      <span
                        key={a}
                        className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium flex items-center gap-1"
                      >
                        <MapPin className="h-2.5 w-2.5" /> {a}
                      </span>
                    ))}
                    {h.areas.length > 3 && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                        +{h.areas.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Surgeries */}
              {(h.surgeries || []).length > 0 && (
                <div className="mb-5 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Treatments Available
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {h.surgeries.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="text-xs px-2.5 py-1 rounded-full bg-primary/8 text-primary font-medium"
                      >
                        {s}
                      </span>
                    ))}
                    {h.surgeries.length > 4 && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                        +{h.surgeries.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <Button
                  size="sm"
                  className="flex-1 rounded-full gap-1.5"
                  onClick={() => setFormOpen(true)}
                >
                  <Phone className="h-3.5 w-3.5" /> Enquire Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full gap-1.5"
                  onClick={() => setFormOpen(true)}
                >
                  <Building2 className="h-3.5 w-3.5" /> View
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No hospitals match your search. Try adjusting your filters.</p>
            <Button variant="outline" className="mt-4 rounded-full" onClick={clearAll}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <Footer />
      <LeadFormModal open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
};

export default Hospitals;
