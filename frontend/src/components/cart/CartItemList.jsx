import CartItem from "./CartItem";
import './CartItemList.css'

function CartItemList () {
    const cartItems = [
        {quantity: "1", price: "40000", name: "Laptop", img: "images/laptop_electronics.jpg"},
        {quantity: "2", price: "50000", name: "Laptop", img: "images/laptop_electronics.jpg"}
    ]

    return (
        <div className="container">
            {cartItems.map(cartItem => <CartItem key={cartItem.id} cartItem={cartItem}></CartItem>)}
        </div>
    )
}

export default CartItemList;