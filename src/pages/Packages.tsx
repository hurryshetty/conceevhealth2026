import { useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadFormModal from "@/components/LeadFormModal";
import { useSpecialties } from "@/hooks/useSpecialties";
import { usePackages } from "@/hooks/usePackages";
import { getIconByName } from "@/lib/icons";
import { formatPrice } from "@/lib/utils";

const cityOptions = ["All Cities", "Bangalore", "Hyderabad"] as const;

const Packages = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [cityFilter, setCityFilter] = useState<string>("All Cities");
  const [formOpen, setFormOpen] = useState(false);

  const { data: specialties = [] } = useSpecialties();
  const { data: allPackages = [] } = usePackages();

  const currentSpecialty = specialties[activeTab];
  const filtered = allPackages
    .filter((p) => p.specialty_id === currentSpecialty?.id)
    .filter((p) => cityFilter === "All Cities" || p.cities.includes(cityFilter));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-navy text-primary-foreground py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
            All Treatment Packages
          </h1>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto text-lg">
            Transparent, fixed-price packages across Gynaecology, Maternity & Fertility — no hidden costs.
          </p>
        </div>
      </section>

      {/* Tabs + Packages */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {specialties.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(i)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === i
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {cityOptions.map((city) => (
                <button
                  key={city}
                  onClick={() => setCityFilter(city)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    cityFilter === city
                      ? "bg-foreground text-background"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {city !== "All Cities" && <MapPin className="h-3 w-3" />}
                  {city}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No packages available for this combination. Try a different city or specialty.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filtered.map((pkg) => {
                const Icon = getIconByName(pkg.icon_name);
                return (
                  <div
                    key={pkg.slug}
                    className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300 relative flex flex-col"
                  >
                    {pkg.tag && (
                      <span className="absolute top-4 right-4 text-xs font-semibold bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full">
                        {pkg.tag}
                      </span>
                    )}
                    <Icon className="h-9 w-9 text-primary mb-3" />
                    <h3 className="font-serif text-lg font-bold text-foreground mb-1">{pkg.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 flex-1">{pkg.description}</p>
                    <p className="text-xl font-bold text-foreground mb-1">
                      Starting at <span className="text-primary">{formatPrice(pkg.price)}</span>
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                      <MapPin className="h-3 w-3" />
                      {pkg.cities.join(" · ")}
                    </div>
                    <Link to={`/packages/${pkg.slug}`}>
                      <Button className="w-full rounded-full gap-1.5">
                        View Package Details <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary/50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
            Not sure which package is right for you?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Our care coordinators will help you find the best option based on your needs and budget.
          </p>
          <Button className="rounded-full" size="lg" onClick={() => setFormOpen(true)}>
            Book Free Consultation
          </Button>
        </div>
      </section>

      <Footer />
      <LeadFormModal open={formOpen} onOpenChange={setFormOpen} sourcePage="packages" />
    </div>
  );
};

export default Packages;
