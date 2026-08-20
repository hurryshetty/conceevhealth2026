import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import FertilityPackages from "./FertilityPackages";
import FertilityPackageDetail from "./FertilityPackageDetail";

/**
 * Render smoke tests for the two fertility routes.
 *
 * Supabase is stubbed to fail the way an unmigrated project does, which is also
 * how the hooks' fallback path is exercised: the pages must render the bundled
 * catalogue rather than an empty state.
 */

vi.mock("@/integrations/supabase/client", () => {
  const rejection = { data: null, error: { message: "relation does not exist" } };
  const builder: Record<string, unknown> = {};
  ["select", "eq", "order", "insert"].forEach((method) => {
    builder[method] = vi.fn(() => builder);
  });
  builder.maybeSingle = vi.fn(async () => rejection);
  // `await`ing the builder resolves like a PostgREST response.
  builder.then = (resolve: (v: unknown) => unknown) => Promise.resolve(rejection).then(resolve);
  return { supabase: { from: vi.fn(() => builder) } };
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
});

const renderAt = (path: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {/* Mirrors the providers App.tsx wraps every route in. */}
      <TooltipProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/fertility-packages" element={<FertilityPackages />} />
            <Route path="/fertility-packages/:slug" element={<FertilityPackageDetail />} />
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

describe("/fertility-packages", () => {
  it("renders one h1 and the package catalogue", async () => {
    renderAt("/fertility-packages");

    const headings = await screen.findAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(/your fertility journey starts with clarity/i);

    expect(
      await screen.findByRole("heading", { name: "Complete Fertility Assessment" })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Couples Fertility Assessment" })
    ).toBeInTheDocument();
  });

  it("writes canonical, description and breadcrumb structured data", async () => {
    renderAt("/fertility-packages");

    await waitFor(() => {
      expect(document.title).toMatch(/Fertility Packages/i);
    });

    expect(
      document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")
    ).toMatch(/\/fertility-packages$/);
    expect(
      document.head.querySelector('meta[name="description"]')?.getAttribute("content")
    ).toBeTruthy();

    const graphs = [...document.head.querySelectorAll('script[type="application/ld+json"]')].map(
      (node) => JSON.parse(node.textContent!)
    );
    expect(graphs.some((g) => g["@type"] === "BreadcrumbList")).toBe(true);
  });

  it("shows pricing-on-request rather than an invented price", async () => {
    renderAt("/fertility-packages");
    const prices = await screen.findAllByText(/pricing on request/i);
    expect(prices.length).toBeGreaterThan(0);
    // No rupee amounts should appear while pricing is unconfirmed.
    expect(screen.queryByText(/₹\s?\d/)).toBeNull();
  });

  it("reorders and highlights packages when an intent is chosen", async () => {
    renderAt("/fertility-packages");

    await screen.findByRole("radiogroup", { name: /i want to/i });
    fireEvent.click(screen.getByRole("radio", { name: /explore egg freezing/i }));

    expect(
      await screen.findByRole("heading", { name: /recommended for you/i, level: 2 })
    ).toBeInTheDocument();

    const cards = screen.getAllByRole("article");
    expect(
      within(cards[0]).getByRole("heading", { name: "Egg Freezing Readiness Check" })
    ).toBeInTheDocument();
    expect(within(cards[0]).getByText(/recommended for you/i)).toBeInTheDocument();
  });
});

describe("/fertility-packages/:slug", () => {
  it("renders the package detail page with its own SEO metadata", async () => {
    renderAt("/fertility-packages/couples-fertility-assessment");

    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/fertility takes two/i);

    await waitFor(() => {
      expect(document.title).toMatch(/Couples Fertility Assessment/i);
    });
    expect(
      document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")
    ).toMatch(/\/fertility-packages\/couples-fertility-assessment$/);

    const graphs = [...document.head.querySelectorAll('script[type="application/ld+json"]')].map(
      (node) => JSON.parse(node.textContent!)
    );
    expect(graphs.some((g) => g["@type"] === "FAQPage")).toBe(true);
    expect(graphs.some((g) => g["@type"] === "Service")).toBe(true);
    // Without confirmed pricing there must be no Offer markup.
    expect(graphs.some((g) => "offers" in g)).toBe(false);
  });

  it("shows the her / him / together split for a couples package", async () => {
    renderAt("/fertility-packages/couples-fertility-assessment");

    expect(await screen.findByText("For her")).toBeInTheDocument();
    expect(screen.getByText("For him")).toBeInTheDocument();
    expect(screen.getByText("Together")).toBeInTheDocument();
    expect(screen.getByText("Semen analysis")).toBeInTheDocument();
  });

  it("builds a WhatsApp link carrying the package name", async () => {
    renderAt("/fertility-packages/egg-freezing-readiness-check");

    // The shared footer renders a static WhatsApp link immediately, so wait for
    // the package itself to load before collecting links — otherwise
    // findAllByRole resolves on the footer alone.
    // The h1 is the package's hero_title, and only renders once it has loaded.
    await screen.findByRole("heading", { level: 1 });

    const links = screen.getAllByRole("link", { name: /whatsapp/i });
    const hrefs = links.map((l) => decodeURIComponent(l.getAttribute("href") ?? ""));
    expect(hrefs.every((h) => h.includes("wa.me/"))).toBe(true);
    // The footer link is generic, so assert a package-specific one exists
    // rather than relying on DOM order.
    expect(hrefs.some((h) => h.includes("Egg Freezing Readiness Check"))).toBe(true);
  });

  it("offers in-page navigation across the long detail page", async () => {
    renderAt("/fertility-packages/complete-fertility-assessment");
    await screen.findByRole("heading", { level: 1 });

    const nav = screen.getByRole("navigation", { name: /on this page/i });
    // Every link must point at a section that actually exists on the page.
    const links = within(nav).getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(8);
    links.forEach((link) => {
      const id = link.getAttribute("href")!.replace("#", "");
      expect(document.getElementById(id), `missing section #${id}`).not.toBeNull();
    });
  });

  it("renders a not-found state for an unknown slug", async () => {
    renderAt("/fertility-packages/does-not-exist");

    expect(
      await screen.findByRole("heading", { name: /couldn't find that package/i })
    ).toBeInTheDocument();
    expect(
      document.head.querySelector('meta[name="robots"]')?.getAttribute("content")
    ).toBe("noindex, nofollow");
  });

  it("omits the testimonials section when nothing is approved", async () => {
    renderAt("/fertility-packages/fertility-health-check");
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("heading", { name: /what patients say/i })).toBeNull();
  });
});
