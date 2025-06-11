import { useParams } from "react-router-dom";
import Footer from "../components/footer/Footer";
import Navbar from "../components/header/Navbar";
import CategoryAllProducts from "../components/products/CategoryAllProducts";
import { useEffect, useState } from "react";

function CategoryProductsPage () {
    const {categoryId} = useParams()
    const [categoryProducts, setCategoryProducts] = useState([])

    useEffect(() => {
        fetch(`http://localhost:5000/products/category/${categoryId}`)
        .then(res => res.json())
        .then(data => setCategoryProducts(data.products))
        .catch(err => console.log("Failed to fetch products", err))
    }, [])

    return (
        <>
            <Navbar></Navbar>
            <CategoryAllProducts categoryName={categoryId} products={categoryProducts}></CategoryAllProducts>
            <Footer></Footer>
        </>
    )
}

export default CategoryProductsPage;