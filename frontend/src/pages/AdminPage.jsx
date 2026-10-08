import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    faBell,
    faBox,
    faBoxOpen,
    faChartLine,
    faChevronDown,
    faGear,
    faGaugeHigh,
    faMagnifyingGlass,
    faBars,
    faPlus,
    faRightFromBracket,
    faSliders,
    faStar,
    faTags,
    faUser,
    faUsers,
    faWarehouse,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AuthContext } from '../App';
import Loader from '../components/loader/Loader';
import './AdminPage.css';
import { API_URL } from '../config/api';
import AdminCategories from '../components/admin/AdminCategories';
import AdminReviews from '../components/admin/AdminReviews';
import AdminSettings from '../components/admin/AdminSettings';

const LOW_STOCK_THRESHOLD = 5;
const EMPTY_PRODUCT_FORM = {
    name: '', sku: '', manufacturer: '', brand: '', description: '', price: '', category: '', stock: '0',
};

async function fetchAdminData(path, options = {}) {
    const response = await fetch(`${API_URL}/admin/${path}`, {
        credentials: 'include',
        ...options,
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
        throw Object.assign(new Error(result.message || 'Unable to load admin dashboard.'), {
            status: response.status,
        });
    }

    return result.data;
}

function AdminPage() {
    const { isLoggedIn, isAuthLoading, setIsLoggedIn } = useContext(AuthContext);
    const [access, setAccess] = useState('checking');
    const [profile, setProfile] = useState(null);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [categories, setCategories] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [storeSettings, setStoreSettings] = useState(null);
    const [stockDrafts, setStockDrafts] = useState({});
    const [updatingStockIds, setUpdatingStockIds] = useState([]);
    const [error, setError] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [inventoryFilter, setInventoryFilter] = useState('all');
    const [productFilter, setProductFilter] = useState('active');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [orderStatusDrafts, setOrderStatusDrafts] = useState({});
    const [updatingOrderIds, setUpdatingOrderIds] = useState([]);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);
    const [existingProductImages, setExistingProductImages] = useState([]);
    const [selectedImageFiles, setSelectedImageFiles] = useState([]);
    const productImagesInputRef = useRef(null);
    const [editingProductId, setEditingProductId] = useState(null);
    const [isSavingProduct, setIsSavingProduct] = useState(false);
    const [profileDraft, setProfileDraft] = useState({ username: '', email: '', phone: '' });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [lowStockThreshold, setLowStockThreshold] = useState(LOW_STOCK_THRESHOLD);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthLoading) {
            return undefined;
        }

        if (!isLoggedIn) {
            setAccess('signed-out');
            setProfile(null);
            return undefined;
        }

        let isMounted = true;
        setAccess('checking');
        setError('');

        async function loadDashboard() {
            try {
                const adminProfile = await fetchAdminData('me');
                if (!isMounted) return;
                setProfile(adminProfile);
                setProfileDraft({
                    username: adminProfile.username || '',
                    email: adminProfile.email || '',
                    phone: adminProfile.phone || '',
                });
                setAccess('loading');

                const [adminUsers, adminOrders, adminInventory, adminCategories, adminReviews, adminSettings] = await Promise.all([
                    fetchAdminData('users'),
                    fetchAdminData('orders'),
                    fetchAdminData('inventory'),
                    fetchAdminData('categories'),
                    fetchAdminData('reviews'),
                    fetchAdminData('settings'),
                ]);
                if (isMounted) {
                    setUsers(adminUsers);
                    setOrders(adminOrders);
                    setInventory(adminInventory);
                    setCategories(adminCategories);
                    setReviews(adminReviews);
                    setStoreSettings(adminSettings);
                    const savedThreshold = adminSettings.account?.low_stock_threshold;
                    setLowStockThreshold(Number.isInteger(savedThreshold) && savedThreshold >= 0 ? savedThreshold : LOW_STOCK_THRESHOLD);
                    setAccess('admin');
                }
            } catch (loadError) {
                if (!isMounted) return;
                if (loadError.status === 401) {
                    setIsLoggedIn(false);
                    setAccess('signed-out');
                } else if (loadError.status === 403) {
                    setAccess('forbidden');
                } else {
                    setError(loadError.message || 'Unable to load admin dashboard.');
                    setAccess('error');
                }
            }
        }

        loadDashboard();
        return () => {
            isMounted = false;
        };
    }, [isAuthLoading, isLoggedIn, setIsLoggedIn]);

    async function handleLogin(event) {
        event.preventDefault();
        setLoginError('');
        setIsLoggingIn(true);

        try {
            const response = await fetch(`${API_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ identifier: identifier.trim(), password }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Unable to sign in.');
            }

            setPassword('');
            setIsLoggedIn(true);
        } catch (loginRequestError) {
            setLoginError(loginRequestError.message || 'Unable to sign in.');
        } finally {
            setIsLoggingIn(false);
        }
    }

    async function handleLogout() {
        setIsLoggingOut(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Unable to log out.');
            }
            setIsLoggedIn(false);
            navigate('/admin', { replace: true });
        } catch (logoutError) {
            setError(logoutError.message || 'Unable to log out.');
        } finally {
            setIsLoggingOut(false);
        }
    }

    async function saveStock(product) {
        const stockValue = stockDrafts[product.id] ?? String(product.stock);
        const stock = Number(stockValue);
        if (!Number.isInteger(stock) || stock < 0) {
            setError('Stock must be a non-negative whole number.');
            return;
        }
        if (updatingStockIds.includes(product.id)) return;

        setUpdatingStockIds((currentIds) => [...currentIds, product.id]);
        setError('');
        try {
            await fetchAdminData(`products/${product.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock }),
            });
            setInventory((currentInventory) => currentInventory.map((item) => (
                item.id === product.id ? { ...item, stock } : item
            )));
            setStockDrafts((currentDrafts) => {
                const remainingDrafts = { ...currentDrafts };
                delete remainingDrafts[product.id];
                return remainingDrafts;
            });
        } catch (stockError) {
            setError(stockError.message || 'Unable to update product stock.');
        } finally {
            setUpdatingStockIds((currentIds) => currentIds.filter((id) => id !== product.id));
        }
    }

    async function updateOrderStatus(order) {
        const status = orderStatusDrafts[order.id] || order.status || 'Pending';
        if (updatingOrderIds.includes(order.id) || status === order.status) return;
        setUpdatingOrderIds((ids) => [...ids, order.id]);
        setError('');
        try {
            await fetchAdminData(`orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            setOrders((currentOrders) => currentOrders.map((currentOrder) => (
                currentOrder.id === order.id ? { ...currentOrder, status } : currentOrder
            )));
            setOrderStatusDrafts((drafts) => {
                const nextDrafts = { ...drafts };
                delete nextDrafts[order.id];
                return nextDrafts;
            });
        } catch (statusError) {
            setError(statusError.message || 'Unable to update order status.');
        } finally {
            setUpdatingOrderIds((ids) => ids.filter((id) => id !== order.id));
        }
    }

    async function saveProduct(event) {
        event.preventDefault();
        setIsSavingProduct(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('product', JSON.stringify({
                ...productForm,
                price: Number(productForm.price),
                stock: Number(productForm.stock),
                keep_image_ids: existingProductImages.map((image) => image.id),
            }));
            selectedImageFiles.forEach((file) => formData.append('images', file));
            await fetchAdminData(editingProductId ? `products/${editingProductId}` : 'products', {
                method: editingProductId ? 'PATCH' : 'POST',
                body: formData,
            });
            const refreshedInventory = await fetchAdminData('inventory');
            setInventory(refreshedInventory);
            setEditingProductId(null);
            setProductForm(EMPTY_PRODUCT_FORM);
            setExistingProductImages([]);
            setSelectedImageFiles([]);
            if (productImagesInputRef.current) productImagesInputRef.current.value = '';
            setProductFilter('active');
        } catch (productError) {
            setError(productError.message || 'Unable to add product.');
        } finally {
            setIsSavingProduct(false);
        }
    }

    async function toggleProductAvailability(product) {
        setError('');
        try {
            await fetchAdminData(`products/${product.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !product.is_active }),
            });
            setInventory((items) => items.map((item) => (
                item.id === product.id ? { ...item, is_active: !product.is_active } : item
            )));
        } catch (productError) {
            setError(productError.message || 'Unable to update product availability.');
        }
    }

    async function loadCustomerDetails(customerId) {
        setError('');
        try {
            setCustomerDetails(await fetchAdminData(`users/${customerId}`));
        } catch (customerError) {
            setError(customerError.message || 'Unable to load customer details.');
        }
    }

    async function saveProfile(event) {
        event.preventDefault();
        setIsSavingProfile(true);
        setError('');
        try {
            await fetch(`${API_URL}/users/me`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileDraft),
            }).then(async (response) => {
                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Unable to save profile.');
                }
            });
            setProfile((currentProfile) => ({ ...currentProfile, ...profileDraft }));
        } catch (profileError) {
            setError(profileError.message || 'Unable to save profile.');
        } finally {
            setIsSavingProfile(false);
        }
    }

    function openAdminSection(section) {
        setActiveSection(section);
        setIsMobileSidebarOpen(false);
        setIsMobileSearchOpen(false);
        setSearchQuery('');
    }

    function openSearchResults(section) {
        setActiveSection(section);
        setIsMobileSidebarOpen(false);
        setIsMobileSearchOpen(false);
        if (section === 'products') setProductFilter('all');
    }

    const lowStockProducts = inventory.filter((product) => product.stock <= lowStockThreshold);
    const pendingOrders = orders.filter((order) => (order.status || 'Pending').toLowerCase() === 'pending');
    const customers = users.filter((user) => user.role !== 'admin');
    const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
    const filteredInventory = inventory.filter((product) => (
        `${product.name} ${product.sku || ''} ${product.stock}`.toLocaleLowerCase().includes(normalizedSearch)
        && (
            inventoryFilter === 'all'
            || (inventoryFilter === 'low' && product.stock <= lowStockThreshold)
            || (inventoryFilter === 'available' && product.stock > lowStockThreshold)
            || (inventoryFilter === 'out' && product.stock === 0)
        )
    )).sort((productA, productB) => (
        Number(productB.stock <= lowStockThreshold) - Number(productA.stock <= lowStockThreshold)
        || productA.stock - productB.stock
        || productA.name.localeCompare(productB.name)
    ));
    const filteredOrders = orders.filter((order) => {
        const customer = users.find((user) => user.id === order.user_id);
        return `${order.id} ${order.order_number || ''} ${order.status || 'Pending'} ${customer?.username || ''} ${customer?.email || ''}`
            .toLocaleLowerCase()
            .includes(normalizedSearch)
            && (orderStatusFilter === 'all' || (order.status || 'Pending') === orderStatusFilter);
    });
    const filteredCustomers = customers.filter((user) => (
        `${user.username} ${user.email || ''} ${user.phone || ''} ${user.id}`
            .toLocaleLowerCase()
            .includes(normalizedSearch)
    ));
    const filteredProducts = inventory.filter((product) => (
        `${product.name} ${product.sku || ''} ${product.category || ''} ${product.manufacturer || ''}`
            .toLocaleLowerCase()
            .includes(normalizedSearch)
        && (
            productFilter === 'all'
            || (productFilter === 'active' && product.is_active)
            || (productFilter === 'archived' && !product.is_active)
        )
    ));
    const globalSearchCounts = {
        products: inventory.filter((product) => (
            `${product.name} ${product.sku || ''} ${product.category || ''} ${product.manufacturer || ''}`
                .toLocaleLowerCase()
                .includes(normalizedSearch)
        )).length,
        orders: orders.filter((order) => {
            const customer = users.find((user) => user.id === order.user_id);
            return `${order.id} ${order.order_number || ''} ${order.status || 'Pending'} ${customer?.username || ''} ${customer?.email || ''}`
                .toLocaleLowerCase()
                .includes(normalizedSearch);
        }).length,
        customers: customers.filter((user) => (
            `${user.username} ${user.email || ''} ${user.phone || ''} ${user.id}`
                .toLocaleLowerCase()
                .includes(normalizedSearch)
        )).length,
        categories: categories.filter((category) => category.name.toLocaleLowerCase().includes(normalizedSearch)).length,
        reviews: reviews.filter((review) => (
            `${review.product_name} ${review.customer_name} ${review.comment} ${review.rating}`
                .toLocaleLowerCase()
                .includes(normalizedSearch)
        )).length,
    };
    const totalSales = orders.reduce((total, order) => total + Number(order.total_price || 0), 0);
    const monthlyOrders = Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - (5 - index));
        return {
            key: `${date.getFullYear()}-${date.getMonth()}`,
            label: date.toLocaleDateString(undefined, { month: 'short' }),
            total: 0,
        };
    });
    orders.forEach((order) => {
        if (!order.order_date) return;
        const date = new Date(order.order_date);
        const month = monthlyOrders.find((item) => item.key === `${date.getFullYear()}-${date.getMonth()}`);
        if (month) month.total += Number(order.total_price || 0);
    });
    const maxMonthlySales = Math.max(...monthlyOrders.map((month) => month.total), 1);
    const orderStatuses = orders.reduce((statusCounts, order) => {
        const status = order.status || 'Pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
        return statusCounts;
    }, {});
    const statusEntries = Object.entries(orderStatuses).sort(([, countA], [, countB]) => countB - countA);
    const maxStatusCount = Math.max(...statusEntries.map(([, count]) => count), 1);

    let content;
    if (isAuthLoading || access === 'checking' || access === 'loading') {
        content = <Loader />;
    } else if (access === 'signed-out') {
        content = (
            <main className="admin-login-page">
                <form className="admin-login-card" onSubmit={handleLogin}>
                    <p className="admin-eyebrow">QwikMall</p>
                    <h1>Admin sign in</h1>
                    <p className="admin-login-description">Sign in with your admin account to continue.</p>
                    <label htmlFor="admin-identifier">Email or mobile number</label>
                    <input
                        id="admin-identifier"
                        type="text"
                        autoComplete="username"
                        placeholder="Email or mobile number"
                        value={identifier}
                        onChange={(event) => setIdentifier(event.target.value)}
                        required
                    />
                    <label htmlFor="admin-password">Password</label>
                    <input
                        id="admin-password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                    {loginError && <p className="admin-error" role="alert">{loginError}</p>}
                    <button type="submit" disabled={isLoggingIn}>
                        {isLoggingIn ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </main>
        );
    } else if (access === 'forbidden') {
        content = (
            <main className="admin-message">
                <h1>Admin access required</h1>
                <p>This account does not have permission to view the admin dashboard.</p>
                <button className="admin-logout-menu-item" type="button" onClick={handleLogout} disabled={isLoggingOut}>
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </button>
            </main>
        );
    } else if (access === 'error') {
        content = (
            <main className="admin-message" role="alert">
                <h1>Unable to open the admin dashboard</h1>
                <p>{error}</p>
            </main>
        );
    } else {
        content = (
            <div className={`admin-shell${isSidebarCollapsed ? ' admin-shell-collapsed' : ''}${isMobileSidebarOpen ? ' admin-shell-mobile-open' : ''}`}>
                <header className="admin-topbar">
                    <div className="admin-topbar-brand">
                        <button
                            className="admin-icon-button admin-menu-toggle"
                            type="button"
                            aria-label={isMobileSidebarOpen ? 'Close navigation menu' : 'Toggle navigation menu'}
                            aria-expanded={window.matchMedia('(max-width: 800px)').matches ? isMobileSidebarOpen : !isSidebarCollapsed}
                            onClick={() => {
                                if (window.matchMedia('(max-width: 800px)').matches) {
                                    setIsMobileSidebarOpen((isOpen) => !isOpen);
                                } else {
                                    setIsSidebarCollapsed((isCollapsed) => !isCollapsed);
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={isMobileSidebarOpen ? faXmark : faBars} />
                        </button>
                        <a className="admin-brand-link" href="#overview" onClick={(event) => { event.preventDefault(); openAdminSection('overview'); }}>
                            <span className="admin-brand-mark">Q</span>
                            <span>QwikMall<span className="admin-brand-suffix"> Admin</span></span>
                        </a>
                    </div>
                    <button
                        className="admin-icon-button admin-mobile-search-toggle"
                        type="button"
                        aria-label={isMobileSearchOpen ? 'Close search' : 'Open search'}
                        aria-expanded={isMobileSearchOpen}
                        onClick={() => setIsMobileSearchOpen((isOpen) => !isOpen)}
                    >
                        <FontAwesomeIcon icon={isMobileSearchOpen ? faXmark : faMagnifyingGlass} />
                    </button>
                    <div className="admin-global-search-area">
                        <div className={`admin-global-search${isMobileSearchOpen ? ' is-mobile-visible' : ''}`} role="search">
                            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
                            <input
                                type="search"
                                placeholder="Search products, orders, customers, categories, reviews..."
                                aria-label="Search products, orders, customers, categories, and reviews"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                            {searchQuery && (
                                <button type="button" aria-label="Clear search" onClick={() => setSearchQuery('')}>
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            )}
                        </div>
                        {normalizedSearch && activeSection === 'overview' && (
                            <div className="admin-global-search-results" aria-label="Search results">
                                {[
                                    ['products', 'Products', globalSearchCounts.products],
                                    ['orders', 'Orders', globalSearchCounts.orders],
                                    ['customers', 'Customers', globalSearchCounts.customers],
                                    ['categories', 'Categories', globalSearchCounts.categories],
                                    ['reviews', 'Reviews', globalSearchCounts.reviews],
                                ].filter(([, , count]) => count > 0).map(([section, label, count]) => (
                                    <button type="button" key={section} onClick={() => openSearchResults(section)}>
                                        <span>{label}</span><strong>{count} result{count === 1 ? '' : 's'}</strong>
                                    </button>
                                ))}
                                {!globalSearchCounts.products && !globalSearchCounts.orders && !globalSearchCounts.customers
                                    && !globalSearchCounts.categories && !globalSearchCounts.reviews && (
                                    <p>No matching products, orders, customers, categories, or reviews.</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="admin-topbar-actions">
                        <details className="admin-popover">
                            <summary className="admin-icon-button admin-notification-trigger" aria-label={`${lowStockProducts.length + pendingOrders.length} store items need attention`}>
                                <FontAwesomeIcon icon={faBell} />
                                {(lowStockProducts.length + pendingOrders.length) > 0 && (
                                    <span className="admin-notification-badge">{lowStockProducts.length + pendingOrders.length}</span>
                                )}
                            </summary>
                            <div className="admin-popover-panel admin-notifications-panel">
                                <strong>Store notifications</strong>
                                <a href="#inventory" onClick={(event) => { event.preventDefault(); openAdminSection('inventory'); }}>
                                    <span className="admin-notification-dot admin-notification-dot-warning" />
                                    <span><b>{lowStockProducts.length} low-stock items</b><small>Products at {lowStockThreshold} units or fewer</small></span>
                                </a>
                                <a href="#orders" onClick={(event) => { event.preventDefault(); openAdminSection('orders'); }}>
                                    <span className="admin-notification-dot" />
                                    <span><b>{pendingOrders.length} pending orders</b><small>Orders awaiting attention</small></span>
                                </a>
                            </div>
                        </details>
                        <details className="admin-popover admin-profile-popover">
                            <summary className="admin-profile-trigger" aria-label="Admin profile and account menu">
                                <span className="admin-avatar">{(profile?.username || 'A').slice(0, 1).toUpperCase()}</span>
                                <span className="admin-profile-copy">
                                    <strong>{profile?.username || 'Admin'}</strong>
                                    <small>Administrator</small>
                                </span>
                                <FontAwesomeIcon className="admin-profile-chevron" icon={faChevronDown} />
                            </summary>
                            <div className="admin-popover-panel admin-profile-menu">
                                <button type="button" onClick={() => openAdminSection('profile')}><FontAwesomeIcon icon={faUser} /> My Profile</button>
                                <button type="button" onClick={() => openAdminSection('settings')}><FontAwesomeIcon icon={faGear} /> Account Settings</button>
                                <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
                                    <FontAwesomeIcon icon={faRightFromBracket} />
                                    {isLoggingOut ? 'Signing out...' : 'Logout'}
                                </button>
                            </div>
                        </details>
                    </div>
                </header>
                {isMobileSidebarOpen && (
                    <button
                        className="admin-sidebar-backdrop"
                        type="button"
                        aria-label="Close navigation menu"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}
                <aside className="admin-sidebar" aria-label="Admin navigation">
                    <div className="admin-sidebar-section">
                        <span className="admin-sidebar-label">Workspace</span>
                        <a className={activeSection === 'overview' ? 'is-active' : ''} href="#overview" title="Dashboard" onClick={(event) => { event.preventDefault(); openAdminSection('overview'); }}>
                            <FontAwesomeIcon icon={faGaugeHigh} /><span>Dashboard</span>
                        </a>
                    </div>
                    <div className="admin-sidebar-section">
                        <span className="admin-sidebar-label">Manage</span>
                        <a className={activeSection === 'products' ? 'is-active' : ''} href="#products" title="Products" onClick={(event) => { event.preventDefault(); openAdminSection('products'); }}>
                            <FontAwesomeIcon icon={faBox} /><span>Products</span>
                        </a>
                        <a className={activeSection === 'inventory' ? 'is-active' : ''} href="#inventory" title="Inventory" onClick={(event) => { event.preventDefault(); openAdminSection('inventory'); }}>
                            <FontAwesomeIcon icon={faWarehouse} /><span>Inventory</span>
                            {lowStockProducts.length > 0 && <span className="admin-sidebar-count">{lowStockProducts.length}</span>}
                        </a>
                        <a className={activeSection === 'orders' ? 'is-active' : ''} href="#orders" title="Orders" onClick={(event) => { event.preventDefault(); openAdminSection('orders'); }}>
                            <FontAwesomeIcon icon={faBoxOpen} /><span>Orders</span>
                            {pendingOrders.length > 0 && <span className="admin-sidebar-count">{pendingOrders.length}</span>}
                        </a>
                        <a className={activeSection === 'customers' ? 'is-active' : ''} href="#customers" title="Customers" onClick={(event) => { event.preventDefault(); openAdminSection('customers'); }}>
                            <FontAwesomeIcon icon={faUsers} /><span>Customers</span>
                        </a>
                        <a className={activeSection === 'categories' ? 'is-active' : ''} href="#categories" title="Categories" onClick={(event) => { event.preventDefault(); openAdminSection('categories'); }}>
                            <FontAwesomeIcon icon={faTags} /><span>Categories</span>
                        </a>
                        <a className={activeSection === 'reviews' ? 'is-active' : ''} href="#reviews" title="Reviews" onClick={(event) => { event.preventDefault(); openAdminSection('reviews'); }}>
                            <FontAwesomeIcon icon={faStar} /><span>Reviews</span>
                            {reviews.some((review) => !review.is_approved) && <span className="admin-sidebar-count">{reviews.filter((review) => !review.is_approved).length}</span>}
                        </a>
                    </div>
                    <div className="admin-sidebar-section">
                        <span className="admin-sidebar-label">Account</span>
                        <a className={activeSection === 'profile' ? 'is-active' : ''} href="#profile" title="Profile" onClick={(event) => { event.preventDefault(); openAdminSection('profile'); }}>
                            <FontAwesomeIcon icon={faUser} /><span>Profile</span>
                        </a>
                        <a className={activeSection === 'settings' ? 'is-active' : ''} href="#settings" title="Settings" onClick={(event) => { event.preventDefault(); openAdminSection('settings'); }}>
                            <FontAwesomeIcon icon={faSliders} /><span>Settings</span>
                        </a>
                    </div>
                    <div className="admin-sidebar-footer">
                        <FontAwesomeIcon icon={faChartLine} />
                        <span>Store overview and operations</span>
                    </div>
                </aside>
                <main className="admin-dashboard">
                <section className="admin-dashboard-header">
                    <div>
                        <p className="admin-eyebrow">QwikMall management</p>
                        <h1>{{
                            overview: 'Dashboard',
                            customers: 'Customers',
                            orders: 'Orders',
                            inventory: 'Inventory',
                            products: 'Products',
                            categories: 'Categories',
                            reviews: 'Reviews',
                            profile: 'My profile',
                            settings: 'Settings',
                        }[activeSection]}</h1>
                        <p>{activeSection === 'overview' ? `Welcome, ${profile?.username || 'Admin'}. Here is your store at a glance.` : 'Manage your store from one place.'}</p>
                    </div>
                </section>
                {error && <p className="admin-error" role="alert">{error}</p>}
                {activeSection === 'overview' && <>
                <section className="admin-stat-grid" aria-label="Store overview">
                    <article className="admin-stat-card">
                        <span>Gross order value</span>
                        <strong>{totalSales.toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</strong>
                    </article>
                    <article className="admin-stat-card">
                        <span>Total orders</span>
                        <strong>{orders.length}</strong>
                    </article>
                    <article className="admin-stat-card">
                        <span>Customers</span>
                        <strong>{customers.length}</strong>
                    </article>
                    <article className={`admin-stat-card ${lowStockProducts.length ? 'admin-stat-card-warning' : ''}`}>
                        <span>Items at low stock</span>
                        <strong>{lowStockProducts.length}</strong>
                    </article>
                </section>
                <nav className="admin-quick-actions" aria-label="Quick actions">
                    <a href="#inventory" onClick={(event) => { event.preventDefault(); openAdminSection('inventory'); }}>
                        <span>Inventory alerts</span>
                        <strong>{lowStockProducts.length ? `${lowStockProducts.length} need attention` : 'All stock looks good'}</strong>
                    </a>
                    <a href="#orders" onClick={(event) => { event.preventDefault(); openAdminSection('orders'); }}>
                        <span>Order management</span>
                        <strong>{pendingOrders.length} pending orders</strong>
                    </a>
                    <a href="#products" onClick={(event) => { event.preventDefault(); openAdminSection('products'); }}>
                        <span>Product catalog</span>
                        <strong>Add or update products</strong>
                    </a>
                </nav>
                <div className="admin-dashboard-grid">
                    <section className="admin-orders-panel admin-chart-panel">
                        <div className="admin-panel-heading">
                            <div>
                                <h2>Sales overview</h2>
                                <p>Order value by month · last 6 months</p>
                            </div>
                        </div>
                        <div className="admin-sales-chart" role="img" aria-label={`Monthly sales totals: ${monthlyOrders.map((month) => `${month.label} ${month.total.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}`).join(', ')}`}>
                            {monthlyOrders.map((month) => (
                                <div className="admin-sales-month" key={month.key}>
                                    <strong>{month.total.toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</strong>
                                    <div className="admin-sales-track">
                                        <span style={{ height: `${Math.max((month.total / maxMonthlySales) * 100, 5)}%` }} />
                                    </div>
                                    <span className="admin-sales-label">{month.label}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section className="admin-orders-panel admin-chart-panel">
                        <div className="admin-panel-heading">
                            <div>
                                <h2>Order status</h2>
                                <p>{orders.length} orders across all statuses</p>
                            </div>
                        </div>
                        {statusEntries.length ? (
                            <div className="admin-status-chart">
                                {statusEntries.map(([status, count]) => (
                                    <div className="admin-status-row" key={status}>
                                        <div><span>{status}</span><strong>{count}</strong></div>
                                        <div className="admin-status-track">
                                            <span style={{ width: `${(count / maxStatusCount) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="admin-empty-state">Order status data will appear here when orders arrive.</p>
                        )}
                    </section>
                </div>
                </>}
                {activeSection === 'inventory' && <section className="admin-orders-panel admin-inventory-panel">
                    <div className="admin-panel-heading">
                        <div>
                            <h2>Inventory</h2>
                            <p>Low stock is {lowStockThreshold} units or fewer. Update on-hand quantities here.</p>
                        </div>
                        <span className={lowStockProducts.length ? 'admin-alert-count' : 'admin-stock-ok'}>
                            {lowStockProducts.length ? `${lowStockProducts.length} low` : 'All stocked'}
                        </span>
                    </div>
                    <div className="admin-section-toolbar">
                        <select aria-label="Filter inventory by stock" value={inventoryFilter} onChange={(event) => setInventoryFilter(event.target.value)}>
                            <option value="all">All stock levels</option>
                            <option value="low">Low stock</option>
                            <option value="out">Out of stock</option>
                            <option value="available">Above threshold</option>
                        </select>
                        <span>{filteredInventory.length} products</span>
                    </div>
                    {!inventory.length ? (
                        <p className="admin-empty-state">No products are in the catalog yet.</p>
                    ) : (
                        <div className="admin-inventory-list">
                            {filteredInventory.length ? filteredInventory.map((product) => {
                                const isUpdating = updatingStockIds.includes(product.id);
                                const stockValue = stockDrafts[product.id] ?? String(product.stock);
                                return (
                                    <div className="admin-inventory-item" key={product.id}>
                                        <div>
                                            <strong>{product.name}</strong>
                                            <span className={product.stock <= lowStockThreshold ? 'admin-stock-warning' : 'admin-stock-available'}>
                                                {product.stock === 0 ? 'Out of stock' : product.stock <= lowStockThreshold ? 'Low stock' : 'In stock'} · {product.stock} {product.stock === 1 ? 'unit' : 'units'}
                                            </span>
                                        </div>
                                        <div className="admin-stock-controls" aria-label={`Adjust stock for ${product.name}`}>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                aria-label={`On-hand quantity for ${product.name}`}
                                                value={stockValue}
                                                onChange={(event) => setStockDrafts((currentDrafts) => ({
                                                    ...currentDrafts,
                                                    [product.id]: event.target.value,
                                                }))}
                                                disabled={isUpdating}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => saveStock(product)}
                                                disabled={isUpdating || !stockValue.trim() || Number(stockValue) === product.stock}
                                            >
                                                {isUpdating ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            }) : <p className="admin-empty-state">{normalizedSearch ? 'No inventory matches your search.' : 'No products are in the catalog yet.'}</p>}
                        </div>
                    )}
                    <p className="admin-inventory-note">Existing products start at 0 units until their on-hand quantities are recorded.</p>
                </section>}
                {activeSection === 'orders' && <section className="admin-orders-panel">
                    <div className="admin-panel-heading">
                        <h2>Orders</h2>
                        <span>{filteredOrders.length} matching orders</span>
                    </div>
                    <div className="admin-section-toolbar">
                        <select aria-label="Filter orders by status" value={orderStatusFilter} onChange={(event) => setOrderStatusFilter(event.target.value)}>
                            <option value="all">All statuses</option>
                            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Failed'].map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>
                    {filteredOrders.length ? (
                        <div className="admin-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Status / update</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.slice(0, 10).map((order) => (
                                        <tr key={order.id}>
                                            <td>{order.order_number || `#${order.id}`}</td>
                                            <td>{users.find((user) => user.id === order.user_id)?.username || `Customer #${order.user_id}`}</td>
                                            <td>{order.order_date ? new Date(order.order_date).toLocaleDateString() : '—'}</td>
                                            <td className="admin-order-status-cell">
                                                <select
                                                    aria-label={`Status for order ${order.order_number || order.id}`}
                                                    value={orderStatusDrafts[order.id] || order.status || 'Pending'}
                                                    onChange={(event) => setOrderStatusDrafts((drafts) => ({ ...drafts, [order.id]: event.target.value }))}
                                                    disabled={updatingOrderIds.includes(order.id) || ['Cancelled', 'Failed'].includes(order.status)}
                                                >
                                                    {['Pending', 'Processing', 'Shipped', 'Delivered', ...( ['Pending', 'Processing'].includes(order.status || 'Pending') ? ['Cancelled', 'Failed'] : [])].map((status) => <option key={status} value={status}>{status}</option>)}
                                                </select>
                                                <button type="button" className="admin-small-action" onClick={() => updateOrderStatus(order)} disabled={updatingOrderIds.includes(order.id) || (orderStatusDrafts[order.id] || order.status || 'Pending') === (order.status || 'Pending')}>
                                                    {updatingOrderIds.includes(order.id) ? 'Saving' : 'Save'}
                                                </button>
                                            </td>
                                            <td>{Number(order.total_price || 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="admin-empty-state">{normalizedSearch ? 'No orders match your search.' : 'There are no orders yet.'}</p>
                    )}
                </section>}
                {activeSection === 'customers' && <section className="admin-orders-panel admin-customers-panel">
                    <div className="admin-panel-heading">
                        <div>
                            <h2>Customers</h2>
                            <p>{filteredCustomers.length} customers</p>
                        </div>
                    </div>
                    {filteredCustomers.length ? (
                        <div className="admin-table-wrap">
                            <table>
                                <thead>
                                    <tr><th>Customer</th><th>Email</th><th>Phone</th><th>Customer ID</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer.id}>
                                            <td>{customer.username}</td>
                                            <td>{customer.email || '—'}</td>
                                            <td>{customer.phone || '—'}</td>
                                            <td>#{customer.id}</td>
                                            <td><button type="button" className="admin-small-action" onClick={() => loadCustomerDetails(customer.id)}>View details</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="admin-empty-state">{normalizedSearch ? 'No customers match your search.' : 'No customers have registered yet.'}</p>
                    )}
                    {customerDetails && (
                        <aside className="admin-customer-detail">
                            <div className="admin-panel-heading">
                                <h3>Customer details</h3>
                                <button type="button" className="admin-small-action" onClick={() => setCustomerDetails(null)}>Close</button>
                            </div>
                            <dl>
                                <div><dt>Name</dt><dd>{customerDetails.username}</dd></div>
                                <div><dt>Email</dt><dd>{customerDetails.email || 'Not provided'}</dd></div>
                                <div><dt>Phone</dt><dd>{customerDetails.phone || 'Not provided'}</dd></div>
                                <div><dt>Customer ID</dt><dd>#{customerDetails.id}</dd></div>
                            </dl>
                        </aside>
                    )}
                </section>}
                {activeSection === 'products' && <section className="admin-section-stack">
                    <form className="admin-orders-panel admin-management-form" onSubmit={saveProduct}>
                        <div className="admin-panel-heading">
                            <div>
                                <h2>{editingProductId ? 'Edit product' : 'Add a product'}</h2>
                                <p>Create and maintain your product catalog.</p>
                            </div>
                            {editingProductId && <button type="button" className="admin-secondary-action" onClick={() => {
                                setEditingProductId(null);
                                setProductForm(EMPTY_PRODUCT_FORM);
                                setExistingProductImages([]);
                                setSelectedImageFiles([]);
                                if (productImagesInputRef.current) productImagesInputRef.current.value = '';
                            }}>Cancel edit</button>}
                        </div>
                        <div className="admin-form-grid">
                            <label>Product name<input required maxLength="50" value={productForm.name} onChange={(event) => setProductForm((form) => ({ ...form, name: event.target.value }))} /></label>
                            <label>SKU<input maxLength="64" value={productForm.sku} onChange={(event) => setProductForm((form) => ({ ...form, sku: event.target.value }))} /></label>
                            <label>Manufacturer<input required maxLength="50" value={productForm.manufacturer} onChange={(event) => setProductForm((form) => ({ ...form, manufacturer: event.target.value }))} /></label>
                            <label>Brand<input maxLength="50" value={productForm.brand} onChange={(event) => setProductForm((form) => ({ ...form, brand: event.target.value }))} /></label>
                            <label>Category<input required maxLength="50" list="admin-product-categories" value={productForm.category} onChange={(event) => setProductForm((form) => ({ ...form, category: event.target.value }))} />
                                <datalist id="admin-product-categories">
                                    {[...new Set(inventory.map((product) => product.category).filter(Boolean))].map((category) => <option key={category} value={category} />)}
                                </datalist>
                            </label>
                            <label>Price (INR)<input required min="0.01" step="0.01" type="number" value={productForm.price} onChange={(event) => setProductForm((form) => ({ ...form, price: event.target.value }))} /></label>
                            <label>Opening stock<input required min="0" step="1" type="number" value={productForm.stock} onChange={(event) => setProductForm((form) => ({ ...form, stock: event.target.value }))} /></label>
                            <label className="admin-form-full-width">Description<textarea required maxLength="2000" rows="4" value={productForm.description} onChange={(event) => setProductForm((form) => ({ ...form, description: event.target.value }))} /></label>
                            <label className="admin-form-full-width admin-image-upload">
                                Product images
                                <input
                                    ref={productImagesInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    multiple
                                    onChange={(event) => {
                                        const files = Array.from(event.target.files || []);
                                        const combinedFiles = [...selectedImageFiles, ...files];
                                        if (existingProductImages.length + combinedFiles.length > 10) {
                                            setError('A product can have up to 10 images.');
                                            event.target.value = '';
                                            return;
                                        }
                                        if (files.some((file) => file.size > 5 * 1024 * 1024)) {
                                            setError('Each product image must be 5 MB or smaller.');
                                            event.target.value = '';
                                            return;
                                        }
                                        setError('');
                                        setSelectedImageFiles(combinedFiles);
                                        event.target.value = '';
                                    }}
                                />
                                <small>Choose up to 10 JPG, PNG, WEBP, or GIF files (5 MB each). Stored in backend/app/static/images/products/.</small>
                            </label>
                        </div>
                        {(existingProductImages.length > 0 || selectedImageFiles.length > 0) && <div className="admin-product-images">
                            {existingProductImages.map((image) => (
                                <div className="admin-product-image" key={image.id}>
                                    <img src={image.image_url} alt="Current product" />
                                    <button type="button" aria-label="Remove current image" onClick={() => setExistingProductImages((images) => images.filter((item) => item.id !== image.id))}>Remove</button>
                                </div>
                            ))}
                            {selectedImageFiles.map((file) => (
                                <div className="admin-product-image admin-product-image-file" key={`${file.name}-${file.lastModified}`}>
                                    <span>{file.name}</span>
                                    <button type="button" aria-label={`Remove ${file.name}`} onClick={() => {
                                        setSelectedImageFiles((files) => files.filter((item) => item !== file));
                                        if (productImagesInputRef.current) productImagesInputRef.current.value = '';
                                    }}>Remove</button>
                                </div>
                            ))}
                        </div>}
                        <button className="admin-primary-action" type="submit" disabled={isSavingProduct}>
                            <FontAwesomeIcon icon={faPlus} /> {isSavingProduct ? 'Saving...' : editingProductId ? 'Save changes' : 'Add product'}
                        </button>
                    </form>
                    <section className="admin-orders-panel">
                        <div className="admin-panel-heading">
                            <div><h2>Product catalog</h2><p>{filteredProducts.length} products</p></div>
                            <select aria-label="Filter products" value={productFilter} onChange={(event) => setProductFilter(event.target.value)}>
                                <option value="active">Active</option><option value="archived">Archived</option><option value="all">All products</option>
                            </select>
                        </div>
                        {filteredProducts.length ? (
                            <div className="admin-table-wrap">
                                <table>
                                    <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {filteredProducts.map((product) => (
                                            <tr key={product.id}>
                                                <td>{product.name}</td>
                                                <td>{product.sku || '—'}</td>
                                                <td>{product.category || '—'}</td>
                                                <td>{Number(product.price || 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}</td>
                                                <td>{product.stock}</td>
                                                <td>{product.is_active ? 'Active' : 'Archived'}</td>
                                                <td className="admin-table-actions">
                                                    <button type="button" className="admin-small-action" onClick={() => {
                                                        setEditingProductId(product.id);
                                                        setProductForm({
                                                            name: product.name || '',
                                                            sku: product.sku || '',
                                                            manufacturer: product.manufacturer || '',
                                                            brand: product.brand || '',
                                                            description: product.description || '',
                                                            price: String(product.price || ''),
                                                            category: product.category || '',
                                                            stock: String(product.stock ?? 0),
                                                        });
                                                        setExistingProductImages(product.images || []);
                                                        setSelectedImageFiles([]);
                                                        if (productImagesInputRef.current) productImagesInputRef.current.value = '';
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}>Edit</button>
                                                    <button type="button" className="admin-small-action" onClick={() => toggleProductAvailability(product)}>
                                                        {product.is_active ? 'Archive' : 'Restore'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="admin-empty-state">{normalizedSearch ? 'No products match your search.' : 'No products in this view.'}</p>}
                    </section>
                </section>}
                {activeSection === 'profile' && <form className="admin-orders-panel admin-management-form admin-profile-form" onSubmit={saveProfile}>
                    <div className="admin-panel-heading">
                        <div><h2>Administrator profile</h2><p>Update the name and contact details shown on your account.</p></div>
                    </div>
                    <div className="admin-form-grid">
                        <label>Full name<input required maxLength="100" value={profileDraft.username} onChange={(event) => setProfileDraft((draft) => ({ ...draft, username: event.target.value }))} /></label>
                        <label>Email address<input type="email" maxLength="100" value={profileDraft.email || ''} onChange={(event) => setProfileDraft((draft) => ({ ...draft, email: event.target.value }))} /></label>
                        <label>Phone number<input required maxLength="20" value={profileDraft.phone} onChange={(event) => setProfileDraft((draft) => ({ ...draft, phone: event.target.value }))} /></label>
                        <label>Role<input value="Administrator" disabled /></label>
                    </div>
                    <button className="admin-primary-action" type="submit" disabled={isSavingProfile}>{isSavingProfile ? 'Saving...' : 'Save profile'}</button>
                </form>}
                {activeSection === 'categories' && <AdminCategories request={fetchAdminData} searchQuery={searchQuery} categories={categories} onCategoriesChange={setCategories} />}
                {activeSection === 'reviews' && <AdminReviews request={fetchAdminData} searchQuery={searchQuery} reviews={reviews} onReviewsChange={setReviews} />}
                {activeSection === 'settings' && <AdminSettings
                    request={fetchAdminData}
                    profile={profile}
                    initialSettings={storeSettings}
                    onSettingsChange={(settings) => {
                        setStoreSettings(settings);
                        setLowStockThreshold(settings.account.low_stock_threshold);
                    }}
                />}
                </main>
            </div>
        );
    }

    return content;
}

export default AdminPage;
