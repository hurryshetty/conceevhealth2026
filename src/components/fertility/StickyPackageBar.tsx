import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FertilityPackage } from "@/data/fertilityPackages";
import PriceBlock from "@/components/fertility/PriceBlock";
import WhatsAppPackageButton from "@/components/fertility/WhatsAppPackageButton";

/**
 * Mobile sticky action bar for a package detail page.
 *
 * Appears only after the hero CTAs have scrolled out of view, so it never
 * duplicates a button already on screen. It sits above the browser chrome using
 * `env(safe-area-inset-bottom)`, and the detail page adds matching bottom
 * padding so the bar can never cover the last section of content.
 */

interface StickyPackageBarProps {
  pkg: FertilityPackage;
  onBook: () => void;
  /** Element to observe; the bar shows once it leaves the viewport. */
  revealAfterId?: string;
}

const StickyPackageBar = ({
  pkg,
  onBook,
  revealAfterId = "package-hero-cta",
}: StickyPackageBarProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(revealAfterId);
    if (!target) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "0px 0px -80% 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [revealAfterId]);

  return (
    <div
      className={cn(
        "md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md",
        "transition-transform duration-300",
        visible ? "translate-y-0" : "translate-y-full"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      // Hidden from assistive tech while off-screen so it isn't announced twice.
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <PriceBlock pkg={pkg} compact className="flex-1" />
        <WhatsAppPackageButton
          pkg={pkg}
          variant="icon"
          source="sticky_bar"
          tabIndex={visible ? 0 : -1}
        />
        <Button
          className="rounded-full px-6 shrink-0"
          onClick={onBook}
          tabIndex={visible ? 0 : -1}
        >
          Book Package
        </Button>
      </div>
    </div>
  );
};

export default StickyPackageBar;
