import API from "../context/axiosInstance";
import axios from "axios";


// const localURL = "http://localhost:5000";
const cloudURL = "http://localhost:5000";

export const handleLogin = (
  username: string,
  password: string,
  onLogin: () => void,
  setUser: React.Dispatch<React.SetStateAction<any>>,
  setToken: React.Dispatch<React.SetStateAction<any>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
  setLoading: React.Dispatch<React.SetStateAction<any>>
) => {
  axios
    .post(`${cloudURL}/api/v1/auth/login`, { username, password })
    .then((response) => {
      if (response.data.success && response.data.user) {
        const user = response.data.user;

        // ✅ Check if the user's status is inactive
        if (user.status === "Inactive") {
          setErrorMessage("Your account is inactive. Please seek assistance from MIS");
          return;
        }

        onLogin();
        setUser(user); 
        setToken(response.data.token);       
      } else {
        setErrorMessage(response.data.message || "Invalid credentials.");
      }
    })
    .catch((error) => {
      const message = error.response?.data?.message || "An error occurred.";
      setErrorMessage(message);
    })
    .finally(() => setLoading(false));
};

export const handleRegister = (
  email: string,
  userId: string,
  role: string,
  password: string,
  setResponse: React.Dispatch<React.SetStateAction<string>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  name?: string,
  assignDept?: string,
) => {
  axios
  .post(`${cloudURL}/api/v1/auth/register`, { email, refId: userId, role, password, assignDept, name})
    .then((response) => {
      if (response.data.success) {
        setResponse(response.data.message)
      } else {
        setResponse(response.data.message || "Invalid credentials.");
      }
    })
    .catch((error) => {
      const message = error.response?.data?.message || "An error occurred.";
      setResponse(message);
    })
    .finally(() => setIsLoading(false));
};

export const handlePending = (
  setPending: React.Dispatch<React.SetStateAction<any>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
  setError: React.Dispatch<React.SetStateAction<any>>
) => {
  API
    .get("user/getPendingUsers")
    .then((response) => {
      if (response.data.success) {
        setPending(response.data.pending); 
      } else {
        setErrorMessage(response.data.message || "Failed to fetch pending. Please try again later");
        setError(true)
      }
    })
    .catch((error) => {
      const message = error.response?.data?.message || "An error occurred. Contact your developer";
      setErrorMessage(message);
      setError(true)
    });
}

export const getAllUsers = ( 
  setUsers: React.Dispatch<React.SetStateAction<any>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
  setError: React.Dispatch<React.SetStateAction<any>>
) => {
  API
    .get("/user/getAllUsers")
    .then((response) => {
      if (response.data.success) {
        setUsers(response.data.users); 
      } else {
        setError(true)
        setErrorMessage(response.data.message || "Failed to fetch all users. Please try again later");
      }
    })
    .catch((error) => {
      const message = error.response?.data?.message || "An error occurred. Contact dev";
      setErrorMessage(message);
      setError(true)
    });
  }

