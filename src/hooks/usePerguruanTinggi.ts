import { useState, useCallback } from 'react';
import { api } from '../services/api';
import type { PerguruanTinggi, PerguruanTinggiResponse } from '../types/perguruanTinggi';

export const usePerguruanTinggi = () => {
  const [data, setData] = useState<PerguruanTinggi[]>([]);
  const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, itemsPerPage: 10, totalPages: 1 });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPT = useCallback(async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<PerguruanTinggiResponse>(
        `/perguruan-tinggi?page=${page}&limit=${limit}&search=${search}`
      );
      setData(response.data.data);
      if (response.data.meta) {
        setMeta(response.data.meta);
      }
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPT = async (payload: Partial<PerguruanTinggi>) => {
    try {
      const response = await api.post('/perguruan-tinggi', payload);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menambah data';
      throw new Error(errorMessage);
    }
  };

  const updatePT = async (id: string, payload: Partial<PerguruanTinggi>) => {
    try {
      const response = await api.put(`/perguruan-tinggi/${id}`, payload);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memperbarui data';
      throw new Error(errorMessage);
    }
  };

  const deletePT = async (id: string) => {
    try {
      const response = await api.delete(`/perguruan-tinggi/${id}`);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus data';
      throw new Error(errorMessage);
    }
  };

  return { data, meta, loading, error, fetchPT, createPT, updatePT, deletePT };
};