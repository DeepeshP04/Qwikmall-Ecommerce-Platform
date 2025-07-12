import CartItem from "./CartItem";
import './CartItemList.css'

function CartItemList ({cartItems}) {
    return (
        <div className="container">
            <div className="cart-header">
                <h2 className="cart-title">Shopping Cart</h2>
                <p className="cart-subtitle">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                </p>
            </div>
            {cartItems.map(cartItem => (
                <CartItem key={cartItem.id} cartItem={cartItem} />
            ))}
        </div>
    )
}

export default CartItemList;