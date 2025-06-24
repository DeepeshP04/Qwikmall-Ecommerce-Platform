import CartContainer from '../components/cart/CartContainer';
import Footer from "../components/footer/Footer";
import Navbar from "../components/header/Navbar";

function Cart () {
    return (
        <>
            <Navbar></Navbar>
            <CartContainer></CartContainer>
            <Footer></Footer>
        </>
    )
}

export default Cart;