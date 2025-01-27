import axios from "axios";

export const StudentData = () => {
    axios
        .get("http://localhost:5000/api/v1/student/getAll")
        .then((response) => {
            if (response.data.success) {
                setStudents(response.data.data);
            } else {
                setError('Failed to fetch students.');
            }
        })
        .catch((error) => {
            const message = error.response?.data?.message || "An error occurred.";
            setErrorMessage(message);
        });
};

