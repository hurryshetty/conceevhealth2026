import { Phone } from "lucide-react";

const MobileBottomBar = () => (
  <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-navy p-3 shadow-lg">
    <a
      href="tel:+919876543210"
      className="flex items-center justify-center gap-2 text-primary-foreground font-semibold text-sm"
    >
      <Phone className="h-4 w-4" /> Call Now – Free Consultation
    </a>
  </div>
);

export default MobileBottomBar;
