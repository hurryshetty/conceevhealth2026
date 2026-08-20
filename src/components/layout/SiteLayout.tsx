import { useCallback, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import LeadFormModal from "@/components/LeadFormModal";
import SiteHeader from "@/components/homepage/SiteHeader";
import SiteFooter from "@/components/homepage/SiteFooter";
import { cn } from "@/lib/utils";

/**
 * Shared shell for every public page on the 2026 brand.
 *
 * Wrapping a page in this gives it the Conceev header and footer, the brand
 * type face, and — via the `conceev-2026` class in index.css — the re-pointed
 * design tokens. Legacy components inside keep working: their `bg-primary`
 * becomes Conceev red, `bg-navy` becomes Conceev black, and `font-serif`
 * becomes the brand face, with no change to their markup.
 *
 * Pages behind a login are deliberately NOT wrapped; they stay on the existing
 * system until that is a separate, deliberate decision.
 */

interface SiteLayoutProps {
  children: ReactNode;
  /** Source label recorded on any lead submitted from this page. */
  leadSource?: string;
  /** Set false on pages that provide their own sticky mobile action. */
  showMobileCta?: boolean;
  className?: string;
}

const SiteLayout = ({
  children,
  leadSource = "site",
  showMobileCta = true,
  className,
}: SiteLayoutProps) => {
  const [leadOpen, setLeadOpen] = useState(false);
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);

  // The header's search icon belongs to the homepage search module; from any
  // other page the useful equivalent is the doctor directory.
  const handleSearch = useCallback(() => navigate("/doctors"), [navigate]);

  return (
    <div className={cn("conceev-2026 min-h-screen bg-white font-brand antialiased", className)}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-conceev-black focus:px-4 focus:py-2.5 focus:text-[14px] focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <SiteHeader onOpenSearch={handleSearch} onBook={() => setLeadOpen(true)} />

      <main id="main" ref={mainRef} className={showMobileCta ? "pb-24 sm:pb-0" : undefined}>
        {children}
      </main>

      <SiteFooter />

      {showMobileCta && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-conceev-black/10 bg-white/95 p-3 backdrop-blur-md sm:hidden"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={() => setLeadOpen(true)}
            className="w-full rounded-xl bg-conceev-red px-5 py-3.5 text-[15px] font-semibold text-white active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conceev-red focus-visible:ring-offset-2"
          >
            Book Appointment
          </button>
        </div>
      )}

      <LeadFormModal open={leadOpen} onOpenChange={setLeadOpen} sourcePage={leadSource} />
    </div>
  );
};

export default SiteLayout;
