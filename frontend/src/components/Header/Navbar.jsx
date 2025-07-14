import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping, faMagnifyingGlass, faUser, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { faSellcast } from '@fortawesome/free-brands-svg-icons'
import './Navbar.css'
import { useEffect, useState, useRef } from 'react'
import {Link} from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../../App'

function Navbar (){

    const [isMenuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen(!isMenuOpen);
    const { isLoggedIn } = useContext(AuthContext)
    const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
    const accountRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);

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

    // Handlers for dropdown actions (stub)
    const goToSignup = () => { window.location.href = '/signup'; };
    const goToAccount = () => { window.location.href = '/account'; };
    const goToOrders = () => { window.location.href = '/orders'; };
    const logout = () => { /* Implement logout logic */ };

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
            <form className="search-bar" method="GET">
                <input id="search-input" type="search" name="query" placeholder="Search for products..."/>
                <button id="search-btn" type="submit"><FontAwesomeIcon icon={faMagnifyingGlass} /></button>
            </form>
            <div className="nav-actions">
                <div 
                    className="login-space account-dropdown-container"
                    ref={accountRef}
                    onMouseEnter={() => setAccountDropdownOpen(true)}
                    onMouseLeave={() => setAccountDropdownOpen(false)}
                    tabIndex={0}
                    onBlur={() => setAccountDropdownOpen(false)}
                >
                    <FontAwesomeIcon icon={faUser} />
                    <span className="account-label">{isLoggedIn ? 'Account' : 'Login'}</span>
                    <span
                        className={`arrow ${accountDropdownOpen ? 'open' : ''}`}
                        onClick={() => setAccountDropdownOpen((open) => !open)}
                        style={{ cursor: 'pointer' }}
                    >
                        <FontAwesomeIcon icon={faAngleDown} />
                    </span>
                    {accountDropdownOpen && (
                        <div className="account-dropdown-menu">
                            {!isLoggedIn ? (
                                <button className="dropdown-item" onClick={goToSignup}>Sign Up</button>
                            ) : (
                                <>
                                    <button className="dropdown-item" onClick={goToAccount}>Account</button>
                                    <button className="dropdown-item" onClick={goToOrders}>Orders</button>
                                    <button className="dropdown-item" onClick={logout}>Logout</button>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div className="cart-space">
                    <FontAwesomeIcon icon={faCartShopping} />
                    <Link to="/cart" className='cart'>Cart</Link>
                </div>
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
                    onClick={() => setAccountDropdownOpen((open) => !open)}
                    tabIndex={0}
                    onBlur={() => setAccountDropdownOpen(false)}
                >
                    <FontAwesomeIcon icon={faUser} />
                    <span className="account-label">{isLoggedIn ? 'Account' : 'Login'}</span>
                    <span className={`arrow ${accountDropdownOpen ? 'open' : ''}`}> <FontAwesomeIcon icon={faAngleDown} /> </span>
                    {accountDropdownOpen && (
                        <div className="account-dropdown-menu">
                            {!isLoggedIn ? (
                                <button className="dropdown-item" onClick={goToSignup}>Sign Up</button>
                            ) : (
                                <>
                                    <button className="dropdown-item" onClick={goToAccount}>Account</button>
                                    <button className="dropdown-item" onClick={goToOrders}>Orders</button>
                                    <button className="dropdown-item" onClick={logout}>Logout</button>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div className="cart-space">
                    <FontAwesomeIcon icon={faCartShopping} />
                    <a className='cart'>Cart</a>
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

export default Navbar;