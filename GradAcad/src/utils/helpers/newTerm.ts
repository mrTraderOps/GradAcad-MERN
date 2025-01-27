export const newTerm = (prelim: any, midterm: any, final: any) => {
    const _prelim = parseFloat(prelim) || 0;
    const _midterm = parseFloat(midterm) || 0;
    const _final = parseFloat(final) || 0;

    const average = _prelim + _midterm + _final;

    const fg = average / 3;

    return fg;
  };