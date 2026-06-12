/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { api } from '../services/api';
import type { Kriteria, KriteriaResponse } from '../types/kriteria';

export const useKriteria = () => {
    const [data, setData] = useState<Kriteria[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchKriteria = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<KriteriaResponse>('/kriteria');
            setData(response.data.data);
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data kriteria';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createKriteria = async (payload: Partial<Kriteria>) => {
        try {
            const response = await api.post('/kriteria', payload);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Gagal menambah data kriteria';
            throw new Error(errorMessage);
        }
    };

    const updateKriteria = async (kode: string, payload: Partial<Kriteria>) => {
        try {
            const response = await api.put(`/kriteria/${kode}`, payload);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Gagal memperbarui data kriteria';
            throw new Error(errorMessage);
        }
    };

    const deleteKriteria = async (kode: string) => {
        try {
            const response = await api.delete(`/kriteria/${kode}`);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Gagal menghapus data kriteria';
            throw new Error(errorMessage);
        }
    };

    return { data, loading, error, fetchKriteria, createKriteria, updateKriteria, deleteKriteria };
};