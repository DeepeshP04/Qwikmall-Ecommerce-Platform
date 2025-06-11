import './RecommendedCategoryProducts.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
import ProductGrid from './ProductGrid'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

function RecommendedCategoryProducts () {
    const [categoryProducts, setCategoryProducts] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/products/recommended-products")
        .then(res => res.json())
        .then(data => setCategoryProducts(data.categories))
        .catch(err => console.log("Failed to fetch data", err))
    }, [])

    const products = [
        {id: 1, name: "Laptop", price: "₹50000"},
        {id: 2, name: "Laptop", price: "₹50000"},
        {id: 3, name: "Laptop", price: "₹50000"},
        {id: 4, name: "Laptop", price: "₹50000"},
        {id: 5, name: "Laptop", price: "₹50000"},
    ]

    return (
        <div className="recommended-category-products">
            {categoryProducts.map((category => 
                <div key={category.id}>
                    <div className='category'>
                        <p className='category-name'>{category.name}</p>
                        <Link to={`category/${category.id}`} className='category-all-products-btn'><FontAwesomeIcon icon={faAngleRight} className='right-arrow' /></Link>
                    </div>
                    <div className="recommeded-products-container">
                        <ProductGrid products={category.products}></ProductGrid>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default RecommendedCategoryProducts;