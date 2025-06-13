import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping, faMagnifyingGlass, faUser, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { faSellcast } from '@fortawesome/free-brands-svg-icons'
import './Navbar.css'
import { useEffect, useState } from 'react'
import {Link} from 'react-router-dom'

function Navbar (){

    const [isMenuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen(!isMenuOpen);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 850) {
                setMenuOpen(false)
            }
        }
        window.addEventListener("resize", handleResize)
    }, [])

    return (
        <div className="navbar">
            <div className="brand-space">
                <a className='brand'>Qwikmall</a>
            </div>
            <form className="search-bar" method="GET">
                <input id="search-input" type="search" name="query" placeholder="Search for products..."/>
                <button id="search-btn" type="submit"><FontAwesomeIcon icon={faMagnifyingGlass} /></button>
            </form>
            <div className="nav-actions">
                <div className="login-space">
                    <FontAwesomeIcon icon={faUser} />
                    <Link to="/login" className="login">Login</Link>
                    <FontAwesomeIcon icon={faAngleDown} />
                    {/* Implement functionality to click angledown button to choose login or signup */}
                </div>
                <div className="cart-space">
                    <FontAwesomeIcon icon={faCartShopping} />
                    <a className='cart'>Cart</a>
                </div>
                <div className="seller-space">
                    <FontAwesomeIcon icon={faSellcast} />
                    <a className='become-seller'>Become a Seller</a>
                </div>
            </div>

            {/* Implement toggleMenu function to toggle nav-actions in mobile */}
            <button className='nav-actions-toggle' onClick={toggleMenu}>☰</button>

            {isMenuOpen ? (<div className="mobile-nav-actions">
                <div className="login-space">
                    <FontAwesomeIcon icon={faUser} />
                    <Link to="/login" className="login">Login</Link>
                    <FontAwesomeIcon icon={faAngleDown} />
                    {/* Implement functionality to click angledown button to choose login or signup */}
                </div>
                <div className="cart-space">
                    <FontAwesomeIcon icon={faCartShopping} />
                    <a className='cart'>Cart</a>
                </div>
                <div className="seller-space">
                    <FontAwesomeIcon icon={faSellcast} />
                    <a className='become-seller'>Become a Seller</a>
                </div>
            </div>) : ""}
        </div>
    )
}

export default Navbar;