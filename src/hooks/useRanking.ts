/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { api } from '../services/api';

export const useRanking = () => {
    const [results, setResults] = useState<any[]>([]);
    const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, itemsPerPage: 10, totalPages: 1 });
    const [loading, setLoading] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    // Fetch diperbarui menerima parameter filter & paginasi
    const fetchResults = useCallback(async (page = 1, limit = 10, search = '', id_pt = '', id_prodi = '', status_kluster = '') => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                ...(search && { search }),
                ...(id_pt && { id_pt }),
                ...(id_prodi && { id_prodi }),
                ...(status_kluster && { status_kluster }),
            }).toString();

            const response = await api.get(`/ranking/results?${query}`);
            setResults(response.data.data);
            setMeta(response.data.meta);
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
            return response.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Gagal set mundur');
        }
    };

    const resetAllRanking = async () => {
        try {
            const response = await api.post('/ranking/reset');
            return response.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Gagal mereset perankingan');
        }
    };

    const downloadExportData = async () => {
    try {
        const response = await api.get('/ranking/export-all');
        return response.data.data; // Mengembalikan array data pelamar utuh
    } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Gagal menarik data ekspor');
    }
};

    return { results, meta, loading, isGenerating, fetchResults, generateRanking, setMundur, resetAllRanking, downloadExportData };
};