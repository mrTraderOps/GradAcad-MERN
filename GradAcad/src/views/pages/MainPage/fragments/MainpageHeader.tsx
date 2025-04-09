import styles from "../styles/MainPage.module.scss";
import nc_logo from "../../../../assets/images/nc_logo.png";
const MainpageHeader = () => {
  return (
    <header className={styles.MainPageHeader}>
      <div>
        <div className={styles.custom_input}>
          <img src={nc_logo} alt="Norzagaray College" width={50} />
        </div>
      </div>
    </header>
  );
};

export default MainpageHeader;
