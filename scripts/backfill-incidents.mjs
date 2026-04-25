import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const DEFAULT_ADMIN_EMAIL = "aaronmarkvaliente@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";

const LEGACY_USER = {
  uid: "3w7fayKuCOYrX10xHRhqV4wNL9s1",
  fullName: "AARON MARK VALIENTE",
  email: "valiente_aaronmark@plpasig.edu.ph",
  address: "522, San Jose Street, St. Paul Compound, Palatiw, Pasig City",
  phone: "09162598683",
  phoneNumber: "09162598683",
  emergencyPhone: "0912345678",
  emergencyContactNumber: "0912345678",
  studentId: "23-00156",
  schoolId: "23-00156",
};

function parseDotEnv(dotEnvRaw) {
  const output = {};
  dotEnvRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .forEach((line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex < 0) {
        return;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^"|"$/g, "");
      output[key] = value;
    });

  return output;
}

function readEnvironment() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    throw new Error(
      "Missing .env file. Create it with your Firebase VITE_* values first.",
    );
  }

  const env = parseDotEnv(readFileSync(envPath, "utf8"));
  const required = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ];

  const missing = required.filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(`Missing .env keys: ${missing.join(", ")}`);
  }

  return env;
}

function pickFirstNonEmpty(...values) {
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

function typeLabel(type) {
  const normalized = String(type || "")
    .trim()
    .toLowerCase();
  if (!normalized) {
    return "Emergency";
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

function buildDescription(incident) {
  const existing = pickFirstNonEmpty(
    incident.description,
    incident.details,
    incident.problemText,
    incident.incidentDescription,
  );
  if (existing) {
    return existing;
  }

  return `${typeLabel(incident.type)} incident reported by ${LEGACY_USER.fullName}.`;
}

async function run() {
  const shouldApply = process.argv.includes("--apply");
  const env = readEnvironment();

  const app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  });

  const db = getFirestore(app);
  const auth = getAuth(app);
  const adminEmail =
    process.env.BACKFILL_ADMIN_EMAIL ||
    env.BACKFILL_ADMIN_EMAIL ||
    DEFAULT_ADMIN_EMAIL;
  const adminPassword =
    process.env.BACKFILL_ADMIN_PASSWORD ||
    env.BACKFILL_ADMIN_PASSWORD ||
    DEFAULT_ADMIN_PASSWORD;

  await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

  const incidentsRef = collection(db, "incidents");
  const incidentsQuery = query(
    incidentsRef,
    where("userId", "==", LEGACY_USER.uid),
  );
  const snapshot = await getDocs(incidentsQuery);

  if (snapshot.empty) {
    console.log("No incidents found for target user UID.");
    return;
  }

  let touched = 0;
  for (const entry of snapshot.docs) {
    const incident = entry.data();
    const callerName = pickFirstNonEmpty(
      incident.callerName,
      incident.caller,
      incident.name,
      incident.reporterName,
      LEGACY_USER.fullName,
    );
    const contact = pickFirstNonEmpty(
      incident.contact,
      incident.phone,
      incident.phoneNumber,
      incident.mobile,
      LEGACY_USER.phone,
      LEGACY_USER.phoneNumber,
      LEGACY_USER.emergencyPhone,
      LEGACY_USER.emergencyContactNumber,
    );
    const description = buildDescription(incident);

    const metadataPatch = {
      ...(incident.metadata || {}),
      reporterUid: LEGACY_USER.uid,
      reporterStudentId: LEGACY_USER.studentId,
      reporterSchoolId: LEGACY_USER.schoolId,
      reporterEmail: LEGACY_USER.email,
      reporterAddress: LEGACY_USER.address,
    };

    const payload = {
      callerName,
      contact,
      description,
      metadata: metadataPatch,
      updatedAt: serverTimestamp(),
    };

    touched += 1;
    if (shouldApply) {
      await updateDoc(doc(db, "incidents", entry.id), payload);
      console.log(`Updated incident: ${entry.id}`);
    } else {
      console.log(`Would update incident: ${entry.id}`);
    }
  }

  if (shouldApply) {
    console.log(`Backfill completed. Updated ${touched} incident(s).`);
  } else {
    console.log(`Dry run completed. ${touched} incident(s) would be updated.`);
    console.log("Run with --apply to persist changes.");
  }
}

run().catch((error) => {
  console.error("Incident backfill failed:", error.message || error);
  process.exitCode = 1;
});
