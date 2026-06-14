export const runtime = "nodejs";

type NominatimResult = {
  display_name?: string;
  name?: string;
  type?: string;
  category?: string;
  address?: Record<string, string | undefined>;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latitude = Number(url.searchParams.get("lat"));
  const longitude = Number(url.searchParams.get("lon"));

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return Response.json({ error: "Valid coordinates are required." }, { status: 400 });
  }

  try {
    const reverseUrl = new URL("https://nominatim.openstreetmap.org/reverse");
    reverseUrl.searchParams.set("lat", String(latitude));
    reverseUrl.searchParams.set("lon", String(longitude));
    reverseUrl.searchParams.set("format", "jsonv2");
    reverseUrl.searchParams.set("zoom", "18");
    reverseUrl.searchParams.set("addressdetails", "1");
    reverseUrl.searchParams.set("namedetails", "1");
    const response = await fetch(reverseUrl, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "ChinaTravelAgent/1.0 (location-aware audio guide)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json({ error: "Could not identify this place." }, { status: 502 });
    }

    const result = (await response.json()) as NominatimResult;
    const address = result.address ?? {};
    const city =
      address.city ||
      address.town ||
      address.municipality ||
      address.county ||
      address.state ||
      "";
    const place =
      result.name ||
      address.attraction ||
      address.museum ||
      address.tourism ||
      address.historic ||
      address.amenity ||
      address.road ||
      city ||
      "this location";

    return Response.json({
      place,
      city,
      displayName: result.display_name || place,
      category: result.category || "",
      type: result.type || "",
      latitude,
      longitude,
    });
  } catch {
    return Response.json({ error: "Could not identify this place." }, { status: 502 });
  }
}
