/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { api } from '../services/api';

export const useRanking = () => {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const fetchResults = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/ranking/results');
            setResults(response.data.data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const generateRanking = async () => {
        setIsGenerating(true);
        try {
            const response = await api.post('/ranking/generate');
            await fetchResults(); // Langsung tarik data terbaru
            return response.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Gagal menjalankan algoritma');
        } finally {
            setIsGenerating(false);
        }
    };

    const setMundur = async (id: string) => {
        try {
            const response = await api.post(`/ranking/resign/${id}`);
            await fetchResults(); // Refresh tabel
            return response.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Gagal set mundur');
        }
    };

    return { results, loading, isGenerating, fetchResults, generateRanking, setMundur };
};