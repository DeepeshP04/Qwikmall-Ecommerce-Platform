import './CartItem.css'

function CartItem () {
    const cartItem = {
        imgUrl: "images/laptop_electronics.jpg", name: "Laptop", price: "₹50000" 
    }

    return (
        <div className="cart-item-container">
            <div className="item-img-space">
                <img src={cartItem.imgUrl} alt={cartItem.name}></img>
            </div>
            <div className='item-content-space'>
                <div className="item-details-space">
                    <h3 className="item-name">{cartItem.name}</h3>
                    <p className="item-price">{cartItem.price}</p>
                </div>
                <div className='item-action-space'>
                    <div className='quantity-control'>
                        <button className='quantity-decrease-btn'>-</button>
                        <input className='quantity-input' type='number' value="1" readOnly></input>
                        <button className='quantity-increase-btn'>+</button>
                    </div>
                    <div className='remove-btn-container'>
                        <button id="item-remove-btn">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartItem;