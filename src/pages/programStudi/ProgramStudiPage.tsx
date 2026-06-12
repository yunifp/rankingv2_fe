/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from 'react';
import { useProgramStudi } from '../../hooks/useProgramStudi';
import { usePerguruanTinggi } from '../../hooks/usePerguruanTinggi'; // Untuk dropdown filter dan form
import { useAuthStore } from '../../store/useAuthStore';
import type { ProgramStudi } from '../../types/programStudi';
import {
    Search, Plus, Edit, Trash2, X, ChevronUp, ChevronDown, 
    AlertTriangle, CheckCircle, Loader2, ChevronRight, Filter
} from 'lucide-react';

const ProgramStudiPage = () => {
    const { data: prodiData, meta, loading, fetchProdi, createProdi, updateProdi, deleteProdi } = useProgramStudi();
    const { data: ptData, fetchPT } = usePerguruanTinggi(); // Mengambil data kampus

    const { hasPermission } = useAuthStore();
    const canCreate = hasPermission('/program-studi', 'CREATE');
    const canUpdate = hasPermission('/program-studi', 'UPDATE');
    const canDelete = hasPermission('/program-studi', 'DELETE');

    console.log("Cek Permission Prodi:", { canCreate, canUpdate, canDelete });
    console.log("Data User saat ini:", useAuthStore.getState().user);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterPt, setFilterPt] = useState(''); // State untuk filter dropdown kampus
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProdi, setCurrentProdi] = useState<ProgramStudi | null>(null);

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<ProgramStudi>>({
        id_pt: '', jenjang: 'S1', nama_prodi: '', kuota: 0, boleh_buta_warna: true
    });

    // Ambil daftar kampus untuk dropdown (limit 100 agar cukup menampung semua kampus)
    useEffect(() => {
        fetchPT(1, 100, ''); 
    }, []);

    // Debounce pencarian
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Fetch data prodi
    useEffect(() => {
        fetchProdi(page, limit, debouncedSearch, filterPt);
    }, [page, limit, debouncedSearch, filterPt, fetchProdi]);

    // Sorting tabel
    const processedData = useMemo(() => {
        let result = [...prodiData];
        if (sortConfig) {
            result.sort((a: any, b: any) => {
                let aValue = a[sortConfig.key] || '';
                let bValue = b[sortConfig.key] || '';
                
                if (sortConfig.key === 'nama_pt') {
                    aValue = a.pt?.nama_pt || '';
                    bValue = b.pt?.nama_pt || '';
                }

                if (typeof aValue === 'string') aValue = aValue.toLowerCase();
                if (typeof bValue === 'string') bValue = bValue.toLowerCase();

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [prodiData, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig?.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const openModal = (prodi?: ProgramStudi) => {
        setCurrentProdi(prodi || null);
        setFormData({
            id_pt: prodi?.id_pt || '',
            jenjang: prodi?.jenjang || 'S1',
            nama_prodi: prodi?.nama_prodi || '',
            kuota: prodi?.kuota || 0,
            boleh_buta_warna: prodi !== undefined ? prodi.boleh_buta_warna : true
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (currentProdi) {
                await updateProdi(currentProdi.id_prodi, formData);
            } else {
                await createProdi(formData);
            }
            setIsModalOpen(false);
            setSuccessMessage(currentProdi ? "Data Program Studi diperbarui!" : "Program Studi baru ditambahkan!");
            setIsSuccessModalOpen(true);
            fetchProdi(page, limit, debouncedSearch, filterPt);
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
            await deleteProdi(deleteTargetId);
            setIsDeleteModalOpen(false);
            setSuccessMessage("Program Studi berhasil dihapus!");
            setIsSuccessModalOpen(true);
            fetchProdi(page, limit, debouncedSearch, filterPt);
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
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Master Program Studi</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Kelola data program studi beserta kuota penerimaannya.</p>
                </div>
                {canCreate && (
                    <button onClick={() => openModal()} className="bg-emerald-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-lg transition-all font-bold active:scale-[0.98] transform text-sm">
                        <Plus size={18} /> Tambah Prodi
                    </button>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama program studi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none text-sm font-medium shadow-sm transition-all"
                        />
                    </div>
                    {/* Filter Berdasarkan Kampus */}
                    <div className="relative min-w-[280px]">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Filter size={16} className="text-slate-400" />
                        </div>
                        <select 
                            value={filterPt}
                            onChange={(e) => { setFilterPt(e.target.value); setPage(1); }}
                            className="w-full pl-11 pr-4 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 cursor-pointer shadow-sm transition-all"
                        >
                            <option value="">Semua Perguruan Tinggi</option>
                            {ptData.map(pt => (
                                <option key={pt.id_pt} value={pt.id_pt}>{pt.nama_pt}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="p-5 cursor-pointer hover:text-emerald-600 transition-colors whitespace-nowrap" onClick={() => requestSort('nama_pt')}>
                                    <div className="flex items-center gap-2">Kampus {sortConfig?.key === 'nama_pt' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                                </th>
                                <th className="p-5 cursor-pointer hover:text-emerald-600 transition-colors whitespace-nowrap" onClick={() => requestSort('nama_prodi')}>
                                    <div className="flex items-center gap-2">Nama Prodi {sortConfig?.key === 'nama_prodi' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                                </th>
                                <th className="p-5 whitespace-nowrap text-center">Jenjang</th>
                                <th className="p-5 whitespace-nowrap text-center">Kuota</th>
                                <th className="p-5 whitespace-nowrap text-center">Syarat Buta Warna</th>
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
                                processedData.map(prodi => (
                                    <tr key={prodi.id_prodi} className="hover:bg-emerald-50/30 transition-colors group bg-white">
                                        <td className="p-5 text-slate-600 font-semibold">{prodi.pt?.singkatan || prodi.pt?.nama_pt}</td>
                                        <td className="p-5 font-bold text-slate-800 text-base">{prodi.nama_prodi}</td>
                                        <td className="p-5 text-center"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold text-xs">{prodi.jenjang}</span></td>
                                        <td className="p-5 text-center font-bold text-emerald-700">{prodi.kuota} Kursi</td>
                                        <td className="p-5 text-center">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${prodi.boleh_buta_warna ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                                {prodi.boleh_buta_warna ? 'Bebas' : 'Wajib Tidak'}
                                            </span>
                                        </td>
                                        {(canUpdate || canDelete) && (
                                            <td className="p-5">
                                                <div className="flex justify-center gap-2">
                                                    {canUpdate && <button onClick={() => openModal(prodi)} className="p-2 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-lg transition-all" title="Edit"><Edit size={18} /></button>}
                                                    {canDelete && <button onClick={() => confirmDelete(prodi.id_prodi)} className="p-2 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all" title="Hapus"><Trash2 size={18} /></button>}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-medium">Data prodi belum tersedia.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100 gap-4">
                    <div className="text-xs text-slate-500 font-bold tracking-widest uppercase">
                        Menampilkan {prodiData.length > 0 ? (meta.currentPage - 1) * meta.itemsPerPage + 1 : 0} - {Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)} dari {meta.totalItems} data
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={limit}
                            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                            className="border border-slate-200 rounded-lg text-xs font-bold px-3 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white shadow-sm"
                        >
                            <option value={10}>10 Baris</option>
                            <option value={25}>25 Baris</option>
                            <option value={50}>50 Baris</option>
                        </select>
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg shadow-sm p-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.currentPage <= 1} className="px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-40 hover:bg-slate-50 text-slate-600">Prev</button>
                            <span className="px-3 py-1.5 text-xs font-black text-emerald-700 bg-emerald-50 rounded-md">{meta.currentPage} <span className="text-emerald-400/50 mx-1">/</span> {meta.totalPages || 1}</span>
                            <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.currentPage >= meta.totalPages || meta.totalPages === 0} className="px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-40 hover:bg-slate-50 text-slate-600">Next</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL FORM PRODI */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
                            <div>
                                <h2 className="text-lg font-bold tracking-tight">{currentProdi ? 'Perbarui Data Prodi' : 'Tambah Prodi Baru'}</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-all text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full"><X size={18} /></button>
                        </div>
                        <div className="p-7 space-y-5">
                            <div className="space-y-2 group">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Kampus <span className="text-red-500">*</span></label>
                                <select 
                                    value={formData.id_pt} 
                                    onChange={e => setFormData({ ...formData, id_pt: e.target.value })} 
                                    className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-sm font-semibold shadow-sm text-slate-800"
                                >
                                    <option value="" disabled>Pilih Perguruan Tinggi</option>
                                    {ptData.map(pt => (
                                        <option key={pt.id_pt} value={pt.id_pt}>{pt.nama_pt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-2 group">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Nama Prodi <span className="text-red-500">*</span></label>
                                    <input value={formData.nama_prodi} onChange={e => setFormData({ ...formData, nama_prodi: e.target.value })} className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:border-emerald-600 font-semibold shadow-sm text-slate-800" placeholder="e.g. Teknik Informatika" />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Jenjang</label>
                                    <select value={formData.jenjang} onChange={e => setFormData({ ...formData, jenjang: e.target.value })} className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:border-emerald-600 text-sm font-bold shadow-sm text-slate-800">
                                        <option value="D3">D3</option>
                                        <option value="D4">D4</option>
                                        <option value="S1">S1</option>
                                        <option value="S2">S2</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 group">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Kuota Maba <span className="text-red-500">*</span></label>
                                    <input type="number" min="0" value={formData.kuota} onChange={e => setFormData({ ...formData, kuota: Number(e.target.value) })} className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:border-emerald-600 text-sm font-bold shadow-sm text-slate-800" placeholder="0" />
                                </div>
                                <div className="flex items-center justify-center mt-6">
                                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 w-full">
                                        <input type="checkbox" id="boleh_buta_warna" checked={formData.boleh_buta_warna} onChange={e => setFormData({ ...formData, boleh_buta_warna: e.target.checked })} className="w-5 h-5 accent-emerald-600 cursor-pointer rounded" />
                                        <label htmlFor="boleh_buta_warna" className="text-xs font-bold text-slate-700 cursor-pointer">Boleh Buta Warna?</label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                                <button onClick={handleSubmit} disabled={!formData.nama_prodi || !formData.id_pt} className="bg-emerald-600 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                    {currentProdi ? 'Simpan' : 'Tambah'} <ChevronRight size={16} />
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
                            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Hapus Prodi?</h2>
                            <p className="text-[13px] text-slate-500 mt-2 font-medium">Apakah Anda yakin ingin menghapus prodi ini?</p>
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

export default ProgramStudiPage;