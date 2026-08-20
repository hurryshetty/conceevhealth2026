import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomepageRedesign from "./HomepageRedesign";
import { BRAND_TAGLINE } from "@/data/homepageContent";

/**
 * Render smoke tests for the 2026 homepage.
 *
 * Supabase is stubbed per table so the page renders against known data without
 * touching the network.
 */

const DOCTORS = [
  {
    id: "d1",
    slug: "dr-sneha-shetty",
    name: "Dr. Sneha Shetty",
    designation: "Fertility Specialist",
    experience: "18 Years",
    image_url: "https://example.test/sneha.jpg",
    bio: "Fertility specialist.",
    qualifications: ["MBBS", "MS OBG"],
    specializations: ["IVF (In Vitro Fertilization)"],
    surgeries: [],
    hospitals: [],
    cities: ["Bangalore"],
    languages: ["English"],
    consultation_fee: "",
  },
];

const SPECIALTIES = [
  { id: "s1", name: "Female Fertility", slug: "female-fertility", sort_order: 1 },
  { id: "s2", name: "IVF & ART", slug: "ivf-art", sort_order: 2 },
  { id: "s3", name: "Male Infertility", slug: "male-infertility", sort_order: 3 },
  { id: "s4", name: "Fertility Preservation", slug: "fertility-preservation", sort_order: 4 },
  { id: "s5", name: "Wellness", slug: "wellness", sort_order: 5 },
  { id: "s6", name: "Training Courses", slug: "training-courses", sort_order: 6 },
];

// useLocations selects `*, cities(name)` and derives city_name from the join,
// so the fixture has to carry the nested relation, not a flat city_name.
const LOCATIONS = [
  {
    id: "l1",
    city_id: "c1",
    name: "Vriksh Fertility",
    areas: ["Indiranagar"],
    surgeries: ["IVF", "IUI", "ICSI", "Egg Freezing"],
    cities: { name: "Bangalore" },
  },
  {
    id: "l2",
    city_id: "c2",
    name: "Apollo Hospital",
    areas: ["Jubilee Hills"],
    surgeries: ["IVF"],
    cities: { name: "Hyderabad" },
  },
];

vi.mock("@/integrations/supabase/client", () => {
  const dataFor = (table: string) => {
    if (table === "doctors") return DOCTORS;
    if (table === "specialties") return SPECIALTIES;
    if (table === "locations") return LOCATIONS;
    return [];
  };

  const from = vi.fn((table: string) => {
    const result = { data: dataFor(table), error: null };
    const builder: Record<string, unknown> = {};
    ["select", "eq", "order", "ilike", "or", "limit", "insert"].forEach((m) => {
      builder[m] = vi.fn(() => builder);
    });
    builder.maybeSingle = vi.fn(async () => ({ data: null, error: null }));
    builder.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve);
    return builder;
  });

  return { supabase: { from } };
});

beforeAll(() => {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  window.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

const renderAt = (path = "/homepage-preview") => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/" element={<HomepageRedesign />} />
            <Route path="/homepage-preview" element={<HomepageRedesign />} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe("2026 homepage", () => {
  it("renders exactly one h1 carrying the brand headline", async () => {
    renderAt();
    const headings = await screen.findAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(/better healthcare starts with better choices/i);
  });

  it("renders every major section heading in order", async () => {
    renderAt();
    await screen.findByRole("heading", { level: 1 });

    const expected = [
      /what healthcare are you looking for/i,
      /healthcare, made easier/i,
      /meet doctors you can trust/i,
      /from first question to continuing care/i,
      /trusted hospitals near you/i,
      /take care of your health/i,
      /healthcare should feel simple/i,
      /real people\. real healthcare journeys/i,
      /understand your health better/i,
      /your health deserves better care/i,
    ];
    for (const pattern of expected) {
      expect(screen.getByRole("heading", { name: pattern, level: 2 })).toBeInTheDocument();
    }
  });

  it("renders doctors from live data with their real credentials", async () => {
    renderAt();
    expect(
      await screen.findByRole("heading", { name: "Dr. Sneha Shetty" })
    ).toBeInTheDocument();
    expect(screen.getByText("Fertility Specialist")).toBeInTheDocument();
    expect(screen.getByText(/18 Years experience/)).toBeInTheDocument();
  });

  it("builds the specialities grid from live data and hides internal categories", async () => {
    renderAt();
    expect(await screen.findByRole("heading", { name: "Female Fertility" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "IVF & ART" })).toBeInTheDocument();
    // "Training Courses" is not patient-facing and must not surface.
    expect(screen.queryByText("Training Courses")).toBeNull();
  });

  it("lists hospitals for the selected city only", async () => {
    renderAt();
    // Wait for the locations query to resolve out of its loading state.
    const hospital = await screen.findByText("Vriksh Fertility");
    const section = hospital.closest("section")!;
    expect(
      within(section).getByRole("heading", { name: /trusted hospitals near you/i })
    ).toBeInTheDocument();
    // Apollo is in Hyderabad; the default city is the first alphabetically.
    expect(within(section).queryByText("Apollo Hospital")).toBeNull();
  });

  it("carries the official tagline verbatim", async () => {
    renderAt();
    await screen.findByRole("heading", { level: 1 });
    expect(screen.getByText(BRAND_TAGLINE)).toBeInTheDocument();
    expect(BRAND_TAGLINE).toBe("GATEWAY TO DIGITAL TRANSFORMATION");
  });

  it("marks the preview path noindex and does not claim / as canonical", async () => {
    renderAt("/homepage-preview");
    await waitFor(() => {
      expect(document.title).toMatch(/Conceev Health/);
    });
    expect(
      document.head.querySelector('meta[name="robots"]')?.getAttribute("content")
    ).toBe("noindex, nofollow");
    expect(
      document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")
    ).toMatch(/\/homepage-preview$/);
  });

  it("indexes normally and claims / once promoted to the root route", async () => {
    renderAt("/");
    await waitFor(() => {
      expect(document.title).toMatch(/Conceev Health/);
    });
    expect(
      document.head.querySelector('meta[name="robots"]')?.getAttribute("content")
    ).toBe("index, follow");
    const canonical = document.head
      .querySelector('link[rel="canonical"]')
      ?.getAttribute("href");
    expect(canonical?.endsWith("/")).toBe(true);
  });

  it("exposes a skip link and a single main landmark", async () => {
    renderAt();
    await screen.findByRole("heading", { level: 1 });
    expect(screen.getByRole("link", { name: /skip to content/i })).toHaveAttribute(
      "href",
      "#main"
    );
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });
});
