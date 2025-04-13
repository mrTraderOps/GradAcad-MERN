import styles from "../styles/MainPage.module.scss";
import nc_logo from "../../../../assets/images/nc_logo.png";
const MainpageHeader = () => {
  return (
    <header className={styles.MainPageHeader}>
      <div className={styles.headerContent}>
        <div className={styles.logoWithText}>
          <img src={nc_logo} alt="Norzagaray College" width={50} />
          <span className={styles.collegeName}>Norzagaray College</span>
        </div>
        <div className={styles.custom_input}></div>
      </div>
    </header>
  );
};

export default MainpageHeader;
