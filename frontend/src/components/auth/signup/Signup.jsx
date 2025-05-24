import AuthComponent from "../AuthComponent";

function Signup() {
    return (
        <AuthComponent spanText="Looks like you're new here!" 
        description="Sign up with your mobile number to get started" 
        submitText="Request OTP" alternateLink="Existing User? Log in">
        </AuthComponent>
    )
}

export default Signup;