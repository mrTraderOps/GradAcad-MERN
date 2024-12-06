import { ReactNode } from "react";
import styles from "../styles/MainPage.module.scss";
import { useResolvedPath, useMatch, useNavigate } from "react-router-dom";

interface Props {
  onLogout: () => void;
}

interface CustomButton {
  to: any;
  children: ReactNode;
}

const Aside = ({ onLogout }: Props) => {
  function CustomButton({ to, children, ...props }: CustomButton) {
    const resolvedPath = useResolvedPath(to);
    const isActive = useMatch({ path: resolvedPath.pathname, end: true });
    const navigate = useNavigate();

    const handleClick = () => {
      navigate(to);
    };

    return (
      <li className={isActive ? styles.activeButton : ""}>
        <button onClick={handleClick} {...props}>
          {children}
        </button>
      </li>
    );
  }

  return (
    <aside className={styles.aside}>
      <header className={styles.header}>
        <div>
          <img
            src="src/assets/icons/acadEx_logo.png"
            width={30}
            height={30}
            alt="LOGO"
          />
          <div>
            <h2>GRAD</h2>
            <h2 className={styles.excel}>ACAD</h2>
          </div>
        </div>
      </header>
      <nav>
        <ul className={styles.navItems}>
          <CustomButton to="/dashboard">DASHBOARD</CustomButton>
          <CustomButton to="/grade_encoding">GRADE ENCODING</CustomButton>
          <CustomButton to="/settings">ACCOUNT DETAILS</CustomButton>
        </ul>
      </nav>
      <footer>
        <button onClick={onLogout}>LOGOUT</button>
      </footer>
    </aside>
  );
};

export default Aside;
