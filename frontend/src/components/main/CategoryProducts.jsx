import './CategoryProducts.css'
import ProductDetails from './ProductDetails'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'

function CategoryProducts () {
    return (
        <>
            <div className="category-products">
                <div className="category">
                    <p className='category-name'>Electronics</p>
                    <a className='category-all-products-btn'><FontAwesomeIcon icon={faAngleRight} className='right-arrow' /></a>
                </div>
                <div className="products-container">
                    <ProductDetails></ProductDetails>
                    <ProductDetails></ProductDetails>
                    <ProductDetails></ProductDetails>
                    <ProductDetails></ProductDetails>
                    <ProductDetails></ProductDetails>
                    <ProductDetails></ProductDetails>
                </div>
            </div>
            <div className="category-products">
                <div className="category">
                    <p className='category-name'>Electronics</p>
                    <a className='category-all-products-btn'><FontAwesomeIcon icon={faAngleRight} className='right-arrow' /></a>
                </div>
                <div className="products-container">
                    <ProductDetails></ProductDetails>
                    <ProductDetails></ProductDetails>
                    <ProductDetails></ProductDetails>
                    <ProductDetails></ProductDetails>
                    <ProductDetails></ProductDetails>
                    <ProductDetails></ProductDetails>
                </div>
            </div>
            <div className="category-products">
                <div className="category">
                    <p className='category-name'>Electronics</p>
                    <a className='category-all-products-btn'><FontAwesomeIcon icon={faAngleRight} className='right-arrow' /></a>
                </div>
                <div className="products-container">
                    <ProductDetails></ProductDetails>
                    <ProductDetails></ProductDetails>
                    <ProductDetails></ProductDetails>
                    <ProductDetails></ProductDetails>
                    <ProductDetails></ProductDetails>
                    <ProductDetails></ProductDetails>
                </div>
            </div>
        </>
    )
}

export default CategoryProducts;