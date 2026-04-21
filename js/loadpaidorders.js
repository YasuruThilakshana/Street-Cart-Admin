import { auth, db, storage } from "/configaration/firebaseConfig.js";
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp) {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/**
 * Get reference name from another collection
 */
async function getReferenceName(collectionName, docId, fieldName) {
  try {
    const docSnap = await getDocs(collection(db, collectionName));
    for (const docItem of docSnap.docs) {
      if (docItem.id === docId) {
        return docItem.data()[fieldName] || "N/A";
      }
    }
    return "N/A";
  } catch (error) {
    console.error(`Error fetching ${fieldName}:`, error);
    return "N/A";
  }
}

/**
 * Get seller name by matching sellerId field in sellers collection
 */
async function getSellerName(sellerId) {
  try {
    const docSnap = await getDocs(collection(db, "sellers"));
    for (const docItem of docSnap.docs) {
      if (docItem.data().sellerId === sellerId) {
        return docItem.data().shopName || "N/A";
      }
    }
    return "N/A";
  } catch (error) {
    console.error(`Error fetching seller name:`, error);
    return "N/A";
  }
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
  const statusMap = {
    "pending": '<span class="badge badge-warning">Pending</span>',
    "confirmed": '<span class="badge badge-info">Confirmed</span>',
    "processing": '<span class="badge badge-primary">Processing</span>',
    "shipped": '<span class="badge badge-success">Shipped</span>',
    "delivered": '<span class="badge badge-success">Delivered</span>',
    "cancelled": '<span class="badge badge-danger">Cancelled</span>'
  };
  return statusMap[status?.toLowerCase()] || '<span class="badge badge-secondary">Unknown</span>';
}

/**
 * Load Paid orders from Firestore - Table View
 * Filter only items where productstatus = "paid"
 */
async function loadPaidOrders() {
  try {
    const querySnapshot = await getDocs(collection(db, "orders"));
    const container = document.querySelector("#ordersContainer");
    
    if (querySnapshot.empty) {
      container.innerHTML = '<div class="alert alert-info"><i class="fas fa-info-circle"></i> No orders found</div>';
      return;
    }

    let html = `
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead class="bg-success text-white">
            <tr>
              <th>User Name</th>
              <th>Mobile</th>
              <th>Product Name</th>
              <th>Seller Name</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>`;

    let hasData = false;

    // Process each order document
    for (const orderDoc of querySnapshot.docs) {
      const orderData = orderDoc.data();
      const userName = orderData.shpDetails?.name || "N/A";
      const userMobile = orderData.shpDetails?.mobile || "N/A";

      // Add each order item as a row - only if productstatus = "paid"
      if (orderData.orderItems && Array.isArray(orderData.orderItems)) {
        for (const orderItem of orderData.orderItems) {
          if (orderItem.productstatus?.toLowerCase() === "paid") {
            hasData = true;
            const productName = await getReferenceName("product", orderItem.productId, "name");
            const sellerName = await getSellerName(orderItem.sellerId);
            const qty = orderItem.quantity || 0;
            const price = orderItem.unitprice || 0;
            const totalPrice = (qty * price).toFixed(2);

            html += `
              <tr>
                <td>${userName}</td>
                <td>${userMobile}</td>
                <td>${productName}</td>
                <td>${sellerName}</td>
                <td><span class="badge badge-secondary">${qty}</span></td>
                <td>Rs. ${price.toFixed(2)}</td>
                <td><strong>Rs. ${totalPrice}</strong></td>
              </tr>`;
          }
        }
      }
    }

    if (!hasData) {
      html += `<tr><td colspan="7" class="text-center text-muted">No paid items found</td></tr>`;
    }

    html += `
          </tbody>
        </table>
      </div>`;

    container.innerHTML = html;

  } catch (error) {
    console.error("Error loading paid orders:", error);
    const container = document.querySelector("#ordersContainer");
    container.innerHTML = '<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> Error loading orders</div>';
  }
}

// Load orders when user is authenticated
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadPaidOrders();
  } else {
    console.log("No user is signed in.");
    const container = document.querySelector("#ordersContainer");
    container.innerHTML = '<div class="alert alert-warning"><i class="fas fa-lock"></i> Please sign in to view orders</div>';
  }
});
