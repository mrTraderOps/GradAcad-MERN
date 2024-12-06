import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.scss";
import axios from "axios";
import { UserContext } from "../../../models/context/UserContext";

import logo from "../../../assets/images/nc_logo_large.png";
import qrGrade from "../../../assets/images/qr-grade.png";
import partner1 from "../../../assets/images/ccs_icon.png";
import partner2 from "../../../assets/images/charms_icon.png";
import partner3 from "../../../assets/images/safe_icon.png";

interface Props {
  onLogin: () => void;
}

const LoginPage = ({ onLogin }: Props) => {
  const navigate = useNavigate();

  const context = useContext(UserContext);

  if (!context) {
    throw new Error("LoginPage must be used within a UserProvider");
  }

  const { setUser } = context;

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/api/login", { username, password })
      .then((response) => {
        if (response.data.success) {
          onLogin();
          setUser(response.data.user);
          navigate("/grade_encoding");
        } else {
          setErrorMessage(response.data.message || "Invalid credentials.");
        }
      })
      .catch((error) => {
        const message = error.response?.data?.message || "An error occurred.";
        setErrorMessage(message);
      });
  };

  return (
    <div className="login-page">
      <div className="left-section">
        <div className="container-left">
          <div className="logo-container">
            <img src={logo} alt="College Logo" className="college-logo" />
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
        <span className="span">
          <img src={qrGrade} alt="" width={300} />
          <h4>Looking for Grade? Scan the QR</h4>
        </span>
      </div>
      <div className="right-section">
        <div className="login-form">
          <h2>Login</h2>
          <p>Enter your account details</p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>
            <button className="login-btn" type="submit">
              Login
            </button>
            <p>
              Don't have an Account? <a href="#">Sign Up</a>
            </p>
          </form>
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
