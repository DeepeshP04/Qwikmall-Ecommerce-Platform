import './AuthComponent.css'

function AuthComponent({ spanText, description, submitText, alternateLink }) {
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
                        <input id="terms-checkbox" type="checkbox"></input>
                        <p>By continuing, you agree to QwikMall's Terms of Use and Privacy Policy.</p>
                    </div>
                    <div className="button-section">
                        <button id="submit-btn" type="submit">{ submitText }</button>
                    </div>
                </div>
                <div className="go-to-login-section">
                    <a href="">{ alternateLink }</a>
                </div>
            </div>
        </div>
    )
}

export default AuthComponent;