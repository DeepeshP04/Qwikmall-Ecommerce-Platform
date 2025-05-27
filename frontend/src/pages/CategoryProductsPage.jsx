import { useParams } from "react-router-dom";
import Footer from "../components/footer/Footer";
import Navbar from "../components/header/Navbar";
import CategoryAllProducts from "../components/products/CategoryAllProducts";

function CategoryProductsPage () {
    const {categorySlug} = useParams()

    const products = [
        {id: 1, name: "Laptop", price: "₹50000"},
        {id: 2, name: "Laptop", price: "₹50000"},
        {id: 3, name: "Laptop", price: "₹50000"},
        {id: 4, name: "Laptop", price: "₹50000"},
        {id: 5, name: "Laptop", price: "₹50000"},
        {id: 6, name: "Laptop", price: "₹50000"},
        {id: 7, name: "Laptop", price: "₹50000"},
        {id: 8, name: "Laptop", price: "₹50000"},
        {id: 9, name: "Laptop", price: "₹50000"},
        {id: 10, name: "Laptop", price: "₹50000"},
        {id: 11, name: "Laptop", price: "₹50000"},
        {id: 12, name: "Laptop", price: "₹50000"},
        {id: 13, name: "Laptop", price: "₹50000"},
    ]

    return (
        <>
            <Navbar></Navbar>
            <CategoryAllProducts categoryName={categorySlug} products={products}></CategoryAllProducts>
            <Footer></Footer>
        </>
    )
}

export default CategoryProductsPage;