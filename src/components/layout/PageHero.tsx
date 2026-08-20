import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Standard hero for internal pages.
 *
 * Matches the homepage language: off-white ground, one soft red glow, an
 * uppercase red eyebrow, a large brand-face h1 and a short supporting line.
 * Keeps every internal page recognisably part of the same site without each
 * one inventing its own header treatment.
 */

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
  /** Optional actions, stats or filters rendered under the copy. */
  children?: ReactNode;
  /** Narrower measure for text-heavy pages such as policies. */
  size?: "default" | "compact";
}

const PageHero = ({
  eyebrow,
  title,
  description,
  crumbs,
  children,
  size = "default",
}: PageHeroProps) => (
  <section className="relative overflow-hidden border-b border-conceev-black/[0.07] bg-conceev-offwhite">
    <div
      className="pointer-events-none absolute -right-[8%] -top-[45%] h-[520px] w-[520px] rounded-full bg-conceev-red/[0.07] blur-[130px]"
      aria-hidden="true"
    />

    <div
      className={cn(
        "relative mx-auto max-w-[1280px] px-5 sm:px-8",
        size === "compact" ? "py-12 sm:py-14" : "py-14 sm:py-20"
      )}
    >
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-7">
          <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-conceev-black/60">
            <li>
              <Link
                to="/"
                className="inline-flex items-center gap-1 rounded-sm transition-colors hover:text-conceev-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red"
              >
                <Home className="h-3.5 w-3.5" aria-hidden="true" /> Home
              </Link>
            </li>
            {crumbs.map((crumb, i) => (
              <Fragment key={crumb.label}>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <li>
                  {crumb.to && i < crumbs.length - 1 ? (
                    <Link
                      to={crumb.to}
                      className="rounded-sm transition-colors hover:text-conceev-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="font-medium text-conceev-black">
                      {crumb.label}
                    </span>
                  )}
                </li>
              </Fragment>
            ))}
          </ol>
        </nav>
      )}

      {eyebrow && (
        <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-conceev-red">
          {eyebrow}
        </p>
      )}

      <h1
        className={cn(
          "font-bold leading-[1.06] text-conceev-black",
          size === "compact"
            ? "max-w-[22ch] text-[30px] sm:text-[40px]"
            : "max-w-[18ch] text-[36px] sm:text-[52px]"
        )}
      >
        {title}
      </h1>

      {description && (
        <p className="mt-5 max-w-[54ch] text-[16px] leading-[1.65] text-conceev-black/60 sm:text-[17px]">
          {description}
        </p>
      )}

      {children && <div className="mt-8">{children}</div>}
    </div>
  </section>
);

export default PageHero;
