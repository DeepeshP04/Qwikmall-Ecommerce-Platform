import CartItem from "../components/cart/CartItem";
import Footer from "../components/footer/Footer";
import Navbar from "../components/header/Navbar";

function Cart () {
    return (
        <>
            <Navbar></Navbar>
            <CartItem></CartItem>
            <Footer></Footer>
        </>
    )
}

export default Cart;