import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

const HOTLINE_COLLECTION = "emergency_hotlines";
const PRIMARY_HOTLINE_DOC = "rescue_team_primary";

const DEFAULT_HOTLINE = {
  name: "PLP Response Team",
  phoneNumber: "09162598683",
  service: "Emergency Response",
  isActive: true,
};

function isPermissionDeniedError(error) {
  if (!error) {
    return false;
  }

  return (
    error.code === "permission-denied" ||
    String(error.message || "")
      .toLowerCase()
      .includes("permission-denied") ||
    String(error.message || "")
      .toLowerCase()
      .includes("missing or insufficient permissions")
  );
}

function fallbackHotlineResult(reason) {
  return {
    success: true,
    created: false,
    fromFallback: true,
    reason,
    hotline: DEFAULT_HOTLINE,
  };
}

export async function ensureEmergencyHotlineDatastore(db) {
  if (!db) {
    return fallbackHotlineResult("Database is not configured.");
  }

  try {
    const hotlineRef = doc(db, HOTLINE_COLLECTION, PRIMARY_HOTLINE_DOC);
    const hotlineSnap = await getDoc(hotlineRef);

    if (!hotlineSnap.exists()) {
      await setDoc(hotlineRef, {
        ...DEFAULT_HOTLINE,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return {
        success: true,
        created: true,
        hotline: DEFAULT_HOTLINE,
      };
    }

    return {
      success: true,
      created: false,
      hotline: hotlineSnap.data(),
    };
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      console.warn(
        "Hotline datastore access denied by Firestore rules. Using fallback hotline.",
      );
      return fallbackHotlineResult("Firestore permission denied");
    }

    console.error("Error ensuring emergency hotline datastore:", error);
    return { success: false, error: error.message };
  }
}

export async function getPrimaryEmergencyHotline(db) {
  if (!db) {
    return fallbackHotlineResult("Database is not configured.");
  }

  try {
    const hotlineRef = doc(db, HOTLINE_COLLECTION, PRIMARY_HOTLINE_DOC);
    const hotlineSnap = await getDoc(hotlineRef);

    if (!hotlineSnap.exists()) {
      const seedResult = await ensureEmergencyHotlineDatastore(db);
      if (!seedResult.success) {
        return seedResult;
      }

      return {
        success: true,
        hotline: seedResult.hotline,
      };
    }

    return {
      success: true,
      hotline: hotlineSnap.data(),
    };
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      console.warn(
        "Emergency hotline read denied by Firestore rules. Using fallback hotline.",
      );
      return fallbackHotlineResult("Firestore permission denied");
    }

    console.error("Error fetching primary emergency hotline:", error);
    return { success: false, error: error.message };
  }
}
