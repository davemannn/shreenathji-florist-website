/**
 * Lazy-loads the Google Maps JavaScript API (Places library) client-side,
 * exactly once, no matter how many components ask for it — every address
 * autocomplete input on a page shares the same script tag/load promise.
 *
 * Returns `null` (never throws) when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
 * isn't configured, or when called on the server — callers treat that as
 * "autocomplete unavailable, fall back to a plain text field" rather than
 * a hard error. This mirrors how Cloudinary/Razorpay env vars are handled
 * elsewhere in this codebase: the feature degrades gracefully, it doesn't
 * crash the page, until someone sets the key.
 *
 * Requires "Places API" and "Maps JavaScript API" enabled on the Google
 * Cloud project the key belongs to (see .env.example).
 */
let loadPromise: Promise<typeof google> | null = null;

export function loadGoogleMaps(): Promise<typeof google> | null {
  if (typeof window === "undefined") return null;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  if (window.google?.maps?.places) return Promise.resolve(window.google);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("google-maps-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps")));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async`;
    script.async = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function isGoogleMapsConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}
