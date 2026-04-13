import { auth, db } from "/configaration/firebaseConfig.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const currentPage = window.location.pathname.split("/").pop();
const isSigninPage = currentPage === "signin.html";

function showSignInError(message) {
  const errorElement = document.querySelector("#signinError");
  if (errorElement) {
    errorElement.innerText = message;
    errorElement.style.display = "block";
  }
}

async function isAdminUser(user) {
  if (!user) {
    return false;
  }

  let adminChecked = false;

  try {
    const adminDocRef = doc(db, "admin", user.uid);
    const adminDoc = await getDoc(adminDocRef);
    if (adminDoc.exists()) {
      return true;
    }
    adminChecked = true;
  } catch (error) {
    console.warn("Admin UID doc read failed:", error);
  }

  if (user.email) {
    try {
      const adminQuery = query(collection(db, "admin"), where("email", "==", user.email));
      const querySnapshot = await getDocs(adminQuery);
      if (!querySnapshot.empty) {
        return true;
      }
      adminChecked = true;
    } catch (error) {
      console.error("Admin email query failed:", error);
      return false;
    }
  }

  if (!adminChecked) {
    console.error("Admin check failed: no admin document or query attempted.");
  }

  return false;
}

export async function signOutAdmin() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out failed:", error);
  }
  window.location.href = "signin.html";
}

async function handleAuthState(user) {
  if (!user) {
    if (!isSigninPage) {
      window.location.replace("signin.html");
    }
    return;
  }

  const isAdmin = await isAdminUser(user);
  if (!isAdmin) {
    await signOut(auth);
    if (!isSigninPage) {
      window.location.replace("signin.html");
    }
    return;
  }

  if (isSigninPage) {
    window.location.replace("index.html");
  }
}

onAuthStateChanged(auth, handleAuthState);

const signinForm = document.querySelector("#signinForm");
if (signinForm) {
  signinForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();

    if (!email || !password) {
      showSignInError("Please enter both email and password.");
      return;
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user = credential.user;
      const admin = await isAdminUser(user);
      if (!admin) {
        await signOut(auth);
        showSignInError("Access denied. Only admin users can sign in. Check Firestore admin read rules.");
        return;
      }
      window.location.replace("index.html");
    } catch (error) {
      console.error("Sign in failed:", error);
      showSignInError(error.message || "Unable to sign in. Check email and password.");
    }
  });
}

window.signOutAdmin = signOutAdmin;
