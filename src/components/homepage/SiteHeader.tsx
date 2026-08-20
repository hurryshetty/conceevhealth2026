import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV } from "@/data/homepageContent";

/**
 * Premium sticky navigation.
 *
 * Off-white with a hairline bottom border at rest; on scroll it gains a subtle
 * backdrop blur and a slightly stronger border. Deliberately spacious — six
 * centre links, and everything else reduced to icons.
 */

interface SiteHeaderProps {
  onOpenSearch: () => void;
  onBook: () => void;
}

const SiteHeader = ({ onOpenSearch, onBook }: SiteHeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page behind the mobile sheet.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-conceev-black/10"
          : "bg-conceev-offwhite border-b border-conceev-black/[0.06]"
      )}
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="flex h-[72px] items-center justify-between gap-8">
          {/*
            Wordmark. Per the Identity Guidelines it is never rotated,
            stretched, compressed, recoloured or set in title case, and never
            below the 1.5in (144px) minimum width — hence min-w. The flex gap
            either side holds the clear space rule (at least the height of the
            letter "C" on every side).
          */}
          <Link
            to="/"
            className="min-w-[144px] shrink-0 rounded-sm text-[21px] font-bold text-conceev-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-4"
            aria-label="Conceev Health — home"
          >
            Conceev<span className="text-conceev-red">Health</span>
          </Link>

          {/* Centre navigation */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {PRIMARY_NAV.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="group relative inline-block rounded-sm py-1 text-[14px] font-medium text-conceev-black/70 transition-colors hover:text-conceev-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-4"
                  >
                    {item.label}
                    <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-conceev-red transition-transform duration-300 group-hover:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right cluster */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search doctors, specialities, hospitals and treatments"
              className="flex h-10 w-10 items-center justify-center rounded-full text-conceev-black/70 transition-colors hover:bg-conceev-black/[0.05] hover:text-conceev-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red"
            >
              <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>

            <Link
              to="/login"
              className="hidden rounded-full px-4 py-2 text-[14px] font-medium text-conceev-black/70 transition-colors hover:text-conceev-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red sm:inline-block"
            >
              Login
            </Link>

            <button
              type="button"
              onClick={onBook}
              className="hidden rounded-xl bg-conceev-red px-5 py-2.5 text-[14px] font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-conceev-red-deep active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2 sm:inline-block"
            >
              Book Appointment
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full text-conceev-black transition-colors hover:bg-conceev-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="border-t border-conceev-black/[0.06] bg-conceev-offwhite lg:hidden">
          <nav aria-label="Primary mobile" className="mx-auto max-w-[1280px] px-5 py-4">
            <ul className="divide-y divide-conceev-black/[0.06]">
              {PRIMARY_NAV.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3.5 text-[16px] font-medium text-conceev-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-3">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-xl border border-conceev-black/15 px-4 py-3 text-center text-[15px] font-semibold text-conceev-black"
              >
                Login
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onBook();
                }}
                className="flex-1 rounded-xl bg-conceev-red px-4 py-3 text-[15px] font-semibold text-white"
              >
                Book Appointment
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
