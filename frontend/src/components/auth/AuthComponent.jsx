import './AuthComponent.css'
import { Link } from 'react-router-dom';

function AuthComponent({ isLogin }) {
    return (
        <div className="auth-container">
            <div className="left-box">
                <span>{ isLogin ? "Login" : "Looks like you're new here!" }</span>
                <p>{ isLogin ? "Get access to your Orders, Wishlist and Recommendations" : "Sign up with your mobile number to get started" }</p>
            </div>
            <div className="right-box">
                <div className="form-section">
                    <div className="input-section">
                        <input id="phone" type="number" placeholder="Enter Phone Number"></input>
                        <p id="error-message"></p>
                    </div>
                    <div className="terms-section">
                        <p>By continuing, you agree to QwikMall's <a href=''>Terms of Use</a> and <a href=''>Privacy Policy</a>.</p>
                    </div>
                    <div className="button-section">
                        <button id="submit-btn" type="submit">Request OTP</button>
                    </div>
                </div>
                <div className="go-to-login-section">
                    <Link to={ isLogin ? "/signup" : "/login" }>{ isLogin ? "New to Qwikmall? Create an account" : "Existing User? Log in" }</Link>
                </div>
            </div>
        </div>
    )
}

export default AuthComponent;