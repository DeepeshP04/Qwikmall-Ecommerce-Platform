import { useParams } from "react-router-dom";
import Footer from "../components/footer/Footer";
import Navbar from "../components/header/Navbar";
import ProductDetails from "../components/products/ProductDetails";
import { useEffect, useState } from "react";

function ProductPage() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5000/products/${productId}`)
        .then(res => res.json())
        .then(data => setProduct(data.product))
        .catch(err => console.log("Failed to fetch product", err))
    }, [productId])
    
    return (
        <>
            <Navbar></Navbar>
            <ProductDetails product={product}></ProductDetails>
            <Footer></Footer>
        </>
    )
}

export default ProductPage;