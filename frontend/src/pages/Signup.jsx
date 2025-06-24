import AuthComponent from "../components/auth/AuthComponent";
import Navbar from "../components/header/Navbar";
import Footer from "../components/footer/Footer";

function Signup() {
    return (
        <>
            <Navbar></Navbar>
            <AuthComponent isLogin={false}>
            </AuthComponent>
            <Footer></Footer>
        </>
    )
}

export default Signup;