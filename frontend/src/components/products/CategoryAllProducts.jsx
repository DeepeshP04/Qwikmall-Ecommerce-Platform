import FilterPanel from './FilterPanel';
import ProductGrid from './ProductGrid';
import './CategoryAllProducts.css'

function CategoryAllProducts () {
    const products = [
        {id: 1, name: "Laptop", price: "₹50000"},
        {id: 2, name: "Laptop", price: "₹50000"},
        {id: 3, name: "Laptop", price: "₹50000"},
        {id: 4, name: "Laptop", price: "₹50000"},
        {id: 5, name: "Laptop", price: "₹50000"},
    ]
    return (
        <div className="category-all-products">
            <div className="filter-products-space">
                <FilterPanel></FilterPanel>
            </div>
            <div className="main-content">
                <h2 className="category-title">Electronics</h2>
                <div className="products-container">
                    <ProductGrid products={products}></ProductGrid>
                </div>
            </div>
        </div>
    )
}

export default CategoryAllProducts;