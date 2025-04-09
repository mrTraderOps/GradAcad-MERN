import style from "../styles/Settings.module.scss";
import { useContext, useState } from "react";
import { UserContext } from "../../../../context/UserContext";
import API from "../../../../context/axiosInstance";
import avatar from "../../../../assets/images/profile.png";

const Settings = () => {
  const [isProfile, setProfile] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const context = useContext(UserContext);

  if (!context) {
    throw new Error("User role can't read");
  }

  const { user } = context;

  // ✅ Password Validation Function
  const validatePassword = (password: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;
    return regex.test(password);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    if (!validatePassword(newPassword)) {
      alert(
        "Password must be 8-16 characters long, include uppercase, lowercase, a number, and a special character."
      );
      return;
    }

    try {
      const response = await API.post("/user/changePassword", {
        refId: user?.refId,
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        alert("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(response.data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("An error occurred while changing the password.");
    }
  };

  return (
    <div className={style.settings}>
      <header>
        <h2>Settings</h2>
      </header>
      <main className={style.settingsSection}>
        <div className={style.tabs}>
          <button className={style.tab1} onClick={() => setProfile(true)}>
            My Profile
          </button>
          <button className={style.tab2} onClick={() => setProfile(false)}>
            Security
          </button>
        </div>
        <div className={style.profileSection}>
          <h2 style={{ textAlign: "start" }}>My Profile</h2>
          <div className={style.profileCard}>
            <div className={style.profileInfo}>
              <img
                src={avatar}
                alt="User Avatar"
                className={style.avatar}
                width={100}
              />
              <div>
                <h2 style={{ textAlign: "start" }}>{user?.name}</h2>
                <p style={{ color: "rgb(37, 35, 35)", fontWeight: 500 }}>
                  {user
                    ? user.role === "registrar"
                      ? "Registrar"
                      : user.role === "prof"
                      ? "Instructor"
                      : user.role === "admin"
                      ? "Admin"
                      : user.role === "student"
                      ? "Student"
                      : user.role === "dean"
                      ? "College Dean"
                      : "Pending"
                    : "User role can't read"}
                </p>
                <p>{user?.email}@gmail.com</p>
              </div>
            </div>
          </div>
          {isProfile ? (
            <div className={style.personalInfo}>
              <div>
                <h3>SYSTEM INFORMATION</h3>
                <span>
                  <section>
                    <p
                      style={{
                        color: "rgb(37, 35, 35)",
                        fontWeight: 500,
                        paddingTop: "10px",
                      }}
                    >
                      {user
                        ? user.role === "registrar"
                          ? "Registrar"
                          : user.role === "prof"
                          ? "Instructor"
                          : user.role === "admin"
                          ? "Admin"
                          : user.role === "student"
                          ? "Student"
                          : user.role === "dean"
                          ? "Dean"
                          : "Pending"
                        : "User role can't read"}{" "}
                      ID : <strong>{user?.refId}</strong>
                    </p>
                  </section>
                </span>
              </div>
            </div>
          ) : (
            <div className={style.personalInfo}>
              <div>
                <h3>SECURITY</h3>
                <span>
                  <section>
                    <p style={{ color: "rgb(37, 35, 35)", fontWeight: 700 }}>
                      Password:
                      <button
                        style={{
                          color: "rgba(37, 35, 35, 0.8)",
                          border: "solid 1px rgba(37, 35, 35, 0.8)",
                          borderRadius: "11px",
                          marginLeft: "17px",
                        }}
                        onClick={() => setIsPasswordModalOpen(true)}
                      >
                        Change Password
                      </button>
                    </p>
                  </section>
                </span>
              </div>
            </div>
          )}
          {isPasswordModalOpen && (
            <div className={style.modal}>
              <div className={style.modalContent}>
                <h3>Change Password</h3>
                <label>Current Password:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <label>New Password:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <label>Confirm New Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    marginTop: "20px",
                    gap: "10px",
                  }}
                >
                  <button
                    onClick={handleChangePassword}
                    style={{ backgroundColor: "#0F2A71" }}
                  >
                    Submit
                  </button>
                  <button onClick={() => setIsPasswordModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;
