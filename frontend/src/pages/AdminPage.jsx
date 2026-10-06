import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import Loader from '../components/loader/Loader';
import './AdminPage.css';

async function fetchAdminData(path) {
    const response = await fetch(`http://localhost:5000/admin/${path}`, {
        credentials: 'include',
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

                const [adminUsers, adminOrders] = await Promise.all([
                    fetchAdminData('users'),
                    fetchAdminData('orders'),
                ]);
                if (isMounted) {
                    setUsers(adminUsers);
                    setOrders(adminOrders);
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
                        <span>Total customers</span>
                        <strong>{users.length}</strong>
                    </article>
                    <article className="admin-stat-card">
                        <span>Total orders</span>
                        <strong>{orders.length}</strong>
                    </article>
                    <article className="admin-stat-card">
                        <span>Admin account</span>
                        <strong>{profile?.username || 'Admin'}</strong>
                    </article>
                </section>
                <section className="admin-orders-panel">
                    <h2>Recent orders</h2>
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
