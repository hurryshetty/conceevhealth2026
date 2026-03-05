import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Doctors", href: "/doctors" },
  { label: "Packages", href: "/packages" },
  { label: "FAQs", href: "#faqs" },
  { label: "Contact Us", href: "#contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="font-serif text-2xl font-bold text-primary">
          Conceev<span className="text-navy">Health</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((l) =>
            l.href.startsWith("/") ? (
              <Link key={l.label} to={l.href} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                {l.label}
              </Link>
            ) : (
              <a key={l.label} href={l.href} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                {l.label}
              </a>
            )
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button size="sm" variant="outline" className="rounded-full gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <Phone className="h-4 w-4" /> Call Now
          </Button>
          <Button size="sm" className="rounded-full">
            Book Consultation
          </Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 pb-4 space-y-1 animate-fade-in">
          {navLinks.map((l) =>
            l.href.startsWith("/") ? (
              <Link key={l.label} to={l.href} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-xl py-3 px-3 transition-colors">
                {l.label}
              </Link>
            ) : (
              <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-xl py-3 px-3 transition-colors">
                {l.label}
              </a>
            )
          )}
          <div className="pt-2 space-y-2">
            <Button size="sm" variant="outline" className="w-full rounded-full gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Phone className="h-4 w-4" /> Call Now
            </Button>
            <Button size="sm" className="w-full rounded-full">
              Book Consultation
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
