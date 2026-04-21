import { auth, db, storage } from "/configaration/firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

const categoryForm = document.querySelector("#categoryAddForm");
const categoryFormMessage = document.querySelector("#categoryFormMessage");

function setFormMessage(message, isError = false) {
  if (!categoryFormMessage) return;
  categoryFormMessage.innerText = message;
  categoryFormMessage.classList.toggle("text-danger", isError);
  categoryFormMessage.classList.toggle("text-success", !isError);
}

async function uploadCategoryImage(file, storagePath) {
  const imageRef = ref(storage, storagePath);
  await uploadBytes(imageRef, file);
  return storagePath;
}

async function addCategory(categoryData) {
  const categoryRef = doc(db, "categories", categoryData.categoryId);
  await setDoc(categoryRef, categoryData);
}

if (categoryForm) {
  categoryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const categoryId = document.querySelector("#categoryId").value.trim();
    const categoryName = document.querySelector("#categoryName").value.trim();
    const categoryImageInput = document.querySelector("#categoryImage");
    const file = categoryImageInput?.files?.[0];

    if (!categoryId || !categoryName || !file) {
      setFormMessage("Please fill in all fields and choose an image.", true);
      return;
    }

    try {
      setFormMessage("Saving category...");

      const storagePath = `category_images/${categoryId}-${file.name}`;
      const imageURL = await uploadCategoryImage(file, storagePath);

      const categoryData = {
        categoryId,
        name: categoryName,
        imageURL,
        createdAt: new Date().toISOString(),
      };

      await addCategory(categoryData);

      setFormMessage("Category added successfully.");
      categoryForm.reset();
      const loadEvent = new CustomEvent("category-added");
      window.dispatchEvent(loadEvent);
    } catch (error) {
      console.error("Category add failed:", error);
      setFormMessage("Failed to add category. Check console for details.", true);
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    setFormMessage("You must be signed in to add categories.", true);
    categoryForm?.querySelector("button[type=submit]")?.setAttribute("disabled", "disabled");
  }
});
