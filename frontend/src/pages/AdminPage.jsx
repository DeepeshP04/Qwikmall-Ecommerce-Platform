import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import Loader from '../components/loader/Loader';
import './AdminPage.css';

const LOW_STOCK_THRESHOLD = 5;

async function fetchAdminData(path, options = {}) {
    const response = await fetch(`http://localhost:5000/admin/${path}`, {
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
    const [stockDrafts, setStockDrafts] = useState({});
    const [updatingStockIds, setUpdatingStockIds] = useState([]);
    const [error, setError] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
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
                setAccess('loading');

                const [adminUsers, adminOrders, adminInventory] = await Promise.all([
                    fetchAdminData('users'),
                    fetchAdminData('orders'),
                    fetchAdminData('inventory'),
                ]);
                if (isMounted) {
                    setUsers(adminUsers);
                    setOrders(adminOrders);
                    setInventory(adminInventory);
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
            const response = await fetch('http://localhost:5000/admin/login', {
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
            const response = await fetch('http://localhost:5000/auth/logout', {
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

    const lowStockProducts = inventory.filter((product) => product.stock <= LOW_STOCK_THRESHOLD);
    const orderedInventory = [...inventory].sort((productA, productB) => (
        Number(productB.stock <= LOW_STOCK_THRESHOLD) - Number(productA.stock <= LOW_STOCK_THRESHOLD)
        || productA.stock - productB.stock
        || productA.name.localeCompare(productB.name)
    ));
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
                <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
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
            <main className="admin-dashboard">
                <header className="admin-dashboard-header">
                    <div>
                        <p className="admin-eyebrow">QwikMall management</p>
                        <h1>Admin dashboard</h1>
                        <p>Welcome, {profile?.username || 'Admin'}.</p>
                    </div>
                    <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
                        {isLoggingOut ? 'Signing out...' : 'Sign out'}
                    </button>
                </header>
                {error && <p className="admin-error" role="alert">{error}</p>}
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
                        <strong>{users.length}</strong>
                    </article>
                    <article className={`admin-stat-card ${lowStockProducts.length ? 'admin-stat-card-warning' : ''}`}>
                        <span>Items at low stock</span>
                        <strong>{lowStockProducts.length}</strong>
                    </article>
                </section>
                <nav className="admin-quick-actions" aria-label="Quick actions">
                    <a href="#inventory">
                        <span>Inventory alerts</span>
                        <strong>{lowStockProducts.length ? `${lowStockProducts.length} need attention` : 'All stock looks good'}</strong>
                    </a>
                    <a href="#orders">
                        <span>Order management</span>
                        <strong>{orders.filter((order) => (order.status || 'Pending').toLowerCase() === 'pending').length} pending orders</strong>
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
                <section className="admin-orders-panel admin-inventory-panel" id="inventory">
                    <div className="admin-panel-heading">
                        <div>
                            <h2>Inventory</h2>
                            <p>Low stock is 5 units or fewer. Update on-hand quantities here.</p>
                        </div>
                        <span className={lowStockProducts.length ? 'admin-alert-count' : 'admin-stock-ok'}>
                            {lowStockProducts.length ? `${lowStockProducts.length} low` : 'All stocked'}
                        </span>
                    </div>
                    {!inventory.length ? (
                        <p className="admin-empty-state">No products are in the catalog yet.</p>
                    ) : (
                        <div className="admin-inventory-list">
                            {orderedInventory.map((product) => {
                                const isUpdating = updatingStockIds.includes(product.id);
                                const stockValue = stockDrafts[product.id] ?? String(product.stock);
                                return (
                                    <div className="admin-inventory-item" key={product.id}>
                                        <div>
                                            <strong>{product.name}</strong>
                                            <span className={product.stock <= LOW_STOCK_THRESHOLD ? 'admin-stock-warning' : 'admin-stock-available'}>
                                                {product.stock === 0 ? 'Out of stock' : product.stock <= LOW_STOCK_THRESHOLD ? 'Low stock' : 'In stock'} · {product.stock} {product.stock === 1 ? 'unit' : 'units'}
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
                            })}
                        </div>
                    )}
                    <p className="admin-inventory-note">Existing products start at 0 units until their on-hand quantities are recorded.</p>
                </section>
                <section className="admin-orders-panel" id="orders">
                    <div className="admin-panel-heading">
                        <h2>Recent orders</h2>
                        <a href="#orders">View all {orders.length} orders</a>
                    </div>
                    {orders.length ? (
                        <div className="admin-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.slice(0, 10).map((order) => (
                                        <tr key={order.id}>
                                            <td>#{order.id}</td>
                                            <td>{users.find((user) => user.id === order.user_id)?.username || `Customer #${order.user_id}`}</td>
                                            <td>{order.order_date ? new Date(order.order_date).toLocaleDateString() : '—'}</td>
                                            <td>{order.status || 'Pending'}</td>
                                            <td>{Number(order.total_price || 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="admin-empty-state">There are no orders yet.</p>
                    )}
                </section>
            </main>
        );
    }

    return content;
}

export default AdminPage;
