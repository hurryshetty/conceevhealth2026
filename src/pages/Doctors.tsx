import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, User, MapPin, X, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadFormModal from "@/components/LeadFormModal";
import { useDoctors } from "@/hooks/useDoctors";

const Doctors = () => {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [hospitalFilter, setHospitalFilter] = useState<string | null>(null);
  const [specFilter, setSpecFilter] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("default");

  const { data: doctors = [] } = useDoctors();

  const allCities = useMemo(() => [...new Set(doctors.flatMap((d) => d.cities))].sort(), [doctors]);
  const allHospitals = useMemo(() => [...new Set(doctors.flatMap((d) => d.hospitals))].sort(), [doctors]);
  const allSpecializations = useMemo(() => [...new Set(doctors.flatMap((d) => d.specializations))].sort(), [doctors]);

  const parseExp = (exp: string) => parseInt(exp.replace(/\D/g, "")) || 0;
  const parseFee = (fee: string) => parseInt(fee.replace(/[^\d]/g, "")) || 0;

  const filtered = useMemo(() => {
    const result = doctors.filter((d) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || d.name.toLowerCase().includes(q) || d.designation.toLowerCase().includes(q) || d.surgeries.some((s) => s.toLowerCase().includes(q));
      const matchesCity = !cityFilter || d.cities.includes(cityFilter);
      const matchesHospital = !hospitalFilter || d.hospitals.includes(hospitalFilter);
      const matchesSpec = !specFilter || d.specializations.includes(specFilter);
      return matchesSearch && matchesCity && matchesHospital && matchesSpec;
    });

    if (sortBy === "experience-high") result.sort((a, b) => parseExp(b.experience) - parseExp(a.experience));
    else if (sortBy === "experience-low") result.sort((a, b) => parseExp(a.experience) - parseExp(b.experience));
    else if (sortBy === "fee-low") result.sort((a, b) => parseFee(a.consultation_fee) - parseFee(b.consultation_fee));
    else if (sortBy === "fee-high") result.sort((a, b) => parseFee(b.consultation_fee) - parseFee(a.consultation_fee));

    return result;
  }, [doctors, search, cityFilter, hospitalFilter, specFilter, sortBy]);

  const activeFilters = [cityFilter, hospitalFilter, specFilter].filter(Boolean).length;
  const clearAll = () => { setSearch(""); setCityFilter(null); setHospitalFilter(null); setSpecFilter(null); };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-3">Our Expert Doctors</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our network of {doctors.length}+ top specialists across cities.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <Select value={cityFilter ?? ""} onValueChange={(v) => setCityFilter(v === "all" ? null : v)}>
              <SelectTrigger className="w-[160px] rounded-full"><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {allCities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={hospitalFilter ?? ""} onValueChange={(v) => setHospitalFilter(v === "all" ? null : v)}>
              <SelectTrigger className="w-[200px] rounded-full"><SelectValue placeholder="Hospital" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hospitals</SelectItem>
                {allHospitals.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={specFilter ?? ""} onValueChange={(v) => setSpecFilter(v === "all" ? null : v)}>
              <SelectTrigger className="w-[220px] rounded-full"><SelectValue placeholder="Specialization" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {allSpecializations.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {activeFilters > 0 && (
              <button onClick={clearAll} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline cursor-pointer">
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search doctor or surgery..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-full" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> doctor{filtered.length !== 1 ? "s" : ""}
          </p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px] rounded-full">
              <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-muted-foreground" /><SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="experience-high">Experience: High to Low</SelectItem>
              <SelectItem value="experience-low">Experience: Low to High</SelectItem>
              <SelectItem value="fee-low">Fee: Low to High</SelectItem>
              <SelectItem value="fee-high">Fee: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((d) => (
            <div key={d.slug} className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-primary/20 shadow-md bg-muted">
                  {d.image_url ? (
                    <img src={d.image_url} alt={d.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-foreground text-lg leading-tight">{d.name}</h3>
                  <p className="text-sm text-primary font-medium mt-0.5">{d.designation}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.experience} experience</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{d.consultation_fee} <span className="text-xs font-normal text-muted-foreground">consultation</span></p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {d.cities.map((c) => (
                  <Badge key={c} variant="outline" className="text-xs gap-1"><MapPin className="h-3 w-3" /> {c}</Badge>
                ))}
              </div>
              <div className="mb-5 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Top Surgeries</p>
                <div className="flex flex-wrap gap-1.5">
                  {d.surgeries.slice(0, 4).map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">{s}</span>
                  ))}
                  {d.surgeries.length > 4 && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">+{d.surgeries.length - 4}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 rounded-full gap-1.5" onClick={() => setFormOpen(true)}>
                  <Calendar className="h-3.5 w-3.5" /> Book Appointment
                </Button>
                <Link to={`/doctors/${d.slug}`}>
                  <Button size="sm" variant="outline" className="rounded-full gap-1.5"><User className="h-3.5 w-3.5" /> Profile</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No doctors match your search. Try adjusting your filters.</p>
            <Button variant="outline" className="mt-4 rounded-full" onClick={clearAll}>Clear Filters</Button>
          </div>
        )}
      </div>

      <Footer />
      <LeadFormModal open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
};

export default Doctors;
