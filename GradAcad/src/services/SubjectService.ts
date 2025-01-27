import axios from "axios";

export const fetchSubjectsbyUsername = (
    loggeduserName: string,
    setSubjects: React.Dispatch<React.SetStateAction<any>>,
    setError: React.Dispatch<React.SetStateAction<string>>
) => {
    axios
        .post("http://localhost:5000/api/v1/subject/getSubjectsByUsername", {
            username: loggeduserName,
        })
        .then((response) => {
            setSubjects(response.data.subjects);
        })
        .catch((error) => {
            const message = error.response?.data?.message || "An error occurred.";
            setError(message);
        });
};