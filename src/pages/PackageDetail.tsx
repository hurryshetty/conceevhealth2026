import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, CalendarCheck, CheckCircle2, Building2, ArrowRight, Star, Users, TrendingUp, ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadFormModal from "@/components/LeadFormModal";
import { usePackageBySlug, usePackages } from "@/hooks/usePackages";
import { useLocations } from "@/hooks/useLocations";
import { getIconByName } from "@/lib/icons";

const PackageDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [formOpen, setFormOpen] = useState(false);
  const { data: pkg, isLoading } = usePackageBySlug(slug || "");
  const { data: allPackages = [] } = usePackages();
  const { data: locations = [] } = useLocations();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4 text-foreground">Package Not Found</h1>
          <Link to="/packages">
            <Button variant="outline" className="rounded-full gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Packages
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const Icon = getIconByName(pkg.icon_name);
  // Use stored available_hospitals list; fall back to city-matched locations for legacy packages
  const storedHospitals = (pkg.available_hospitals || []);
  const availableHospitals = storedHospitals.length > 0
    ? locations.filter((h) => storedHospitals.includes(h.name))
    : locations.filter((h) => pkg.cities.includes(h.city_name || ""));
  const relatedPackages = allPackages
    .filter((p) => p.specialty_id === pkg.specialty_id && p.slug !== pkg.slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-navy text-primary-foreground py-14 md:py-20">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-1.5 text-sm text-primary-foreground/50 mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary-foreground transition-colors flex items-center gap-1">
              <Home className="h-3.5 w-3.5" /> Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/packages" className="hover:text-primary-foreground transition-colors">Packages</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-primary-foreground font-medium">{pkg.title}</span>
          </nav>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 flex items-center justify-center shrink-0">
              <Icon className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-serif text-4xl md:text-5xl font-bold">{pkg.title}</h1>
                {pkg.tag && (
                  <span className="text-xs font-semibold bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full">
                    {pkg.tag}
                  </span>
                )}
              </div>
              <p className="text-primary-foreground/70 text-lg mb-4">{pkg.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary-foreground/50" /> {pkg.duration}</span>
                <span className="flex items-center gap-1.5"><CalendarCheck className="h-4 w-4 text-primary-foreground/50" /> Recovery: {pkg.recovery}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary-foreground/50" /> {pkg.cities.join(" & ")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Overview</h2>
                <p className="text-muted-foreground leading-relaxed">{pkg.overview}</p>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">What's Included</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {pkg.includes.map((item) => (
                    <div key={item} className="flex items-center gap-3 bg-card rounded-xl border border-border p-4">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-sm font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Available Hospitals</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {availableHospitals.slice(0, 6).map((h, i) => (
                    <div key={`${h.name}-${i}`} className="bg-card rounded-xl border border-border p-4 flex items-start gap-3 hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{h.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {h.area}, {h.city_name}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {h.surgeries.map((s) => (
                            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Success Rate & Stats</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-card rounded-xl border border-border p-5 text-center">
                    <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{pkg.success_rate || "N/A"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Success Rate</p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-5 text-center">
                    <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{pkg.total_patients || "N/A"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Patients Treated</p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-5 text-center">
                    <Star className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{pkg.avg_rating}/5</p>
                    <p className="text-xs text-muted-foreground mt-1">Avg Rating</p>
                  </div>
                </div>
              </div>

              {pkg.reviews && pkg.reviews.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Patient Reviews</h2>
                  <div className="space-y-4">
                    {pkg.reviews.map((review) => (
                      <div key={review.id} className="bg-card rounded-xl border border-border p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-bold text-foreground">{review.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {review.city}
                            </p>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star key={j} className={`h-4 w-4 ${j < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">"{review.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                <p className="text-sm text-muted-foreground mb-1">Starting at</p>
                <p className="text-3xl font-bold text-primary mb-1">{pkg.price}</p>
                <p className="text-xs text-muted-foreground mb-6">Fixed price · No hidden costs</p>
                <Button className="w-full rounded-full mb-3" size="lg" onClick={() => setFormOpen(true)}>
                  Book Free Consultation
                </Button>
                <Button variant="outline" className="w-full rounded-full gap-1.5" size="lg" asChild>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
                    WhatsApp Us <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                {(pkg.features || []).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm text-muted-foreground">
                    {(pkg.features || []).map((feat) => (
                      <div key={feat} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> {feat}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Packages */}
      {relatedPackages.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-8">Other {pkg.specialty_name} Packages</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPackages.map((rp) => {
                const RpIcon = getIconByName(rp.icon_name);
                return (
                  <Link key={rp.slug} to={`/packages/${rp.slug}`} className="group">
                    <div className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <RpIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors">{rp.title}</h3>
                          {rp.tag && <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{rp.tag}</span>}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 flex-1">{rp.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">{rp.price}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {rp.cities.join(", ")}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
      <LeadFormModal open={formOpen} onOpenChange={setFormOpen} sourcePage={`package-${slug}`} />
    </div>
  );
};

export default PackageDetail;
