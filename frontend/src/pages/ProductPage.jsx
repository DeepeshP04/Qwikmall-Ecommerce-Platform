import Footer from "../components/footer/Footer";
import Navbar from "../components/header/Navbar";
import ProductDetails from "../components/products/ProductDetails";

function ProductPage() {
    const product = {
        id: 1, name: "Phone", description: "Phone", image_url: "frontend/public/images/laptop_electronics.jpg", price: "₹10000"
    }
    return (
        <>
            <Navbar></Navbar>
            <ProductDetails product={product}></ProductDetails>
            <Footer></Footer>
        </>
    )
}

export default ProductPage;