import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSpecialties } from "@/hooks/useSpecialties";
import { usePackages } from "@/hooks/usePackages";
import { getIconByName } from "@/lib/icons";

const SpecialtiesGrid = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { data: specialties = [] } = useSpecialties();
  const { data: allPackages = [] } = usePackages();

  const currentSpecialty = specialties[activeTab];
  const packages = allPackages.filter(
    (p) => p.specialty_id === currentSpecialty?.id
  );

  if (specialties.length === 0) return null;

  return (
    <section id="specialties" className="py-16 md:py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-primary" /> Specialties
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Conceev Health Specialties
          </h2>
          <p className="text-muted-foreground mt-2 max-w-lg">
            Comprehensive women's healthcare packages curated for your needs.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {specialties.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeTab === i
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Package Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((s) => {
            const Icon = getIconByName(s.icon_name);
            return (
              <div
                key={s.slug}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative flex flex-col"
              >
                {s.tag && (
                  <span className="absolute top-4 right-4 text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    {s.tag}
                  </span>
                )}
                <Icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-serif text-lg font-bold mb-1 text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 flex-1">{s.description}</p>
                <p className="text-sm font-semibold text-foreground mb-4">
                  Starting at <span className="text-primary">{s.price}</span>
                </p>
                <Link to={`/packages/${s.slug}`}>
                  <Button variant="outline" size="sm" className="rounded-full gap-1.5">
                    View Package <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link to="/packages">
            <Button variant="default" className="rounded-full gap-2">
              View All Packages <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SpecialtiesGrid;
