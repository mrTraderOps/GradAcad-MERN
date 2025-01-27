export const calculateEQ = (term: number) => {
    const ranges = [
      { min: 96.5, grade: 1.0 },
      { min: 93.5, grade: 1.25 },
      { min: 90.5, grade: 1.5 },
      { min: 87.5, grade: 1.75 },
      { min: 84.5, grade: 2.0 },
      { min: 81.5, grade: 2.25 },
      { min: 75.5, grade: 2.75 },
      { min: 74.5, grade: 3.0 },
    ];

    const match = ranges.find((range) => term >= range.min);
    return match ? match.grade : 5.0; // Default to 5.0 if no match
  };