import './ProductCard.css'

function ProductCard ({ product }) {
    return (
        <div className="product-card">
            <img className="product-card-img" src="../../images/laptop_electronics.jpg" alt={product.name}/>
            <p className="product-card-name">{product.name}</p>
            <p className="product-card-price">{product.price}</p>
        </div>
    )
}

export default ProductCard;