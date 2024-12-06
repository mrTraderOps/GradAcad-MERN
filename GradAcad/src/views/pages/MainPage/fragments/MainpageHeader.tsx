import styles from "../styles/MainPage.module.scss";

const MainpageHeader = () => {
  return (
    <header className={styles.MainPageHeader}>
      <div>
        <div className={styles.custom_input}>
          <img
            src="src\assets\images\nc_logo.png"
            alt="Norzagaray College"
            width={50}
          />
        </div>
        <div className={styles.userProfile}>
          <button>
            <img
              src="src\assets\icons\user_profile_icon.png"
              width={30}
              height={30}
              alt="Profile"
            />
          </button>
          <button>
            <img
              src="src\assets\icons\notif_icon.png"
              width={30}
              height={30}
              alt="Notifications"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default MainpageHeader;
