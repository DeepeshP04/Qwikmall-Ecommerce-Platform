import CartItem from "../components/cart/CartItem";
import CartItemList from "../components/cart/CartItemList";
import Footer from "../components/footer/Footer";
import Navbar from "../components/header/Navbar";

function Cart () {
    return (
        <>
            <Navbar></Navbar>
            <CartItemList></CartItemList>
            <Footer></Footer>
        </>
    )
}

export default Cart;