import { useEffect, useState } from 'react';
import axios from 'axios';
import { TermData } from '../models/types/GradeData';

export const useTerm = () => {
    const [terms, setTerms] = useState<TermData[]>([]); // Fix: Store an array
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        axios.get('http://localhost:5000/api/v1/terms/getTerms')
          .then((response) => {
            if (response.data.success && Array.isArray(response.data.data)) {
              setTerms(response.data.data);
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

    return { terms, error, loading };
};
