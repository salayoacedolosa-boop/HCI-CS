import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

function isGranted(permission) {
  return (
    permission?.location === "granted" ||
    permission?.coarseLocation === "granted"
  );
}

function normalizeLocation(position) {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    altitude: position.coords.altitude,
    altitudeAccuracy: position.coords.altitudeAccuracy,
    heading: position.coords.heading,
    speed: position.coords.speed,
    timestamp: position.timestamp,
  };
}

function getBrowserLocation(options) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(normalizeLocation(position)),
      (error) => reject(error),
      options,
    );
  });
}

/**
 * Request location permission explicitly.
 * Useful for prompting on app start before first location fetch.
 */
export async function requestLocationPermission() {
  if (Capacitor.isNativePlatform()) {
    try {
      const permission = await Geolocation.checkPermissions();
      if (isGranted(permission)) {
        return { granted: true, source: "native" };
      }

      // Always attempt request when not granted.
      // Android may still show a prompt unless the user chose "Don't ask again".
      const requested = await Geolocation.requestPermissions();
      const granted = isGranted(requested);

      if (granted) {
        return { granted: true, source: "native" };
      }

      return {
        granted: false,
        source: "native",
        message:
          "Location permission is denied. Enable it in Android app settings for this emulator app.",
      };
    } catch (error) {
      return {
        granted: false,
        source: "native",
        message:
          error?.message ||
          "Unable to request location permission. Check emulator location settings.",
      };
    }
  }

  if (!navigator.geolocation) {
    return {
      granted: false,
      source: "web",
      message: "Geolocation is not supported by this browser.",
    };
  }

  // Browser permission prompt fallback by making a lightweight location request.
  try {
    await getBrowserLocation({
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 60000,
    });
    return { granted: true, source: "web" };
  } catch {
    return {
      granted: false,
      source: "web",
      message: "Location permission was not granted.",
    };
  }
}

/**
 * Get device location using Geolocation API
 * Works on mobile browsers and Capacitor-wrapped apps
 */
export async function getDeviceLocation() {
  const highAccuracyOptions = {
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 0,
  };

  const balancedOptions = {
    enableHighAccuracy: false,
    timeout: 15000,
    maximumAge: 60000,
  };

  if (Capacitor.isNativePlatform()) {
    try {
      const permissionResult = await requestLocationPermission();
      if (!permissionResult.granted) {
        throw new Error(
          permissionResult.message ||
            "Location permission is required to get your current location.",
        );
      }

      try {
        const position =
          await Geolocation.getCurrentPosition(highAccuracyOptions);
        return normalizeLocation(position);
      } catch (error) {
        console.warn("High-accuracy location failed, retrying:", error);
        const position = await Geolocation.getCurrentPosition(balancedOptions);
        return normalizeLocation(position);
      }
    } catch (error) {
      console.error("Capacitor geolocation error:", error);
      throw new Error(
        error?.message ||
          "Unable to get location from emulator. Ensure app permission is allowed and mock location is set.",
      );
    }
  }

  try {
    return await getBrowserLocation(highAccuracyOptions);
  } catch {
    try {
      return await getBrowserLocation(balancedOptions);
    } catch (error) {
      console.error("Geolocation error:", error);
      throw new Error(
        "Unable to get location. In Android emulator, set a mock location in Extended Controls > Location and ensure app location permission is allowed.",
      );
    }
  }
}

/**
 * Watch device location for continuous updates
 * Useful for live tracking during active incidents
 */
export function watchDeviceLocation(callback, errorCallback) {
  if (!navigator.geolocation) {
    errorCallback(new Error("Geolocation is not supported by this browser"));
    return;
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };
      callback(location);
    },
    (error) => {
      console.error("Geolocation watch error:", error);
      errorCallback(error);
    },
    options,
  );

  return watchId;
}

/**
 * Stop watching device location
 */
export function stopWatchingLocation(watchId) {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(latitude, longitude) {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

/**
 * Calculate distance between two points (in km)
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
