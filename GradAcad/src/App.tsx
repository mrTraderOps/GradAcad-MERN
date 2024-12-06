import LoginPage from "./views/pages/LoginPage/LoginPage";
import MainPage from "./views/pages/MainPage/MainPage";
import { UserProvider } from "./models/context/UserContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/grade_encoding" replace />
              ) : (
                <LoginPage onLogin={() => setIsLoggedIn(true)} />
              )
            }
          />

          <Route
            path="/*"
            element={
              isLoggedIn ? (
                <MainPage onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
