import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, MapPin, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFertilityExperts } from "@/hooks/useFertilityPackages";

/**
 * Fertility experts, rendered from the existing published `doctors` records.
 *
 * Nothing is fabricated: names, qualifications, experience and bios come
 * straight from the doctors module. When no published doctor matches a fertility
 * specialisation the whole section is omitted rather than filled with
 * placeholders.
 */

interface ExpertsSectionProps {
  limit?: number;
}

const ExpertsSection = ({ limit = 3 }: ExpertsSectionProps) => {
  const { experts, isLoading } = useFertilityExperts(limit);

  if (isLoading || experts.length === 0) return null;

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {experts.map((doctor) => (
          <article
            key={doctor.id}
            className="flex flex-col rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-4 mb-4">
              {doctor.image_url ? (
                <img
                  src={doctor.image_url}
                  alt={`Portrait of ${doctor.name}`}
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                  className="h-16 w-16 rounded-xl object-cover bg-secondary/10"
                />
              ) : (
                <span
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <UserRound className="h-7 w-7" />
                </span>
              )}
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-foreground leading-snug">
                  {doctor.name}
                </h3>
                {doctor.designation && (
                  <p className="text-sm text-muted-foreground mt-0.5">{doctor.designation}</p>
                )}
                {doctor.experience && (
                  <p className="text-xs text-primary font-medium mt-1">
                    {doctor.experience}
                  </p>
                )}
              </div>
            </div>

            {doctor.qualifications?.length > 0 && (
              <p className="flex items-start gap-2 text-xs text-muted-foreground mb-2">
                <GraduationCap className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{doctor.qualifications.join(", ")}</span>
              </p>
            )}

            {doctor.cities?.length > 0 && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{doctor.cities.join(" · ")}</span>
              </p>
            )}

            {doctor.bio && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                {doctor.bio}
              </p>
            )}

            <Link
              to={`/doctors/${doctor.slug}`}
              className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              View profile
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-8">
        <Button variant="outline" className="rounded-full gap-2" asChild>
          <Link to="/doctors">
            Meet Our Fertility Experts
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ExpertsSection;
