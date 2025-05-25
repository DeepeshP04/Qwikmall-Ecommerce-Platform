import AuthComponent from "../components/auth/AuthComponent";
import Navbar from "../components/header/Navbar";
import Footer from "../components/footer/Footer";

function Signup() {
    return (
        <>
            <Navbar></Navbar>
            <AuthComponent spanText="Looks like you're new here!" 
                description="Sign up with your mobile number to get started" 
                submitText="Request OTP" alternateLink="/login" alternateLinkText="Existing User? Log in">
            </AuthComponent>
            <Footer></Footer>
        </>
    )
}

export default Signup;