import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Building2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeaturedCities, useLocations } from "@/hooks/useLocations";

const CityCoverage = () => {
  const { data: cities = [] } = useFeaturedCities();
  const { data: locations = [] } = useLocations();
  const [activeCity, setActiveCity] = useState<string>("");
  // "" means "All" (no filter)
  const [selectedArea, setSelectedArea] = useState<Record<string, string>>({});
  const [scrollIndex, setScrollIndex] = useState(0);

  const activeCityName = activeCity || cities[0]?.name || "";

  const cityData = useMemo(() => {
    return cities.map((c) => {
      const cityLocations = locations.filter((l) => l.city_id === c.id);
      const areas = [...new Set(cityLocations.flatMap((l) => l.areas || []))].sort();
      return {
        ...c,
        count: `${cityLocations.length}+ Hospitals`,
        areas,
        hospitals: cityLocations,
      };
    });
  }, [cities, locations]);

  const handleCityClick = (city: string) => {
    setActiveCity(city);
    setScrollIndex(0);
    // Default to "All" — do not auto-select any area
  };

  const handleAreaClick = (city: string, area: string) => {
    setSelectedArea((prev) => ({ ...prev, [city]: area }));
    setScrollIndex(0);
  };

  const handleAllClick = (city: string) => {
    setSelectedArea((prev) => ({ ...prev, [city]: "" }));
    setScrollIndex(0);
  };

  if (cities.length === 0) return null;

  return (
    <section id="cities" className="py-16 md:py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          Hospitals Near You
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
          Partner hospitals across {cities.map((c) => c.name).join(" & ")} for convenient access.
        </p>

        {/* City tabs */}
        <div className="flex flex-col sm:flex-row gap-0">
          {cityData.map((c) => (
            <button
              key={c.id}
              onClick={() => handleCityClick(c.name)}
              className={`flex-1 flex items-center justify-between px-4 sm:px-6 py-4 border transition-all cursor-pointer ${
                activeCityName === c.name
                  ? "bg-card border-border border-b-card rounded-t-2xl shadow-sm z-10"
                  : "bg-secondary/80 border-transparent hover:bg-secondary rounded-t-2xl"
              }`}
            >
              <div className="flex items-center gap-3">
                <h3 className="font-serif text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
                  <MapPin className="h-5 w-5 text-primary" /> {c.name}
                </h3>
                <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {c.count}
                </span>
              </div>
              {activeCityName === c.name ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          ))}
        </div>

        {/* Active city content */}
        {cityData
          .filter((c) => c.name === activeCityName)
          .map((c) => {
            const activeArea = selectedArea[c.name] ?? "";
            // "" = All areas (show all hospitals in the city)
            const filteredHospitals = activeArea
              ? c.hospitals.filter((h) => (h.areas || []).includes(activeArea))
              : c.hospitals;
            const maxScroll = Math.max(0, filteredHospitals.length - 2);

            return (
              <div key={c.id} className="bg-card rounded-b-2xl border border-t-0 border-border p-6 shadow-sm">
                {/* Area chips carousel — "All" first, then areas */}
                {c.areas.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
                    {/* All chip */}
                    <button
                      onClick={() => handleAllClick(c.name)}
                      className={`text-sm px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium whitespace-nowrap shrink-0 ${
                        !activeArea
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                      }`}
                    >
                      All
                    </button>
                    {c.areas.map((a) => (
                      <button
                        key={a}
                        onClick={() => handleAreaClick(c.name, a)}
                        className={`text-sm px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium whitespace-nowrap shrink-0 ${
                          activeArea === a
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}

                <Link
                  to="/hospitals"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
                >
                  Find Hospitals <ArrowRight className="h-4 w-4" />
                </Link>

                {/* Hospital cards carousel */}
                {filteredHospitals.length > 0 && (
                  <div className="pt-5 mt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        {activeArea ? `Hospitals in ${activeArea}` : `All Hospitals in ${c.name}`}
                      </p>
                      {filteredHospitals.length > 2 && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setScrollIndex(Math.max(0, scrollIndex - 1))}
                            disabled={scrollIndex === 0}
                            className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center disabled:opacity-30 hover:bg-accent transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setScrollIndex(Math.min(maxScroll, scrollIndex + 1))}
                            disabled={scrollIndex >= maxScroll}
                            className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center disabled:opacity-30 hover:bg-accent transition-colors"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <div
                        className="flex gap-4 transition-transform duration-300"
                        style={{ transform: `translateX(-${scrollIndex * 292}px)` }}
                      >
                        {filteredHospitals.map((h, i) => (
                          <div
                            key={`${h.name}-${i}`}
                            className="min-w-[250px] sm:min-w-[270px] max-w-[270px] flex-shrink-0 bg-background rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all flex flex-col gap-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-foreground leading-tight">{h.name}</p>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {(h.areas || []).slice(0, 2).join(", ")}
                                  {(h.areas || []).length > 2 && ` +${h.areas.length - 2} more`}
                                  {h.city_name && `, ${h.city_name}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {h.surgeries.slice(0, 4).map((s) => (
                                <span
                                  key={s}
                                  className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium"
                                >
                                  {s}
                                </span>
                              ))}
                              {h.surgeries.length > 4 && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                                  +{h.surgeries.length - 4}
                                </span>
                              )}
                            </div>
                            <Link to="/hospitals" className="mt-auto">
                              <Button size="sm" variant="outline" className="text-xs w-full">
                                View Hospital
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {filteredHospitals.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-4 italic">
                    No hospitals found in {activeArea}. Try a different area.
                  </p>
                )}
              </div>
            );
          })}
      </div>
    </section>
  );
};

export default CityCoverage;
