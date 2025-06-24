import ProductCard from "./ProductCard";
import './ProductGrid.css'

function ProductGrid ({ products }) {
    if (!products.length) {
        return <p>No products found.</p>
    }

    return (
        <div className="product-grid">
            {products.map(product => (
                <ProductCard key={product.id} product={product}></ProductCard>
            ))}
        </div>
    )
}

export default ProductGrid;