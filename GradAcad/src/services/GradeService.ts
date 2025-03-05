import axios from "axios";

export const InsertGrade = (
    dept: string,
    sect: string,
    subjCode: string,
    StudentId: string,
    term: string,
    grade:string,
    setResponse:  React.Dispatch<React.SetStateAction<any>>,
    setError: React.Dispatch<React.SetStateAction<any>>,
    setLoading: React.Dispatch<React.SetStateAction<any>>
) => {
    axios
            .post("http://localhost:5000/api/v1/grade/insertGrade", {
              dept: dept,
              sect: sect,
              subjCode: subjCode,
              StudentId: StudentId,
              term: term,
              grade: grade,
            })
            .then((response) => {
              if (response.data.success) {
                setResponse(response.data.data);
              } else {
                setError("Failed to fetch grades.");
              }
            })
            .catch((error) => {
              setError("An error occurred while fetching grades.");
              console.error(error);
            })
            .finally(() => {
              setLoading(false);
            });
}