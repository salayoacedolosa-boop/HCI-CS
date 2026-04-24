import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

/**
 * Create a new SOS incident in Firestore
 */
export async function createSOSIncident(db, userId, location) {
  try {
    const incidentsRef = collection(db, "incidents");
    const docRef = await addDoc(incidentsRef, {
      userId: userId,
      type: "sos",
      status: "active",
      location: {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy || null,
        timestamp: serverTimestamp(),
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("SOS incident created:", docRef.id);
    return { success: true, incidentId: docRef.id };
  } catch (error) {
    console.error("Error creating SOS incident:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create an emergency incident by type (injury, fire, crime, accident)
 */
export async function createEmergencyIncident(
  db,
  userId,
  type,
  location,
  description = "",
) {
  try {
    const incidentsRef = collection(db, "incidents");
    const docRef = await addDoc(incidentsRef, {
      userId: userId,
      type: type,
      status: "active",
      description: description,
      location: {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy || null,
        timestamp: serverTimestamp(),
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("Emergency incident created:", docRef.id);
    return { success: true, incidentId: docRef.id };
  } catch (error) {
    console.error("Error creating emergency incident:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update incident status
 */
export async function updateIncidentStatus(db, incidentId, newStatus) {
  try {
    const incidentRef = doc(db, "incidents", incidentId);
    await updateDoc(incidentRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    console.log("Incident status updated:", newStatus);
    return { success: true };
  } catch (error) {
    console.error("Error updating incident status:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update incident location (for live tracking)
 */
export async function updateIncidentLocation(db, incidentId, location) {
  try {
    const incidentRef = doc(db, "incidents", incidentId);
    await updateDoc(incidentRef, {
      location: {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy || null,
        timestamp: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });

    console.log("Incident location updated");
    return { success: true };
  } catch (error) {
    console.error("Error updating incident location:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's recent incidents
 */
export async function getUserIncidents(db, userId) {
  try {
    const q = query(collection(db, "incidents"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const incidents = [];
    querySnapshot.forEach((doc) => {
      incidents.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, incidents };
  } catch (error) {
    console.error("Error fetching user incidents:", error);
    return { success: false, error: error.message };
  }
}
