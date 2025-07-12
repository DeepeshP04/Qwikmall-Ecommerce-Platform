import { useParams } from "react-router-dom";
import Footer from "../components/footer/Footer";
import Navbar from "../components/header/Navbar";
import ProductDetails from "../components/products/ProductDetails";
import { useEffect, useState } from "react";

function ProductPage() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        
        fetch(`http://localhost:5000/products/${productId}`)
        .then(res => {
            console.log("Response status:", res.status);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("API Response:", data);
            if (data.success) {
                setProduct(data.data);
            } else {
                setError(data.message || "Failed to fetch product");
            }
        })
        .catch(err => {
            console.error("Failed to fetch product:", err);
            setError("Failed to load product. Please check if the server is running.");
        })
        .finally(() => {
            setLoading(false);
        });
    }, [productId]);
    
    // Loading state
    if (loading) {
        return (
            <>
                <Navbar />
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '50vh',
                    fontSize: '18px'
                }}>
                    Loading product details...
                </div>
                <Footer />
            </>
        );
    }
    
    // Error state
    if (error) {
        return (
            <>
                <Navbar />
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '50vh',
                    fontSize: '18px',
                    color: 'red',
                    textAlign: 'center',
                    padding: '20px'
                }}>
                    <div>
                        <h3>Error Loading Product</h3>
                        <p>{error}</p>
                        <p>Please check if the backend server is running on localhost:5000</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }
    
    // No product found
    if (!product) {
        return (
            <>
                <Navbar />
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '50vh',
                    fontSize: '18px'
                }}>
                    Product not found
                </div>
                <Footer />
            </>
        );
    }
    
    // Success state
    return (
        <>
            <Navbar />
            <ProductDetails product={product} />
            <Footer />
        </>
    );
}

export default ProductPage;