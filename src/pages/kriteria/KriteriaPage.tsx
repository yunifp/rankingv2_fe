 
import { useState, useEffect, useMemo } from 'react';
import { useKriteria } from '../../hooks/useKriteria';
import { useAuthStore } from '../../store/useAuthStore';
import type { Kriteria, StatusKluster, TipeKriteria } from '../../types/kriteria';
import {
    Search, Plus, Edit, Trash2, X, ChevronUp, ChevronDown, 
    AlertTriangle, CheckCircle, Loader2, ChevronRight, Filter
} from 'lucide-react';

const KriteriaPage = () => {
    const { data: kriteriaData, loading, fetchKriteria, createKriteria, updateKriteria, deleteKriteria } = useKriteria();

    const { hasPermission } = useAuthStore();
    const canCreate = hasPermission('/kriteria', 'CREATE');
    const canUpdate = hasPermission('/kriteria', 'UPDATE');
    const canDelete = hasPermission('/kriteria', 'DELETE');

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterKluster, setFilterKluster] = useState<string>(''); // Filter kluster
    
    // Client-side pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Kriteria; direction: 'asc' | 'desc' } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentKode, setCurrentKode] = useState<string | null>(null);

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetKode, setDeleteTargetKode] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<Kriteria>>({
        kode_kriteria: '', nama_kriteria: '', tipe: 'benefit', bobot: 0, kluster: 'Reguler'
    });

    useEffect(() => {
        fetchKriteria();
    }, [fetchKriteria]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Proses Data (Search, Filter, Sort) Client-Side
    const processedData = useMemo(() => {
        let result = [...kriteriaData];

        if (debouncedSearch) {
            const lowerSearch = debouncedSearch.toLowerCase();
            result = result.filter(item => 
                item.kode_kriteria.toLowerCase().includes(lowerSearch) || 
                item.nama_kriteria.toLowerCase().includes(lowerSearch)
            );
        }

        if (filterKluster) {
            result = result.filter(item => item.kluster === filterKluster);
        }

        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [kriteriaData, debouncedSearch, filterKluster, sortConfig]);

    // Paginasi Client-Side
    const totalItems = processedData.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const paginatedData = useMemo(() => {
        const start = (page - 1) * limit;
        return processedData.slice(start, start + limit);
    }, [processedData, page, limit]);

    const requestSort = (key: keyof Kriteria) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig?.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const openModal = (kriteria?: Kriteria) => {
        if (kriteria) {
            setIsEditMode(true);
            setCurrentKode(kriteria.kode_kriteria);
            setFormData({
                kode_kriteria: kriteria.kode_kriteria,
                nama_kriteria: kriteria.nama_kriteria,
                tipe: kriteria.tipe,
                bobot: Number(kriteria.bobot),
                kluster: kriteria.kluster
            });
        } else {
            setIsEditMode(false);
            setCurrentKode(null);
            setFormData({
                kode_kriteria: '', nama_kriteria: '', tipe: 'benefit', bobot: 0, kluster: 'Reguler'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (isEditMode && currentKode) {
                await updateKriteria(currentKode, formData);
            } else {
                await createKriteria(formData);
            }
            setIsModalOpen(false);
            setSuccessMessage(isEditMode ? "Data Kriteria diperbarui!" : "Kriteria baru ditambahkan!");
            setIsSuccessModalOpen(true);
            fetchKriteria();
        } catch (error) {
            const caughtError = error as Error;
            alert(caughtError.message);
        }
    };

    const confirmDelete = (kode: string) => {
        setDeleteTargetKode(kode);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!deleteTargetKode) return;
        try {
            await deleteKriteria(deleteTargetKode);
            setIsDeleteModalOpen(false);
            setSuccessMessage("Kriteria berhasil dihapus!");
            setIsSuccessModalOpen(true);
            fetchKriteria();
        } catch (error) {
            const caughtError = error as Error;
            alert(caughtError.message);
        }
        setDeleteTargetKode(null);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto font-sans pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Data Kriteria SAW</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Atur kriteria penilaian dan bobot untuk SPK perankingan.</p>
                </div>
                {canCreate && (
                    <button onClick={() => openModal()} className="bg-emerald-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-lg transition-all font-bold active:scale-[0.98] transform text-sm">
                        <Plus size={18} /> Tambah Kriteria
                    </button>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Cari kode atau nama kriteria..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none text-sm font-medium shadow-sm transition-all"
                        />
                    </div>
                    {/* Filter Berdasarkan Kluster */}
                    <div className="relative min-w-[200px]">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Filter size={16} className="text-slate-400" />
                        </div>
                        <select 
                            value={filterKluster}
                            onChange={(e) => { setFilterKluster(e.target.value); setPage(1); }}
                            className="w-full pl-11 pr-4 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 cursor-pointer shadow-sm transition-all"
                        >
                            <option value="">Semua Kluster</option>
                            <option value="Afirmasi">Afirmasi</option>
                            <option value="Reguler">Reguler</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="p-5 cursor-pointer hover:text-emerald-600 transition-colors whitespace-nowrap" onClick={() => requestSort('kode_kriteria')}>
                                    <div className="flex items-center gap-2">Kode {sortConfig?.key === 'kode_kriteria' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                                </th>
                                <th className="p-5 cursor-pointer hover:text-emerald-600 transition-colors whitespace-nowrap" onClick={() => requestSort('nama_kriteria')}>
                                    <div className="flex items-center gap-2">Nama Kriteria {sortConfig?.key === 'nama_kriteria' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                                </th>
                                <th className="p-5 whitespace-nowrap text-center">Tipe</th>
                                <th className="p-5 whitespace-nowrap text-center cursor-pointer hover:text-emerald-600" onClick={() => requestSort('bobot')}>
                                    <div className="flex items-center justify-center gap-2">Bobot {sortConfig?.key === 'bobot' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                                </th>
                                <th className="p-5 whitespace-nowrap text-center">Kluster</th>
                                {(canUpdate || canDelete) && <th className="p-5 text-center whitespace-nowrap w-32">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center text-slate-400 font-medium">
                                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-3" size={32} />
                                        <p className="animate-pulse">Memuat data...</p>
                                    </td>
                                </tr>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map(item => (
                                    <tr key={item.kode_kriteria} className="hover:bg-emerald-50/30 transition-colors group bg-white">
                                        <td className="p-5 text-emerald-700 font-bold font-mono text-xs">{item.kode_kriteria}</td>
                                        <td className="p-5 font-bold text-slate-800 text-base">{item.nama_kriteria}</td>
                                        <td className="p-5 text-center">
                                            <span className={`px-2 py-1 rounded font-bold text-[10px] uppercase tracking-widest ${item.tipe === 'benefit' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                {item.tipe}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center font-black text-slate-700">{Number(item.bobot).toFixed(2)}</td>
                                        <td className="p-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${item.kluster === 'Afirmasi' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                {item.kluster}
                                            </span>
                                        </td>
                                        {(canUpdate || canDelete) && (
                                            <td className="p-5">
                                                <div className="flex justify-center gap-2">
                                                    {canUpdate && <button onClick={() => openModal(item)} className="p-2 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-lg transition-all" title="Edit"><Edit size={18} /></button>}
                                                    {canDelete && <button onClick={() => confirmDelete(item.kode_kriteria)} className="p-2 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all" title="Hapus"><Trash2 size={18} /></button>}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-medium">Data kriteria tidak ditemukan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100 gap-4">
                    <div className="text-xs text-slate-500 font-bold tracking-widest uppercase">
                        Menampilkan {paginatedData.length > 0 ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, totalItems)} dari {totalItems} data
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={limit}
                            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                            className="border border-slate-200 rounded-lg text-xs font-bold px-3 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white shadow-sm"
                        >
                            <option value={10}>10 Baris</option>
                            <option value={25}>25 Baris</option>
                        </select>
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg shadow-sm p-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-40 hover:bg-slate-50 text-slate-600">Prev</button>
                            <span className="px-3 py-1.5 text-xs font-black text-emerald-700 bg-emerald-50 rounded-md">{page} <span className="text-emerald-400/50 mx-1">/</span> {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-40 hover:bg-slate-50 text-slate-600">Next</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL FORM KRITERIA */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
                            <div>
                                <h2 className="text-lg font-bold tracking-tight">{isEditMode ? 'Perbarui Kriteria' : 'Tambah Kriteria Baru'}</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-all text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full"><X size={18} /></button>
                        </div>
                        <div className="p-7 space-y-5">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 group">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Kode <span className="text-red-500">*</span></label>
                                    <input 
                                        value={formData.kode_kriteria} 
                                        onChange={e => setFormData({ ...formData, kode_kriteria: e.target.value.toUpperCase() })} 
                                        disabled={isEditMode}
                                        className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:border-emerald-600 font-mono text-sm font-semibold shadow-sm text-emerald-800 bg-slate-50 disabled:opacity-70 disabled:cursor-not-allowed uppercase" 
                                        placeholder="C-01" 
                                    />
                                </div>
                                <div className="space-y-2 col-span-2 group">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Nama Kriteria <span className="text-red-500">*</span></label>
                                    <input 
                                        value={formData.nama_kriteria} 
                                        onChange={e => setFormData({ ...formData, nama_kriteria: e.target.value })} 
                                        className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:border-emerald-600 font-semibold shadow-sm text-slate-800" 
                                        placeholder="e.g. Nilai Rapor" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 group">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Kluster <span className="text-red-500">*</span></label>
                                    <select 
                                        value={formData.kluster} 
                                        onChange={e => setFormData({ ...formData, kluster: e.target.value as StatusKluster })} 
                                        className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:border-emerald-600 text-sm font-bold shadow-sm text-slate-800"
                                    >
                                        <option value="Afirmasi">Afirmasi</option>
                                        <option value="Reguler">Reguler</option>
                                    </select>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Tipe Kriteria <span className="text-red-500">*</span></label>
                                    <select 
                                        value={formData.tipe} 
                                        onChange={e => setFormData({ ...formData, tipe: e.target.value as TipeKriteria })} 
                                        className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:border-emerald-600 text-sm font-bold shadow-sm text-slate-800"
                                    >
                                        <option value="benefit">Benefit (Maksimal)</option>
                                        <option value="cost">Cost (Minimal)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Bobot (0.00 - 1.00) <span className="text-red-500">*</span></label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    min="0" 
                                    max="1"
                                    value={formData.bobot} 
                                    onChange={e => setFormData({ ...formData, bobot: Number(e.target.value) })} 
                                    className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:border-emerald-600 text-sm font-bold shadow-sm text-slate-800" 
                                    placeholder="0.30" 
                                />
                                <p className="text-[10px] text-slate-400 font-medium">Nilai desimal. Contoh: 30% ditulis 0.30</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                                <button onClick={handleSubmit} disabled={!formData.kode_kriteria || !formData.nama_kriteria || formData.bobot === 0} className="bg-emerald-600 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                    {isEditMode ? 'Simpan' : 'Tambah'} <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI DELETE */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100"><AlertTriangle size={40} strokeWidth={2.5} /></div>
                            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Hapus Kriteria?</h2>
                            <p className="text-[13px] text-slate-500 mt-2 font-medium">Apakah Anda yakin ingin menghapus kriteria ini? Perhitungan SPK bisa terpengaruh.</p>
                        </div>
                        <div className="flex border-t border-slate-100 bg-slate-50">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 font-bold text-slate-600 hover:bg-slate-100 text-sm">Batal</button>
                            <button onClick={executeDelete} className="flex-1 py-4 font-bold text-white bg-red-500 hover:bg-red-600 text-sm">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL SUKSES */}
            {isSuccessModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-100"><CheckCircle size={40} strokeWidth={2.5} /></div>
                            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Berhasil!</h2>
                            <p className="text-[13px] text-slate-500 mt-2 font-medium">{successMessage}</p>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <button onClick={() => setIsSuccessModalOpen(false)} className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-900 text-sm">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KriteriaPage;