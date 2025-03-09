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

export const GenerateReportService = async (
  loggedUsername: string,
  setResponse: React.Dispatch<React.SetStateAction<any>>,
  setError: React.Dispatch<React.SetStateAction<any>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    setLoading(true); // Indicate loading starts

    // Send only the loggedUsername in the request body
    const response = await axios.post(
      "http://localhost:5000/api/v1/grade/generateReport",
      { username: loggedUsername } // Only include the username
    );

    if (response.data?.success) {
      setResponse(response.data.data)
      ; // Set the response data
    } else {
      setError(response.data?.message || "Failed to fetch grades."); // Set error message
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "An error occurred while fetching grades.";
    setError(errorMessage); // Set error message
    console.error("Generate Report API Error:", error);
  } finally {
    setLoading(false); // Indicate loading ends
  }
};

