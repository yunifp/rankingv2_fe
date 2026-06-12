/* eslint-disable prefer-const */
import { useState, useEffect, useMemo } from 'react';
import { usePerguruanTinggi } from '../../hooks/usePerguruanTinggi';
import { useAuthStore } from '../../store/useAuthStore';
import type { PerguruanTinggi } from '../../types/perguruanTinggi';
import {
    Search, Plus, Edit, Trash2, X, ChevronUp, ChevronDown, 
    AlertTriangle, CheckCircle, Loader2, ChevronRight
} from 'lucide-react';

const PerguruanTinggiPage = () => {
    const {
        data, meta, loading, fetchPT, createPT, updatePT, deletePT
    } = usePerguruanTinggi();

    const { hasPermission } = useAuthStore();
    const canCreate = hasPermission('/perguruan-tinggi', 'CREATE');
    const canUpdate = hasPermission('/perguruan-tinggi', 'UPDATE');
    const canDelete = hasPermission('/perguruan-tinggi', 'DELETE');

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: keyof PerguruanTinggi; direction: 'asc' | 'desc' } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPT, setCurrentPT] = useState<PerguruanTinggi | null>(null);

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<PerguruanTinggi>>({
        id_pt: '', nama_pt: '', singkatan: '', kota: '', status_aktif: true
    });

    // Debounce untuk search bar
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); 
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Fetch data ke API
    useEffect(() => {
        fetchPT(page, limit, debouncedSearch);
    }, [page, limit, debouncedSearch, fetchPT]);

    // Sorting Lokal di tabel
    const processedData = useMemo(() => {
        let result = [...data];
        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = (a[sortConfig.key] || '').toString().toLowerCase();
                const bValue = (b[sortConfig.key] || '').toString().toLowerCase();
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [data, sortConfig]);

    const requestSort = (key: keyof PerguruanTinggi) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig?.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const openModal = (pt?: PerguruanTinggi) => {
        setCurrentPT(pt || null);
        setFormData({
            id_pt: pt?.id_pt || '', // Menangkap ID ke dalam form
            nama_pt: pt?.nama_pt || '',
            singkatan: pt?.singkatan || '',
            kota: pt?.kota || '',
            status_aktif: pt !== undefined ? pt.status_aktif : true
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            // Hilangkan spasi di awal/akhir ID jika ada
            const payload = { ...formData, id_pt: formData.id_pt?.trim() };

            if (currentPT) {
                // Perbarui jika currentPT ada
                await updatePT(currentPT.id_pt, payload);
            } else {
                await createPT(payload);
            }
            
            setIsModalOpen(false);
            setSuccessMessage(currentPT ? "Data kampus berhasil diperbarui!" : "Kampus baru berhasil ditambahkan!");
            setIsSuccessModalOpen(true);
            fetchPT(page, limit, debouncedSearch);
        } catch (error) {
            const caughtError = error as Error;
            alert(caughtError.message);
        }
    };

    const confirmDelete = (id: string) => {
        setDeleteTargetId(id);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!deleteTargetId) return;
        try {
            await deletePT(deleteTargetId);
            setIsDeleteModalOpen(false);
            setSuccessMessage("Perguruan Tinggi berhasil dihapus!");
            setIsSuccessModalOpen(true);
            fetchPT(page, limit, debouncedSearch);
        } catch (error) {
            const caughtError = error as Error;
            alert(caughtError.message);
        }
        setDeleteTargetId(null);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto font-sans pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Master Perguruan Tinggi</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Kelola data referensi perguruan tinggi.</p>
                </div>
                {canCreate && (
                    <button onClick={() => openModal()} className="bg-emerald-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-lg transition-all font-bold active:scale-[0.98] transform text-sm">
                        <Plus size={18} /> Tambah Kampus
                    </button>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                {/* Header Filter & Search */}
                <div className="p-6 border-b border-slate-100 bg-white">
                    <div className="relative max-w-sm group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Cari ID, Nama atau Singkatan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none text-sm font-medium shadow-sm transition-all"
                        />
                    </div>
                </div>

                {/* Tabel Data */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="p-5 cursor-pointer hover:text-emerald-600 transition-colors whitespace-nowrap" onClick={() => requestSort('id_pt')}>
                                    <div className="flex items-center gap-2">
                                        ID PT
                                        {sortConfig?.key === 'id_pt' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                    </div>
                                </th>
                                <th className="p-5 cursor-pointer hover:text-emerald-600 transition-colors whitespace-nowrap" onClick={() => requestSort('nama_pt')}>
                                    <div className="flex items-center gap-2">
                                        Nama Kampus
                                        {sortConfig?.key === 'nama_pt' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                    </div>
                                </th>
                                <th className="p-5 cursor-pointer hover:text-emerald-600 transition-colors whitespace-nowrap" onClick={() => requestSort('singkatan')}>
                                    <div className="flex items-center gap-2">Singkatan</div>
                                </th>
                                <th className="p-5 whitespace-nowrap">Kota</th>
                                <th className="p-5 whitespace-nowrap text-center">Status</th>
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
                            ) : processedData.length > 0 ? (
                                processedData.map(pt => (
                                    <tr key={pt.id_pt} className="hover:bg-emerald-50/30 transition-colors group bg-white">
                                        <td className="p-5 text-emerald-700 font-bold font-mono text-xs">{pt.id_pt}</td>
                                        <td className="p-5 font-semibold text-slate-800 text-base">{pt.nama_pt}</td>
                                        <td className="p-5 text-slate-600 font-medium">{pt.singkatan || '-'}</td>
                                        <td className="p-5 text-slate-600">{pt.kota || '-'}</td>
                                        <td className="p-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase shadow-sm border ${pt.status_aktif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                {pt.status_aktif ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        {(canUpdate || canDelete) && (
                                            <td className="p-5">
                                                <div className="flex justify-center gap-2">
                                                    {canUpdate && (
                                                        <button onClick={() => openModal(pt)} className="p-2 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-lg transition-all active:scale-[0.98]" title="Edit"><Edit size={18} /></button>
                                                    )}
                                                    {canDelete && (
                                                        <button onClick={() => confirmDelete(pt.id_pt)} className="p-2 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all active:scale-[0.98]" title="Hapus"><Trash2 size={18} /></button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-medium">Data kampus belum tersedia.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100 gap-4">
                    <div className="text-xs text-slate-500 font-bold tracking-widest uppercase">
                        Menampilkan {data.length > 0 ? (meta.currentPage - 1) * meta.itemsPerPage + 1 : 0} - {Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)} dari {meta.totalItems} data
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={limit}
                            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                            className="border border-slate-200 rounded-lg text-xs font-bold px-3 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white text-slate-700 shadow-sm cursor-pointer transition-all"
                        >
                            <option value={10}>10 Baris</option>
                            <option value={25}>25 Baris</option>
                            <option value={50}>50 Baris</option>
                        </select>

                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg shadow-sm p-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={meta.currentPage <= 1}
                                className="px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-slate-600"
                            >
                                Prev
                            </button>
                            <span className="px-3 py-1.5 text-xs font-black text-emerald-700 bg-emerald-50 rounded-md">
                                {meta.currentPage} <span className="text-emerald-400/50 mx-1">/</span> {meta.totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                disabled={meta.currentPage >= meta.totalPages || meta.totalPages === 0}
                                className="px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-slate-600"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL FORM KAMPUS */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
                            <div>
                                <h2 className="text-lg font-bold tracking-tight">{currentPT ? 'Perbarui Data Kampus' : 'Tambah Kampus Baru'}</h2>
                                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Lengkapi profil kampus di bawah ini.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-all text-slate-400 hover:text-white bg-slate-800/50 p-2 hover:bg-slate-800 rounded-full"><X size={18} /></button>
                        </div>

                        <div className="p-7 space-y-5">
                            
                            {/* INPUT ID PT BARU */}
                            <div className="space-y-2 group">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-emerald-700 transition-colors">ID Perguruan Tinggi <span className="text-slate-400 font-normal lowercase">(Opsional)</span></label>
                                <input 
                                    value={formData.id_pt} 
                                    onChange={e => setFormData({ ...formData, id_pt: e.target.value })} 
                                    className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 font-mono text-sm font-semibold shadow-sm text-emerald-800 bg-slate-50 placeholder:text-slate-300 transition-all uppercase" 
                                    placeholder="Kosongkan agar otomatis generate (e.g. PT-001)" 
                                />
                                {currentPT && <p className="text-[10px] text-orange-500 font-medium ml-1">Peringatan: Mengubah ID dapat gagal jika kampus ini sudah memiliki Prodi.</p>}
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-emerald-700 transition-colors">Nama Perguruan Tinggi <span className="text-red-500">*</span></label>
                                <input 
                                    value={formData.nama_pt} 
                                    onChange={e => setFormData({ ...formData, nama_pt: e.target.value })} 
                                    className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 font-semibold shadow-sm text-slate-800 placeholder:text-slate-300 transition-all" 
                                    placeholder="e.g. Universitas Indonesia" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 group">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-emerald-700 transition-colors">Singkatan</label>
                                    <input 
                                        value={formData.singkatan || ''} 
                                        onChange={e => setFormData({ ...formData, singkatan: e.target.value })} 
                                        className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-sm font-semibold shadow-sm text-slate-800 placeholder:text-slate-300 transition-all uppercase" 
                                        placeholder="e.g. UI" 
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-emerald-700 transition-colors">Kota</label>
                                    <input 
                                        value={formData.kota || ''} 
                                        onChange={e => setFormData({ ...formData, kota: e.target.value })} 
                                        className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-sm font-medium shadow-sm text-slate-800 placeholder:text-slate-300 transition-all" 
                                        placeholder="e.g. Depok" 
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <input 
                                    type="checkbox" 
                                    id="status_aktif"
                                    checked={formData.status_aktif} 
                                    onChange={e => setFormData({ ...formData, status_aktif: e.target.checked })}
                                    className="w-5 h-5 accent-emerald-600 cursor-pointer rounded"
                                />
                                <label htmlFor="status_aktif" className="text-sm font-bold text-slate-700 cursor-pointer">Status Kampus Aktif</label>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.nama_pt}
                                    className="bg-emerald-600 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {currentPT ? 'Simpan Perubahan' : 'Buat Kampus'} <ChevronRight size={16} />
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
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
                                <AlertTriangle size={40} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Hapus Kampus?</h2>
                            <p className="text-[13px] text-slate-500 mt-2 font-medium leading-relaxed">
                                Apakah Anda yakin ingin menghapus perguruan tinggi ini? Pastikan tidak ada data Program Studi yang masih terhubung.
                            </p>
                        </div>
                        <div className="flex border-t border-slate-100 bg-slate-50">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm">Batal</button>
                            <button onClick={executeDelete} className="flex-1 py-4 font-bold text-white bg-red-500 hover:bg-red-600 transition-colors text-sm shadow-inner">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL SUKSES */}
            {isSuccessModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-100">
                                <CheckCircle size={40} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Berhasil!</h2>
                            <p className="text-[13px] text-slate-500 mt-2 font-medium leading-relaxed">{successMessage}</p>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <button onClick={() => setIsSuccessModalOpen(false)} className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-900 shadow-md transition-all active:scale-[0.98] text-sm">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PerguruanTinggiPage;