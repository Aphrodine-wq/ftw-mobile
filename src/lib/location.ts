import * as Location from "expo-location";

/**
 * Requests location permissions and returns the current device coordinates.
 * Returns { latitude, longitude } or null if permission denied or location unavailable.
 */
export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Location permission denied");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error("Failed to get current location:", error);
    return null;
  }
}

/**
 * Geocodes an address string to coordinates using Expo's geocoding.
 * Returns { latitude, longitude } or null if geocoding failed.
 */
export async function geocodeAddress(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const results = await Location.geocodeAsync(address);

    if (results.length === 0) {
      console.log("No geocoding results for:", address);
      return null;
    }

    return {
      latitude: results[0].latitude,
      longitude: results[0].longitude,
    };
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
}

/**
 * Reverse geocodes coordinates to an address string.
 * Returns a formatted address or null.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (results.length === 0) return null;

    const place = results[0];
    const parts = [place.city, place.region].filter(Boolean);
    return parts.join(", ") || null;
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return null;
  }
}
