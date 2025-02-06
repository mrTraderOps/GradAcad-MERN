import axios from "axios";

export const StudentData = (
    department: string,
    section: string,
    setStudent: React.Dispatch<React.SetStateAction<any>>,
    setErrorMessage: React.Dispatch<React.SetStateAction<any>>,
) => {
    axios
        .post("http://localhost:5000/api/v1/student/getSection", { department, section })
        .then((response) => {
            if (response.data) {
              setStudent(response.data.students);
            } else {
              setErrorMessage(response.data.message || "Invalid credentials.");
            }
          })
        .catch((error) => {
            const message = error.response?.data?.message || "An error occurred.";
            setErrorMessage(message);
        });
};

