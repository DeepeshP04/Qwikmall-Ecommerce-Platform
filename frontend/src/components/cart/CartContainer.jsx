import CartItemList from "./CartItemList";
import './CartContainer.css'
import { useCallback, useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';

function CartContainer () {
    const navigate = useNavigate();
    const [cart, setCart] = useState({
        cart_items: [],
        total_price: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItemIds, setSelectedItemIds] = useState([]);
    const [actionMessage, setActionMessage] = useState("");
    const hasInitializedSelection = useRef(false);
    const { isLoggedIn } = useContext(AuthContext);

    const fetchCartItems = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("http://localhost:5000/cart/", {
                credentials: "include"
            });
            const data = await response.json();

            if (response.ok) {
                const normalizedCart = {
                    ...data.data,
                    items: data.data.items || data.data.cart_items || [],
                };
                setCart(normalizedCart);
                setSelectedItemIds((current) => {
                    const availableIds = normalizedCart.items.map((item) => item.item_id);
                    if (!hasInitializedSelection.current) {
                        hasInitializedSelection.current = true;
                        return availableIds;
                    }
                    return current.filter((id) => availableIds.includes(id));
                });
            } else if (response.status === 404) {
                setCart({ items: [], total_price: 0 });
                setSelectedItemIds([]);
            } else {
                setError(data.message || 'Failed to load cart items');
            }
        } catch (err) {
            console.error('Error fetching cart:', err);
            setError('Failed to load cart items. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            fetchCartItems();
        } else {
            setLoading(false);
        }
    }, [fetchCartItems, isLoggedIn]);

    // Update quantity handler
    const updateCartItemQuantity = async (cartItemId, newQuantity) => {
        // Optimistically update UI
        setCart(prevCart => {
            const updatedItems = (prevCart.items || prevCart.cart_items).map(item =>
                item.item_id === cartItemId ? { ...item, quantity: newQuantity } : item
            );
            return { ...prevCart, items: updatedItems, cart_items: updatedItems };
        });
        // Send PATCH to backend
        try {
            const response = await fetch(`http://localhost:5000/cart/items/${cartItemId}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ quantity: newQuantity })
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to update cart item quantity');
            }
            window.dispatchEvent(new Event('cartUpdated'));
            // Optionally, re-fetch cart to sync totals
            await fetchCartItems();
        } catch (updateError) {
            console.error('Failed to update cart item quantity', updateError);
            setActionMessage(updateError.message || 'Failed to update cart item quantity');
            await fetchCartItems();
        }
    };

    // Remove cart item handler
    const removeCartItem = async (cartItemId) => {
        // Optimistically update UI
        setCart(prevCart => {
            const updatedItems = prevCart.items.filter(item => item.item_id !== cartItemId);
            return { ...prevCart, items: updatedItems, cart_items: updatedItems };
        });
        setSelectedItemIds((current) => current.filter((id) => id !== cartItemId));
        // Send DELETE to backend
        try {
            const response = await fetch(`http://localhost:5000/cart/items/${cartItemId}/`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to remove cart item');
            }
            window.dispatchEvent(new Event('cartUpdated'));
            await fetchCartItems();
            return true;
        } catch (removeError) {
            console.error('Failed to remove cart item', removeError);
            setActionMessage(removeError.message || 'Failed to remove cart item');
            await fetchCartItems();
            return false;
        }
    };

    const cartItems = cart.items || [];
    const selectedItems = cartItems.filter((item) => selectedItemIds.includes(item.item_id));
    const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;
    const selectedSubtotal = selectedItems.reduce(
        (total, item) => total + Number(item.product.price || 0) * Number(item.quantity || 0),
        0
    );
    const shipping = selectedItems.length ? 40 : 0;
    const selectedQuantity = selectedItems.reduce((total, item) => total + Number(item.quantity || 0), 0);

    const toggleAllItems = () => {
        setSelectedItemIds(allSelected ? [] : cartItems.map((item) => item.item_id));
    };

    const toggleCartItem = (itemId) => {
        setSelectedItemIds((current) => current.includes(itemId)
            ? current.filter((id) => id !== itemId)
            : [...current, itemId]);
    };

    const shareCartItem = async (item) => {
        const productUrl = `${window.location.origin}/product/${item.product.id}`;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: item.product.name,
                    text: `Take a look at ${item.product.name} on QwikMall`,
                    url: productUrl,
                });
            } else if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(productUrl);
                setActionMessage('Product link copied to clipboard.');
            } else {
                throw new Error('Sharing is not available in this browser.');
            }
        } catch (shareError) {
            if (shareError.name !== 'AbortError') {
                setActionMessage(shareError.message || 'Unable to share this product.');
            }
        }
    };

    const saveForLater = async (item) => {
        setActionMessage('');
        try {
            const response = await fetch('http://localhost:5000/wishlist/items', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: item.product.id }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Unable to save this product for later.');
            }
            window.dispatchEvent(new Event('wishlistUpdated'));
            const removed = await removeCartItem(item.item_id);
            if (!removed) return;
            setActionMessage('Product saved to your wishlist.');
        } catch (saveError) {
            setActionMessage(saveError.message || 'Unable to save this product for later.');
        }
    };

    if (loading) {
        return (
            <div className="cart-container centered">
                <div className="cart-items centered">
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
            <div className="cart-container centered">
                <div className="cart-items centered">
                    <div className="cart-empty">
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

    if (!isLoggedIn) {
        return (
            <div className="cart-container centered">
                <div className="cart-items centered">
                    <div className="cart-empty">
                        <div className="cart-empty-icon">🔒</div>
                        <h3>Please log in to view your cart</h3>
                        <p>You need to be logged in to access your shopping cart.</p>
                        <a href="/login" className="continue-shopping-btn">Login</a>
                    </div>
                </div>
            </div>
        );
    }

    const isCartEmpty = cartItems.length === 0;

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
                    <>
                        {actionMessage && <p className="cart-action-message" role="status">{actionMessage}</p>}
                        <CartItemList
                            cartItems={cartItems}
                            selectedItemIds={selectedItemIds}
                            allSelected={allSelected}
                            onToggleAll={toggleAllItems}
                            onToggleItem={toggleCartItem}
                            onUpdateQuantity={updateCartItemQuantity}
                            onRemoveItem={removeCartItem}
                            onShareItem={shareCartItem}
                            onSaveForLater={saveForLater}
                        />
                    </>
                )}
            </div>
            {!isCartEmpty && (
                <div className="cart-summary">
                    <h3 className="price-details-heading">Price Details</h3>
                    <div className="price-details">
                        <div className="price-row">
                            <span>Selected items:</span>
                            <span>{selectedQuantity}</span>
                        </div>
                        <div className="price-row">
                            <span>Subtotal:</span>
                            <span>₹{selectedSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="price-row">
                            <span>Shipping:</span>
                            <span>{shipping ? `₹${shipping}` : '—'}</span>
                        </div>
                        <div className="price-row tota">
                            <span>Total Price:</span>
                            <span>₹{(selectedSubtotal + shipping).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                    <button
                        className="place-order-btn"
                        disabled={!selectedItems.length}
                        onClick={() => navigate('/checkout', {
                            state: { selectedCartItemIds: selectedItemIds },
                        })}
                    >
                        Proceed to checkout
                    </button>
                </div>
            )}
        </div>
    );
}

export default CartContainer;