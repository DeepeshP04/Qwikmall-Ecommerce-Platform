import ProductGrid from './ProductGrid';
import FilterPanel from './FilterPanel';
import './CategoryAllProducts.css'
import { useState, useEffect } from 'react';

function CategoryAllProducts ({categoryName, products}) {
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setFilteredProducts(products);
        fetchFilters();
    }, [products, categoryName]);

    const fetchFilters = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/products/category/${categoryName}/filters`);
            const data = await response.json();
            
            if (response.ok && data.success) {
                setFilters(data.data || {});
            } else {
                console.error('Failed to fetch filters:', data.message);
                setFilters({});
            }
        } catch (error) {
            console.error('Error fetching filters:', error);
            setFilters({});
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (selectedFilters) => {
        // Apply filters to products
        let filtered = products;
        
        // Apply each filter type
        Object.keys(selectedFilters).forEach(filterType => {
            const selectedOptions = selectedFilters[filterType];
            if (selectedOptions && selectedOptions.length > 0) {
                filtered = filtered.filter(product => {
                    return selectedOptions.some(option => {
                        // Check if product has the filter attribute
                        const productValue = product[filterType.toLowerCase()];
                        if (!productValue) return false;
                        
                        // Handle different data types
                        if (Array.isArray(productValue)) {
                            // If product value is an array, check if any value matches
                            return productValue.some(val => 
                                val.toString().toLowerCase() === option.toString().toLowerCase()
                            );
                        } else {
                            // If product value is a string, do direct comparison
                            return productValue.toString().toLowerCase() === option.toString().toLowerCase();
                        }
                    });
                });
            }
        });
        
        setFilteredProducts(filtered);
    };

    if (loading) {
        return (
            <div className="category-all-products">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading filters...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="category-all-products">
            <div className="category-header">
                <h2 className="category-title">{categoryName}</h2>
                <p className="product-count">{filteredProducts.length} products found</p>
            </div>
            
            <div className="category-content">
                {/* Left Side - Filter Panel */}
                <div className="filter-section">
                    <FilterPanel 
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </div>
                
                {/* Right Side - Products */}
                <div className="products-section">
                    <div className="products-container">
                        <ProductGrid products={filteredProducts} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategoryAllProducts;