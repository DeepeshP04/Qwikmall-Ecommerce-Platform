function ProductDetails({ product }) {
    <div className="product-details-section">
        <div className="left">
            <img id="product-img" src={product.img_url} alt={product.name}/>
            <div className="buy-or-add-cart">
                <button id="buy-btn">Buy Now</button>
                <button id="add-to-cart-btn">Add to Cart</button>
            </div>
        </div>
        <div className="right">
            <h3>{product.name}</h3>
            <p>{product.price}</p>
            <p>{product.description}</p>
        </div>
    </div>
}

export default ProductDetails;