import './ProductDetails.css'

function ProductDetails({ product }) {
    if (!product) return <p>Loading...</p>
    
    return (
        <div className="product-details-section">
            <div className="left">
                <img id="product-img" src="/images/laptop_electronics.jpg" alt={product.name}/>
                <div className="buy-or-add-cart">
                    <button className="btn" id="buy-btn">Buy Now</button>
                    <button className="btn" id="add-to-cart-btn">Add to Cart</button>
                </div>
            </div>
            <div className="right">
                <h3>{product.name}</h3>
                <p>{product.price}</p>
                <p>{product.description}</p>
            </div>
        </div>
    )
}

export default ProductDetails;