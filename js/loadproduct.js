import { auth, db, storage } from "/configaration/firebaseConfig.js";
import { collection, getDocs, doc, getDoc, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

async function getReferenceName(collectionName, id, fieldName) {
  if (!id) return "Unknown";

  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data[fieldName] || "Unknown";
    }
  } catch (error) {
    console.error(`Error loading ${collectionName} reference by id ${id}:`, error);
  }

  try {
    const refs = [
      query(collection(db, collectionName), where("categoryId", "==", id)),
      query(collection(db, collectionName), where("sellerId", "==", id)),
      query(collection(db, collectionName), where("id", "==", id)),
      query(collection(db, collectionName), where("name", "==", id)),
      query(collection(db, collectionName), where("shopName", "==", id)),
    ];

    for (const q of refs) {
      const snap = await getDocs(q);
      if (!snap.empty) {
        const firstDoc = snap.docs[0];
        const data = firstDoc.data();
        if (data[fieldName]) {
          return data[fieldName];
        }
      }
    }
  } catch (error) {
    console.error(`Error querying ${collectionName} fallback for id ${id}:`, error);
  }

  return "Unknown";
}

function isFullUrl(value) {
  try {
    return Boolean(value && new URL(value).protocol.startsWith("http"));
  } catch (error) {
    return false;
  }
}

function getProductImageUrl(imagePath) {
  if (!imagePath) {
    return null;
  }
  if (isFullUrl(imagePath)) {
    return imagePath;
  }
  return imagePath.startsWith("product_images/") ? imagePath : `product_images/${imagePath}`;
}

async function loadProducts() {
  try {
    const collectionsToTry = ["products", "product"];
    let productSnapshot = null;
    let productCollectionName = "products";

    for (const name of collectionsToTry) {
      const snapshot = await getDocs(collection(db, name));
      if (!snapshot.empty) {
        productSnapshot = snapshot;
        productCollectionName = name;
        break;
      }
    }

    if (!productSnapshot) {
      console.warn("No documents found in 'products' or 'product' collections.");
      return;
    }

    const tableBody = document.querySelector("#ProductTable tbody");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    for (const docItem of productSnapshot.docs) {
      const data = docItem.data();
      const row = tableBody.insertRow();

      const nameCell = row.insertCell(0);
      const categoryCell = row.insertCell(1);
      const sellerCell = row.insertCell(2);
      const priceCell = row.insertCell(3);
      const stockCell = row.insertCell(4);
      const imageCell = row.insertCell(5);
      const statusCell = row.insertCell(6);

      nameCell.innerText = data.name || "";
      priceCell.innerText = data.price != null ? `${data.price}` : "";
      stockCell.innerText = data.stockCount != null ? data.stockCount : "";

      let productStatus = data.status === true;
      statusCell.innerText = productStatus ? "Active" : "Inactive";
      statusCell.style.color = productStatus ? "green" : "red";
      statusCell.style.cursor = "pointer";
      statusCell.title = "Click to toggle status";

      categoryCell.innerText = await getReferenceName("categories", data.categoryId, "name");
      sellerCell.innerText = await getReferenceName("sellers", data.sellerId, "shopName");

      const imageUrl = getProductImageUrl(data.images?.[0]);
      if (imageUrl) {
        const img = document.createElement("img");
        img.width = 80;
        img.height = 80;
        img.style.objectFit = "cover";
        img.style.borderRadius = "8px";

        if (isFullUrl(imageUrl)) {
          img.src = imageUrl;
        } else {
          const imageRef = ref(storage, imageUrl);
          getDownloadURL(imageRef)
            .then((url) => {
              img.src = url;
            })
            .catch((error) => {
              console.error("Product image load error:", error);
            });
        }

        imageCell.appendChild(img);
      }

      statusCell.addEventListener("click", async () => {
        const statusRef = doc(db, productCollectionName, docItem.id);
        const newStatus = !productStatus;
        statusCell.innerText = "Updating...";
        statusCell.style.color = "gray";
        try {
          await updateDoc(statusRef, { status: newStatus });
          productStatus = newStatus;
          statusCell.innerText = productStatus ? "Active" : "Inactive";
          statusCell.style.color = productStatus ? "green" : "red";
        } catch (error) {
          console.error("Failed to update product status:", error);
          statusCell.innerText = productStatus ? "Active" : "Inactive";
          statusCell.style.color = productStatus ? "green" : "red";
        }
      });
    }
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadProducts();
  }
});
