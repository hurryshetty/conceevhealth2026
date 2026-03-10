import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Search, Stethoscope, Package, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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

// ─── Search result types ──────────────────────────────────────────────────────

interface SearchResult {
  type: "doctor" | "package" | "specialty";
  label: string;
  sub: string;
  href: string;
}

// ─── Dropdown menu ────────────────────────────────────────────────────────────

interface DropdownProps {
  label: string;
  items: { label: string; href: string; internal: boolean }[];
}

const Dropdown = ({ label, items }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = (item: { href: string; internal: boolean }) => {
    setOpen(false);
    if (item.internal) {
      navigate(item.href);
    } else {
      const el = document.querySelector(item.href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else window.location.href = item.href;
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-sm font-medium whitespace-nowrap transition-colors ${
          open ? "text-primary" : "text-foreground/80 hover:text-primary"
        }`}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => handleClick(item)}
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

// ─── Search bar ───────────────────────────────────────────────────────────────

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const term = q.trim().toLowerCase();

      const [doctorsRes, packagesRes, specialtiesRes] = await Promise.all([
        supabase
          .from("doctors")
          .select("name, slug, designation")
          .ilike("name", `%${term}%`)
          .limit(4),
        supabase
          .from("packages")
          .select("title, slug, description")
          .or(`title.ilike.%${term}%,description.ilike.%${term}%`)
          .limit(4),
        supabase
          .from("specialties")
          .select("name, slug")
          .ilike("name", `%${term}%`)
          .limit(3),
      ]);

      const combined: SearchResult[] = [
        ...(doctorsRes.data || []).map((d) => ({
          type: "doctor" as const,
          label: d.name,
          sub: d.designation || "Doctor",
          href: `/doctors/${d.slug}`,
        })),
        ...(packagesRes.data || []).map((p) => ({
          type: "package" as const,
          label: p.title,
          sub: "Package",
          href: `/packages/${p.slug}`,
        })),
        ...(specialtiesRes.data || []).map((s) => ({
          type: "specialty" as const,
          label: s.name,
          sub: "Treatment / Specialty",
          href: `/packages?specialty=${s.slug}`,
        })),
      ];

      setResults(combined);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 280);
  };

  const handleSelect = (href: string) => {
    setQuery("");
    setResults([]);
    setFocused(false);
    navigate(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = focused && (results.length > 0 || (query.length >= 2 && !loading));

  const typeIcon = (type: SearchResult["type"]) => {
    if (type === "doctor") return <Stethoscope className="h-3.5 w-3.5 text-primary shrink-0" />;
    if (type === "package") return <Package className="h-3.5 w-3.5 text-primary shrink-0" />;
    return <FlaskConical className="h-3.5 w-3.5 text-primary shrink-0" />;
  };

  return (
    <div ref={ref} className="relative flex-1 max-w-md">
      <div className={`flex items-center gap-2 h-9 px-3 rounded-full border transition-all bg-background ${
        focused ? "border-primary shadow-sm ring-1 ring-primary/20" : "border-border hover:border-primary/50"
      }`}>
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search doctors, packages, treatments..."
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground min-w-0"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-sm text-muted-foreground">Searching...</div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">No results found for "{query}"</div>
          )}
          {!loading && results.length > 0 && (
            <>
              {/* Group by type */}
              {(["doctor", "package", "specialty"] as const).map((type) => {
                const group = results.filter((r) => r.type === type);
                if (group.length === 0) return null;
                const groupLabel = type === "doctor" ? "Doctors" : type === "package" ? "Packages" : "Treatments";
                return (
                  <div key={type}>
                    <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {groupLabel}
                    </p>
                    {group.map((r) => (
                      <button
                        key={r.href}
                        onClick={() => handleSelect(r.href)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors text-left"
                      >
                        {typeIcon(r.type)}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{r.label}</p>
                          <p className="text-xs text-muted-foreground">{r.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
              <div className="border-t border-border px-4 py-2.5">
                <button
                  onClick={() => handleSelect(`/packages?q=${encodeURIComponent(query)}`)}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  See all results for "{query}" →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Mobile accordion group ───────────────────────────────────────────────────

interface MobileGroupProps {
  label: string;
  items: { label: string; href: string; internal: boolean }[];
  onClose: () => void;
}

const MobileGroup = ({ label, items, onClose }: MobileGroupProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = (item: { href: string; internal: boolean }) => {
    onClose();
    if (item.internal) {
      navigate(item.href);
    } else {
      const el = document.querySelector(item.href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else window.location.href = item.href;
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
              onClick={() => handleClick(item)}
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
      <div className="container mx-auto flex items-center gap-4 h-16 px-4">
        {/* Logo */}
        <Link to="/" className="font-serif text-2xl font-bold text-primary shrink-0">
          Conceev<span className="text-navy">Health</span>
        </Link>

        {/* Search bar — desktop only, center */}
        <div className="hidden md:flex flex-1 justify-center px-4">
          <SearchBar />
        </div>

        {/* Right side: nav + CTA — desktop */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <Dropdown label="For Patients" items={FOR_PATIENTS} />
          <Dropdown label="Our Company" items={OUR_COMPANY} />
          <Button size="sm" className="rounded-full whitespace-nowrap" asChild>
            <a href="#contact">Book Consultation</a>
          </Button>
        </div>

        {/* Mobile: search icon + hamburger */}
        <div className="md:hidden flex items-center gap-2 ml-auto">
          <button
            className="text-foreground"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 pb-4 space-y-2">
          {/* Mobile search bar */}
          <div className="py-2">
            <SearchBar />
          </div>

          <MobileGroup label="For Patients" items={FOR_PATIENTS} onClose={() => setMobileOpen(false)} />
          <MobileGroup label="Our Company" items={OUR_COMPANY} onClose={() => setMobileOpen(false)} />

          <div className="pt-2">
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
