import { useState } from "react";
import "./UserAccount.css";

function UserAccount() {
  const [activeTab, setActiveTab] = useState("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection />;
      case "orders":
        return <OrdersSection />;
      case "wishlist":
        return <WishlistSection />;
      case "addresses":
        return <AddressSection />;
      case "security":
        return <SecuritySection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="account-container">
      {/* Sidebar */}
      <aside className="account-sidebar">
        <h2 className="brand">QwikMall</h2>

        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          👤 Profile
        </button>

        <button
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => setActiveTab("orders")}
        >
          📦 My Orders
        </button>

        <button
          className={activeTab === "wishlist" ? "active" : ""}
          onClick={() => setActiveTab("wishlist")}
        >
          ❤️ Wishlist
        </button>

        <button
          className={activeTab === "addresses" ? "active" : ""}
          onClick={() => setActiveTab("addresses")}
        >
          🏠 Addresses
        </button>

        <button
          className={activeTab === "security" ? "active" : ""}
          onClick={() => setActiveTab("security")}
        >
          🔐 Security
        </button>

        <button className="logout-btn">🚪 Logout</button>
      </aside>

      {/* Main Content */}
      <main className="account-content">
        {renderContent()}
      </main>
    </div>
  );
}

/* ---------------- Sections ---------------- */

function ProfileSection() {
  return (
    <div className="section">
      <h2>My Profile</h2>
      <div className="profile-card">
        <img src="https://i.pravatar.cc/100" alt="profile" />
        <div>
          <p><strong>Name:</strong> John Doe</p>
          <p><strong>Email:</strong> john@example.com</p>
          <p><strong>Phone:</strong> +91 9876543210</p>
          <button className="btn-primary">Edit Profile</button>
        </div>
      </div>
    </div>
  );
}

function OrdersSection() {
  return (
    <div className="section">
      <h2>My Orders</h2>

      <div className="order-card">
        <p><strong>Order #12345</strong></p>
        <p>Status: Delivered</p>
        <p>Total: ₹1,299</p>
        <button className="btn-outline">View Details</button>
      </div>

      <div className="order-card">
        <p><strong>Order #12346</strong></p>
        <p>Status: In Transit</p>
        <p>Total: ₹499</p>
        <button className="btn-outline">Track Order</button>
      </div>
    </div>
  );
}

function WishlistSection() {
  return (
    <div className="section">
      <h2>Wishlist</h2>

      <div className="wishlist-item">
        <p>Wireless Headphones</p>
        <button className="btn-outline">Add to Cart</button>
      </div>

      <div className="wishlist-item">
        <p>Smart Watch</p>
        <button className="btn-outline">Add to Cart</button>
      </div>
    </div>
  );
}

function AddressSection() {
  return (
    <div className="section">
      <h2>Saved Addresses</h2>

      <div className="address-card">
        <p><strong>Home</strong></p>
        <p>221B Baker Street, Nagpur, Maharashtra</p>
        <button className="btn-outline">Edit</button>
      </div>

      <button className="btn-primary">+ Add New Address</button>
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="section">
      <h2>Security</h2>
      <button className="btn-outline">Change Password</button>
      <button className="btn-outline danger">Delete Account</button>
    </div>
  );
}

export default UserAccount;
