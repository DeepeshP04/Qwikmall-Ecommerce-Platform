import './ProductCard.css'

function ProductCard () {
    return (
        <div className="product-card">
            <img className="product-card-img" src="../../images/laptop_electronics.jpg" alt="Product Image"/>
            <p className="product-card-name">Laptop</p>
            <p className="product-card-price">₹50000</p>
        </div>
    )
}

export default ProductCard;