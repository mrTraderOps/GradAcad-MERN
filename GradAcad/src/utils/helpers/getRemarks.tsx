export const getRemarks = (
  prelim: number,
  midterm: number,
  final: number,
  fg: number
) => {
  const terms = [prelim, midterm, final];
  const nonZeroCount = terms.filter((term) => term > 0).length;

  if (nonZeroCount === 1) {
    return (
      <select>
        <option value="AW">AW</option>
        <option value="UW">UW</option>
        <option value="NCA">NCA</option>
        <option value="INC">INC</option>
      </select>
    );
  }

  return fg === 5.0 ? "FAILED" : "PASSED";
};
