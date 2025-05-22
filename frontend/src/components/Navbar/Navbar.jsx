import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping, faMagnifyingGlass, faUser, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { faSellcast } from '@fortawesome/free-brands-svg-icons'
import './Navbar.css'

function Navbar (){
    return (
        <div className="navbar">
            <div className="brand">
                <a>Qwikmall</a>
            </div>
            <form className="search-bar" method="GET">
                <input type="search" name="query" placeholder="Search for products..."/>
                <button type="submit"><FontAwesomeIcon icon={faMagnifyingGlass} /></button>
            </form>
            <div className="login-space">
                <FontAwesomeIcon icon={faUser} />
                <p>Login</p>
                <FontAwesomeIcon icon={faAngleDown} />
            </div>
            <div className="cart">
                <FontAwesomeIcon icon={faCartShopping} />
                <p>Cart</p>
            </div>
            <div className="seller">
                <FontAwesomeIcon icon={faSellcast} />
                <p>Become a Seller</p>
            </div>
        </div>
    )
}

export default Navbar;