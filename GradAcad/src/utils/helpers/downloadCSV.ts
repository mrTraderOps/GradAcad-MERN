import { StudentRow } from "../../models/types/StudentRow";

export const downloadCSV = (studentList: StudentRow[]) => {

  const capitalizeWords = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
      .join(" ");
  };

  // Initialize an array for CSV data
  const csvData = [];

  // Add header row to CSV
  csvData.push(["STUDENT_ID", "STUDENT NAME", "PRELIM", "MIDTERM", "FINAL"]);

  // Loop through the tableData to extract rows
  studentList.forEach((row) => {
    const fullName = `${row.studentName.lastName} ${row.studentName.firstName} ${row.studentName.middleInitial}`;
    const formattedName = capitalizeWords(fullName);
    csvData.push([
      row.studentId, // Student ID
      formattedName, // Full name
      "",
      "",
      "", // Blank value for Final Term
    ]);
  });

  // Create CSV content
  const csvContent = csvData
    .map((row) => row.join(",")) // Join rows with commas
    .join("\n"); // Add newline between rows

  // Create a Blob for the CSV content
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  // Create a link and trigger download
  const a = document.createElement("a");
  a.href = url;
  a.download = "Student_Grades_Template.csv"; // Filename
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
