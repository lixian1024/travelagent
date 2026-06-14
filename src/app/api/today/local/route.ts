export const runtime = "nodejs";

type OpenMeteoWeather = {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
  };
  timezone?: string;
};

type GeocodingResult = {
  results?: Array<{
    name?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  }>;
};

type ReverseResult = {
  address?: {
    city?: string;
    town?: string;
    municipality?: string;
    county?: string;
    state?: string;
  };
};

function weatherLabel(code = -1) {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Weather unavailable";
}

async function geocodeCity(city: string) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", city);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) return null;
  const data = (await response.json()) as GeocodingResult;
  return data.results?.[0] ?? null;
}

async function reverseCity(latitude: number, longitude: number) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("zoom", "10");
  url.searchParams.set("addressdetails", "1");
  const response = await fetch(url, {
    headers: {
      "Accept-Language": "en",
      "User-Agent": "ChinaTravelAgent/1.0 (local travel assistant)",
    },
    cache: "no-store",
  });
  if (!response.ok) return "";
  const data = (await response.json()) as ReverseResult;
  return (
    data.address?.city ||
    data.address?.town ||
    data.address?.municipality ||
    data.address?.county ||
    data.address?.state ||
    ""
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fallbackCity = url.searchParams.get("city")?.trim() || "Beijing";
  const latitudeParam = url.searchParams.get("lat");
  const longitudeParam = url.searchParams.get("lon");
  let latitude = Number(latitudeParam);
  let longitude = Number(longitudeParam);
  let city = fallbackCity;
  let timezone = "Asia/Shanghai";
  const hasCoordinates =
    latitudeParam !== null &&
    longitudeParam !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180;

  try {
    if (hasCoordinates) {
      city = (await reverseCity(latitude, longitude)) || fallbackCity;
    } else {
      const place = await geocodeCity(fallbackCity);
      if (!place?.latitude || !place.longitude) {
        return Response.json({ city: fallbackCity, weather: null });
      }
      latitude = place.latitude;
      longitude = place.longitude;
      city = place.name || fallbackCity;
      timezone = place.timezone || timezone;
    }

    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.searchParams.set("latitude", String(latitude));
    weatherUrl.searchParams.set("longitude", String(longitude));
    weatherUrl.searchParams.set(
      "current",
      "temperature_2m,apparent_temperature,weather_code",
    );
    weatherUrl.searchParams.set("timezone", "auto");
    const weatherResponse = await fetch(weatherUrl, { cache: "no-store" });
    const weather = weatherResponse.ok
      ? ((await weatherResponse.json()) as OpenMeteoWeather)
      : null;
    const code = weather?.current?.weather_code;

    return Response.json({
      city,
      timezone: weather?.timezone || timezone,
      coordinates: { latitude, longitude },
      weather: weather?.current
        ? {
            temperature: Math.round(weather.current.temperature_2m ?? 0),
            apparentTemperature: Math.round(
              weather.current.apparent_temperature ?? weather.current.temperature_2m ?? 0,
            ),
            condition: weatherLabel(code),
            code,
          }
        : null,
    });
  } catch {
    return Response.json({ city: fallbackCity, timezone, weather: null });
  }
}
