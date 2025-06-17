import './CartItem.css'

function CartItem () {
    const cartItem = {
        imgUrl: "images/laptop_electronics.jpg", name: "Laptop", price: "₹50000" 
    }

    return (
        <div className="cart-item">
            <div className="item-img-space">
                <img src={cartItem.imgUrl} alt={cartItem.name}></img>
            </div>
            <div className="item-details-space">
                <h3 id="item-name">{cartItem.name}</h3>
                <p id="item-price">{cartItem.price}</p>
                <button id="item-remove-btn">Remove</button>
            </div>
        </div>
    )
}

export default CartItem;