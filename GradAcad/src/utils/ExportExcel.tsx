import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { CombinedDataProps } from "../models/types/StudentData";
import styles from "../views/pages/MainPage/fragments/students_panel/styles/StudentsPanel.module.scss";
// const { NClogoBase64, CCSlogoBase64 } = require("../assets/base64/logoBase64");
import logoDataBase64 from "../assets/base64/logoBase64.json";
import { calculateAverage } from "./helpers/calculateAve";
import { calculateEQ } from "./helpers/calculateEQ";

const { NClogoBase64, CCSlogoBase64 } = logoDataBase64;

const ExportExcel = ({
  combinedData,
  loggedName,
  dept,
  subjectCode,
  subjectName,
  section,
}: {
  combinedData: CombinedDataProps[];
  loggedName: string;
  dept: string;
  subjectCode: string;
  subjectName: string;
  section: string;
}) => {
  const exportToExcel = async () => {
    const totalStudents = combinedData.length;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("SUMMARY");

    // **Add Logos**
    const NClogo = workbook.addImage({
      base64: NClogoBase64,
      extension: "png",
    });
    const CCSlogo = workbook.addImage({
      base64: CCSlogoBase64,
      extension: "png",
    });

    worksheet.addImage(NClogo, {
      tl: { col: 1.8, row: 1.1 },
      ext: { width: 100, height: 100 }, // Ensure 1:1 aspect ratio for circle
    });
    worksheet.addImage(CCSlogo, {
      tl: { col: 5.7, row: 1.0 },
      ext: { width: 110, height: 110 }, // Ensure 1:1 aspect ratio for circle
    });

    // **Header Titles**
    worksheet.mergeCells("A3:H3");
    worksheet.getCell("A3").value = "NORZAGARAY COLLEGE";
    worksheet.getCell("A3").font = {
      bold: true,
      size: 14,
      name: "Times New Roman",
    };
    worksheet.getCell("A3").alignment = { horizontal: "center" };

    function TitleDept(depart: string) {
      worksheet.mergeCells("A4:H4");
      worksheet.getCell("A4").value = depart;
      worksheet.getCell("A4").font = {
        bold: true,
        size: 12,
        name: "Times New Roman",
      };
      worksheet.getCell("A4").alignment = { horizontal: "center" };
    }

    switch (dept) {
      case "BSCS":
        TitleDept("COLLEGE OF COMPUTING STUDIES");
        break;
      case "BEED":
        TitleDept("COLLEGE OF EDUCATION");
        break;
      case "BSED":
        TitleDept("COLLEGE OF EDUCATION");
        break;
      case "BSHM":
        TitleDept("COLLEGE OF HOSPITALITY MANAGEMENT");
        break;
      default:
        break;
    }

    worksheet.mergeCells("A5:H5");
    worksheet.getCell("A5").value = "Municipal Compound, Norzagaray, Bulacan";
    worksheet.getCell("A5").font = { italic: true, size: 10 };
    worksheet.getCell("A5").alignment = { horizontal: "center" };

    function TitleCourse(course: string) {
      worksheet.mergeCells("A7:H7");
      worksheet.getCell("A7").value = course;
      worksheet.getCell("A7").font = {
        bold: true,
        size: 11,
        name: "Arial",
      };
      worksheet.getCell("A7").alignment = { horizontal: "center" };
    }

    switch (dept) {
      case "BSCS":
        TitleCourse("BACHELOR OF SCIENCE IN COMPUTER SCIENCE");
        break;
      case "BEED":
        TitleCourse("BACHELOR OF SCIENCE IN ELEMENTARY EDUCATION");
        break;
      case "BSED":
        TitleCourse("BACHELOR OF SCIENCE IN SECONDARY EDUCATION");
        break;
      case "BSHM":
        TitleCourse("BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT");
        break;
      default:
        "";
        break;
    }

    //Title Details
    worksheet.mergeCells("A9:B9");
    worksheet.getCell("A9").value = "Course Code:";
    worksheet.getCell("A9").alignment = { horizontal: "left" };
    worksheet.getCell("A9").font = { name: "Arial" };

    worksheet.mergeCells("A10:B10");
    worksheet.getCell("A10").value = "Course Title:";
    worksheet.getCell("A10").alignment = { horizontal: "left" };
    worksheet.getCell("A10").font = { name: "Arial" };

    worksheet.mergeCells("A11:B11");
    worksheet.getCell("A11").value = "Course/Yr & Section:";
    worksheet.getCell("A11").alignment = { horizontal: "left" };
    worksheet.getCell("A11").font = { name: "Arial" };

    worksheet.mergeCells("A12:B12");
    worksheet.getCell("A12").value = "Faculty:";
    worksheet.getCell("A12").alignment = { horizontal: "left" };
    worksheet.getCell("A12").font = { name: "Arial" };

    worksheet.mergeCells("A13:B13");
    worksheet.getCell("A13").value = "Academic Term:";
    worksheet.getCell("A13").alignment = { horizontal: "left" };
    worksheet.getCell("A13").font = { name: "Arial" };

    // Add Subject Code
    worksheet.mergeCells("C9:D9");
    worksheet.getCell("C9").value = subjectCode; // Dynamic subject code
    worksheet.getCell("C9").alignment = { horizontal: "left" };
    worksheet.getCell("C9").font = { bold: true, name: "Arial" };

    // Add Subject Name
    worksheet.mergeCells("C10:D10");
    worksheet.getCell("C10").value = subjectName; // Dynamic subject name
    worksheet.getCell("C10").alignment = { horizontal: "left" };
    worksheet.getCell("C10").font = { bold: true, name: "Arial" };

    // Add Section
    worksheet.mergeCells("C11:D11");
    worksheet.getCell("C11").value = `${dept} - ${section}`; // Dynamic section
    worksheet.getCell("C11").alignment = { horizontal: "left" };
    worksheet.getCell("C11").font = { bold: true, name: "Arial" };

    worksheet.mergeCells("C12:D12");
    worksheet.getCell("C12").value = loggedName.toUpperCase();
    worksheet.getCell("C12").alignment = { horizontal: "left" };
    worksheet.getCell("C12").font = { bold: true, name: "Arial" };

    worksheet.mergeCells("C13:D13");
    worksheet.getCell("C13").value = "1st Semester A.Y. 2023-2024";
    worksheet.getCell("C13").alignment = { horizontal: "left" };
    worksheet.getCell("C13").font = { bold: true, name: "Arial" };

    worksheet.mergeCells("F9:G9");
    worksheet.getCell("F9").value = "Total Students:";
    worksheet.getCell("F9").alignment = { horizontal: "left" };
    worksheet.getCell("F9").font = { name: "Arial" };

    worksheet.getCell("H9").value = totalStudents;
    worksheet.getCell("H9").alignment = { horizontal: "left" };
    worksheet.getCell("H9").font = { bold: true, name: "Arial" };

    // **Table Headers**
    const headers = [
      "No.",
      "Student ID",
      "Student Name",
      "PRELIM TERM",
      "MID TERM",
      "FINAL TERM",
      "FINAL GRADE",
      "",
      "REMARKS",
    ];
    worksheet.addRow(headers);

    worksheet.mergeCells("G14:H14");

    // **Style Headers**
    const headerRow = worksheet.getRow(14);
    headerRow.font = { bold: true, name: "Arial", size: 10 };
    headerRow.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    headerRow.height = 60;

    // **Add Borders to Headers**
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: "medium" },
        left: { style: "medium" },
        bottom: { style: "medium" },
        right: { style: "medium" },
      };
    });

    combinedData.forEach((student, index) => {
      const rawAverage = calculateAverage(
        student.terms.PRELIM ?? 0,
        student.terms.MIDTERM ?? 0,
        student.terms.FINAL ?? 0
      );
      const rawGradeEq = calculateEQ(rawAverage);
      const gradeEq = rawGradeEq.toFixed(2);
      const average = rawAverage.toFixed(2);
      const isFailed = rawGradeEq > 3.0;
      const fullName = `${student.LastName || ""}, ${student.FirstName || ""} ${
        student.MiddleInitial || ""
      }.`.trim();

      // Add a row with student data
      const row = worksheet.addRow([
        index + 1,
        student.StudentId,
        fullName,
        student.terms.PRELIM || 0,
        student.terms.MIDTERM || 0,
        student.terms.FINAL || 0,
        average,
        gradeEq,
        isFailed ? "FAILED" : "PASSED", // Assuming REMARKS is not part of the data
      ]);

      row.height = 30;

      row.alignment = {
        vertical: "middle",
      };
      // Check if this is the last row
      const isLastRow = index === combinedData.length - 1;

      // Apply font styles and borders to each cell in the row
      row.eachCell((cell, colNumber) => {
        // Set alignment
        if (colNumber >= 1 && colNumber <= 2) {
          cell.alignment = {
            horizontal: "center",
          };
        } else if (colNumber == 3) {
          cell.alignment = {
            horizontal: "left",
          };
        } else {
          cell.alignment = {
            horizontal: "right",
          };
        }

        // Set font styles
        if (colNumber >= 4 && colNumber <= 6) {
          cell.font = {
            name: "Arial", // Set font family to Arial
            size: 10, // Set font size
            italic: true, // Italic for terms
          };
        } else if (colNumber >= 7 && colNumber <= 8) {
          cell.font = {
            name: "Arial", // Set font family to Arial
            size: 10, // Set font size
            italic: true, // Italic for terms
            bold: true,
          };
        } else if (colNumber == 9) {
          cell.font = {
            color: isFailed ? { argb: "FF0000" } : { argb: "000000" },
            bold: true,
            italic: true,
          };
          cell.alignment = {
            horizontal: "center",
          };
        } else {
          cell.font = {
            name: "Times New Roman", // Set font family to Times New Roman
            size: 11, // Set font size
          };
        }

        // Set borders
        if (colNumber == 1) {
          cell.border = {
            top: { style: "thin" },
            left: { style: "medium" },
            bottom: isLastRow ? { style: "medium" } : { style: "thin" }, // Medium bottom border for last row
            right: { style: "thin" },
          };
        } else if (colNumber == 9) {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: isLastRow ? { style: "medium" } : { style: "thin" }, // Medium bottom border for last row
            right: { style: "medium" },
          };
        } else {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: isLastRow ? { style: "medium" } : { style: "thin" }, // Medium bottom border for last row
            right: { style: "thin" },
          };
        }
      });
    });

    // **Add "Approved by" and "Noted by:" below the last student**
    // const lastRowIndex = combinedData.length + 1; // Index after the last student row
    const approvedByRow = worksheet.addRow([]); // Empty row
    approvedByRow.getCell(4).value = "Approved by:"; // Column 4 (PRELIM)
    approvedByRow.getCell(7).value = "Noted by:"; // Column 7 (FINAL GRADE)

    // Format "Approved by" and "Noted by:"
    approvedByRow.getCell(4).font = {
      name: "Arial",
      size: 11,
    };
    approvedByRow.getCell(7).font = {
      name: "Arial",
      size: 11,
    };

    // **Add a gap of 3 rows**
    worksheet.addRow([]); // Empty row 1
    worksheet.addRow([]); // Empty row 2
    worksheet.addRow([]); // Empty row 3

    // **Add Names of Instructor, Dean, and Registrar**
    const namesRow = worksheet.addRow([]); // Empty row
    namesRow.getCell(1).value = loggedName.toUpperCase();

    switch (dept) {
      case "BSCS":
        namesRow.getCell(4).value = "MINDALITA O. CRUZ, DIT";
        break;
      case "BEED":
        namesRow.getCell(4).value = "MARICAR JOY C. BULURAN, PhD";
        break;
      case "BSED":
        namesRow.getCell(4).value = "MARICAR JOY C. BULURAN, PhD";
        break;
      case "BSHM":
        namesRow.getCell(4).value = "MARIA VANESSA S. MENDOZA, MBA";
        break;
      default:
        "";
        break;
    }

    namesRow.getCell(7).value = "JEANITA G. NICOLAS";

    namesRow.getCell(1).font = {
      bold: true,
      underline: true,
      name: "Arial",
      size: 11,
    };
    namesRow.getCell(4).font = {
      bold: true,
      underline: true,
      name: "Arial",
      size: 11,
    };
    namesRow.getCell(7).font = {
      bold: true,
      underline: true,
      name: "Arial",
      size: 11,
    };

    const titlesRow = worksheet.addRow([]);
    titlesRow.getCell(1).value = "Instructor";

    switch (dept) {
      case "BSCS":
        titlesRow.getCell(4).value = "Dean, College of Computing Studies";
        break;
      case "BEED":
        titlesRow.getCell(4).value = "Dean, College of Education";
        break;
      case "BSED":
        titlesRow.getCell(4).value = "Dean, College of Education";
        break;
      case "BSHM":
        titlesRow.getCell(4).value = "Dean, College of Hospitality Management";
        break;
      default:
        "";
        break;
    }

    titlesRow.getCell(7).value = "Registrar";

    titlesRow.getCell(1).font = {
      name: "Arial",
      size: 11,
    };
    titlesRow.getCell(4).font = {
      name: "Arial",
      size: 11,
    };
    titlesRow.getCell(7).font = {
      name: "Arial",
      size: 11,
    };

    // **Set Column Widths**
    worksheet.columns = [
      { width: 5 }, // No.
      { width: 15 }, // Student No.
      { width: 25 }, // Name
      { width: 13 }, // Prelim Term
      { width: 13 }, // Mid Term
      { width: 13 }, // Final Term
      { width: 10 }, // Final Grade
      { width: 10 }, // Final Grade
      { width: 10 }, // Remarks
    ];

    // **Save and Download**
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${subjectCode}-${dept}${section}.xlsx`
    );

    return buffer;
  };

  return (
    <button className={styles.button1} onClick={exportToExcel}>
      <span className={styles.exportIcon}>export_notes</span>
      <p>EXPORT TO EXCEL</p>
    </button>
  );
};

export default ExportExcel;
