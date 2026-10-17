import { describe, it, expect } from "vitest";
import { normalizeMapEmbed, normalizeMapsLink, directionsUrl, safeWebsite } from "../map-location";

describe("Google Maps URLs", () => {
  it("extracts only a validated iframe source", () => {
    expect(normalizeMapEmbed('<iframe src="https://www.google.com/maps/embed?pb=!1m18" onload="alert(1)"></iframe>'))
      .toBe("https://www.google.com/maps/embed?pb=!1m18");
  });
  it.each(["javascript:alert(1)", "https://www.google.com.evil.test/maps/embed?pb=x", "https://www.google.com@evil.test/maps/embed?pb=x",
    "https://www.google.com:8080/maps/embed?pb=x", "https://maps.app.goo.gl/test", "https://www.google.com/maps/place/test"])("rejects unsupported embed: %s", value => {
    expect(normalizeMapEmbed(value)).toBeNull();
  });
  it("keeps share links distinct and provides directions without an embed", () => {
    expect(normalizeMapsLink("https://maps.app.goo.gl/test")).toBe("https://maps.app.goo.gl/test");
    expect(directionsUrl("Cần Thơ")).toContain(encodeURIComponent("Cần Thơ"));
    expect(normalizeMapEmbed("")).toBe("");
    expect(safeWebsite("javascript:alert(1)")).toBeUndefined();
    expect(safeWebsite("example.com")).toBe("https://example.com/");
  });
});
