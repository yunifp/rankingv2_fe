/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { api } from '../services/api';
import type { PenghasilanOrtu, PenghasilanOrtuResponse } from '../types/penghasilan';

export const usePenghasilan = () => {
    const [data, setData] = useState<PenghasilanOrtu[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPenghasilan = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<PenghasilanOrtuResponse>('/penghasilan-ortu');
            setData(response.data.data);
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data penghasilan';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createPenghasilan = async (payload: Partial<PenghasilanOrtu>) => {
        try {
            const response = await api.post('/penghasilan-ortu', payload);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Gagal menambah data';
            throw new Error(errorMessage);
        }
    };

    const updatePenghasilan = async (id: string, payload: Partial<PenghasilanOrtu>) => {
        try {
            const response = await api.put(`/penghasilan-ortu/${id}`, payload);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Gagal memperbarui data';
            throw new Error(errorMessage);
        }
    };

    const deletePenghasilan = async (id: string) => {
        try {
            const response = await api.delete(`/penghasilan-ortu/${id}`);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Gagal menghapus data';
            throw new Error(errorMessage);
        }
    };

    return { data, loading, error, fetchPenghasilan, createPenghasilan, updatePenghasilan, deletePenghasilan };
};