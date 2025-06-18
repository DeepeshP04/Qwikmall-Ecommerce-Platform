import CartItem from "./CartItem";
import './CartItemList.css'

function CartItemList ({cartItems}) {
    return (
        <div className="container">
            {cartItems.map(cartItem => <CartItem key={cartItem.id} cartItem={cartItem}></CartItem>)}
        </div>
    )
}

export default CartItemList;