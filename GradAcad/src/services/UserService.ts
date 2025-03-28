import axios from "axios";

export const handleLogin = (
  username: string,
  password: string,
  onLogin: () => void,
  setUser: React.Dispatch<React.SetStateAction<any>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
) => {
  axios
    .post("http://localhost:5000/api/v1/user/login", { email: username, password })
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
      } else {
        setErrorMessage(response.data.message || "Invalid credentials.");
      }
    })
    .catch((error) => {
      const message = error.response?.data?.message || "An error occurred.";
      setErrorMessage(message);
    });
};


export const handleRegister = (
  email: string,
  password: string,
  role: string,
  name: string,
  studentId: string,
  setRegister: React.Dispatch<React.SetStateAction<any>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
) => {
  axios
    .post("http://localhost:5000/api/v1/user/register", { email, password, role, name, studentId })
    .then((response) => {
      if (response.data.success && response.data.user) {
        setRegister(response.data.user); 
      } else {
        setErrorMessage(response.data.message || "Invalid credentials.");
      }
    })
    .catch((error) => {
      const message = error.response?.data?.message || "An error occurred.";
      setErrorMessage(message);
    });
};

export const handlePending = (
  setPending: React.Dispatch<React.SetStateAction<any>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
) => {
  axios
    .get("http://localhost:5000/api/v1/user/getPendingUsers")
    .then((response) => {
      if (response.data.success) {
        setPending(response.data.pending); 
      } else {
        setErrorMessage(response.data.message || "Invalid credentials.");
      }
    })
    .catch((error) => {
      const message = error.response?.data?.message || "An error occurred.";
      setErrorMessage(message);
    });
}

export const getAllUsers = ( 
  setUsers: React.Dispatch<React.SetStateAction<any>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
) => {
  axios
    .get("http://localhost:5000/api/v1/user/getAllUsers")
    .then((response) => {
      if (response.data.success) {
        setUsers(response.data.users); 
      } else {
        setErrorMessage(response.data.message || "Invalid credentials.");
      }
    })
    .catch((error) => {
      const message = error.response?.data?.message || "An error occurred.";
      setErrorMessage(message);
    });
  }

