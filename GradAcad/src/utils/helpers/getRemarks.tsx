export const getRemarks = (
  prelim: number,
  midterm: number,
  final: number,
  fg: number
) => {
  const terms = [prelim, midterm, final];
  const average = terms.reduce((sum, val) => sum + val, 0) / terms.length;

  if (average < 65) {
    return "NFS"; // No Final Standing
  }

  return fg === 5.0 ? "FAILED" : "PASSED";
};
