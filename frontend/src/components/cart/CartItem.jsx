import './CartItem.css'
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareNodes, faTruckFast } from '@fortawesome/free-solid-svg-icons';

function CartItem ({
    cartItem,
    selected,
    onToggleSelected,
    onUpdateQuantity,
    onRemoveItem,
    onShareItem,
    onSaveForLater,
}) {
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
    const deliveryStart = new Date();
    deliveryStart.setDate(deliveryStart.getDate() + 3);
    const deliveryEnd = new Date();
    deliveryEnd.setDate(deliveryEnd.getDate() + 7);
    const deliveryWindow = `${deliveryStart.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} – ${deliveryEnd.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`;

    return (
        <article className={`cart-item-container${selected ? ' cart-item-selected' : ''}`}>
            <label className="cart-item-checkbox">
                <input
                    aria-label={`Select ${cartItem.product.name}`}
                    checked={selected}
                    onChange={onToggleSelected}
                    type="checkbox"
                />
            </label>
            <div className="item-img-space">
                <img src={cartItem.product.img_url} alt={cartItem.product.name} />
            </div>
            <div className='item-content-space'>
                <div className="item-details-space">
                    <h3 className="item-name">{cartItem.product.name}</h3>
                    <p className="item-price">₹{Number(cartItem.product.price).toLocaleString('en-IN')}</p>
                    <p className="cart-delivery-date">
                        <FontAwesomeIcon icon={faTruckFast} aria-hidden="true" />
                        Estimated delivery: <strong>{deliveryWindow}</strong>
                    </p>
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
                    <div className="item-total item-total-small">
                        ₹{calculateItemTotal()}
                    </div>
                </div>
                <div className="cart-item-links">
                    <button type="button" onClick={() => onRemoveItem(cartItem.item_id)}>Delete</button>
                    <span aria-hidden="true">|</span>
                    <button type="button" onClick={() => onSaveForLater(cartItem)}>Save for later</button>
                    <span aria-hidden="true">|</span>
                    <button type="button" onClick={() => onShareItem(cartItem)}>
                        <FontAwesomeIcon icon={faShareNodes} aria-hidden="true" /> Share
                    </button>
                </div>
            </div>
        </article>
    )
}

export default CartItem;