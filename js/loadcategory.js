
import { auth, db, storage } from "/configaration/firebaseConfig.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

async function loadCategories() {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const tableBody = document.querySelector("#CategoryTable tbody");

    tableBody.innerHTML = ""; // clear table

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      const row = tableBody.insertRow();

      const categoryIdCell = row.insertCell(0);
      const categoryNameCell = row.insertCell(1);
      const categoryImageCell = row.insertCell(2);

      // 👤 Name
      categoryIdCell.innerText = data.categoryId;
      categoryNameCell.innerText = data.name;

     

      // 🖼️ Profile Image
      const img = document.createElement("img");
      img.width = 100;
      img.height = 100;
      img.style.borderRadius = "50%";

      // 🔥 Storage path (IMPORTANT)
      const imagePath = data.imageURL.startsWith("category_images/")
        ? data.imageURL
        : `category_images/${data.imageURL}`;
      const imageRef = ref(storage, imagePath);

      getDownloadURL(imageRef)
        .then((url) => {
          img.src = url;
        })
        .catch((error) => {
          console.error("Image load error:", error);
        });

      categoryImageCell.appendChild(img);
    });
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadCategories();
  }
});

window.addEventListener("category-added", () => {
  loadCategories();
});