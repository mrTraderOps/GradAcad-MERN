import API from "../context/axiosInstance";
import { User } from "../context/UserContext";

export const handleLogin = async(
  username: string,
  password: string,
  login: (userData: User) => void,
  setToken: React.Dispatch<React.SetStateAction<any>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
  setLoading: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const response = await API.post("/auth/login", { username, password });

    const user = response.data.user;
    if (user.status === "Inactive") {
      setErrorMessage("Your account is inactive. Please seek assistance from MIS");
      return;
    }

    login(user);
    setToken(response.data.token);
    sessionStorage.setItem("token", response.data.token);
  } catch (error) {
    const message = (error as any)?.response?.data?.message || "An error occurred.";
    setErrorMessage(message);
  } finally {
    setLoading(false);
  }
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
  API
  .post("/auth/register", { email, refId: userId, role, password, assignDept, name})
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

export const handlePending = async (
  selectedSort: string,
  role: string,
  page: number,
  setPending: React.Dispatch<React.SetStateAction<any>>,
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
  setTotalPages: React.Dispatch<React.SetStateAction<number>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
  setError: React.Dispatch<React.SetStateAction<any>>,
  setLoading: React.Dispatch<React.SetStateAction<any>>
) => {
  setLoading(true)
  try {
    const response = await API.post("/user/getPendingUsers", {
      sorter: selectedSort,
      role,
      page,
    });

    if (response.data.success) {
      setPending(response.data.pending);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } else {
      setErrorMessage(response.data.message || "Failed to fetch pending users.");
      setError(true);
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "An error occurred. Please contact your developer.";
    setErrorMessage(message);
    setError(true);
  } finally {
    setLoading(false)
  }
};

export const getAllApprovedUsers = async ( 
  selectedSort: string,
  role: string,
  page: number,
  setApproved: React.Dispatch<React.SetStateAction<any>>,
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
  setTotalPages: React.Dispatch<React.SetStateAction<number>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
  setError: React.Dispatch<React.SetStateAction<any>>,
  setLoading: React.Dispatch<React.SetStateAction<any>>
) => {
  setLoading(true)
  try {
    const response = await API.post("/user/getAllApprovedUsers", {
      sorter: selectedSort,
      role,
      page,
    });

    if (response.data.success) {
      setApproved(response.data.users);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } else {
      setErrorMessage(response.data.message || "Failed to fetch pending users.");
      setError(true);
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "An error occurred. Please contact your developer.";
    setErrorMessage(message);
    setError(true);
  } finally {
    setLoading(false)
  }}

