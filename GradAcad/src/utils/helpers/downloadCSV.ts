import { Student } from "../../models/types/StudentData";

export const downloadCSV = (studentList: Student[], grades: string[]) => {

  const capitalizeWords = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
      .join(" ");
  };

  // Initialize an array for CSV data
  const csvData = [];

  // Add header row to CSV
  csvData.push(["STUDENT_ID", "STUDENT NAME", `${grades}`]);

  // Loop through the tableData to extract rows
  studentList.forEach((row) => {
    const fullName = `${row.LastName} ${row.FirstName} ${row.MiddleInitial}.`;
    const formattedName = capitalizeWords(fullName);
    csvData.push([
      row.StudentId, // Student ID
      formattedName, // Full name
      "",
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
