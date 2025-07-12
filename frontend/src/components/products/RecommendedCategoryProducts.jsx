import './RecommendedCategoryProducts.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
import ProductGrid from './ProductGrid'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Loader from '../Loader/loader'

function RecommendedCategoryProducts () {
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true)
        fetch("http://localhost:5000/products/recommended")
        .then(res => res.json())
        .then(data => {
            setCategoryProducts(data.data)
            setIsLoading(false)
        })
        .catch(err => console.log("Failed to fetch data", err))

    }, [])

    return (
        <div className="recommended-category-products">
            {isLoading ? (<Loader />) : (categoryProducts.map((category => 
                <div key={category.id}>
                    <div className='category'>
                        <p className='category-name'>{category.name}</p>
                        <Link to={`category/${category.id}`} className='category-all-products-btn'><FontAwesomeIcon icon={faAngleRight} className='right-arrow' /></Link>
                    </div>
                    <div className="recommeded-products-container">
                        <ProductGrid products={category.products}></ProductGrid>
                    </div>
                </div>
            )))}
        </div>
    )
}

export default RecommendedCategoryProducts;