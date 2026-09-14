import { useState } from "react";
import Navbar from "../components/header/Navbar";

function UserAccount() {
  const [activeTab, setActiveTab] = useState("profile");

  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      background: "#f5f7fa",
      fontFamily: "Arial, sans-serif",
      color: "#111827"
    },
    sidebar: {
      width: "260px",
      background: "#111827",
      color: "#fff",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    },
    brand: {
      fontSize: "22px",
      fontWeight: "bold",
      marginBottom: "20px",
      textAlign: "center",
      color: "#38bdf8"
    },
    sidebarBtn: (active) => ({
      padding: "12px",
      border: "1px solid #374151",
      borderRadius: "8px",
      cursor: "pointer",
      background: active ? "#2563eb" : "#1f2937",
      color: active ? "#ffffff" : "#e5e7eb",
      textAlign: "left",
      fontSize: "15px",
      fontWeight: active ? "600" : "500",
      transition: "all 0.2s ease"
    }),
    logoutBtn: {
      marginTop: "auto",
      padding: "12px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      background: "#dc2626",
      color: "#fff"
    },
    content: {
      flex: 1,
      padding: "30px"
    },
    section: {
      background: "#fff",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      color: "#111827"
    },
    card: {
      display: "flex",
      gap: "15px",
      alignItems: "center",
      padding: "15px",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      marginBottom: "12px",
      color: "#111827"
    },
    btnPrimary: {
      background: "#2563eb",
      color: "#fff",
      padding: "10px 14px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      marginTop: "10px"
    },
    btnOutline: {
      background: "transparent",
      color: "#2563eb",
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #2563eb",
      cursor: "pointer",
      marginTop: "6px"
    },
    danger: {
      borderColor: "#dc2626",
      color: "#dc2626"
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection styles={styles} />;
      case "orders":
        return <OrdersSection styles={styles} />;
      case "wishlist":
        return <WishlistSection styles={styles} />;
      case "addresses":
        return <AddressSection styles={styles} />;
      case "security":
        return <SecuritySection styles={styles} />;
      default:
        return <ProfileSection styles={styles} />;
    }
  };

  return (
    <>
    <Navbar></Navbar>
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2 style={styles.brand}>QwikMall</h2>

        <button style={styles.sidebarBtn(activeTab === "profile")} onClick={() => setActiveTab("profile")}>👤 Profile</button>
        <button style={styles.sidebarBtn(activeTab === "orders")} onClick={() => setActiveTab("orders")}>📦 My Orders</button>
        <button style={styles.sidebarBtn(activeTab === "wishlist")} onClick={() => setActiveTab("wishlist")}>❤️ Wishlist</button>
        <button style={styles.sidebarBtn(activeTab === "addresses")} onClick={() => setActiveTab("addresses")}>🏠 Addresses</button>
        <button style={styles.sidebarBtn(activeTab === "security")} onClick={() => setActiveTab("security")}>🔐 Security</button>

        <button style={styles.logoutBtn}>🚪 Logout</button>
      </aside>

      <main style={styles.content}>
        {renderContent()}
      </main>
    </div>
    </>
  );
}

/* -------- Sections -------- */

function ProfileSection({ styles }) {
  return (
    <div style={styles.section}>
      <h2>My Profile</h2>
      <div style={styles.card}>
        <img src="https://i.pravatar.cc/100" alt="profile" style={{ borderRadius: "50%" }} />
        <div>
          <p><strong>Name:</strong> John Doe</p>
          <p><strong>Email:</strong> john@example.com</p>
          <p><strong>Phone:</strong> +91 9876543210</p>
          <button style={styles.btnPrimary}>Edit Profile</button>
        </div>
      </div>
    </div>
  );
}

function OrdersSection({ styles }) {
  return (
    <div style={styles.section}>
      <h2>My Orders</h2>
      <div style={styles.card}>
        <div>
          <p><strong>Order #12345</strong></p>
          <p>Status: Delivered</p>
          <p>Total: ₹1,299</p>
          <button style={styles.btnOutline}>View Details</button>
        </div>
      </div>
    </div>
  );
}

function WishlistSection({ styles }) {
  return (
    <div style={styles.section}>
      <h2>Wishlist</h2>
      <div style={styles.card}>
        <p>Wireless Headphones</p>
        <button style={styles.btnOutline}>Add to Cart</button>
      </div>
    </div>
  );
}

function AddressSection({ styles }) {
  return (
    <div style={styles.section}>
      <h2>Saved Addresses</h2>
      <div style={styles.card}>
        <p><strong>Home</strong></p>
        <p>221B Baker Street, Nagpur</p>
        <button style={styles.btnOutline}>Edit</button>
      </div>
      <button style={styles.btnPrimary}>+ Add New Address</button>
    </div>
  );
}

function SecuritySection({ styles }) {
  return (
    <div style={styles.section}>
      <h2>Security</h2>
      <button style={styles.btnOutline}>Change Password</button>
      <br />
      <button style={{ ...styles.btnOutline, ...styles.danger, marginTop: "10px" }}>
        Delete Account
      </button>
    </div>
  );
}

export default UserAccount;
