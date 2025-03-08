export const handlePrint = async (
  exportExcelRef: React.MutableRefObject<{ exportToExcel: () => Promise<Buffer> } | null>
) => {
  try {
    // Access the exportToExcel function via ref
    if (exportExcelRef.current) {
      const buffer = await exportExcelRef.current.exportToExcel()

      // Create a Blob from the Excel buffer
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);

      // Open the Excel file in a new tab
      const win = window.open(url, "_blank");

      // Wait for the file to load, then trigger print
      if (win) {
        win.onload = () => {
          win.print(); // Open the print dialog
        };
      }
    }
  } catch (error) {
    console.error("Error printing file:", error);
  }
};