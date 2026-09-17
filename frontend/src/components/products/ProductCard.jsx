import './ProductCard.css'
import { Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { toast } from 'react-toastify'
import { AuthContext } from '../../App'

function ProductCard ({ product }) {
    const navigate = useNavigate()
    const { isLoggedIn } = useContext(AuthContext)
    const image = Array.isArray(product.img_url) ? product.img_url[0] : product.img_url
    const stock = product.stock ?? product.quantity

    const handleCardClick = () => {
        navigate(`/product/${product.id}`)
    }

    const handleCardKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleCardClick()
        }
    }

    const handleAddToCart = async (event) => {
        event.preventDefault()
        event.stopPropagation()

        if (!isLoggedIn) {
            toast('Please login to add product to cart')
            navigate('/login')
            return
        }

        try {
            const response = await fetch('http://localhost:5000/cart/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: product.id, quantity: 1 }),
                credentials: 'include'
            })
            const data = await response.json()

            if (data.success) {
                toast.success('Item added to cart')
            } else {
                toast.error(data.message || 'Unable to add item to cart')
            }
        } catch (error) {
            console.error('Error adding item to cart:', error)
            toast.error('Unable to add item to cart')
        }
    }

    return (
        <article
            className="product-card-link"
            role="link"
            tabIndex="0"
            onClick={handleCardClick}
            onKeyDown={handleCardKeyDown}
        >
            <div className="product-card">
                <div className="product-card-image-container">
                    <img
                        className="product-card-img"
                        src={image}
                        alt={product.img_alt_text || product.name}
                        loading="lazy"
                    />
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

                <div className="product-card-expanded" onClick={(event) => event.stopPropagation()}>
                    <p className="product-card-expanded-description">
                        {product.description || 'Explore this product for more details.'}
                    </p>
                    <div className="product-card-expanded-meta">
                        {product.manufacturer && <span><strong>Brand:</strong> {product.manufacturer}</span>}
                        {stock !== undefined && (
                            <span className={stock > 0 ? 'in-stock' : 'out-of-stock'}>
                                {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                            </span>
                        )}
                    </div>
                    {product.attributes && Object.keys(product.attributes).length > 0 && (
                        <div className="product-card-attributes">
                            {Object.entries(product.attributes).slice(0, 3).map(([key, value]) => (
                                <span key={key}><strong>{key}:</strong> {value}</span>
                            ))}
                        </div>
                    )}
                    <div className="product-card-actions">
                        <button type="button" onClick={handleAddToCart}>Add to Cart</button>
                        <Link to={`/product/${product.id}`} onClick={(event) => event.stopPropagation()}>
                            View Product
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    )
}

export default ProductCard;