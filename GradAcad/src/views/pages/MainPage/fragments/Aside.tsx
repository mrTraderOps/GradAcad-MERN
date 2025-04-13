import { ReactNode } from "react";
import styles from "../styles/MainPage.module.scss";
import { useResolvedPath, useMatch, useNavigate } from "react-router-dom";
import acadEx from "../../../../assets/icons/acadEx_logo.png";

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
          <img src={acadEx} width={50} height={50} alt="LOGO" />
          <div>
            <h2>GRAD</h2>
            <h2 className={styles.excel}>ACAD</h2>
          </div>
        </div>
      </header>
      <nav>
        <ul className={styles.navItems}>
          {role === "admin" && (
            <>
              <CustomButton to="/dashboard">DASHBOARD</CustomButton>
              <CustomButton to="/account_approvals">
                ACCOUNT APPROVAL
              </CustomButton>
              <CustomButton to="/user_management">USER MANAGEMENT</CustomButton>
              <CustomButton to="/audit_trail">AUDIT TRAIL</CustomButton>
            </>
          )}

          {role === "prof" && (
            <>
              <CustomButton to="/dashboard">DASHBOARD</CustomButton>
              <CustomButton to="/subjects">SUBJECTS</CustomButton>
            </>
          )}

          {role === "registrar" && (
            <>
              <CustomButton to="/grade_period">GRADE PERIOD</CustomButton>
              <CustomButton to="/grade_sheet">GRADE SHEET</CustomButton>
              <CustomButton to="/offered_subjects">
                OFFERED SUBJECTS
              </CustomButton>
              <CustomButton to="/enrollees">ENROLLEES</CustomButton>
            </>
          )}

          {role === "student" && (
            <>
              <CustomButton to="/grade_viewing">GRADE VIEWING</CustomButton>
            </>
          )}

          {role === "dean" && (
            <>
              <CustomButton to="/encoding_checklist">
                ENCODING CHECKLIST
              </CustomButton>
              <CustomButton to="/subjects">SUBJECTS</CustomButton>
            </>
          )}

          <CustomButton to="/settings">SETTINGS</CustomButton>
        </ul>
      </nav>
      <footer>
        <button onClick={onLogout}>LOGOUT</button>
      </footer>
    </aside>
  );
};

export default Aside;
