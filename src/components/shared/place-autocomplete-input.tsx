"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadGoogleMaps, isGoogleMapsConfigured } from "@/lib/google-maps";

export interface PlaceResult {
  formattedAddress: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

// Vadodara city centre — biases (doesn't restrict) autocomplete results
// toward the store's own city without excluding the rest of India.
const VADODARA_BOUNDS = { lat: 22.3072, lng: 73.1812 };

function addressComponent(
  components: google.maps.GeocoderAddressComponent[],
  type: string,
): string {
  return components.find((c) => c.types.includes(type))?.long_name ?? "";
}

/**
 * A search box backed by Google Places Autocomplete — renders nothing
 * (returns null) if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY isn't configured, so
 * every call site's plain manual-entry fields underneath keep working as
 * the fallback regardless of whether Maps is set up.
 */
export function PlaceAutocompleteInput({
  label = "Search your address",
  placeholder = "Start typing your address or apartment name…",
  onSelect,
  disabled,
}: {
  label?: string;
  placeholder?: string;
  onSelect: (result: PlaceResult) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const promise = loadGoogleMaps();
    if (!promise || !inputRef.current) return;

    let listener: google.maps.MapsEventListener | undefined;

    promise
      .then((maps) => {
        if (!inputRef.current) return;
        const autocomplete = new maps.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "in" },
          fields: ["address_components", "formatted_address", "geometry"],
          types: ["geocode", "establishment"],
        });
        autocomplete.setBounds(
          new maps.maps.LatLngBounds(
            { lat: VADODARA_BOUNDS.lat - 0.3, lng: VADODARA_BOUNDS.lng - 0.3 },
            { lat: VADODARA_BOUNDS.lat + 0.3, lng: VADODARA_BOUNDS.lng + 0.3 },
          ),
        );
        setReady(true);

        listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();
          if (lat == null || lng == null) return;

          const components = place.address_components ?? [];
          const streetNumber = addressComponent(components, "street_number");
          const route = addressComponent(components, "route");
          const sublocality =
            addressComponent(components, "sublocality_level_1") ||
            addressComponent(components, "sublocality");
          const line1 =
            [streetNumber, route].filter(Boolean).join(" ") ||
            sublocality ||
            place.formatted_address ||
            "";
          const city =
            addressComponent(components, "locality") ||
            addressComponent(components, "administrative_area_level_2");
          const state = addressComponent(components, "administrative_area_level_1");
          const pincode = addressComponent(components, "postal_code");

          onSelectRef.current({
            formattedAddress: place.formatted_address ?? "",
            line1,
            city,
            state,
            pincode,
            latitude: lat,
            longitude: lng,
          });
        });
      })
      .catch(() => setFailed(true));

    return () => {
      listener?.remove();
    };
  }, []);

  if (!isGoogleMapsConfigured() || failed) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? <Label htmlFor="place-autocomplete">{label}</Label> : null}
      <div className="relative">
        <MapPin
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          id="place-autocomplete"
          ref={inputRef}
          placeholder={ready ? placeholder : "Loading map search…"}
          disabled={disabled || !ready}
          autoComplete="off"
          className="pl-8"
        />
      </div>
    </div>
  );
}
