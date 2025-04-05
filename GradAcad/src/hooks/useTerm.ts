import { useEffect, useState } from 'react';
import { API } from '@/context/axiosInstance';
import { TermData } from '../models/types/GradeData';

export const useTerm = () => {
  const [terms] = useState<TermData[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasActiveTerms, setHasActiveTerms] = useState(false);
  const [activeTerms, setActiveTerms] = useState<string[]>([]);
  const [initialTerm, setInitialTerm] = useState<string>("PRELIM");

  // Add states for academic year and semester
  const [activeAcadYrs, setActiveAcadYrs] = useState<string[]>([]);
  const [initialAcadYr, setInitialAcadYr] = useState<string>("");
  const [activeSems, setActiveSems] = useState<string[]>([]);
  const [initialSem, setInitialSem] = useState<string>("");

  const [donePrelim, setDonePrelim] = useState<boolean>(false);
  const [doneMidterm, setDoneMidterm] = useState<boolean>(false);
  const [doneFinal, setDoneFinal] = useState<boolean>(false);

  useEffect(() => {
    API.get('/grade/getTermsV2')
      .then((response) => {
        if (response.data.success && Array.isArray(response.data.data)) {
          const data = response.data.data[0]; // Assuming only one document is returned

          // Set academic year
          setActiveAcadYrs([data.acadYr]); // Wrap the string in an array
          setInitialAcadYr(data.acadYr); // Set the academic year as initial

          setDonePrelim(data.prelimDone)
          setDoneMidterm(data.midtermDone)
          setDoneFinal(data.finalDone)

          // Extract active semesters
          const activeSemsList = Object.keys(data.sem).filter(
            (key) => data.sem[key] === true
          );
          setActiveSems(activeSemsList);
          setInitialSem(activeSemsList[0]);

          // Extract active terms
          const activeTermsList = Object.keys(data.term).filter(
            (key) => data.term[key] === true
          );
          setActiveTerms(activeTermsList);
          setHasActiveTerms(activeTermsList.length > 0);

          // Determine the initial term based on conditions
          if (activeTermsList.includes("prelim") && !activeTermsList.includes("midterm") && !activeTermsList.includes("final")) {
            setInitialTerm("PRELIM");
          } else if (activeTermsList.includes("prelim") && activeTermsList.includes("midterm") && !activeTermsList.includes("final")) {
            setInitialTerm("MIDTERM");
          } else if (activeTermsList.includes("prelim") && activeTermsList.includes("midterm") && activeTermsList.includes("final")) {
            setInitialTerm("FINAL");
          }
        } else {
          setError('Failed to fetch terms.');
        }
      })
      .catch((error) => {
        setError('An error occurred while fetching terms.');
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    terms,
    error,
    loading,
    hasActiveTerms,
    activeTerms,
    initialTerm,
    activeAcadYrs,
    initialAcadYr,
    activeSems,
    initialSem,
    donePrelim,
    doneMidterm,
    doneFinal
  };
};