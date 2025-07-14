import './ProductCard.css'
import { Link } from 'react-router-dom'

function ProductCard ({ product }) {
    return (
        <Link to={`/product/${product.product_id}`} className="product-card-link">
            <div className="product-card">
                <div className="product-card-image-container">
                    <img 
                        className="product-card-img" 
                        src={product.img_url} 
                        alt={product.img_alt_text || product.name}
                        loading="lazy"
                    />
                    <div className="product-card-overlay">
                        <button className="quick-view-btn">Quick View</button>
                    </div>
                </div>
                
                <div className="product-card-content">
                    <h3 className="product-card-name">{product.name}</h3>
                    
                    <div className="product-card-price-container">
                        <span className="product-card-price">₹{product.price}</span>
                    </div>
                    
                    {product.overall_rating && (
                        <div className="product-card-rating">
                            <div className="stars">
                                {[...Array(5)].map((_, index) => (
                                    <span 
                                        key={index} 
                                        className={`star ${index < Math.floor(product.overall_rating) ? 'filled' : ''}`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <span className="rating-text">({product.overall_rating})</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default ProductCard;