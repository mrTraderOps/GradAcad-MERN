import style from "../styles/Settings.module.scss";

interface Props {
  LoggedName: string;
  LoggeduserName: string;
}

const Settings = ({ LoggedName, LoggeduserName }: Props) => {
  return (
    <div className={style.settings}>
      <header>
        <h2>Settings</h2>
      </header>
      <main className={style.settingsSection}>
        {/* <div className={style.tabs}>
                    <button className={style.tab}>My Profile</button>
                </div> */}
        <div className={style.profileSection}>
          <h2>My Profile</h2>
          <div className={style.profileCard}>
            <div className={style.profileInfo}>
              <img
                src="src\assets\images\profile.png"
                alt="User Avatar"
                className={style.avatar}
                width={100}
              />
              <div>
                <h2>{LoggedName}</h2>
                <p>Professor</p>
                <p>{LoggeduserName}@gmail.com</p>
              </div>
            </div>
          </div>
          <div className={style.personalInfo}>
            <div>
              <h3>Personal Information</h3>
              <span>
                <section>
                  <p>
                    <strong>Phone:</strong> (+63) 912345678
                  </p>
                  <p>
                    <strong>Position:</strong> Professor
                  </p>
                </section>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
