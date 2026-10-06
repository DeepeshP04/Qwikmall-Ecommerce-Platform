import './ProductDetails.css'
import { useEffect, useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faShieldHalved, faTruckFast } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ProductCard from './ProductCard'
import { AuthContext } from '../../App'

function ProductDetails({ product }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const { isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!product?.category_name) {
            setRelatedProducts([]);
            return undefined;
        }

        const controller = new AbortController();
        const loadRelatedProducts = async () => {
            try {
                setRelatedLoading(true);
                const response = await fetch(
                    `http://localhost:5000/products/category/${encodeURIComponent(product.category_name)}`,
                    { signal: controller.signal }
                );
                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Unable to load related products.');
                }

                const products = result.data?.products || [];
                setRelatedProducts(products.filter((item) => item.id !== product.id).slice(0, 8));
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Unable to load related products:', error);
                    setRelatedProducts([]);
                }
            } finally {
                if (!controller.signal.aborted) setRelatedLoading(false);
            }
        };

        loadRelatedProducts();
        return () => controller.abort();
    }, [product?.category_name, product?.id]);

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
                window.dispatchEvent(new Event('cartUpdated'));
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
                        {product.manufacturer && (
                            <span className="product-image-brand">{product.manufacturer}</span>
                        )}
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
                        {product.category_name && <span className="product-category-label">{product.category_name}</span>}
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
                                <span className="rating-text">{product.overall_rating} out of 5</span>
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div className="product-price-section">
                        <span className="product-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
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

                    <div className="product-assurances">
                        <div>
                            <FontAwesomeIcon icon={faTruckFast} aria-hidden="true" />
                            <span>Delivery options at checkout</span>
                        </div>
                        <div>
                            <FontAwesomeIcon icon={faShieldHalved} aria-hidden="true" />
                            <span>Secure shopping</span>
                        </div>
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

            <section className="related-products-section" aria-labelledby="related-products-title">
                <div className="related-products-heading">
                    <div>
                        <span className="product-category-label">More to explore</span>
                        <h2 id="related-products-title">Related products</h2>
                        <p>More picks from {product.category_name || 'this collection'}.</p>
                    </div>
                    {product.category_name && (
                        <Link to={`/category/${encodeURIComponent(product.category_name)}`} className="related-products-link">
                            View category
                        </Link>
                    )}
                </div>
                {relatedLoading ? (
                    <p className="related-products-message" role="status">Finding similar products...</p>
                ) : relatedProducts.length ? (
                    <div className="related-products-grid">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard
                                key={relatedProduct.id}
                                product={relatedProduct}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="related-products-message">
                        No other products in this category yet.
                    </p>
                )}
            </section>
        </div>
    )
}

export default ProductDetails;