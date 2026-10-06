import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  faArrowRightFromBracket,
  faArrowUpRightFromSquare,
  faBox,
  faCheck,
  faHeart,
  faHouse,
  faLock,
  faMagnifyingGlass,
  faPen,
  faRotateLeft,
  faTruckFast,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AuthContext } from "../App";
import Footer from "../components/footer/Footer";
import Navbar from "../components/header/Navbar";
import "./UserAccount.css";

const accountTabs = [
  { id: "profile", label: "Profile information", icon: faUser },
  { id: "orders", label: "My orders", icon: faBox },
  { id: "wishlist", label: "Wishlist", icon: faHeart },
  { id: "addresses", label: "Addresses", icon: faHouse },
  { id: "security", label: "Security", icon: faLock },
];

function UserAccount() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const { setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/users/me", {
          credentials: "include",
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load your profile.");
        }
        if (isMounted) {
          setProfile(result.data);
          setForm({
            username: result.data.username || "",
            email: result.data.email || "",
            phone: result.data.phone || "",
          });
        }
      } catch (error) {
        if (isMounted) {
          setPageError(error.message || "Unable to load your profile.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const beginEditing = () => {
    setForm({
      username: profile?.username || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
    });
    setSaveError("");
    setSaveMessage("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setForm({
      username: profile?.username || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
    });
    setSaveError("");
    setEditing(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveMessage("");

    try {
      const response = await fetch("http://localhost:5000/users/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save your profile.");
      }

      const updatedProfile = {
        ...profile,
        username: form.username.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim(),
      };
      setProfile(updatedProfile);
      setForm({
        username: updatedProfile.username,
        email: updatedProfile.email || "",
        phone: updatedProfile.phone,
      });
      setEditing(false);
      setSaveMessage("Your profile details have been updated.");
    } catch (error) {
      setSaveError(error.message || "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to log out.");
      }
      setIsLoggedIn(false);
      navigate("/login");
    } catch (error) {
      setPageError(error.message || "Unable to log out.");
      setLoggingOut(false);
    }
  };

  const initials = profile?.username?.trim().slice(0, 2).toUpperCase() || "U";
  const avatarUrl = profile?.profile_picture || profile?.avatar_url;
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <Navbar />
      <div className="account-page">
        <div className="account-layout">
          <aside className="account-sidebar" aria-label="Account navigation">
            <div className="account-sidebar-heading">
              <span className="account-sidebar-avatar" aria-hidden="true">
                {initials}
              </span>
              <div>
                <span className="account-eyebrow">Welcome back</span>
                <strong>{profile?.username || "My account"}</strong>
              </div>
            </div>
            <nav className="account-nav">
              {accountTabs.map((tab) => (
                <button
                  className={`account-nav-item${activeTab === tab.id ? " is-active" : ""}`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                >
                  <FontAwesomeIcon icon={tab.icon} aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
            <button
              className="account-logout"
              onClick={handleLogout}
              disabled={loggingOut}
              type="button"
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} aria-hidden="true" />
              <span>{loggingOut ? "Logging out..." : "Log out"}</span>
            </button>
          </aside>

          <main className="account-main">
            {activeTab === "profile" ? (
              <ProfileSection
                profile={profile}
                loading={loading}
                error={pageError}
                editing={editing}
                form={form}
                saving={saving}
                saveError={saveError}
                saveMessage={saveMessage}
                initials={initials}
                avatarUrl={avatarUrl}
                joinedDate={joinedDate}
                onBeginEditing={beginEditing}
                onCancelEditing={cancelEditing}
                onChange={handleFormChange}
                onSave={saveProfile}
              />
            ) : activeTab === "orders" ? (
              <OrdersSection />
            ) : (
              <AccountPlaceholder tab={activeTab} />
            )}
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}

function OrdersSection() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All orders");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const response = await fetch("http://localhost:5000/orders/", {
          credentials: "include",
        });
        const result = await response.json();
        if (response.status === 404 && !result.success) {
          if (isMounted) setOrders([]);
          return;
        }
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load your orders.");
        }
        if (isMounted) {
          const orderList = Array.isArray(result.data) ? result.data : [];
          setOrders(orderList.slice().sort(
            (first, second) => new Date(second.order_date) - new Date(first.order_date)
          ));
        }
      } catch (loadError) {
        if (isMounted) setError(loadError.message || "Unable to load your orders.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  const statusOptions = ["All orders", "On the way", "Delivered", "Cancelled"];
  const filteredOrders = orders.filter((order) => {
    const status = normalizeOrderStatus(order.status);
    const matchesStatus = statusFilter === "All orders"
      || (statusFilter === "On the way" && ["pending", "processing", "shipped", "out for delivery"].includes(status))
      || status === statusFilter.toLowerCase();
    const searchValue = search.trim().toLowerCase();
    const matchesSearch = !searchValue
      || String(order.id).includes(searchValue)
      || (order.order_items || []).some((item) =>
        item.product?.name?.toLowerCase().includes(searchValue)
      );
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="orders-content">
      <header className="orders-page-heading">
        <div>
          <span className="profile-eyebrow">Your account</span>
          <h1>My orders</h1>
          <p>Track deliveries, review purchases, and find your order details.</p>
        </div>
        <span className="orders-total-count">{orders.length} {orders.length === 1 ? "order" : "orders"}</span>
      </header>

      <div className="orders-toolbar">
        <div className="orders-status-tabs" role="group" aria-label="Filter orders by status">
          {statusOptions.map((status) => (
            <button
              className={`orders-status-tab${statusFilter === status ? " is-active" : ""}`}
              key={status}
              onClick={() => setStatusFilter(status)}
              type="button"
            >
              {status}
            </button>
          ))}
        </div>
        <label className="orders-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
          <input
            aria-label="Search orders"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search orders"
            value={search}
          />
        </label>
      </div>

      {loading ? (
        <section className="profile-panel">
          <div className="profile-loading" role="status">Loading your orders...</div>
        </section>
      ) : error ? (
        <section className="profile-panel orders-empty">
          <h2>We couldn't load your orders</h2>
          <p role="alert">{error}</p>
        </section>
      ) : filteredOrders.length ? (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <section className="profile-panel orders-empty">
          <span className="orders-empty-icon"><FontAwesomeIcon icon={faBox} aria-hidden="true" /></span>
          <h2>{orders.length ? "No matching orders" : "No orders yet"}</h2>
          <p>
            {orders.length
              ? "Try a different status or search term."
              : "When you place an order, its items and delivery updates will appear here."}
          </p>
          {!orders.length && <Link className="profile-primary-button" to="/products">Explore products</Link>}
        </section>
      )}
    </div>
  );
}

function OrderCard({ order }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const items = order.order_items || [];
  const itemCount = items.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const status = normalizeOrderStatus(order.status);
  const statusLabel = order.status || "Processing";
  const orderDate = order.order_date
    ? new Date(order.order_date).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date unavailable";
  const address = order.address;
  const addressText = address
    ? [
        address.address_line1,
        address.address_line2,
        address.city,
        address.state,
        address.postal_code,
        address.country,
      ].filter(Boolean).join(", ")
    : "Delivery address unavailable";
  const trackingSteps = [
    { label: "Order placed", icon: faCheck },
    { label: "Shipped", icon: faTruckFast },
    { label: "Delivered", icon: faBox },
  ];
  const currentStep = status === "cancelled"
    ? -1
    : status === "delivered"
      ? 2
      : ["shipped", "out for delivery"].includes(status)
        ? 1
        : 0;

  return (
    <article className="order-card">
      <header className="order-card-header">
        <div className="order-meta-group">
          <div className="order-meta">
            <span>ORDER PLACED</span>
            <strong>{orderDate}</strong>
          </div>
          <div className="order-meta">
            <span>TOTAL</span>
            <strong>{formatOrderPrice(order.total_price)}</strong>
          </div>
          <div className="order-meta order-meta--number">
            <span>ORDER</span>
            <strong>#{order.id}</strong>
          </div>
        </div>
        <span className={`order-status order-status--${status.replaceAll(" ", "-")}`}>
          {statusLabel}
        </span>
      </header>

      <div className="order-card-body">
        <div className="order-items">
          {items.map((item) => (
            <div className="order-item" key={item.id}>
              <div className="order-item-image">
                {item.product?.image_url ? (
                  <img
                    src={item.product.image_url}
                    alt={item.product.image_alt_text || item.product.name}
                  />
                ) : (
                  <FontAwesomeIcon icon={faBox} aria-hidden="true" />
                )}
              </div>
              <div className="order-item-copy">
                <strong>{item.product?.name || `Product #${item.product_id}`}</strong>
                <span>Quantity: {item.quantity}</span>
                <span>Unit price: {formatOrderPrice(item.price)}</span>
              </div>
              <strong className="order-item-total">
                {formatOrderPrice(Number(item.price || 0) * Number(item.quantity || 0))}
              </strong>
            </div>
          ))}
        </div>

        <div className="order-summary">
          <div className="order-summary-block">
            <h3>Delivery address</h3>
            <p>{addressText}</p>
            {address?.landmark && <span>Landmark: {address.landmark}</span>}
          </div>
          <div className="order-summary-block">
            <h3>Payment</h3>
            <p>{formatPaymentMethod(order.payment_method)}</p>
            <span>Order total: {formatOrderPrice(order.total_price)}</span>
          </div>
          <button
            className="order-details-button"
            aria-expanded={detailsOpen}
            onClick={() => setDetailsOpen((open) => !open)}
            type="button"
          >
            {detailsOpen ? "Hide details" : "Order details"}
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" />
          </button>
        </div>
      </div>

      {detailsOpen && (
        <div className="order-extra-details">
          <span><strong>Order number:</strong> #{order.id}</span>
          <span><strong>Placed on:</strong> {order.order_date ? new Date(order.order_date).toLocaleString() : orderDate}</span>
          <span><strong>Payment method:</strong> {formatPaymentMethod(order.payment_method)}</span>
          <span><strong>Items in this order:</strong> {itemCount}</span>
        </div>
      )}

      <footer className="order-card-footer">
        {status === "cancelled" ? (
          <p className="order-cancelled-message">
            <FontAwesomeIcon icon={faRotateLeft} aria-hidden="true" />
            This order was cancelled.
          </p>
        ) : (
          <>
            <div className="order-progress" aria-label={`Order status: ${statusLabel}`}>
              {trackingSteps.map((step, index) => (
                <div className={`order-progress-step${index <= currentStep ? " is-complete" : ""}`} key={step.label}>
                  <span className="order-progress-marker">
                    <FontAwesomeIcon icon={step.icon} aria-hidden="true" />
                  </span>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
            <span className="order-items-count">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
          </>
        )}
      </footer>
    </article>
  );
}

function normalizeOrderStatus(status) {
  return String(status || "processing").trim().toLowerCase();
}

function formatOrderPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPaymentMethod(method) {
  const paymentLabels = {
    cod: "Cash on Delivery",
    upi: "UPI",
    card: "Debit / Credit Card",
  };
  return paymentLabels[String(method || "").toLowerCase()] || method || "Payment method unavailable";
}

function ProfileSection({
  profile,
  loading,
  error,
  editing,
  form,
  saving,
  saveError,
  saveMessage,
  initials,
  avatarUrl,
  joinedDate,
  onBeginEditing,
  onCancelEditing,
  onChange,
  onSave,
}) {
  if (loading) {
    return (
      <section className="profile-panel">
        <div className="profile-loading" role="status">Loading your profile...</div>
      </section>
    );
  }

  if (error && !profile) {
    return (
      <section className="profile-panel profile-error">
        <div className="profile-section-heading">
          <span className="profile-eyebrow">Your account</span>
          <h1>Profile information</h1>
        </div>
        <p role="alert">{error}</p>
        <Link className="profile-primary-button" to="/login">Log in to view your profile</Link>
      </section>
    );
  }

  return (
    <div className="profile-content">
      <header className="profile-page-heading">
        <div>
          <span className="profile-eyebrow">Your account</span>
          <h1>Profile information</h1>
          <p>Manage your personal details and how we can reach you.</p>
        </div>
      </header>

      {saveMessage && <p className="profile-alert profile-alert--success" role="status">{saveMessage}</p>}
      {error && <p className="profile-alert profile-alert--error" role="alert">{error}</p>}

      <section className="profile-hero">
        <div className="profile-identity">
          <div className="profile-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={`${profile.username}'s profile`} />
            ) : (
              <span aria-label={`${profile.username}'s initials`}>{initials}</span>
            )}
          </div>
          <div className="profile-identity-copy">
            <span className="profile-eyebrow">QwikMall customer</span>
            <h2>{profile.username}</h2>
            <p>{profile.email || "Add an email address to your account"}</p>
          </div>
        </div>
        {!editing && (
          <button className="profile-primary-button" onClick={onBeginEditing} type="button">
            <FontAwesomeIcon icon={faPen} aria-hidden="true" />
            Edit details
          </button>
        )}
      </section>

      <section className="profile-panel">
        <div className="profile-panel-heading">
          <div>
            <h2>Personal details</h2>
            <p>Keep your contact information up to date.</p>
          </div>
          {editing && (
            <button className="profile-close-button" onClick={onCancelEditing} type="button" aria-label="Cancel editing">
              <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
            </button>
          )}
        </div>

        {editing ? (
          <form className="profile-form" onSubmit={onSave}>
            <label className="profile-field">
              <span>Full name</span>
              <input
                autoComplete="name"
                maxLength={100}
                name="username"
                onChange={onChange}
                required
                value={form.username}
              />
            </label>
            <label className="profile-field">
              <span>Email address</span>
              <input
                autoComplete="email"
                name="email"
                onChange={onChange}
                type="email"
                value={form.email}
              />
            </label>
            <label className="profile-field">
              <span>Phone number</span>
              <input
                autoComplete="tel"
                maxLength={20}
                name="phone"
                onChange={onChange}
                required
                type="tel"
                value={form.phone}
              />
              <small>Your phone number is used for sign-in and order updates.</small>
            </label>
            {saveError && <p className="profile-alert profile-alert--error" role="alert">{saveError}</p>}
            <div className="profile-form-actions">
              <button className="profile-secondary-button" onClick={onCancelEditing} type="button">Cancel</button>
              <button className="profile-primary-button" disabled={saving} type="submit">
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        ) : (
          <dl className="profile-details-list">
            <div className="profile-detail-row">
              <dt>Full name</dt>
              <dd>{profile.username || "Not provided"}</dd>
            </div>
            <div className="profile-detail-row">
              <dt>Email address</dt>
              <dd>{profile.email || "Not provided"}</dd>
            </div>
            <div className="profile-detail-row">
              <dt>Phone number</dt>
              <dd>{profile.phone || "Not provided"}</dd>
            </div>
          </dl>
        )}
      </section>

      <section className="profile-panel profile-account-panel">
        <div className="profile-panel-heading">
          <div>
            <h2>Account details</h2>
            <p>Basic information about your QwikMall account.</p>
          </div>
        </div>
        <dl className="profile-details-list profile-details-list--compact">
          <div className="profile-detail-row">
            <dt>Customer ID</dt>
            <dd>#{profile.id}</dd>
          </div>
          <div className="profile-detail-row">
            <dt>Account type</dt>
            <dd>{profile.role === "admin" ? "Administrator" : "Customer"}</dd>
          </div>
          {joinedDate && (
            <div className="profile-detail-row">
              <dt>Member since</dt>
              <dd>{joinedDate}</dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
}

function AccountPlaceholder({ tab }) {
  const selectedTab = accountTabs.find((item) => item.id === tab);
  return (
    <section className="profile-panel account-placeholder">
      <span className="profile-eyebrow">Your account</span>
      <h1>{selectedTab?.label || "My account"}</h1>
      <p>This section is not available yet. Your profile details can be managed from Profile information.</p>
    </section>
  );
}

export default UserAccount;
