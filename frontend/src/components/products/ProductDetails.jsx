import './ProductDetails.css'
import { useState, useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthContext } from '../../App'
import { useNavigate } from 'react-router-dom';

function ProductDetails({ product }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

    if (!product) return <p>Loading...</p>
    
    // Handle image display - API returns array of image URLs
    const images = Array.isArray(product.img_url) ? product.img_url : [product.img_url];
    const primaryImage = images[selectedImageIndex] || "/images/laptop_electronics.jpg";
    
    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= 10) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        if(isLoggedIn) {
        fetch('http://localhost:5000/cart/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ product_id: product.id, quantity: quantity }), credentials: 'include'
        }).then(response => response.json())
        .then(data => {
            if (data.success) {
                toast.success('Item added to cart');
                console.log(data.message);
            } else {
                toast.error(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        toast('Please login to add product to cart')
        navigate('/login')
    }
    };

    const handleAddToWishlist = async () => {
        if (!isLoggedIn) {
            toast('Please login to save products to your wishlist')
            navigate('/login')
            return
        }

        try {
            const response = await fetch('http://localhost:5000/wishlist/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: product.id }),
                credentials: 'include'
            })
            const data = await response.json()
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Unable to save this product')
            }
            toast.success(data.message || 'Product saved to your wishlist')
        } catch (error) {
            toast.error(error.message || 'Unable to save this product')
        }
    }

    const handleBuy = () => {
        if(isLoggedIn) {
            
        } else {
            toast('Please login to buy product')
            navigate('/login')
        }
    }    

    return (
        <div className="product-details-container">
            <div className="product-details-content">
                {/* Left Section - Images */}
                <div className="product-images-section">
                    <div className="main-image-container">
                        <img 
                            src={primaryImage} 
                            alt={product.name}
                            className="main-product-image"
                        />
                    </div>
                    
                    {/* Image Gallery */}
                    {images.length > 1 && (
                        <div className="image-gallery">
                            {images.map((img, index) => (
                                <img 
                                    key={index}
                                    src={img} 
                                    alt={`${product.name} - Image ${index + 1}`}
                                    className={`gallery-thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                                    onClick={() => setSelectedImageIndex(index)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Section - Product Info */}
                <div className="product-info-section">
                    <div className="product-header">
                        <h1 className="product-title">{product.name}</h1>
                        
                        {/* Rating */}
                        {product.overall_rating > 0 && (
                            <div className="product-rating">
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

                    {/* Price */}
                    <div className="product-price-section">
                        <span className="product-price">₹{product.price}</span>
                        <span className="price-label">Inclusive of all taxes</span>
                    </div>

                    {/* Manufacturer */}
                    {product.manufacturer && (
                        <div className="product-manufacturer">
                            <span className="label">Brand:</span>
                            <span className="value">{product.manufacturer}</span>
                        </div>
                    )}

                    {/* Description */}
                    <div className="product-description">
                        <h3>Description</h3>
                        <p>{product.description}</p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="quantity-section">
                        <span className="label">Quantity:</span>
                        <div className="quantity-selector">
                            <button 
                                className="quantity-btn"
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <span className="quantity-value">{quantity}</span>
                            <button 
                                className="quantity-btn"
                                onClick={() => handleQuantityChange(1)}
                                disabled={quantity >= 10}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button className="btn btn-primary buy-now-btn" onClick={handleBuy}>
                            Buy Now
                        </button>
                        <button className="btn btn-secondary add-to-cart-btn" onClick={handleAddToCart}>
                            Add to Cart
                        </button>
                        <button className="btn btn-wishlist" onClick={handleAddToWishlist}>
                            <FontAwesomeIcon icon={faHeart} aria-hidden="true" />
                            Save
                        </button>
                    </div>

                    {/* Product Attributes/Specifications */}
                    {product.attributes && Object.keys(product.attributes).length > 0 && (
                        <div className="product-specifications">
                            <h3>Specifications</h3>
                            <div className="specifications-grid">
                                {Object.entries(product.attributes).map(([key, value]) => (
                                    <div key={key} className="specification-item">
                                        <span className="spec-label">{key}:</span>
                                        <span className="spec-value">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            {product.reviews && product.reviews.length > 0 && (
                <div className="reviews-section">
                    <h3>Customer Reviews ({product.reviews.length})</h3>
                    <div className="reviews-grid">
                        {product.reviews.map((review) => (
                            <div key={review.id} className="review-card">
                                <div className="review-header">
                                    <span className="reviewer-name">{review.username}</span>
                                    <div className="review-stars">
                                        {[...Array(5)].map((_, index) => (
                                            <span 
                                                key={index} 
                                                className={`star ${index < review.rating ? 'filled' : ''}`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <p className="review-text">{review.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductDetails;