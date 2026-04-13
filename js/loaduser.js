
import { auth, db, storage } from "/configaration/firebaseConfig.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

async function loadUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const tableBody = document.querySelector("#userTable tbody");

    tableBody.innerHTML = ""; // clear table

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      const row = tableBody.insertRow();

      const nameCell = row.insertCell(0);
      const emailCell = row.insertCell(1);
      const statusCell = row.insertCell(2);
      const userCell = row.insertCell(3);

      // 👤 Name
      nameCell.innerText = data.name;

      // 📧 Email
      emailCell.innerText = data.email;

      // 🟢 Status
      if (data.status === true) {
        statusCell.innerText = "Active";
        statusCell.style.color = "green";
      } else {
        statusCell.innerText = "Inactive";
        statusCell.style.color = "red";
      }

      // 🖼️ Profile Image
      const img = document.createElement("img");
      img.width = 60;
      img.height = 60;
      img.style.borderRadius = "50%";

      // 🔥 Storage path (IMPORTANT)
      const imageRef = ref(storage, "profile_pics/" + data.profilePicUrl);

      getDownloadURL(imageRef)
        .then((url) => {
          img.src = url;
        })
        .catch((error) => {
          console.error("Image load error:", error);
        });

      userCell.appendChild(img);
    });

  } catch (error) {
    console.error("Error loading users:", error);
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadUsers();
  }
});