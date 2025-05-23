import './ProductDetails.css'

function ProductDetails () {
    return (
        <div className="product-details">
            <img className="product-img" src="../../images/laptop_electronics.jpg" alt="Product Image"/>
            <p className="product-name">Laptop</p>
            <p className="product-price">₹50000</p>
        </div>
    )
}

export default ProductDetails;