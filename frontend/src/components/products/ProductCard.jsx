import './ProductCard.css'
import { Link } from 'react-router-dom'

function ProductCard ({ product }) {
    return (
        <Link to={`/product/${product.id}`}>
            <div className="product-card">
                <img className="product-card-img" src="/images/laptop_electronics.jpg" alt={product.name}/>
                <p className="product-card-name">{product.name}</p>
                <p className="product-card-price">{product.price}</p>
            </div>
        </Link>
    )
}

export default ProductCard;