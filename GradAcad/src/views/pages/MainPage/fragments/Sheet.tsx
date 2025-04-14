import styles from "../fragments/students_panel/styles/StudentsPanel.module.scss";
import style from "../styles/Department.module.scss";
import { useContext, useMemo, useState } from "react";
import { UserContext } from "../../../../context/UserContext";
import { useCombinedDatav2 } from "../../../../hooks/useCombinedData";
import { calculateAverage } from "../../../../utils/helpers/calculateAve";
import { calculateEQ } from "../../../../utils/helpers/calculateEQ";
import { getRemarks } from "../../../../utils/helpers/getRemarks";
import cslogo from "../../../../assets/images/ccs_icon.png";
import nclogo from "../../../../assets/images/nc_logo.png";
import notfound from "../../../../assets/images/notfound.jpg";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GenerateReport } from "../../../components/GenerateReport";

const Sheet = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("ExportExcel must be used within a UserProvider");
  }

  const { user, confirmData } = context;

  const { acadYr, sem, subjCode, subjName, dept, sect } = confirmData[0] || {};

  const combinedParams = useMemo(
    () => ({
      acadYr,
      sem,
      dept,
      sect,
      subjCode,
      terms: [""],
    }),
    [acadYr, sem, dept, sect, subjCode] // 👈 include trigger
  );

  const { combinedData, errorMessage, loading } =
    useCombinedDatav2(combinedParams);

  const [showModal, setShowModal] = useState(true);

  const handleCancelSubmit = () => {
    setShowModal(false);
  };

  const loadImageBase64 = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Prevent CORS issues
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  };

  const handlePrintPDF = async () => {
    const doc = new jsPDF();

    // Positioning variables
    const startX = 20; // Left margin
    const startY = 60; // Below "Registrar's Office"
    const lineHeight = 5; // Line spacing

    // Load logos
    const leftLogo = await loadImageBase64(nclogo);
    const rightLogo = await loadImageBase64(cslogo);

    // Add logos and header text
    doc.addImage(leftLogo, "PNG", 20, 10, 28, 28);
    doc.addImage(rightLogo, "PNG", 160, 10, 30, 30);

    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("NORZAGARAY COLLEGE", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text("Municipal Compound, Poblacion, Norzagaray, Bulacan", 105, 27, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.text("Registrar's Office", 105, 34, { align: "center" });

    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.text("Generate Report", 105, 50, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("times", "bold");
    doc.text(
      `Subject Code & Name: THESIS 102 - Thesis 2`,
      startX,
      startY + lineHeight
    );
    doc.text(`Academic Year: 2024 - 2025`, startX, startY + lineHeight * 2);
    doc.text(`Semester: 2nd`, startX, startY + lineHeight * 3);
    doc.text(`Course & Section: BSCS - 4A`, startX, startY + lineHeight * 4);

    const tableStartY = startY + lineHeight * 5;

    // **Extract table data from combinedData**
    const headers = [
      "No.",
      "STUDENT ID",
      "STUDENT NAME",
      "PRELIM",
      "MIDTERM",
      "FINAL",
      "AVERAGE",
      "GRADE EQ",
      "REMARKS",
    ];

    const rows = combinedData.map((row, index) => {
      const existingRemark =
        row.finalRemarks?.trim() ||
        row.midtermRemarks?.trim() ||
        row.prelimRemarks?.trim();

      const average = existingRemark
        ? 0.0
        : calculateAverage(
            row.terms.PRELIM ?? 0,
            row.terms.MIDTERM ?? 0,
            row.terms.FINAL ?? 0
          );

      const gradeEq = existingRemark ? 0.0 : calculateEQ(average);

      const remarks = existingRemark
        ? existingRemark // Use existing remark if present
        : getRemarks(
            row.terms.PRELIM ?? 0,
            row.terms.MIDTERM ?? 0,
            row.terms.FINAL ?? 0,
            gradeEq
          );

      return [
        String(`${index + 1}.`),
        String(row.StudentId), // Ensure string
        `${row.LastName ?? ""}, ${row.FirstName ?? ""} ${
          row.MiddleInitial ?? ""
        }.`, // Ensure text
        Number(row.terms.PRELIM ?? 0), // Ensure number
        Number(row.terms.MIDTERM ?? 0), // Ensure number
        Number(row.terms.FINAL ?? 0), // Ensure number
        Number(average.toFixed(2)), // Ensure number
        Number(gradeEq), // Ensure number
        {
          content: String(remarks),
          styles: existingRemark
            ? { textColor: [255, 0, 0] as [number, number, number] }
            : {},
        }, // ✅ Ensure correct textColor tuple
      ];
    });

    // **Add table**
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: tableStartY,
      margin: { top: tableStartY },
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 63, 116] },
      theme: "grid",
      pageBreak: "auto",
    });

    // **Add Generated Date (Bottom Left) & Prepared By (Bottom Right)**
    const currentDate = new Date().toLocaleString();
    const preparedBy = `Prepared by: ${user?.refId} - ${user?.name}`;

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(10);
    doc.text(`Generated Date: ${currentDate}`, 20, pageHeight - 10);
    doc.text(
      preparedBy,
      pageWidth - doc.getTextWidth(preparedBy) - 20,
      pageHeight - 10
    );

    // **Open print panel**
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  };

  if (!confirmData || confirmData.length === 0) {
    return (
      <>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <img src={notfound} alt="not found" width={600} />
          <p>No data found. Click Generate Report to view data.</p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#293F74",
              color: "#fff",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Generate Report
          </button>
        </div>
        <GenerateReport
          isOpen={showModal}
          onCancel={handleCancelSubmit}
          isRegistrar={true}
        />
      </>
    );
  }

  return (
    <>
      <div className={style.department}>
        <div className={styles.preloader}>
          <p>Subject &gt; Section </p>
          <p>
            {sem} Semester A.Y. {acadYr}
          </p>
        </div>
        <header className={styles.headerStudentsPanel}>
          <div
            className={styles.div1}
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "30px",
            }}
          >
            <p>SUBJECT CODE: </p>
            <strong style={{ color: "#0F2A71", fontWeight: "bold" }}>
              {subjCode}
            </strong>
            <p>SUBJECT NAME: </p>
            <strong style={{ color: "#0F2A71", fontWeight: "bold" }}>
              {subjName}
            </strong>
            <p>COURSE & SECTION :</p>
            <strong style={{ color: "#0F2A71", fontWeight: "bold" }}>
              {dept} - {sect}
            </strong>
          </div>

          <div className={styles.div3}>
            <button
              onClick={() => handlePrintPDF()}
              style={{
                backgroundColor: "rgb(41, 63, 116)",
                borderRadius: "10px",
              }}
            >
              OPEN IN PDF
            </button>
          </div>
        </header>
        <main className={styles.main}>
          <section>
            <div className={styles.StudentList}>
              {loading && <p className={styles.loading}>Loading data...</p>}
              {errorMessage && <p className={styles.error}>{errorMessage}</p>}
              {!loading && !errorMessage && (
                <table>
                  <thead>
                    <tr>
                      <th>
                        <h5>STUDENT ID</h5>
                      </th>
                      <th>
                        <h5>STUDENT NAME</h5>
                      </th>
                      <th>
                        <h5>PRELIM</h5>
                      </th>
                      <th>
                        <h5>MIDTERM</h5>
                      </th>
                      <th>
                        <h5>FINAL</h5>
                      </th>
                      <th>
                        <h5>AVERAGE</h5>
                      </th>
                      <th>
                        <h5>GRADE EQ</h5>
                      </th>
                      <th>
                        <h5>REMARKS</h5>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedData.map((row) => {
                      // Check if there's already a remark in prelim, midterm, or final
                      const existingRemark =
                        row.finalRemarks?.trim() ||
                        row.midtermRemarks?.trim() ||
                        row.prelimRemarks?.trim();

                      // Compute only if no existing remarks
                      const average = existingRemark
                        ? 0.0
                        : calculateAverage(
                            row.terms.PRELIM ?? 0,
                            row.terms.MIDTERM ?? 0,
                            row.terms.FINAL ?? 0
                          );
                      const gradeEq = existingRemark
                        ? 0.0
                        : calculateEQ(average);
                      const remarks = existingRemark
                        ? existingRemark // Use the existing remark if present
                        : getRemarks(
                            row.terms.PRELIM ?? 0,
                            row.terms.MIDTERM ?? 0,
                            row.terms.FINAL ?? 0,
                            gradeEq
                          );

                      // Ensure remarks are red if the student has an existing remark or failed
                      const isFailed = existingRemark || gradeEq > 3.0;

                      return (
                        <tr key={row.StudentId}>
                          <td>{row.StudentId}</td>
                          <td className={styles.studentName}>
                            {`${row.LastName ?? ""}, ${row.FirstName ?? ""} ${
                              row.MiddleInitial ?? ""
                            }.`}
                          </td>
                          <td>{row.terms.PRELIM}</td>
                          <td>{row.terms.MIDTERM}</td>
                          <td>{row.terms.FINAL}</td>
                          <td>{average.toFixed(2)}</td>
                          <td>{gradeEq}</td>
                          <td className={isFailed ? styles.fail : ""}>
                            {remarks}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </main>
      </div>
      <GenerateReport
        isOpen={showModal}
        onCancel={handleCancelSubmit}
        isRegistrar={true}
      />
    </>
  );
};

export default Sheet;
