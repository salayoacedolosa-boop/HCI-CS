import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

/**
 * Sign in with Google
 */
export async function signInWithGoogle(auth) {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    console.log("Google sign-in successful:", result.user.email);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Google sign-in error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(auth, email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("Email sign-in successful:", result.user.email);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Email sign-in error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(auth, email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Email sign-up successful:", result.user.email);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Email sign-up error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Sign out
 */
export async function userSignOut(auth) {
  try {
    await signOut(auth);
    console.log("Sign-out successful");
    return { success: true };
  } catch (error) {
    console.error("Sign-out error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(auth, callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User logged in:", user.email);
      callback({ loggedIn: true, user });
    } else {
      console.log("User logged out");
      callback({ loggedIn: false, user: null });
    }
  });
}

/**
 * Get current user
 */
export function getCurrentUser(auth) {
  return auth.currentUser;
}

/**
 * Get user ID token
 */
export async function getUserToken(auth) {
  try {
    const token = await auth.currentUser?.getIdToken();
    return { success: true, token };
  } catch (error) {
    console.error("Error getting user token:", error);
    return { success: false, error: error.message };
  }
}
