import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./LoginPage.scss";
import logo from "../../../assets/images/nc_logo_large.png";
import partner1 from "../../../assets/images/ccs_icon.png";
import partner2 from "../../../assets/images/hm.png";
import partner3 from "../../../assets/images/safe_icon.png";
import API from "../../../context/axiosInstance";

const ForgotPass = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await API.post("/auth/resetPassword", {
        token,
        newPassword: password,
      });

      if (response.data.success) {
        setMessage("✅ Password changed successfully! Redirecting...");
        setTimeout(() => navigate("/"), 3000); // redirect to login after 3s
      } else {
        setMessage("❌ Failed to change password.");
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "❌ An unexpected error occurred.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="background-container"></div>

      <div className="left-section">
        <div className="container-left">
          <div className="logo-container">
            <img src={logo} alt="Norzagaray College" className="college-logo" />
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
          <h2>Reset Password</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ paddingBottom: "10px" }}>New Password</label>
              <input
                type="password"
                placeholder="Enter a new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="register-btn" type="submit" disabled={loading}>
              {loading ? "Changing..." : "Change Password"}
            </button>
            {message && <p style={{ marginTop: "10px" }}>{message}</p>}
            <p>
              Changed your mind? Back to{" "}
              <a onClick={() => navigate("/")}>Login</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPass;
