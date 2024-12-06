import React, {
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

// Define a type for the user object
type User = {
  id: number;
  name: string;
  username: string;
} | null;

// Define a type for the context value
type UserContextType = {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
};

// Create the context with a default value of `undefined` (until provided by `UserProvider`)
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

// Define props for the UserProvider component
type UserProviderProps = {
  children: ReactNode; // Accept any valid React children
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
