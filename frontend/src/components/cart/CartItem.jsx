import './CartItem.css'
import { useState } from 'react';

function CartItem ({cartItem, onUpdateQuantity, onRemoveItem}) {
    const [quantity, setQuantity] = useState(cartItem.quantity || 1);

    const handleDecrease = () => {
        if (quantity > 1) {
            const newQty = quantity - 1;
            setQuantity(newQty);
            onUpdateQuantity(cartItem.item_id, newQty);
        }
    };
    const handleIncrease = () => {
        const newQty = quantity + 1;
        setQuantity(newQty);
        onUpdateQuantity(cartItem.item_id, newQty);
    };
    const calculateItemTotal = () => {
        const price = cartItem.product.price || 0;
        return (price * quantity).toFixed(2);
    };

    return (
        <div className="cart-item-container">
            <div className="item-img-space">
                <img src={cartItem.product.img_url} alt={cartItem.product.name} />
            </div>
            <div className='item-content-space'>
                <div className="item-details-space">
                    <h3 className="item-name">{cartItem.product.name}</h3>
                    <p className="item-price">₹{cartItem.product.price}</p>
                </div>
                <div className='item-action-space'>
                    <div className='quantity-control'>
                        <button className='quantity-update-btn' title="Decrease quantity" onClick={handleDecrease}>-</button>
                        <input 
                            className='quantity-input' 
                            type='number' 
                            value={quantity} 
                            readOnly 
                            min="1"
                        />
                        <button className='quantity-update-btn' title="Increase quantity" onClick={handleIncrease}>+</button>
                    </div>
                    <div className='remove-btn-container'>
                        <button className="item-remove-btn" title="Remove item" onClick={() => onRemoveItem(cartItem.item_id)}>Remove</button>
                    </div>
                    <div className="item-total item-total-small">
                        ₹{calculateItemTotal()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartItem;