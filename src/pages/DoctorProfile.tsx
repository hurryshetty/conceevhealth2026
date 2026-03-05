import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Building2, Calendar, Phone, Globe, GraduationCap, Stethoscope, Award, Clock, IndianRupee, ChevronRight, Home, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadFormModal from "@/components/LeadFormModal";
import { useDoctorBySlug } from "@/hooks/useDoctors";

const DoctorProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: doctor, isLoading } = useDoctorBySlug(slug || "");
  const [formOpen, setFormOpen] = useState(false);
  const [activeReview, setActiveReview] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center"><p className="text-muted-foreground">Loading...</p></div>
        <Footer />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Doctor Not Found</h1>
          <p className="text-muted-foreground mb-6">The doctor profile you're looking for doesn't exist.</p>
          <Link to="/"><Button className="rounded-full gap-2"><ArrowLeft className="h-4 w-4" /> Back to Home</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const reviews = doctor.reviews || [];
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
      <Navbar />

      <section className="bg-navy text-primary-foreground py-12 md:py-16">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-1.5 text-sm text-primary-foreground/50 mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary-foreground transition-colors flex items-center gap-1"><Home className="h-3.5 w-3.5" /> Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/doctors" className="hover:text-primary-foreground transition-colors">Doctors</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-primary-foreground font-medium">{doctor.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-4 border-primary/30 shadow-2xl shrink-0 bg-muted">
              {doctor.image_url ? (
                <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><User className="h-16 w-16 text-muted-foreground" /></div>
              )}
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-1">{doctor.name}</h1>
              <p className="text-primary text-lg font-medium mb-2">{doctor.designation}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-primary-foreground/70 mb-4">
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {doctor.experience}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {doctor.cities.join(", ")}</span>
                <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {avgRating} ({reviews.length} reviews)</span>
                <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> {doctor.languages.join(", ")}</span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                {doctor.hospitals.map((h) => (
                  <span key={h} className="inline-flex items-center gap-1.5 text-xs bg-primary-foreground/10 rounded-full px-3 py-1.5 font-medium"><Building2 className="h-3 w-3" /> {h}</span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button size="lg" className="rounded-full gap-2" onClick={() => setFormOpen(true)}><Calendar className="h-4 w-4" /> Book Appointment</Button>
                <Button size="lg" variant="outline" className="rounded-full gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"><Phone className="h-4 w-4" /> Call Now</Button>
              </div>
            </div>

            <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-2xl p-5 text-center shrink-0 min-w-[160px]">
              <IndianRupee className="h-5 w-5 mx-auto text-primary-foreground/60 mb-1" />
              <p className="text-2xl font-bold">{doctor.consultation_fee}</p>
              <p className="text-xs text-primary-foreground/60">Consultation Fee</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-2"><Stethoscope className="h-5 w-5 text-primary" /> About {doctor.name}</h2>
                <p className="text-muted-foreground leading-relaxed">{doctor.bio}</p>
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> Qualifications</h2>
                <ul className="space-y-3">
                  {doctor.qualifications.map((q) => (
                    <li key={q} className="flex items-start gap-3 text-sm text-foreground"><div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />{q}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {doctor.specializations.map((s) => (
                    <span key={s} className="px-4 py-2 rounded-xl bg-primary/5 border border-primary/15 text-sm font-medium text-foreground">{s}</span>
                  ))}
                </div>
              </div>
              {reviews.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2"><Star className="h-5 w-5 text-primary" /> Patient Reviews</h2>
                  <div className="space-y-4">
                    {reviews.map((r, i) => (
                      <div key={r.id} className={`p-5 rounded-2xl border transition-all cursor-pointer ${activeReview === i ? "bg-card border-primary shadow-md" : "bg-card/50 border-border hover:border-primary/30"}`} onClick={() => setActiveReview(i)}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20 bg-muted flex items-center justify-center">
                            {r.image_url ? <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" /> : <User className="h-5 w-5 text-muted-foreground" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{r.name}</p>
                            <p className="text-xs text-muted-foreground">{r.area}</p>
                          </div>
                          <div className="ml-auto flex items-center gap-1">
                            {[...Array(5)].map((_, s) => (
                              <Star key={s} className={`h-3.5 w-3.5 ${s < Math.floor(r.rating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">"{r.quote}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-navy rounded-2xl p-6 text-primary-foreground sticky top-24">
                <h3 className="font-serif text-lg font-bold mb-2">Book an Appointment</h3>
                <p className="text-xs text-primary-foreground/70 mb-4">Get a free consultation with {doctor.name}.</p>
                <Button className="w-full rounded-full mb-3" onClick={() => setFormOpen(true)}><Calendar className="h-4 w-4 mr-2" /> Book Free Consultation</Button>
                <Button variant="outline" className="w-full rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"><Phone className="h-4 w-4 mr-2" /> Call Now</Button>
              </div>
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-serif text-base font-bold text-foreground mb-3">Surgeries Performed</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.surgeries.map((s) => <span key={s} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground font-medium">{s}</span>)}
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-serif text-base font-bold text-foreground mb-3">Available At</h3>
                <ul className="space-y-2">
                  {doctor.hospitals.map((h) => <li key={h} className="flex items-center gap-2 text-sm text-muted-foreground"><Building2 className="h-4 w-4 text-primary shrink-0" />{h}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <LeadFormModal open={formOpen} onOpenChange={setFormOpen} sourcePage={`doctor_${doctor.slug}`} />
    </div>
  );
};

export default DoctorProfile;
