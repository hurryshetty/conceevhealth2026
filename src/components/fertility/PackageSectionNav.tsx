import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Sticky in-page navigation for the package detail page.
 *
 * The detail page is long — overview, who it's for, inclusions, outcomes,
 * process, results, experts, FAQs. Without this the only way to reach the FAQs
 * or the inclusions list is to scroll the whole thing, which is punishing on a
 * phone. This pins under the header and tracks the section in view.
 *
 * Horizontally scrollable on mobile, so it stays one row at any width.
 */

export interface NavSection {
  id: string;
  label: string;
}

interface PackageSectionNavProps {
  sections: NavSection[];
}

const PackageSectionNav = ({ sections }: PackageSectionNavProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Choose the entry nearest the top of the viewport that is visible.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      // Band just below the sticky chrome, so the active item matches what the
      // reader is actually looking at rather than what is technically on screen.
      { rootMargin: "-140px 0px -65% 0px", threshold: 0 }
    );

    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => Boolean(n));
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    setActiveId(id);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    // Move focus for keyboard and screen-reader users, not just the scroll box.
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-[72px] z-30 border-y border-border bg-background/95 backdrop-blur-md"
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <ul className="-mx-5 flex gap-1 overflow-x-auto scrollbar-hide px-5 sm:mx-0 sm:px-0">
          {sections.map((section) => {
            const active = activeId === section.id;
            return (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  onClick={(e) => handleClick(e, section.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "relative block whitespace-nowrap px-3.5 py-3.5 text-[13px] font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {section.label}
                  <span
                    className={cn(
                      "absolute inset-x-2.5 bottom-0 h-0.5 rounded-full transition-opacity",
                      active ? "bg-primary opacity-100" : "opacity-0"
                    )}
                    aria-hidden="true"
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default PackageSectionNav;
