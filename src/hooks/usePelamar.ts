/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { api } from '../services/api';
import type { ImportPelamarResponse, Pelamar, PelamarPaginatedResponse } from '../types/pelamar';

export const usePelamar = () => {
    const [data, setData] = useState<Pelamar[]>([]);
    const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, itemsPerPage: 10, totalPages: 1 });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPelamar = useCallback(async (page = 1, limit = 10, search = '', kluster = '') => {
        setLoading(true); setError(null);
        try {
            const response = await api.get<PelamarPaginatedResponse>(`/pelamar?page=${page}&limit=${limit}&search=${search}&status_kluster=${kluster}`);
            setData(response.data.data);
            setMeta(response.data.meta);
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data';
            setError(errorMessage); throw err;
        } finally { setLoading(false); }
    }, []);

    const importExcel = async (file: File) => {
        setLoading(true); setError(null);
        try {
            const formData = new FormData(); formData.append('file_excel', file);
            const response = await api.post<ImportPelamarResponse>('/pelamar/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Gagal mengunggah file';
            setError(errorMessage); throw new Error(errorMessage);
        } finally { setLoading(false); }
    };

    // FUNGSI BARU: Update Pelamar
    const updatePelamar = async (id: string, payload: Partial<Pelamar>) => {
        try {
            const response = await api.put(`/pelamar/${id}`, payload);
            return response.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.message || err.message || 'Gagal memperbarui data');
        }
    };

    // FUNGSI BARU: Delete Pelamar
    const deletePelamar = async (id: string) => {
        try {
            const response = await api.delete(`/pelamar/${id}`);
            return response.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.message || err.message || 'Gagal menghapus data');
        }
    };

    return { data, meta, loading, error, fetchPelamar, importExcel, updatePelamar, deletePelamar };
};