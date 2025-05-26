import './RecommendedCategoryProducts.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
import ProductGrid from './ProductGrid'

function RecommendedCategoryProducts () {
    const products = [
        {id: 1, name: "Laptop", price: "₹50000"},
        {id: 2, name: "Laptop", price: "₹50000"},
        {id: 3, name: "Laptop", price: "₹50000"},
        {id: 4, name: "Laptop", price: "₹50000"},
        {id: 5, name: "Laptop", price: "₹50000"},
    ]

    return (
        <div className="recommended-category-products">
            <div className="category">
                <p className='category-name'>Electronics</p>
                <a className='category-all-products-btn'><FontAwesomeIcon icon={faAngleRight} className='right-arrow' /></a>
            </div>
            <div className="recommeded-products-container">
                <ProductGrid products={products}></ProductGrid>
            </div>
        </div>
    )
}

export default RecommendedCategoryProducts;