import AuthComponent from "../components/auth/AuthComponent";
import Footer from "../components/footer/Footer";
import Navbar from "../components/header/Navbar";

function Login() {
    return (
        <>
            <Navbar></Navbar>
            <AuthComponent isLogin={true}>
            </AuthComponent>
            <Footer></Footer>
        </>
    )
}

export default Login;