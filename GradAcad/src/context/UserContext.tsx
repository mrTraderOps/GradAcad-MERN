import React, { createContext, useState } from "react";

interface User {
  refId?: string;
  id: string;
  username?: string;
  studentId?: string;
  email: string;
  name: string;
  role: string;
  password?: string;
}

interface ConfirmData {
  sem: string;
  acadYr: string;
  dept: string;
  sect: string;
  subjCode: string;
  subjName: string;
  terms?: [string];
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void; // Logout function
  confirmData: ConfirmData[]; // Array of confirmation data
  addConfirmData: (data: ConfirmData) => void; // Function to add confirmation data
}

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const logout = () => {
    setUser(null);
  };

  const [confirmData, setConfirmData] = useState<ConfirmData[]>([
    // {
    //   sem: "Second",
    //   acadYr: "2024 - 2025",
    //   dept: "BSCS",
    //   sect: "4A",
    //   subjCode: "THESIS 102",
    //   subjName: "Thesis 2",
    //   terms: [""],
    // },
  ]);

  // Function to add confirmation data to the array
  const addConfirmData = (data: ConfirmData) => {
    console.log(data);
    setConfirmData((prev) => [...prev, data]);
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, logout, confirmData, addConfirmData }}
    >
      {children}
    </UserContext.Provider>
  );
};
