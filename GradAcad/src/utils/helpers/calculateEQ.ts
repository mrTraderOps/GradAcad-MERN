export const calculateEQ = (term: number) => {
    const ranges = [
      { min: 96.5, grade: 1.00 },
      { min: 93.5, grade: 1.25 },
      { min: 90.5, grade: 1.50 },
      { min: 87.5, grade: 1.75 },
      { min: 84.5, grade: 2.00 },
      { min: 81.5, grade: 2.25 },
      { min: 75.5, grade: 2.75 },
      { min: 74.5, grade: 3.00 },
    ];

    const match = ranges.find((range) => term >= range.min);
    return match ? match.grade : 5.00; // Default to 5.0 if no match
  };

  export const getRemark = (grade: number) => {
    return grade <= 3.00 ? "PASSED" : "FAILED";
  };