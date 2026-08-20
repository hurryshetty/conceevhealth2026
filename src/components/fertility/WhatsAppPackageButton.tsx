import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/config/site";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import type { FertilityPackage } from "@/data/fertilityPackages";

/**
 * WhatsApp CTA for a fertility package.
 *
 * The pre-filled message is built from the package record, so no package name is
 * ever hardcoded into a link.
 */

const packageWhatsAppMessage = (pkg: FertilityPackage): string =>
  `Hi Conceev Health, I'm interested in the ${pkg.name} package. Could you share more details?`;

interface WhatsAppPackageButtonProps {
  pkg: FertilityPackage;
  variant?: "default" | "outline" | "icon";
  className?: string;
  /** Where the click happened, recorded on the whatsapp_click event. */
  source?: string;
  tabIndex?: number;
}

const WhatsAppPackageButton = ({
  pkg,
  variant = "outline",
  className,
  source = "package_page",
  tabIndex,
}: WhatsAppPackageButtonProps) => {
  const href = whatsappLink(packageWhatsAppMessage(pkg));

  const handleClick = () =>
    trackEvent(ANALYTICS_EVENTS.WHATSAPP_CLICK, {
      package_slug: pkg.slug,
      package_name: pkg.name,
      source,
    });

  if (variant === "icon") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        tabIndex={tabIndex}
        aria-label={`Chat on WhatsApp about the ${pkg.name} package`}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground",
          "transition-colors hover:border-primary/40 hover:text-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
      </a>
    );
  }

  return (
    <Button
      variant={variant === "default" ? "default" : "outline"}
      className={cn("rounded-full gap-2", className)}
      asChild
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        tabIndex={tabIndex}
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Chat on WhatsApp
      </a>
    </Button>
  );
};

export default WhatsAppPackageButton;
