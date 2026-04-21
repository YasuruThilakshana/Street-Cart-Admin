
import { auth, db, storage } from "/configaration/firebaseConfig.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

async function loadVendor() {
  try {
    const querySnapshot = await getDocs(collection(db, "sellers"));
    const tableBody = document.querySelector("#vendorTable tbody");

    tableBody.innerHTML = ""; // clear table

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      const row = tableBody.insertRow();

      const firstNameCell = row.insertCell(0);
      const lastNameCell = row.insertCell(1);
      const mobileCell = row.insertCell(2);
      const nicCell = row.insertCell(3);
      const shopNameCell = row.insertCell(4);
      const vendorCell = row.insertCell(5);
      const profileCell = row.insertCell(6);

      // 👤 Name
      firstNameCell.innerText = data.firstName;
      lastNameCell.innerText = data.lastName;

      // � Mobile
      mobileCell.innerText = data.mobile;


      // 🆔 NIC
      nicCell.innerText = data.nic;

      // 🏪 Shop Name
      shopNameCell.innerText = data.shopName;

      // 🕒 Vendor
      vendorCell.innerText = data.vendor;

      // 🟢 Status
    //   if (data.status === true) {
    //     statusCell.innerText = "Active";
    //     statusCell.style.color = "green";
    //   } else {
    //     statusCell.innerText = "Inactive";
    //     statusCell.style.color = "red";
    //   }

      // 🖼️ Profile Image
      const img = document.createElement("img");
      img.width = 60;
      img.height = 60;
      img.style.borderRadius = "50%";

      // 🔥 Storage path (IMPORTANT)
      const imageRef = ref(storage, "vender_images/" + data.venderprofilePicUrl);

      getDownloadURL(imageRef)
        .then((url) => {
          img.src = url;
        })
        .catch((error) => {
          console.error("Image load error:", error);
        });

      profileCell.appendChild(img);
    });
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadVendor()
  }
});