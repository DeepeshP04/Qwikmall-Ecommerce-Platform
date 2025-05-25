import AuthComponent from "../components/auth/AuthComponent";
import Footer from "../components/footer/Footer";
import Navbar from "../components/header/Navbar";

function Login() {
    return (
        <>
            <Navbar></Navbar>
            <AuthComponent spanText="Login" 
                description="Get access to your Orders, Wishlist and Recommendations" 
                submitText="Request OTP" alternateLink="New to Qwikmall? Create an account">
            </AuthComponent>
            <Footer></Footer>
        </>
    )
}

export default Login;