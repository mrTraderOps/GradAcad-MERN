import { useContext, useEffect, useState } from "react";
import "./LoginPage.scss";
import { UserContext } from "../../../context/UserContext";
import logo from "../../../assets/images/nc_logo_large.png";
import partner1 from "../../../assets/images/ccs_icon.png";
import partner2 from "../../../assets/images/hm.png";
import partner3 from "../../../assets/images/safe_icon.png";
import loadingHorizontal from "../../../assets/webM/loadingHorizontal.webm";
import { handleLogin } from "../../../services/UserService";
import API from "../../../context/axiosInstance";

interface Props {
  onLogin: () => void;
}

const LoginPage = ({ onLogin }: Props) => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("LoginPage must be used within a UserProvider");
  }

  const { setUser, setToken } = context;

  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [isDoneRoleCounts, setIsDoneRoleCounts] = useState<boolean>(false);
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [year, setYear] = useState("");
  const [number, setNumber] = useState("");

  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  // Registration Fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRoleCounts = async () => {
      try {
        const response = await API.get("/auth/getCountUsersRole");
        if (response.data.success) {
          setRoleCounts(response.data.roleCounts);
          setIsDoneRoleCounts(true);
        }
      } catch (error) {
        console.error("Error fetching role counts:", error);
      }
    };

    fetchRoleCounts();
  }, []);

  useEffect(() => {
    if (year.length === 4 && number.length === 4) {
      setUserId(`${year}-${number}`);
    } else {
      setUserId("");
    }
  }, [year, number]);

  const handleRoleChange = (selectedRole: string) => {
    setRole(selectedRole);
    let newId = "";

    if (selectedRole === "student") {
      // Student ID format: YYYY-NNNN (User must input manually)
      setUserId(""); // Clear input for manual entry
    } else {
      const count = (roleCounts[selectedRole] || 0) + 1;

      if (selectedRole === "prof") {
        newId = `INST-${count.toString().padStart(3, "0")}`;
      } else if (selectedRole === "admin") {
        newId = `MIS-${count.toString().padStart(3, "0")}`;
      } else if (selectedRole === "registrar") {
        newId = `REGIST-${count.toString().padStart(3, "0")}`;
      } else if (selectedRole === "dean") {
        newId = `DEAN-${count.toString().padStart(3, "0")}`;
      }

      setUserId(newId);
    }
  };

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
          "http://localhost:5000/api/v1/auth/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          }
        );

        const data = await response.json();
        if (!data.succes) {
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
      handleLogin(
        username,
        password,
        onLogin,
        setUser,
        setToken,
        setErrorMessage,
        setIsLoading
      );
    }
  };

  const handleSubmitForgotPassword = (e: any) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Invalid email format");
      return;
    }
    setError("");
    console.log("Reset password for:", email);
    setEmail(""); // Clear input after submission
  };

  return (
    <div className="login-page">
      <div className="background-container"></div>
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
                  <label>Role</label>
                  <select
                    value={role}
                    onChange={(e) => {
                      handleRoleChange(e.target.value);
                    }}
                    required
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Role</option>
                    <option value="dean">Dean</option>
                    <option value="admin">MIS</option>
                    <option value="registrar">Registrar</option>
                    <option value="prof">Instructor</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                {role && ( // Only show input when a role is selected
                  <div
                    className={
                      role !== "student" ? "form-group" : "studentForm"
                    }
                  >
                    <label>
                      {role === "student"
                        ? "Student ID: "
                        : "Auto-Generated ID"}
                    </label>

                    {role === "student" && (
                      <>
                        <input
                          type="number"
                          placeholder="YYYY"
                          value={year}
                          min="2007"
                          max={currentYear}
                          onChange={(e) => {
                            const value = e.target.value;

                            if (/^\d*$/.test(value) && value.length <= 4) {
                              setYear(value);
                            }
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            // Validate year is not below 2012
                            if (value && parseInt(value) < 2012) {
                              alert("Year must be 2007 or later");
                              setYear("");
                            } else if (parseInt(value) > currentYear) {
                              alert(`Year must be below to ${currentYear}`);
                              setYear("");
                            }
                          }}
                        />
                        <span>-</span>
                        <input
                          type="text"
                          placeholder="NNNN"
                          value={number}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Only allow numbers and limit to 4 digits
                            if (/^\d*$/.test(value) && value.length <= 4) {
                              setNumber(value);
                            }
                          }}
                        />
                      </>
                    )}
                    {role !== "student" && (
                      <>
                        <input
                          type="text"
                          placeholder=""
                          value={userId}
                          onChange={(e) => {
                            setUserId(e.target.value);
                          }}
                          disabled={true}
                        />
                      </>
                    )}
                  </div>
                )}
                <button
                  className="register-btn"
                  type="submit"
                  disabled={isLoading || !isDoneRoleCounts}
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
                      setEmail(e.target.value);
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
                  {!isLoading && (
                    <a
                      href="#"
                      className="forgot-password"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Forgot Password?
                    </a>
                  )}
                </div>
                {isLoading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    <video autoPlay loop muted width={60}>
                      <source src={loadingHorizontal} type="video/webm" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <>
                    <button className="login-btn" type="submit">
                      Login
                    </button>
                    <p>
                      Don't have an Account?{" "}
                      <a
                        onClick={() => {
                          setIsRegistering(true);
                          setEmail("");
                          setErrorMessage("");
                          setName("");
                          setPassword("");
                          setRole("");
                          setUserId("");
                          setUsername("");
                        }}
                      >
                        Sign Up
                      </a>
                    </p>
                  </>
                )}
              </>
            )}
          </form>
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
      </div>
      {isModalOpen && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h3>Forgot Password</h3>
            <p>Enter your email to receive password reset instructions.</p>
            <form onSubmit={handleSubmitForgotPassword}>
              <div className="formGroup">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{ maxWidth: "90%", borderRadius: "10px" }}
                  required
                />
                {error && <p className="error">{error}</p>}
              </div>

              <div className="modalActions">
                <button type="submit">Submit</button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEmail("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
