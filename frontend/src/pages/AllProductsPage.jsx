import Footer from "../components/footer/Footer";
import Navbar from "../components/header/Navbar";
import CategoryAllProducts from "../components/products/CategoryAllProducts";
import { useEffect, useState } from "react";
import Loader from "../components/loader/Loader";
import { useLocation } from 'react-router-dom';
import { API_URL } from '../config/api';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function AllProductsPage () {
    const [allProducts, setAllProducts] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const query = useQuery().get('query') || '';

    useEffect(() => {
        setIsLoading(true)
        const url = query ? `${API_URL}/products?query=${query}` : `${API_URL}/products`
        fetch(url)
        .then(res => res.json())
        .then(data => {
            setAllProducts(data.data.products || data.data)
            setIsLoading(false)
        })
        .catch(err => {
            setIsLoading(false)
            console.log("Failed to fetch all products", err)
        })
    }, [query])

    return (
        <>
            <Navbar />
            {isLoading ? <Loader /> : <CategoryAllProducts categoryName="None" products={allProducts}/>}
            <Footer />
        </>
    )
}

export default AllProductsPage; 