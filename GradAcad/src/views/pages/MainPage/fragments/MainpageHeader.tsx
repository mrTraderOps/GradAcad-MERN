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
      </div>
    </header>
  );
};

export default MainpageHeader;
