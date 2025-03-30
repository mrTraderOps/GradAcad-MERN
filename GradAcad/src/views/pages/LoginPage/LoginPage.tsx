import { useContext, useState } from "react";
import "./LoginPage.scss";
import { UserContext } from "../../../context/UserContext";

import logo from "../../../assets/images/nc_logo_large.png";
import partner1 from "../../../assets/images/ccs_icon.png";
import partner2 from "../../../assets/images/charms_icon.png";
import partner3 from "../../../assets/images/safe_icon.png";
import { handleLogin } from "../../../services/UserService";

interface Props {
  onLogin: () => void;
}

const LoginPage = ({ onLogin }: Props) => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("LoginPage must be used within a UserProvider");
  }

  const { setUser } = context;

  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Registration Fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Password Validation Function
  const validatePassword = (password: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;
    return regex.test(password);
  };

  const validateEmail = (email: string): boolean => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    if (isRegistering) {
      try {
        // Validate role
        if (!["admin", "registrar", "student", "prof"].includes(role)) {
          setErrorMessage("Invalid role selected.");
          setIsLoading(false);
          return;
        }

        // Validate studentId if role is student
        if (!userId.trim()) {
          setErrorMessage("Employee or Student ID is required for students.");
          setIsLoading(false);
          return;
        }

        const userData: any = { email, name, password, role };
        // Define regex pattern for student ID format (YYYY-NNNN)
        const studentIdPattern = /^\d{4}-\d{4}$/;

        // Add studentId to the request only if the role is "student" and a valid format is entered
        if (role === "student") {
          if (studentIdPattern.test(userId.trim())) {
            userData.studentId = userId;
          } else {
            alert(
              "Invalid Student ID format. Please enter in YYYY-NNNN format."
            );
            return;
          }
        } else {
          userData.employeeId = userId;
        }

        if (!validateEmail(email.trim())) {
          alert("Invalid email format. Please enter a valid email address.");
          return;
        }

        if (!validatePassword(userData.password)) {
          alert(
            "Password must be 8-16 characters long, include uppercase, lowercase, a number, and a special character."
          );
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/v1/user/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          }
        );

        const data = await response.json();
        if (!data.success) {
          setErrorMessage(data.message || "Registration failed.");
        } else {
          setIsRegistering(false);
          alert(
            "Registration successful! Kindly wait to your registered e-mail for the approval of your application. Warm Regards."
          );
        }
      } catch (error) {
        setErrorMessage("Registration failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      handleLogin(username, password, onLogin, setUser, setErrorMessage);
      setIsLoading(false);
    }
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
      </div>

      {/* Dynamic Panel */}
      <div className={`right-section ${isRegistering ? "expand" : ""}`}>
        <div className={`login-form ${isRegistering ? "register-panel" : ""}`}>
          <h2>{isRegistering ? "Sign Up" : "Login"}</h2>
          <p>
            {isRegistering
              ? "Create a new account"
              : "Enter your account details"}
          </p>

          <form onSubmit={handleSubmit}>
            {isRegistering ? (
              <>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                </div>
                <div className="form-group">
                  <label>Employee or Student ID</label>
                  <input
                    type="text"
                    placeholder="ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="registrar">Registrar</option>
                    <option value="student">Student</option>
                    <option value="prof">Instructor</option>
                  </select>
                </div>

                <button
                  className="register-btn"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing Up..." : "Sign Up"}
                </button>
                <p>
                  Already have an account?{" "}
                  <a onClick={() => setIsRegistering(false)}>Login</a>
                </p>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Email or Student ID</label>
                  <input
                    type="text"
                    placeholder="Email or Student ID"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
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
                <button
                  className="login-btn"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging In..." : "Login"}
                </button>
                <p>
                  Don't have an Account?{" "}
                  <a onClick={() => setIsRegistering(true)}>Sign Up</a>
                </p>
              </>
            )}
          </form>
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
