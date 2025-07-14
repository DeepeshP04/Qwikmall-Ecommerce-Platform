import CartItem from "./CartItem";
import './CartItemList.css'

function CartItemList ({cartItems, onUpdateQuantity, onRemoveItem}) {
    return (
        <div className="container">
            <div className="cart-header">
                <h2 className="cart-title">Shopping Cart</h2>
                <p className="cart-subtitle">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                </p>
            </div>
            {cartItems.map(cartItem => (
                <CartItem key={cartItem.item_id} cartItem={cartItem} onUpdateQuantity={onUpdateQuantity} onRemoveItem={onRemoveItem} />
            ))}
        </div>
    )
}

export default CartItemList;