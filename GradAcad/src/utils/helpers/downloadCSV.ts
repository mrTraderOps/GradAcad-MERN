import { CombinedDataProps, DataProps, Student } from "../../models/types/StudentData";
import Papa from 'papaparse';

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

export const exportCSV = (studentData: CombinedDataProps[], subjectData: DataProps) => {
  const metadata = [
    [`Department: ${subjectData.dept}`],
    [`Section: ${subjectData.section}`],
    [`Subject Code: ${subjectData.subjectCode}`],
    [`Subject Name: ${subjectData.subjectName}`],
    [], 
  ];

  
  const csvData = studentData.map((student) => ({
    StudentID: student.StudentId,
    StudentName: `${student.LastName}, ${student.FirstName} ${student.MiddleInitial}.` || "",
    PRELIM: student.terms.PRELIM || "",
    MIDTERM: student.terms.MIDTERM || "",
    FINAL: student.terms.FINAL || "",
  }));

  const metadataCsv = Papa.unparse(metadata, { header: false });
  const studentCsv = Papa.unparse(csvData, { header: true });


  const combinedCsv = `${metadataCsv}\n${studentCsv}`;


  const blob = new Blob([combinedCsv], { type: "text/csv;charset=utf-8;" });


  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `NC_Grade_${subjectData.dept}_${subjectData.section}_${subjectData.subjectCode}_${subjectData.subjectName}.csv`);
  link.style.visibility = "hidden";


  document.body.appendChild(link);
  link.click();


  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};