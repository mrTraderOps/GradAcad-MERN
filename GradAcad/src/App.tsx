import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./views/pages/LoginPage/LoginPage";
import MainPage from "./views/pages/MainPage/MainPage";
import { UserProvider, UserContext } from "./context/UserContext";
import ForgotPass from "./views/pages/LoginPage/ForgotPass";

function App() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("App must be used within a UserProvider");
  }

  const { user, logout } = context;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              user.role === "prof" ? (
                <Navigate to="/subjects" replace />
              ) : user.role === "admin" ? (
                <Navigate to="/account_approvals" replace />
              ) : user.role === "registrar" ? (
                <Navigate to="/grade_period" replace />
              ) : user.role === "student" ? (
                <Navigate to="/grade_viewing" replace />
              ) : (
                <Navigate to="/encoding_checklist" replace />
              )
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/*"
          element={
            user ? <MainPage onLogout={logout} /> : <Navigate to="/" replace />
          }
        />
        <Route path="/reset_password" element={<ForgotPass />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function AppWrapper() {
  return (
    <UserProvider>
      <App />
    </UserProvider>
  );
}
