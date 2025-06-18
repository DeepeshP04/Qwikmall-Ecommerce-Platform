import CartItemList from "./CartItemList";

function Cart () {
    return (
        <div className="cart">
            <div className="cart-items">
                <CartItemList cartItems={cartItems}></CartItemList>
            </div>
            <div className="cart-summary">
                <h3>Price Details</h3>
                <div className="price-details">
                    <div className="price-row">
                        <span>Total Items:</span>
                        <span>2</span>
                    </div>
                    <div className="price-row">
                        <span>Subtotal:</span>
                        <span>40000</span>
                    </div>
                    <div className="price-row">
                        <span>Shipping:</span>
                        <span>40</span>
                    </div>
                    <div className="price-row tota">
                        <span>Total Price:</span>
                        <span>40000</span>
                    </div>
                </div>
                <button className="place-order-btn">Place Order</button>
            </div>
        </div>
    )
}

export default Cart;