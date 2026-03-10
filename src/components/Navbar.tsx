import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Menu structure ───────────────────────────────────────────────────────────

const FOR_PATIENTS = [
  { label: "Doctors", href: "/doctors", internal: true },
  { label: "Packages", href: "/packages", internal: true },
  { label: "FAQs", href: "#faqs", internal: false },
  { label: "Contact Us", href: "#contact", internal: false },
];

const OUR_COMPANY = [
  { label: "About Us", href: "#about", internal: false },
  { label: "Doctor Onboarding", href: "/register-as-doctor", internal: true },
  { label: "Partner With Us", href: "/register-your-hospital", internal: true },
  { label: "Careers", href: "#careers", internal: false },
];

// ─── Dropdown ─────────────────────────────────────────────────────────────────

interface DropdownProps {
  label: string;
  items: { label: string; href: string; internal: boolean }[];
  onClose: () => void;
}

const Dropdown = ({ label, items, onClose }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleItemClick = (item: { href: string; internal: boolean }) => {
    setOpen(false);
    onClose();
    if (item.internal) {
      navigate(item.href);
    } else {
      // For hash links on the same page, use native anchor behavior
      const el = document.querySelector(item.href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = item.href;
      }
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-sm font-medium transition-colors ${
          open ? "text-primary" : "text-foreground/80 hover:text-primary"
        }`}
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => handleItemClick(item)}
              className="w-full text-left px-4 py-3 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors border-b border-border/50 last:border-0"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Mobile accordion ─────────────────────────────────────────────────────────

interface MobileGroupProps {
  label: string;
  items: { label: string; href: string; internal: boolean }[];
  onClose: () => void;
}

const MobileGroup = ({ label, items, onClose }: MobileGroupProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleItemClick = (item: { href: string; internal: boolean }) => {
    onClose();
    if (item.internal) {
      navigate(item.href);
    } else {
      const el = document.querySelector(item.href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = item.href;
      }
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-sm font-semibold text-foreground/80 hover:text-primary py-3 px-3 rounded-xl hover:bg-primary/5 transition-colors"
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ml-4 border-l-2 border-primary/20 pl-3 space-y-0.5 mb-1">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => handleItemClick(item)}
              className="block w-full text-left text-sm text-muted-foreground hover:text-primary py-2 px-2 rounded-lg hover:bg-primary/5 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Navbar ──────────────────────────────────────────────────────────────

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="font-serif text-2xl font-bold text-primary shrink-0">
          Conceev<span className="text-navy">Health</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Dropdown label="For Patients" items={FOR_PATIENTS} onClose={() => {}} />
          <Dropdown label="Our Company" items={OUR_COMPANY} onClose={() => {}} />
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            asChild
          >
            <a href="tel:+919876543210">
              <Phone className="h-4 w-4" /> Call Now
            </a>
          </Button>
          <Button size="sm" className="rounded-full" asChild>
            <a href="#contact">Book Consultation</a>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 pb-4 space-y-0.5 animate-fade-in">
          <MobileGroup label="For Patients" items={FOR_PATIENTS} onClose={() => setMobileOpen(false)} />
          <MobileGroup label="Our Company" items={OUR_COMPANY} onClose={() => setMobileOpen(false)} />
          <div className="pt-3 space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-full gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              asChild
            >
              <a href="tel:+919876543210">
                <Phone className="h-4 w-4" /> Call Now
              </a>
            </Button>
            <Button size="sm" className="w-full rounded-full" asChild>
              <a href="#contact" onClick={() => setMobileOpen(false)}>
                Book Consultation
              </a>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
