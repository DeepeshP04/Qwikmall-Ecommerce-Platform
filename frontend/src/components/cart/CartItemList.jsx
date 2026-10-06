import CartItem from "./CartItem";
import './CartItemList.css'

function CartItemList ({
    cartItems,
    selectedItemIds,
    allSelected,
    onToggleAll,
    onToggleItem,
    onUpdateQuantity,
    onRemoveItem,
    onShareItem,
    onSaveForLater,
}) {
    return (
        <div className="container">
            <div className="cart-header">
                <div className="cart-header-title">
                    <div>
                        <h2 className="cart-title">Shopping Cart</h2>
                        <p className="cart-subtitle">
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                        </p>
                    </div>
                    <label className="select-all-items">
                        <input
                            checked={allSelected}
                            onChange={onToggleAll}
                            type="checkbox"
                        />
                        <span>Select all items</span>
                    </label>
                </div>
            </div>
            {cartItems.map(cartItem => (
                <CartItem
                    key={cartItem.item_id}
                    cartItem={cartItem}
                    selected={selectedItemIds.includes(cartItem.item_id)}
                    onToggleSelected={() => onToggleItem(cartItem.item_id)}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemoveItem={onRemoveItem}
                    onShareItem={onShareItem}
                    onSaveForLater={onSaveForLater}
                />
            ))}
        </div>
    )
}

export default CartItemList;