import Navbar from '../components/header/Navbar'
import Main from '../components/main/Main'
import Footer from '../components/footer/Footer'
import CategoryAllProducts from '../components/products/CategoryAllProducts';

function Home() {
    return (
        <>
            <Navbar></Navbar>
            <Main></Main>
            <Footer></Footer>
            <CategoryAllProducts></CategoryAllProducts>
        </>
    )
}

export default Home;