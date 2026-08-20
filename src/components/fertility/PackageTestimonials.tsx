import { Star } from "lucide-react";
import { usePackageTestimonials } from "@/hooks/useFertilityPackages";

/**
 * Patient testimonials for a package.
 *
 * Data-driven and empty by default. No sample or placeholder testimonials are
 * bundled anywhere in this module — until the marketing team publishes approved,
 * consented entries in `fertility_package_testimonials`, this renders nothing
 * and the detail page skips the section entirely.
 */

interface PackageTestimonialsProps {
  packageId: string;
}

const Rating = ({ value }: { value: number }) => {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`Rated ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rounded
              ? "h-3.5 w-3.5 text-primary fill-primary"
              : "h-3.5 w-3.5 text-border fill-border"
          }
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

const PackageTestimonials = ({ packageId }: PackageTestimonialsProps) => {
  const { data: testimonials = [], isLoading } = usePackageTestimonials(packageId);

  if (isLoading || testimonials.length === 0) return null;

  return (
    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {testimonials.map((testimonial) => (
        <li
          key={testimonial.id}
          className="flex flex-col rounded-2xl border border-border bg-card p-6"
        >
          <Rating value={testimonial.rating} />
          <blockquote className="text-sm text-foreground/85 leading-relaxed mt-4 flex-1">
            {testimonial.quote}
          </blockquote>
          <footer className="mt-5 pt-4 border-t border-border">
            <p className="text-sm font-semibold text-foreground">
              {testimonial.display_name}
              {testimonial.age !== null && (
                <span className="font-normal text-muted-foreground">, {testimonial.age}</span>
              )}
            </p>
            {testimonial.journey && (
              <p className="text-xs text-muted-foreground mt-0.5">{testimonial.journey}</p>
            )}
          </footer>
        </li>
      ))}
    </ul>
  );
};

export default PackageTestimonials;
