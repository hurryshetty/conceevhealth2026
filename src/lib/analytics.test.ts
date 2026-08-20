import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Attribution behaviour.
 *
 * The module memoises the current visit on first call, so each test re-imports
 * it with `vi.resetModules()` to simulate a fresh page load.
 */

const loadAnalytics = async () => {
  vi.resetModules();
  return import("./analytics");
};

const visit = (url: string) => {
  window.history.replaceState({}, "", url);
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  window.dataLayer = [];
  visit("/");
  Object.defineProperty(document, "referrer", { value: "", configurable: true });
});

describe("captureAttribution", () => {
  it("reads UTM parameters off the landing URL", async () => {
    visit("/fertility-packages?utm_source=google&utm_medium=cpc&utm_campaign=fertility_q3");
    const { captureAttribution, getAttributionPayload } = await loadAnalytics();

    captureAttribution();
    const payload = getAttributionPayload();

    expect(payload.utm_source).toBe("google");
    expect(payload.utm_medium).toBe("cpc");
    expect(payload.utm_campaign).toBe("fertility_q3");
    expect(payload.landing_page).toBe(
      "/fertility-packages?utm_source=google&utm_medium=cpc&utm_campaign=fertility_q3"
    );
  });

  it("captures click identifiers such as gclid", async () => {
    visit("/fertility-packages?gclid=abc123");
    const { captureAttribution, getAttributionPayload } = await loadAnalytics();

    captureAttribution();
    expect(getAttributionPayload().click_id).toBe("gclid:abc123");
  });

  it("keeps the original first touch across later visits", async () => {
    visit("/?utm_source=newsletter&utm_medium=email");
    const first = await loadAnalytics();
    first.captureAttribution();

    // A later visit from a different campaign.
    visit("/fertility-packages?utm_source=instagram&utm_medium=social");
    const second = await loadAnalytics();
    second.captureAttribution();
    const payload = second.getAttributionPayload();

    expect(payload.first_touch_source).toBe("newsletter");
    expect(payload.first_touch_medium).toBe("email");
    expect(payload.last_touch_source).toBe("instagram");
    expect(payload.last_touch_medium).toBe("social");
    expect(payload.utm_source).toBe("instagram");
  });

  it("does not let a direct return visit overwrite last touch", async () => {
    visit("/?utm_source=google&utm_medium=cpc");
    const first = await loadAnalytics();
    first.captureAttribution();

    visit("/fertility-packages");
    const second = await loadAnalytics();
    second.captureAttribution();

    expect(second.getAttributionPayload().last_touch_source).toBe("google");
  });

  it("ignores same-origin referrers", async () => {
    Object.defineProperty(document, "referrer", {
      value: `${window.location.origin}/some-page`,
      configurable: true,
    });
    const { captureAttribution, getAttributionPayload } = await loadAnalytics();

    captureAttribution();
    expect(getAttributionPayload().referrer).toBeNull();
  });

  it("records an external referrer", async () => {
    Object.defineProperty(document, "referrer", {
      value: "https://www.google.com/search?q=fertility+test",
      configurable: true,
    });
    const { captureAttribution, getAttributionPayload } = await loadAnalytics();

    captureAttribution();
    expect(getAttributionPayload().referrer).toContain("google.com");
  });

  it("reuses one session id for the whole session", async () => {
    const { captureAttribution, getAttributionPayload } = await loadAnalytics();
    captureAttribution();

    const first = getAttributionPayload().session_id;
    expect(first).toBeTruthy();
    expect(getAttributionPayload().session_id).toBe(first);
  });
});

describe("trackEvent", () => {
  it("pushes the event and its attribution onto the data layer", async () => {
    visit("/fertility-packages/egg-freezing-readiness-check?utm_source=meta");
    const { ANALYTICS_EVENTS, captureAttribution, trackEvent } = await loadAnalytics();
    captureAttribution();

    trackEvent(ANALYTICS_EVENTS.PACKAGE_VIEW, {
      package_slug: "egg-freezing-readiness-check",
    });

    const pushed = window.dataLayer!.at(-1)!;
    expect(pushed.event).toBe("package_view");
    expect(pushed.package_slug).toBe("egg-freezing-readiness-check");
    expect(pushed.utm_source).toBe("meta");
    expect(pushed.device_type).toBeTruthy();
  });

  it("exposes every event name the brief requires", async () => {
    const { ANALYTICS_EVENTS } = await loadAnalytics();
    expect(Object.values(ANALYTICS_EVENTS).sort()).toEqual(
      [
        "comparison_interaction",
        "consultation_click",
        "package_booking_start",
        "package_booking_submit",
        "package_cta_click",
        "package_filter",
        "package_intent_selection",
        "package_view",
        "whatsapp_click",
      ].sort()
    );
  });
});
