import CartItemList from "./CartItemList";
import './CartContainer.css'
import { useEffect, useState } from "react";

function CartContainer () {
    const [cart, setCart] = useState({
        cart_items: [],
        total_price: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("http://localhost:5000/cart/", {
                credentials: "include"
            });
            const data = await response.json();
            
            console.log("Cart response:", data);
            
            if (response.ok) {
                setCart(data.data || { items: [], total_price: 0 });
            } else {
                setError(data.message || 'Failed to load cart items');
            }
        } catch (err) {
            console.error('Error fetching cart:', err);
            setError('Failed to load cart items. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        const subtotal = cart.total_price || 0;
        const shipping = 40;
        return subtotal + shipping;
    };

    if (loading) {
        return (
            <div className="cart-container">
                <div className="cart-items">
                    <div className="cart-loading">
                        <div className="loading-spinner"></div>
                    </div>
                </div>
                <div className="cart-summary">
                    <div className="cart-loading">
                        <div className="loading-spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cart-container">
                <div className="cart-items">
                    <div className="cart-empty">
                        <div className="cart-empty-icon">⚠️</div>
                        <h3>Error Loading Cart</h3>
                        <p>{error}</p>
                        <button 
                            className="continue-shopping-btn"
                            onClick={fetchCartItems}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isCartEmpty = !cart.items || cart.items.length === 0;

    return (
        <div className="cart-container">
            <div className="cart-items">
                {isCartEmpty ? (
                    <div className="cart-empty">
                        <div className="cart-empty-icon">🛒</div>
                        <h3>Your cart is empty</h3>
                        <p>Looks like you haven't added any items to your cart yet.</p>
                        <a href="/" className="continue-shopping-btn">
                            Continue Shopping
                        </a>
                    </div>
                ) : (
                    <CartItemList cartItems={cart.items} />
                )}
            </div>
            {!isCartEmpty && (
                <div className="cart-summary">
                    <h3 className="price-details-heading">Price Details</h3>
                    <div className="price-details">
                        <div className="price-row">
                            <span>Total Items:</span>
                            <span>{cart.items.length}</span>
                        </div>
                        <div className="price-row">
                            <span>Subtotal:</span>
                            <span>₹{cart.total_price}</span>
                        </div>
                        <div className="price-row">
                            <span>Shipping:</span>
                            <span>₹40</span>
                        </div>
                        <div className="price-row tota">
                            <span>Total Price:</span>
                            <span>₹{calculateTotal()}</span>
                        </div>
                    </div>
                    <button className="place-order-btn">Place Order</button>
                </div>
            )}
        </div>
    );
}

export default CartContainer;