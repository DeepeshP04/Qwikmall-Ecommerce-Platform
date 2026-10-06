import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping, faMagnifyingGlass, faUser, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { faSellcast } from '@fortawesome/free-brands-svg-icons'
import './Navbar.css'
import { useCallback, useEffect, useState, useRef } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../../App'

function Navbar (){

    const [isMenuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen(!isMenuOpen);
    const { isLoggedIn } = useContext(AuthContext)
    const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
    const accountRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [cartItemCount, setCartItemCount] = useState(0);
    const navigate = useNavigate();

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (accountRef.current && !accountRef.current.contains(event.target)) {
                setAccountDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchCartCount = useCallback(async () => {
        if (!isLoggedIn) {
            setCartItemCount(0);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/cart/', {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok && data.success) {
                const items = data.data?.items || data.data?.cart_items || [];
                setCartItemCount(items.reduce((total, item) => total + Number(item.quantity || 0), 0));
            } else if (response.status === 404) {
                setCartItemCount(0);
            } else {
                console.error('Unable to load cart item count:', data.message || response.statusText);
            }
        } catch (error) {
            console.error('Unable to load cart item count:', error);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        fetchCartCount();
    }, [fetchCartCount]);

    useEffect(() => {
        const handleCartUpdated = () => fetchCartCount();
        window.addEventListener('cartUpdated', handleCartUpdated);
        return () => window.removeEventListener('cartUpdated', handleCartUpdated);
    }, [fetchCartCount]);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/products?query=${searchQuery}`);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 850) {
                setMenuOpen(false)
            }
        }
        window.addEventListener("resize", handleResize)
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
        <div className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
            <div className="brand-space">
                <a href="/" className='brand'>Qwikmall</a>
            </div>
            <form className="search-bar" method="GET" onSubmit={handleSearch}>
                <input id="search-input" type="search" name="query" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for products..."/>
                <button id="search-btn" type="submit"><FontAwesomeIcon icon={faMagnifyingGlass} /></button>
            </form>
            <div className="nav-actions">
                <div 
                    className="login-space account-dropdown-container"
                    ref={accountRef}
                    onMouseEnter={() => !isLoggedIn && setAccountDropdownOpen(true)}
                    onMouseLeave={() => setAccountDropdownOpen(false)}
                    tabIndex={0}
                    onBlur={() => setAccountDropdownOpen(false)}
                >
                    <FontAwesomeIcon icon={faUser} />
                    <Link to={isLoggedIn ? "/account" : "/login"} className="account-label">
                        {isLoggedIn ? 'Account' : 'Login'}
                    </Link>
                    {!isLoggedIn && (
                        <span
                            className={`arrow ${accountDropdownOpen ? 'open' : ''}`}
                            onClick={() => setAccountDropdownOpen((open) => !open)}
                            style={{ cursor: 'pointer' }}
                        >
                            <FontAwesomeIcon icon={faAngleDown} />
                        </span>
                    )}
                    {!isLoggedIn && accountDropdownOpen && (
                        <div className="account-dropdown-menu">
                            <Link className="dropdown-item" to="/signup" onClick={() => setAccountDropdownOpen(false)}>
                                New Customer? <span className='signup-span'>Sign Up</span>
                            </Link>
                        </div>
                    )}
                </div>
                <CartNavLink itemCount={cartItemCount} />
                <div className="seller-space">
                    <FontAwesomeIcon icon={faSellcast} />
                    <a className='become-seller'>Become a Seller</a>
                </div>
            </div>

            {/* Implement toggleMenu function to toggle nav-actions in mobile */}
            <button className='nav-actions-toggle' onClick={toggleMenu}>☰</button>
        </div>

        {isMenuOpen ? 
            (<div className="mobile-nav-actions">
                <div className="login-space account-dropdown-container"
                    ref={accountRef}
                    onClick={() => !isLoggedIn && setAccountDropdownOpen((open) => !open)}
                    tabIndex={0}
                    onBlur={() => setAccountDropdownOpen(false)}
                >
                    <FontAwesomeIcon icon={faUser} />
                    <Link to={isLoggedIn ? "/account" : "/login"} className="account-label">
                        {isLoggedIn ? 'Account' : 'Login'}
                    </Link>
                    {!isLoggedIn && (
                        <span className={`arrow ${accountDropdownOpen ? 'open' : ''}`}>
                            <FontAwesomeIcon icon={faAngleDown} />
                        </span>
                    )}
                    {!isLoggedIn && accountDropdownOpen && (
                        <div className="account-dropdown-menu">
                            <Link className="dropdown-item" to="/signup" onClick={() => setAccountDropdownOpen(false)}>Sign Up</Link>
                        </div>
                    )}
                </div>
                <div className="cart-space">
                    <FontAwesomeIcon icon={faCartShopping} />
                    <Link to="/cart" className='cart'>Cart</Link>
                    {isLoggedIn && cartItemCount > 0 && (
                        <span className="cart-badge" aria-label={`${cartItemCount} items in cart`}>
                            {cartItemCount > 99 ? '99+' : cartItemCount}
                        </span>
                    )}
                </div>
                <div className="seller-space">
                    <FontAwesomeIcon icon={faSellcast} />
                    <a className='become-seller'>Become a Seller</a>
                </div>
            </div>) 
            : ""}
        </>
    )
}

function CartNavLink({ itemCount }) {
    const { isLoggedIn } = useContext(AuthContext);
    return (
        <div className="cart-space">
            <FontAwesomeIcon icon={faCartShopping} />
            <Link to="/cart" className='cart'>Cart</Link>
            {isLoggedIn && itemCount > 0 && (
                <span className="cart-badge" aria-label={`${itemCount} items in cart`}>
                    {itemCount > 99 ? '99+' : itemCount}
                </span>
            )}
        </div>
    );
}

export default Navbar;