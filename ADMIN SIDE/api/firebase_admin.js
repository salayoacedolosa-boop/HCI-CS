import { app } from "../../services/firebase_config.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  limit,
} from "firebase/firestore";

export const auth = getAuth(app);
export const db = getFirestore(app);

const TEST_ADMIN_USERNAME = "admin";
const TEST_ADMIN_EMAIL = "aaronmarkvaliente@gmail.com";

function redirectToLogin() {
  const loginPath = "login.html";
  if (window.top) {
    window.top.location.href = loginPath;
    return;
  }
  window.location.href = loginPath;
}

export function formatTimestamp(value) {
  if (!value) {
    return "-";
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toLocaleString();
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString();
  }

  return "-";
}

export function inferIncidentLocation(incident) {
  if (!incident?.location) {
    return "Unknown";
  }

  if (incident.location.label) {
    return incident.location.label;
  }

  const lat = incident.location.lat;
  const lng = incident.location.lng;
  if (typeof lat === "number" && typeof lng === "number") {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  return "Unknown";
}

export function getIncidentTypeLabel(type) {
  const normalized = String(type || "")
    .trim()
    .toLowerCase();
  if (!normalized) {
    return "Unknown";
  }

  const labels = {
    sos: "SOS",
    fire: "Fire",
    medical: "Medical",
    accident: "Accident",
    injury: "Injury",
    crime: "Crime",
    security: "Security",
  };

  return (
    labels[normalized] ||
    normalized.charAt(0).toUpperCase() + normalized.slice(1)
  );
}

function readFirstString(...values) {
  for (const value of values) {
    if (value === undefined || value === null) {
      continue;
    }

    const normalized = String(value).trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeIncidentRecord(entry) {
  const data = entry.data();
  const metadata = data?.metadata || {};

  return {
    id: entry.id,
    ...data,
    callerName: readFirstString(
      data?.callerName,
      data?.caller,
      data?.name,
      data?.reporterName,
      data?.userName,
      metadata?.callerName,
    ),
    contact: readFirstString(
      data?.contact,
      data?.phone,
      data?.phoneNumber,
      data?.mobile,
      data?.reporterContact,
      metadata?.contact,
      metadata?.phone,
    ),
    description: readFirstString(
      data?.description,
      data?.details,
      data?.report,
      data?.problemText,
      data?.incidentDescription,
      metadata?.description,
    ),
  };
}

export async function resolveAdminEmail(usernameOrEmail) {
  const value = String(usernameOrEmail || "").trim();
  if (!value) {
    throw new Error("Username or email is required.");
  }

  if (value.includes("@")) {
    return value;
  }

  const usernameLower = value.toLowerCase();

  if (usernameLower === TEST_ADMIN_USERNAME) {
    return TEST_ADMIN_EMAIL;
  }

  const usernameRef = doc(db, "admin_usernames", usernameLower);
  const usernameSnap = await getDoc(usernameRef);

  if (!usernameSnap.exists()) {
    throw new Error("Admin account not found.");
  }

  const usernameData = usernameSnap.data();
  if (usernameData.isActive === false) {
    throw new Error("Admin account is inactive.");
  }

  if (!usernameData.email) {
    throw new Error("Admin account email mapping is missing.");
  }

  return usernameData.email;
}

async function ensureAdminProfile(user, loginIdentifier = "") {
  const adminRef = doc(db, "admin_users", user.uid);
  const adminSnap = await getDoc(adminRef);

  const fallbackUsername =
    loginIdentifier && !loginIdentifier.includes("@")
      ? loginIdentifier.toLowerCase()
      : user.email === TEST_ADMIN_EMAIL
        ? TEST_ADMIN_USERNAME
        : user.email?.split("@")[0]?.toLowerCase() || "admin";

  if (!adminSnap.exists()) {
    const adminProfile = {
      uid: user.uid,
      username: fallbackUsername,
      usernameLower: fallbackUsername,
      displayName: user.displayName || "Admin User",
      email: user.email,
      role: "admin",
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(adminRef, adminProfile, { merge: true });

    await setDoc(
      doc(db, "admin_usernames", fallbackUsername),
      {
        uid: user.uid,
        email: user.email,
        role: "admin",
        isActive: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return adminProfile;
  }

  const profile = adminSnap.data();
  if (profile.isActive === false) {
    throw new Error("Admin account is inactive.");
  }

  return profile;
}

export async function signInAdmin(loginIdentifier, password) {
  const email = await resolveAdminEmail(loginIdentifier);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await ensureAdminProfile(credential.user, loginIdentifier);

  return {
    user: credential.user,
    profile,
  };
}

export async function signOutAdmin() {
  await signOut(auth);
}

export function onAdminAuthStateChanged(callback) {
  return onAuthStateChanged(auth, callback);
}

function waitForAuthState() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function requireAdminSession({ autoRedirect = true } = {}) {
  const user = await waitForAuthState();

  if (!user) {
    if (autoRedirect) {
      redirectToLogin();
    }
    throw new Error("Authentication required.");
  }

  const profileSnap = await getDoc(doc(db, "admin_users", user.uid));
  if (!profileSnap.exists() || profileSnap.data().isActive === false) {
    await signOut(auth);
    if (autoRedirect) {
      redirectToLogin();
    }
    throw new Error("Admin access is required.");
  }

  return {
    user,
    profile: profileSnap.data(),
  };
}

export function subscribeIncidents(callback) {
  const incidentsRef = collection(db, "incidents");
  const incidentsQuery = query(
    incidentsRef,
    orderBy("createdAt", "desc"),
    limit(300),
  );

  return onSnapshot(incidentsQuery, (snapshot) => {
    const incidents = snapshot.docs.map((entry) =>
      normalizeIncidentRecord(entry),
    );
    callback(incidents);
  });
}

export function subscribeActiveIncidents(callback) {
  const incidentsRef = collection(db, "incidents");
  const activeQuery = query(
    incidentsRef,
    where("status", "in", ["active", "dispatched"]),
    orderBy("updatedAt", "desc"),
    limit(100),
  );

  return onSnapshot(activeQuery, (snapshot) => {
    const incidents = snapshot.docs.map((entry) =>
      normalizeIncidentRecord(entry),
    );
    callback(incidents);
  });
}

export function subscribeHotlines(callback) {
  const hotlinesRef = collection(db, "emergency_hotlines");
  const hotlinesQuery = query(hotlinesRef, orderBy("name", "asc"));

  return onSnapshot(hotlinesQuery, (snapshot) => {
    const hotlines = snapshot.docs.map((entry) => ({
      id: entry.id,
      ...entry.data(),
    }));
    callback(hotlines);
  });
}

export async function addHotline(hotline) {
  const data = {
    ...hotline,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await addDoc(collection(db, "emergency_hotlines"), data);
}

export async function createManualIncident(incident) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Authentication required.");
  }

  await addDoc(collection(db, "incidents"), {
    userId: user.uid,
    source: "admin",
    status: incident.status || "active",
    type: incident.type || "security",
    description: incident.description || "",
    callerName: incident.callerName || "Unknown",
    contact: incident.contact || "",
    location: incident.location || null,
    metadata: {
      unit: incident.unit || "Police",
      victims: incident.victims || "1-4",
      aggressors: incident.aggressors || "2-4",
      dangerLevel: Number(incident.dangerLevel || 5),
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateIncidentStatus(incidentId, status) {
  await updateDoc(doc(db, "incidents", incidentId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function logDispatch({ incidentId, receiver, status, message }) {
  await addDoc(collection(db, "communication_logs"), {
    incidentId: incidentId || null,
    receiver: receiver || "Response Team",
    status: status || "Delivered",
    message: message || "Dispatch sent",
    createdAt: serverTimestamp(),
  });
}

export function subscribeCommunicationLogs(callback) {
  const logsRef = collection(db, "communication_logs");
  const logsQuery = query(logsRef, orderBy("createdAt", "desc"), limit(100));

  return onSnapshot(logsQuery, (snapshot) => {
    const logs = snapshot.docs.map((entry) => ({
      id: entry.id,
      ...entry.data(),
    }));
    callback(logs);
  });
}

export async function getIncidentSnapshot() {
  const snap = await getDocs(
    query(
      collection(db, "incidents"),
      orderBy("createdAt", "desc"),
      limit(500),
    ),
  );
  return snap.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
}

export async function updateAdminProfile(updates) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Authentication required.");
  }

  const payload = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, "admin_users", user.uid), payload, { merge: true });
}

export async function updateAdminPassword(newPassword) {
  if (!auth.currentUser) {
    throw new Error("Authentication required.");
  }

  await updatePassword(auth.currentUser, newPassword);
}

export async function getSystemStatus() {
  const ref = doc(db, "admin_settings", "system_status");
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      database: "online",
      mapService: "offline",
      emergencyApi: "online",
    };
  }

  return snap.data();
}
