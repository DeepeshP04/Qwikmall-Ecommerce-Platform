function Navbar (){
    return (
        <div className="navbar">
            <div className="brand">
                <p>Qwikmall</p>
            </div>
            <form className="search-bar" method="GET">
                <input type="search" name="query" placeholder="Search for products..."/>
                <button type="submit"></button>
            </form>
            <div className="login-space"></div>
            <div className="cart"></div>
            <div className="seller"></div>
        </div>
    )
}

export default Navbar;