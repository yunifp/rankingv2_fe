/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { api } from '../services/api';
import type { ProgramStudi, ProgramStudiResponse } from '../types/programStudi';

export const useProgramStudi = () => {
    const [data, setData] = useState<ProgramStudi[]>([]);
    const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, itemsPerPage: 10, totalPages: 1 });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProdi = useCallback(async (page = 1, limit = 10, search = '', filterPt = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<ProgramStudiResponse>(
                `/program-studi?page=${page}&limit=${limit}&search=${search}&id_pt=${filterPt}`
            );
            setData(response.data.data);
            if (response.data.meta) {
                setMeta(response.data.meta);
            }
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data prodi';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createProdi = async (payload: Partial<ProgramStudi>) => {
        try {
            const response = await api.post('/program-studi', payload);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Gagal menambah data prodi';
            throw new Error(errorMessage);
        }
    };

    const updateProdi = async (id: string, payload: Partial<ProgramStudi>) => {
        try {
            const response = await api.put(`/program-studi/${id}`, payload);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Gagal memperbarui data prodi';
            throw new Error(errorMessage);
        }
    };

    const deleteProdi = async (id: string) => {
        try {
            const response = await api.delete(`/program-studi/${id}`);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Gagal menghapus data prodi';
            throw new Error(errorMessage);
        }
    };

    return { data, meta, loading, error, fetchProdi, createProdi, updateProdi, deleteProdi };
};