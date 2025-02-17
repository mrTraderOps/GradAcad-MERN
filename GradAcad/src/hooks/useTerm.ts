import { useEffect, useState } from 'react';
import axios from 'axios';
import { TermData } from '../models/types/GradeData';

export const useTerm = () => {
    const [terms, setTerms] = useState<TermData[]>([]); 
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true); 
    const [hasActiveTerms, setHasActiveTerms] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:5000/api/v1/grade/getTerms')
          .then((response) => {
            if (response.data.success && Array.isArray(response.data.data)) {
              setTerms(response.data.data);
              const active = response.data.data.some((TermData: { term: any[]; }) =>
                TermData.term?.some(term => Object.values(term).includes(true))
              );
              setHasActiveTerms(active);
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

    return { terms, error, loading, hasActiveTerms };
};
