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
            let url;
            if (categoryName === "None") {
                url = `http://localhost:5000/products/filters`;
            } else {
                url = `http://localhost:5000/products/category/${categoryName}/filters`;
            }
            const response = await fetch(url);
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
        // Initially filtered is all products
        let filtered = products;

        // for each selectedFilter type, take all selected options
        // filter the products matching filter options
        Object.keys(selectedFilters).forEach(filterType => {
            console.log(selectedFilters, filterType)
            const selectedOptions = selectedFilters[filterType];
            console.log(selectedOptions)
            // if (selectedOptions && selectedOptions.length > 0) {
            //     filtered = filtered.filter(product => {
            //         console.log(product)
            //         return selectedOptions.some(option => {
            //             const productValue = product[filterType.toLowerCase()];
            //             if (!productValue) return false;
            //             if (Array.isArray(productValue)) {
            //                 return productValue.some(val => 
            //                     val.toString().toLowerCase() === option.toString().toLowerCase()
            //                 );
            //             } else {
            //                 return productValue.toString().toLowerCase() === option.toString().toLowerCase();
            //             }
            //         });
            //     });
            // }
            if (selectedOptions && selectedOptions.length > 0) {
            filtered = filtered.filter(product => {
                const productValue = product.attributes?.[filterType];

                if (!productValue) return false;

                return selectedOptions.some(option => {
                    if (Array.isArray(productValue)) {
                        return productValue.some(val =>
                            val.toString().toLowerCase() === option.toString().toLowerCase()
                        );
                    } else {
                        return productValue.toString().toLowerCase() === option.toString().toLowerCase();
                    }
                });
            });
        }
        });

        setFilteredProducts(filtered)
    }

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
                <h2 className="category-title">{categoryName === "None" ? "All Products" : categoryName}</h2>
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