import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { CombinedDataProps } from "../models/types/StudentData";
import styles from "../views/pages/MainPage/fragments/students_panel/styles/StudentsPanel.module.scss";
import logoDataBase64 from "../assets/base64/logoBase64.json";
import { calculateEQ } from "./helpers/calculateEQ";

const { NClogoBase64, CCSlogoBase64 } = logoDataBase64;

const ExportExcel = ({
  combinedData,
  loggedName,
  dept,
  subjectCode,
  subjectName,
  section,
  sem,
  acadYr,
  buttonName = "EXPORT TO EXCEL",
  isDefault = true,
  setLoadingExporting,
}: {
  combinedData: CombinedDataProps[];
  loggedName: string;
  dept: string;
  subjectCode: string;
  subjectName?: string;
  section: string;
  sem: string;
  acadYr: string;
  buttonName?: string;
  isDefault?: boolean;
  setLoadingExporting: (loading: boolean) => void;
}) => {
  const exportToExcel = async () => {
    setLoadingExporting(true);

    try {
      // **Determine Active Terms**
      const hasPrelim = combinedData.some(
        (student) => (student.terms?.PRELIM ?? 0) > 0
      );
      const hasMidterm = combinedData.some(
        (student) => (student.terms?.MIDTERM ?? 0) > 0
      );
      const hasFinal = combinedData.some(
        (student) => (student.terms?.FINAL ?? 0) > 0
      );

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
      worksheet.getCell("C13").value = `${sem} Semester A.Y. ${acadYr}`;
      worksheet.getCell("C13").alignment = { horizontal: "left" };
      worksheet.getCell("C13").font = { bold: true, name: "Arial" };

      // **Filter Headers Based on Active Terms**
      const headers = ["No.", "Student ID", "Student Name"];
      if (hasPrelim) headers.push("PRELIM TERM");
      if (hasMidterm) headers.push("MID TERM");
      if (hasFinal) headers.push("FINAL TERM");
      headers.push("FINAL GRADE", "", "REMARKS");

      worksheet.addRow(headers);

      // Determine the column letters for mergeCells
      let mergeStart = "G"; // Default
      let mergeEnd = "H"; // Default

      if (!hasFinal) {
        mergeStart = hasMidterm ? "F" : "E";
        mergeEnd = hasMidterm ? "G" : "F";
      }

      // Merge the appropriate cells
      worksheet.mergeCells(`${mergeStart}14:${mergeEnd}14`);

      // Style the header row
      const headerRow = worksheet.getRow(14);
      headerRow.font = { bold: true, name: "Arial", size: 10 };
      headerRow.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      headerRow.height = 60;

      // Add Borders to Headers
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: "medium" },
          left: { style: "medium" },
          bottom: { style: "medium" },
          right: { style: "medium" },
        };
      });

      combinedData.forEach((student, index) => {
        const terms = {
          PRELIM: student.terms?.PRELIM ?? null,
          MIDTERM: student.terms?.MIDTERM ?? null,
          FINAL: student.terms?.FINAL ?? null,
        };

        // Keep only numeric terms (null values removed)
        const filteredTerms = Object.values(terms).filter(
          (value): value is number => value !== null
        );

        let rawAverage = 0;
        let rawGradeEq = 0;
        let gradeEq = "0.00";
        let average = "0.00";

        const hasAnyRemarks =
          (student.prelimRemarks && student.prelimRemarks.trim() !== "") ||
          (student.midtermRemarks && student.midtermRemarks.trim() !== "") ||
          (student.finalRemarks && student.finalRemarks.trim() !== "");

        // Skip computation if student has finalRemarks
        if (!hasAnyRemarks) {
          rawAverage =
            filteredTerms.length > 0
              ? filteredTerms.reduce((sum, value) => sum + value, 0) /
                filteredTerms.length
              : 0;
          rawGradeEq = calculateEQ(rawAverage);
          gradeEq = rawGradeEq.toFixed(2);
          average = rawAverage.toFixed(2);
        }

        const isFailed = rawGradeEq > 3.0;

        // Determine the student's final remarks
        let finalRemarks =
          student.finalRemarks && student.finalRemarks.trim() !== ""
            ? student.finalRemarks
            : student.midtermRemarks && student.midtermRemarks.trim() !== ""
            ? student.midtermRemarks
            : student.prelimRemarks && student.prelimRemarks.trim() !== ""
            ? student.prelimRemarks
            : isFailed
            ? "FAILED"
            : "PASSED";

        // Build full name
        const fullName = `${student.LastName || ""}, ${
          student.FirstName || ""
        } ${student.MiddleInitial || ""}.`.trim();

        // Compute remarks column dynamically
        const remarksColumnIndex = 4 + filteredTerms.length + 2;

        // Construct row data dynamically
        const rowData = [
          index + 1, // No.
          student.StudentId, // Student ID
          fullName, // Student Name
          ...filteredTerms, // Dynamic term values
          average, // Final Grade (0.00 if finalRemarks exists)
          gradeEq, // Grade Equivalent (0.00 if finalRemarks exists)
          finalRemarks, // Remarks
        ];

        // Add row to worksheet
        const row = worksheet.addRow(rowData);
        row.height = 30;

        // Apply styles to each column
        row.eachCell((cell, colNumber) => {
          // Column 1-3 (No., Student ID, Student Name) - Times New Roman
          if (colNumber >= 1 && colNumber <= 3) {
            cell.font = { name: "Times New Roman", size: 11 };
          }
          // Column 4 to Remarks (Prelim, Midterm, Final, Final Grade, Grade Equivalent, Remarks) - Arial Italic
          else if (colNumber >= 4) {
            cell.font = { name: "Arial", size: 10, italic: true };
          }

          // Final Grade, Grade Equivalent, and Remarks should be bold
          if (colNumber >= remarksColumnIndex - 2) {
            cell.font = { name: "Arial", size: 10, italic: true, bold: true };
          }

          // Remarks Column should be colored red if FAILED
          if (colNumber === remarksColumnIndex) {
            cell.font = {
              color:
                isFailed || hasAnyRemarks
                  ? { argb: "FF0000" }
                  : { argb: "000000" },
              bold: true,
              italic: true,
            };
            cell.alignment = { horizontal: "center" };
          }

          // Alignments
          if (colNumber === 1 || colNumber === 2) {
            cell.alignment = { horizontal: "center" };
          } else if (colNumber === 3) {
            cell.alignment = { horizontal: "left" };
          } else {
            cell.alignment = { horizontal: "right" };
          }

          // Borders
          cell.border = {
            top: { style: "thin" },
            left: { style: colNumber === 1 ? "medium" : "thin" },
            bottom:
              index === combinedData.length - 1
                ? { style: "medium" }
                : { style: "thin" },
            right:
              colNumber === remarksColumnIndex
                ? { style: "medium" }
                : { style: "thin" },
          };
        });
      });

      const nothingfollows = worksheet.addRow([]);
      nothingfollows.getCell(4).value = "***NOTHING FOLLOWS***";
      nothingfollows.getCell(4).font = {
        name: "Arial",
        bold: true,
        size: 11,
        italic: true,
      };

      worksheet.addRow([]);
      worksheet.addRow([]);
      worksheet.addRow([]);

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
          titlesRow.getCell(4).value =
            "Dean, College of Hospitality Management";
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

      setTimeout(() => {
        saveAs(
          new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          `${subjectCode}-${dept}${section}.xlsx`
        );
        return buffer;
      }, 2000);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setTimeout(() => {
        setLoadingExporting(false);
      }, 3000);
    }
  };
  return (
    <button
      className={styles.button1}
      onClick={exportToExcel}
      style={{ transition: "all 0.3s ease" }}
    >
      {isDefault ? <span className={styles.exportIcon}>export_notes</span> : ""}
      <p>{buttonName}</p>
    </button>
  );
};

export default ExportExcel;
