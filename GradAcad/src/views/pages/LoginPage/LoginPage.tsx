import { useContext, useEffect, useState } from "react";
import "./LoginPage.scss";
import { UserContext } from "../../../context/UserContext";
import logo from "../../../assets/images/nc_logo_large.png";
import partner1 from "../../../assets/images/ccs_icon.png";
import partner2 from "../../../assets/images/hm.png";
import partner3 from "../../../assets/images/safe_icon.png";
import loadingHorizontal from "../../../assets/webM/loadingHorizontal.webm";
import { handleLogin, handleRegister } from "../../../services/UserService";
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
  const [assignedDept, SetAssignedDept] = useState("");

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

  useEffect(() => {
    setPassword("");
    setEmail("");
    setNumber("");
    setEmail("");
    setName("");
    setUserId("");
    setUsername("");
    setRole("");
    SetAssignedDept("");
    setErrorMessage("");
    setError("");
  }, [isRegistering]);

  const handleRoleChange = (selectedRole: string) => {
    setRole(selectedRole);
    let newId = "";

    if (selectedRole === "student") {
      setNumber("");
      setYear("");
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

  const validateStudentId = (userId: string): boolean => {
    const studentIdPattern = /^\d{4}-\d{4}$/;
    return studentIdPattern.test(userId);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (isRegistering) {
      if (!validateEmail(email.trim())) {
        alert("Invalid email format. Please enter a valid email address.");
        setEmail("");
        setIsLoading(false);
        return;
      }

      if (role === "student") {
        if (!validateStudentId(userId.trim())) {
          alert("Invalid student ID format. Please enter a valid Student ID.");
          setUserId("");
          setIsLoading(false);
          return;
        }
      }

      if (!validatePassword(password.trim())) {
        alert(
          "Password must be 8-16 characters long, include uppercase, lowercase, a number, and a special character."
        );
        setIsLoading(false);
        return;
      }

      handleRegister(
        email,
        userId,
        role,
        password,
        setErrorMessage,
        setIsLoading,
        name,
        assignedDept
      );
    } else {
      handleLogin(
        username.trim(),
        password.trim(),
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
    setError("");
    setIsLoading(true);
    try {
      if (!validateEmail(email.trim())) {
        alert("Invalid email format. Please enter a valid email address.");
        setEmail("");
        setIsLoading(false);
        return;
      }
      API.post("/email/forgotPassword", { emailOrId: username }).then((res) => {
        if (res.data.success) {
          alert("Check your email for password reset instructions.");
          setIsModalOpen(false);
          setEmail("");
        } else {
          setError(res.data.message);
        }
      });
    } catch (error) {
      alert(`Internal Server Error: ${error}`);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
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

                {role && (
                  <>
                    {role !== "student" && (
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
                    )}

                    {role === "dean" && (
                      <div className="form-group">
                        <label>Assigned College Department</label>
                        <select
                          style={{ width: "100%" }}
                          value={assignedDept}
                          onChange={(e) => SetAssignedDept(e.target.value)}
                          required
                        >
                          <option value="">Select College Department</option>
                          <option value="CCS">
                            College of Computing Studies
                          </option>
                          <option value="COED">College of Education</option>
                          <option value="CHM">
                            College of Hospitality Management
                          </option>
                        </select>
                      </div>
                    )}

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
                            maxLength={4}
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
                            onKeyDown={(e) => {
                              // Block unwanted characters
                              if (
                                ["e", "E", "+", "-", ".", ","].includes(e.key)
                              ) {
                                e.preventDefault();
                              }
                            }}
                          />
                          <span style={{ color: "black" }}>-</span>
                          <input
                            type="text"
                            placeholder="NNNN"
                            value={number}
                            maxLength={4}
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
                  </>
                )}
                <button
                  className="register-btn"
                  type="submit"
                  disabled={isLoading || !isDoneRoleCounts}
                >
                  {isLoading ? "Signing Up..." : "Sign Up"}
                </button>
                {!isLoading ? (
                  <p>
                    Already have an account?{" "}
                    <a onClick={() => setIsRegistering(false)}>Login</a>
                  </p>
                ) : null}
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
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
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
