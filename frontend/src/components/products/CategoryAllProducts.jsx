import ProductGrid from './ProductGrid';
import './CategoryAllProducts.css'

function CategoryAllProducts ({categoryName, products}) {
    return (
        <div className="category-all-products">
            {/* Add filter panel component for displaying different filter options for products */}
            {/* <div className="filter-products-space">
                <FilterPanel filters={filters}></FilterPanel>
            </div>  */}
            <h2 className="category-title">{categoryName}</h2>
            <div className="products-container">
                <ProductGrid products={products}></ProductGrid>
            </div>
        </div>
    )
}

export default CategoryAllProducts;