import CartItemList from "./CartItemList";
import './CartContainer.css'
import { useEffect, useState } from "react";

function CartContainer () {
    const [cart, setCart] = useState({
        cart_items: [],
        total_price: 0
    })

    useEffect(() => {
        fetch("http://localhost:5000/cart/items")
        .then(res => res.json())
        .then(data => {
            console.log(data.message)
            setCart(data.cart)
        })
        .catch(err => console.log(err))
    }, [])
    
    return (
        <div className="cart-container">
            <div className="cart-items">
                <CartItemList cartItems={cart.cart_items}></CartItemList>
            </div>
            <div className="cart-summary">
                <h3 className="price-details-heading">Price Details</h3>
                <div className="price-details">
                    <div className="price-row">
                        <span>Total Items:</span>
                        <span>{cart.cart_items.length}</span>
                    </div>
                    <div className="price-row">
                        <span>Subtotal:</span>
                        <span>{cart.total_price}</span>
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

export default CartContainer;