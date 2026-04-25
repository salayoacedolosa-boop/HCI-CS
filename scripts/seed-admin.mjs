import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";

const ADMIN_ACCOUNT = {
  username: "admin",
  email: "aaronmarkvaliente@gmail.com",
  password: "admin123",
  role: "admin",
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

async function createOrSignInAdmin(auth, email, password) {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (error.code !== "auth/email-already-in-use") {
      throw error;
    }

    return signInWithEmailAndPassword(auth, email, password);
  }
}

async function run() {
  const env = readEnvironment();

  const app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  });

  const auth = getAuth(app);
  const db = getFirestore(app);

  const credential = await createOrSignInAdmin(
    auth,
    ADMIN_ACCOUNT.email,
    ADMIN_ACCOUNT.password,
  );

  await updateProfile(credential.user, { displayName: ADMIN_ACCOUNT.username });

  const uid = credential.user.uid;

  await setDoc(
    doc(db, "admin_users", uid),
    {
      uid,
      username: ADMIN_ACCOUNT.username,
      usernameLower: ADMIN_ACCOUNT.username.toLowerCase(),
      displayName: "Admin User",
      email: ADMIN_ACCOUNT.email,
      role: ADMIN_ACCOUNT.role,
      isActive: true,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );

  await setDoc(
    doc(db, "admin_usernames", ADMIN_ACCOUNT.username.toLowerCase()),
    {
      uid,
      email: ADMIN_ACCOUNT.email,
      role: ADMIN_ACCOUNT.role,
      isActive: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await setDoc(
    doc(db, "admin_settings", "system_status"),
    {
      database: "online",
      mapService: "online",
      emergencyApi: "online",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await setDoc(
    doc(db, "emergency_hotlines", "rescue_team_primary"),
    {
      name: "PLP Response Team",
      phoneNumber: "09162598683",
      service: "Emergency Response",
      isActive: true,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );

  console.log("Admin seed complete.");
  console.log(`Username: ${ADMIN_ACCOUNT.username}`);
  console.log(`Email: ${ADMIN_ACCOUNT.email}`);
}

run().catch((error) => {
  console.error("Admin seed failed:", error.message || error);
  process.exitCode = 1;
});
