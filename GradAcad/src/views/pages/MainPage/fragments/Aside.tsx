import { ReactNode } from "react";
import styles from "../styles/MainPage.module.scss";
import { useResolvedPath, useMatch, useNavigate } from "react-router-dom";

interface Props {
  onLogout: () => void;
  role: string;
}

interface CustomButton {
  to: any;
  children: ReactNode;
}

const Aside = ({ role, onLogout }: Props) => {
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

          {role === "admin" && (
            <>
              <CustomButton to="/account_approvals">
                ACCOUNT APPROVAL
              </CustomButton>
              <CustomButton to="/user_management">USER MANAGEMENT</CustomButton>
              <CustomButton to="/audit_trail">AUDIT TRAIL</CustomButton>
            </>
          )}

          {role === "prof" && (
            <>
              <CustomButton to="/grade_encoding">GRADE ENCODING</CustomButton>
              <CustomButton to="/settings">SETTINGS</CustomButton>
            </>
          )}

          {role === "registrar" && (
            <>
              <CustomButton to="/grade_sheet">GRADE SHEET</CustomButton>
              <CustomButton to="/settings">SETTINGS</CustomButton>
            </>
          )}
        </ul>
      </nav>
      <footer>
        <button onClick={onLogout}>LOGOUT</button>
      </footer>
    </aside>
  );
};

export default Aside;
