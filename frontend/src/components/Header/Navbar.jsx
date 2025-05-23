import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping, faMagnifyingGlass, faUser, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { faSellcast } from '@fortawesome/free-brands-svg-icons'
import './Navbar.css'
import { useState } from 'react'

function Navbar (){

    const [isMenuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen(!isMenuOpen);

    return (
        <div className="navbar">
            <div className="brand-space">
                <a className='brand'>Qwikmall</a>
            </div>
            <form className="search-bar" method="GET">
                <input id="search-input" type="search" name="query" placeholder="Search for products..."/>
                <button id="search-btn" type="submit"><FontAwesomeIcon icon={faMagnifyingGlass} /></button>
            </form>
            <div className='nav-actions'>
                <div className="login-space">
                    <FontAwesomeIcon icon={faUser} />
                    <a className='login'>Login</a>
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
            <button className='nav-actions-toggle' onClick={toggleMenu}>☰</button>
        </div>

        // Implement toggleMenu function to toggle nav-actions in mobile
    )
}

export default Navbar;