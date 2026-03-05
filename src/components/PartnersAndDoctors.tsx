import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Building2, ArrowRight, Calendar, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import LeadFormModal from "./LeadFormModal";
import { doctors } from "@/data/doctors";

const CARDS_PER_PAGE = 6; // 2 rows × 3 columns

const allHospitalNames = [...new Set(doctors.flatMap((d) => d.hospitals))];
const hospitals = [
  { name: "All", doctors: doctors.map((d) => d.name) },
  ...allHospitalNames.map((h) => ({
    name: h,
    doctors: doctors.filter((d) => d.hospitals.includes(h)).map((d) => d.name),
  })),
];

const allDoctors = doctors;

const PartnersAndDoctors = () => {
  const [activeHospital, setActiveHospital] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [page, setPage] = useState(0);

  const selectedHospital = hospitals.find((h) => h.name === activeHospital)!;
  const filteredDoctors = useMemo(
    () => allDoctors.filter((d) => selectedHospital.doctors.includes(d.name)),
    [activeHospital]
  );

  const totalPages = Math.ceil(filteredDoctors.length / CARDS_PER_PAGE);
  const pagedDoctors = filteredDoctors.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  const handleHospitalChange = (name: string) => {
    setActiveHospital(name);
    setPage(0);
  };

  return (
    <section id="surgeons" className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header with navigation arrows */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
              <span className="w-2 h-2 rounded-full bg-primary" /> Top Surgeons
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Consult Top Surgeons in Your City
            </h2>
            <p className="text-muted-foreground mt-2">Experienced specialists handpicked for quality care.</p>
          </div>

          {/* Arrow navigation */}
          {totalPages > 1 && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous doctors"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next doctors"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
            </div>
          )}
        </div>

        {/* Hospital chips */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {hospitals.map((h) => (
            <button
              key={h.name}
              onClick={() => handleHospitalChange(h.name)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeHospital === h.name
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              {h.name !== "All" && <Building2 className="h-4 w-4" />}
              {h.name}
            </button>
          ))}
        </div>

        {/* Doctor cards - 2 rows max */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pagedDoctors.map((d) => (
            <div
              key={d.name}
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-primary/20 shadow-md">
                  <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-foreground text-lg leading-tight">{d.name}</h3>
                  <p className="text-sm text-primary font-medium mt-0.5">{d.designation}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.experience} experience</p>
                </div>
              </div>

              <div className="mb-5 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Top Surgeries</p>
                <div className="flex flex-wrap gap-1.5">
                  {d.surgeries.map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1 rounded-full gap-1.5" onClick={() => setFormOpen(true)}>
                  <Calendar className="h-3.5 w-3.5" /> Book Appointment
                </Button>
                <Link to={`/doctors/${d.slug}`}>
                  <Button size="sm" variant="outline" className="rounded-full gap-1.5">
                    <User className="h-3.5 w-3.5" /> View Profile
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <p className="text-muted-foreground text-sm py-8 text-center">No doctors found for this hospital.</p>
        )}

        {/* Mobile arrows + page indicator */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8 md:hidden">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          </div>
        )}

        {/* View All button */}
        <div className="mt-10">
          <Link to="/doctors">
            <Button variant="outline" className="group rounded-full">
              View All Doctor Profiles
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      <LeadFormModal open={formOpen} onOpenChange={setFormOpen} />
    </section>
  );
};

export default PartnersAndDoctors;
