import React, { createContext, useEffect, useState } from "react";

export interface User {
  refId?: string;
  id: string;
  username?: string;
  studentId?: string;
  email: string;
  name: string;
  role: string;
  password?: string;
  assignDept?: string;
}

interface ConfirmData {
  sem: string;
  acadYr: string;
  dept: string;
  sect: string;
  subjCode: string;
  subjName?: string;
  terms?: [string];
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
  confirmData: ConfirmData[]; // Array of confirmation data
  addConfirmData: (data: ConfirmData) => void; // Function to add confirmation data
  login: (userData: User) => void; // Function to log in and store user data
  token: string | null;
  setToken: (token: string | null) => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [confirmData, setConfirmData] = useState<ConfirmData[]>([]);

  // 🔁 Load token from sessionStorage on first render
  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      setTokenState(storedToken);
    }
  }, []);

  // ✅ Rehydrate user from localStorage on initial load
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Optional: Helper function to log in and store in localStorage
  const login = (userData: User) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Save token to sessionStorage and update state
  const setToken = (newToken: string | null) => {
    if (newToken) {
      sessionStorage.setItem("token", newToken);
    } else {
      sessionStorage.removeItem("token");
    }
    setTokenState(newToken);
  };

  // Function to add confirmation data to the array
  const addConfirmData = (data: ConfirmData) => {
    console.log(data);
    setConfirmData((prev) => [...prev, data]);
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    setToken(null); // 🧹 Clear token on logout
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
        login,
        confirmData,
        addConfirmData,
        token,
        setToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
