import React, { createContext, useEffect, useState } from "react";

interface User {
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
  logout: () => void; // Logout function
  confirmData: ConfirmData[]; // Array of confirmation data
  addConfirmData: (data: ConfirmData) => void; // Function to add confirmation data

  token: string | null; // ⬅️ New: token in context
  setToken: (token: string | null) => void; // ⬅️ New: setter for token
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
    setUser(null);
    setToken(null); // 🧹 Clear token on logout
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
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
