export const calculateAverage = (prelim: number, midterm: number, final: number) => {
    return (prelim + midterm + final) / 3 || 0;
  };