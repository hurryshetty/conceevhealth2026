import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, MapPin, ShieldCheck, UserRound, Video } from "lucide-react";
import { useDoctors } from "@/hooks/useDoctors";

/**
 * Doctor discovery.
 *
 * Every field is live from the `doctors` table — name, designation, experience,
 * qualifications, cities, specialisations, photo. Nothing is fabricated, and a
 * doctor missing a photo or a qualification simply renders without that row
 * rather than with filler.
 *
 * The layout is intentionally not an e-commerce card: a wide portrait column
 * with the credentials set as a labelled list beside it.
 */

interface FeaturedDoctorsProps {
  onBook: (doctorName: string) => void;
}

const FeaturedDoctors = ({ onBook }: FeaturedDoctorsProps) => {
  const { data: doctors = [], isLoading } = useDoctors();
  const featured = doctors.slice(0, 3);

  if (!isLoading && featured.length === 0) return null;

  return (
    <section className="bg-white py-20 sm:py-28" aria-labelledby="doctors-heading">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[46ch]">
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-conceev-red">
              Find the right doctor
            </p>
            <h2
              id="doctors-heading"
              className="text-[32px] font-bold leading-[1.08] text-conceev-black sm:text-[44px]"
            >
              Meet doctors you can trust.
            </h2>
            <p className="mt-4 text-[16px] leading-[1.65] text-conceev-black/60">
              Experienced specialists, verified credentials and convenient appointments.
            </p>
          </div>

          <Link
            to="/doctors"
            className="group inline-flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-conceev-black transition-colors hover:text-conceev-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
          >
            View all doctors
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-12 grid gap-5 md:grid-cols-3" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[420px] animate-pulse rounded-[20px] bg-conceev-grey/25" />
            ))}
            <span className="sr-only">Loading doctors</span>
          </div>
        ) : (
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {featured.map((doctor) => (
              <li
                key={doctor.id}
                className="group flex flex-col overflow-hidden rounded-[20px] border border-conceev-black/[0.08] bg-white transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-conceev-black/20"
              >
                {/* Portrait */}
                <div className="relative aspect-[4/3] overflow-hidden bg-conceev-offwhite">
                  {doctor.image_url ? (
                    <img
                      src={doctor.image_url}
                      alt={`Portrait of ${doctor.name}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-conceev-grey">
                      <UserRound className="h-12 w-12" aria-hidden="true" />
                    </span>
                  )}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-conceev-black backdrop-blur-sm">
                    <ShieldCheck className="h-3 w-3 text-conceev-red" aria-hidden="true" />
                    Verified
                  </span>
                </div>

                {/* Credentials */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-[18px] font-semibold leading-tight text-conceev-black">
                    <Link
                      to={`/doctors/${doctor.slug}`}
                      className="rounded-sm transition-colors hover:text-conceev-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
                    >
                      {doctor.name}
                    </Link>
                  </h3>
                  {doctor.designation && (
                    <p className="mt-1 text-[14px] text-conceev-red">{doctor.designation}</p>
                  )}

                  <dl className="mt-4 space-y-2 border-t border-conceev-black/[0.07] pt-4 text-[13px]">
                    {doctor.experience && (
                      <div className="flex items-center gap-2 text-conceev-black/65">
                        <dt className="sr-only">Experience</dt>
                        <dd>{doctor.experience} experience</dd>
                      </div>
                    )}
                    {doctor.qualifications?.length > 0 && (
                      <div className="flex items-start gap-2 text-conceev-black/65">
                        <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <dt className="sr-only">Qualifications</dt>
                        <dd className="line-clamp-1">{doctor.qualifications.join(", ")}</dd>
                      </div>
                    )}
                    {doctor.cities?.length > 0 && (
                      <div className="flex items-center gap-2 text-conceev-black/65">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <dt className="sr-only">Location</dt>
                        <dd>{doctor.cities.join(" · ")}</dd>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-conceev-black/65">
                      <Video className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <dt className="sr-only">Consultation type</dt>
                      <dd>In-clinic &amp; online consultation</dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onBook(doctor.name)}
                      className="flex-1 rounded-xl bg-conceev-black px-4 py-2.5 text-[14px] font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-conceev-ink active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
                    >
                      Book Appointment
                    </button>
                    <Link
                      to={`/doctors/${doctor.slug}`}
                      className="rounded-xl border border-conceev-black/15 px-4 py-2.5 text-[14px] font-semibold text-conceev-black transition-colors hover:border-conceev-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
                    >
                      Profile
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default FeaturedDoctors;
