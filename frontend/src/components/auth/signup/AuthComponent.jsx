import './AuthComponent.css'

function AuthComponent() {
    return (
        <div className="auth-container">
            <div className="left-box">
                <span>Looks like you're new here!</span>
                <p>Sign up with your mobile number to get started</p>
            </div>
            <div className="right-box">
                <div className="form-section">
                    <div className="input-section">
                        <input id="phone" type="number" placeholder="Enter Phone Number"></input>
                    </div>
                    <div className="terms-section">
                        <input id="terms-checkbox" type="checkbox"></input>
                        <p>By continuing, you agree to QwikMall's Terms of Use and Privacy Policy.</p>
                    </div>
                    <div className="button-section">
                        <button id="submit-btn" type="submit">Sign Up</button>
                    </div>
                </div>
                <div className="go-to-login-section">
                    <a href="">Existing User? Log in</a>
                </div>
            </div>
        </div>
    )
}

export default AuthComponent;