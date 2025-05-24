import AuthComponent from "../AuthComponent";

function Login() {
    return (
        <AuthComponent spanText="Login" 
        description="Get access to your Orders, Wishlist and Recommendations" 
        submitText="Request OTP" alternateLink="New to Qwikmall? Create an account">
        </AuthComponent>
    )
}

export default Login;