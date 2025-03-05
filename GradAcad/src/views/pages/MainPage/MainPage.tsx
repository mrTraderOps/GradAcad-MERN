import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Aside from "./fragments/Aside";
import MainpageHeader from "./fragments/MainpageHeader";
import Dashboard from "./fragments/Dashboard";
import Settings from "./fragments/Settings";
import GradeEncode from "./fragments/GradeEncode";
import styles from "../MainPage/styles/MainPage.module.scss";
import { UserContext } from "../../../models/context/UserContext";
import AccountApproval from "./fragments/AccountsApproval";
import UserManagement from "./fragments/UserManagement";
import AuditTrail from "./fragments/AuditTrail";

interface Props {
  onLogout: () => void;
}

const MainPage = ({ onLogout }: Props) => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("MainPage must be used within a UserProvider");
  }

  const { user } = context;

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className={styles.landingPage}>
      <Aside onLogout={onLogout} role={user.role} />

      <main>
        <MainpageHeader />
        <div className={styles.MainPage}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  LoggedName={user.name}
                  userRole={user.role}
                  LoggeduserName={user.username}
                />
              }
            />
            <Route
              path="/grade_encoding"
              element={<GradeEncode LoggeduserName={user.username} />}
            />
            <Route path="/account_approvals" element={<AccountApproval />} />
            <Route path="/user_management" element={<UserManagement />} />
            <Route path="/audit_trail" element={<AuditTrail />} />
            <Route
              path="/settings"
              element={
                <Settings
                  LoggedName={user.name}
                  LoggeduserName={user.username}
                />
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default MainPage;
