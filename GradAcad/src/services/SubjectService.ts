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
            if (response.data.success) {
                setSubjects(response.data.subjects);
            } else {
                setError(response.data.message)
            }
        })
        .catch((error) => {
            const message = error.response?.data?.message || "An error occurred.";
            setError(message);
        });
};

export const fetchAcadYrSem = (
    setYr: React.Dispatch<React.SetStateAction<any>>,
    setSem: React.Dispatch<React.SetStateAction<any>>,
    setError: React.Dispatch<React.SetStateAction<string>>
) => {
    axios
        .get("http://localhost:5000/api/v1/subject/getAcadYrSem")
        .then((response) => {
            if (response.data.success) {
                setYr(response.data.data.acadYr);
                setSem(response.data.data.sem);
            } else {
                setError(response.data.message)
            }
        })
        .catch((error) => {
            const message = error.response?.data?.message || "An error occurred.";
            setError(message);
        });
};