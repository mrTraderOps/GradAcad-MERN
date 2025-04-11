// import { useState } from "react";
import "./LoginPage.scss";
import logo from "../../../assets/images/nc_logo_large.png";
import partner1 from "../../../assets/images/ccs_icon.png";
import partner2 from "../../../assets/images/hm.png";
import partner3 from "../../../assets/images/safe_icon.png";
// import loadingHorizontal from "../../../assets/webM/loadingHorizontal.webm";

const ForgotPass = () => {
  // const [email, setEmail] = useState("");

  return (
    <div className="login-page">
      <div className="background-container"></div>

      <div className="left-section">
        <div className="container-left">
          <div className="logo-container">
            <img
              src={logo}
              alt="Norzagarate College"
              className="college-logo"
            />
          </div>
          <div className="bottom-container">
            <div className="partners">
              <img src={partner1} alt="Partner 1" />
              <img src={partner2} alt="Partner 2" />
              <img src={partner3} alt="Partner 3" />
            </div>
            <p className="powered-by">with</p>
            <p>
              <strong className="strong1">GRAD</strong>
              <strong className="strong2">ACAD</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="right-section expand">
        <div className="login-form register-panel">
          <h2>Forgot Password</h2>
          <p>Enter a new password</p>

          <form>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Password" />
            </div>
            <p>
              Already have an account? <a>Login</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPass;
