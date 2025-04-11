import API  from "../context/axiosInstance";

export const fetchSubjectsbyUsername = (
    loggeduserName: string,
    setSubjects: React.Dispatch<React.SetStateAction<any>>,
    setError: React.Dispatch<React.SetStateAction<string>>
) => {
    API
        .post("/subject/getSubjectsByUsername", {
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

export const fetchSubjectsByRefId =  async (
    refId: string,
    acadYr: string,
    sem: string,
    setSubjects: React.Dispatch<React.SetStateAction<any>>,
    setError: React.Dispatch<React.SetStateAction<string>>
) => {
    
    await API
        .post("/subject/getSubjectsByRefId", {
            refId: refId,
            acadYr: acadYr,
            sem: sem,
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
    API
        .get("/subject/getAcadYrSem")
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