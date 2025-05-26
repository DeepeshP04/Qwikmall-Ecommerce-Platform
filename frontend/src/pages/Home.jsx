import Navbar from '../components/header/Navbar'
import Main from '../components/main/Main'
import Footer from '../components/footer/Footer'
import FilterOption from '../components/products/FilterOption';

function Home() {
    return (
        <>
            <Navbar></Navbar>
            <Main></Main>
            <Footer></Footer>
            <FilterOption></FilterOption>
        </>
    )
}

export default Home;