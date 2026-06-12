/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { api } from '../services/api';

export const useDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/dashboard/stats');
            setStats(response.data.data);
        } catch (err: any) {
            setError(err.message || "Gagal mengambil data statistik");
        } finally {
            setLoading(false);
        }
    }, []);

    return { stats, loading, error, fetchStats };
};