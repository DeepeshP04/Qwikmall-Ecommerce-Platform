import './AuthComponent.css'
import { Link } from 'react-router-dom';

function AuthComponent({ spanText, description, submitText, alternateLink, alternateLinkText }) {
    return (
        <div className="auth-container">
            <div className="left-box">
                <span>{ spanText }</span>
                <p>{ description }</p>
            </div>
            <div className="right-box">
                <div className="form-section">
                    <div className="input-section">
                        <input id="phone" type="number" placeholder="Enter Phone Number"></input>
                    </div>
                    <div className="terms-section">
                        <p>By continuing, you agree to QwikMall's <a href=''>Terms of Use</a> and <a href=''>Privacy Policy</a>.</p>
                    </div>
                    <div className="button-section">
                        <button id="submit-btn" type="submit">{ submitText }</button>
                    </div>
                </div>
                <div className="go-to-login-section">
                    <Link to={alternateLink}>{ alternateLinkText }</Link>
                </div>
            </div>
        </div>
    )
}

export default AuthComponent;