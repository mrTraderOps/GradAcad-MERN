import style from "../styles/Settings.module.scss";
import { useContext, useState } from "react";
import see from "../../../../assets/images/see.png";
import unsee from "../../../../assets/images/unsee.png";
import { UserContext } from "../../../../context/UserContext";
const Settings = () => {
  const [isProfile, setProfile] = useState(true);
  const [isUnsee, setUnsee] = useState(true);

  const context = useContext(UserContext);

  if (!context) {
    throw new Error("User role can't read");
  }

  const { user } = context;

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
                src="src\assets\images\profile.png"
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
                <h3>PERSONAL INFORMATION</h3>
                <span>
                  <section>
                    <p style={{ color: "rgb(37, 35, 35)", fontWeight: 700 }}>
                      Contact Number:
                      <p
                        style={{
                          color: "rgba(37, 35, 35, 0.8)",
                          fontWeight: 500,
                        }}
                      >
                        092838582721
                      </p>
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
                      <p
                        style={{
                          color: "rgba(37, 35, 35, 0.8)",
                          fontWeight: 500,
                        }}
                      >
                        **************
                        <img
                          src={isUnsee ? see : unsee}
                          alt="eye"
                          width={20}
                          style={{ cursor: "pointer", padding: "0px 10px" }}
                          onClick={() => setUnsee((prev) => !prev)}
                        />
                        <button style={{ color: "rgba(37, 35, 35, 0.8)" }}>
                          Change Password
                        </button>
                      </p>
                    </p>
                  </section>
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;
