import axios from "axios";

export const handleLogin = (
  username: string,
  password: string,
  onLogin: () => void,
  setUser: React.Dispatch<React.SetStateAction<any>>,
  navigate: any,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
) => {
  axios
    .post("http://localhost:5000/api/v1/user/login", { username, password })
    .then((response) => {
      if (response.data.success) {
        onLogin();
        setUser(response.data.user);
        navigate("/grade_encoding");
      } else {
        setErrorMessage(response.data.message || "Invalid credentials.");
      }
    })
    .catch((error) => {
      const message = error.response?.data?.message || "An error occurred.";
      setErrorMessage(message);
    });
};

