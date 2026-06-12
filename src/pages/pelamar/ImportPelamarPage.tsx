/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from 'react';
import type { DragEvent, ChangeEvent, FormEvent } from 'react';
import { usePelamar } from '../../hooks/usePelamar';
import { useAuthStore } from '../../store/useAuthStore';
import type { Pelamar } from '../../types/pelamar';
import { 
    UploadCloud, FileSpreadsheet, X, Loader2, CheckCircle, 
    AlertTriangle, ShieldCheck, Database, Server, Search, Filter,
    Pencil, Trash2
} from 'lucide-react';

const ImportPelamarPage = () => {
    const { data: pelamarData, meta, loading, fetchPelamar, importExcel, updatePelamar, deletePelamar } = usePelamar();
    const { hasPermission } = useAuthStore();
    
    // Pengecekan Hak Akses
    const canImport = hasPermission('/pelamar', 'CREATE');
    const canUpdate = hasPermission('/pelamar', 'UPDATE');
    const canDelete = hasPermission('/pelamar', 'DELETE');

    // State Tabel & Paginasi
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterKluster, setFilterKluster] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // State Upload File
    const [file, setFile] = useState<File | null>(null);
    const [isDragActive, setIsDragActive] = useState<boolean>(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
    const [trxInfo, setTrxInfo] = useState<{ id_trx: string; s3_path: string; message: string; berhasil: number; duplikat: number } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // State CRUD Manual
    const [editingPelamar, setEditingPelamar] = useState<Pelamar | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Efek: Fetch data setiap ada perubahan parameter tabel
    useEffect(() => {
        fetchPelamar(page, limit, debouncedSearch, filterKluster);
    }, [page, limit, debouncedSearch, filterKluster]);

    // Efek: Debounce untuk pencarian agar tidak membebani server
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // ==========================================
    // FUNGSI HANDLER UPLOAD FILE
    // ==========================================
    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const validateAndSetFile = (selectedFile: File) => {
        setErrorMessage(null);
        const ext = selectedFile.name.split('.').pop()?.toLowerCase();
        if (ext === 'xlsx' || ext === 'xls') {
            setFile(selectedFile);
        } else {
            setErrorMessage('Format file tidak didukung! Hanya diperbolehkan file .xlsx atau .xls');
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        try {
            const res = await importExcel(file);
            if (res.success) {
                setTrxInfo({
                    id_trx: res.data.id_trx,
                    s3_path: res.data.s3_path,
                    message: res.message,
                    berhasil: res.data.totalBerhasil,
                    duplikat: res.data.totalDuplikat
                });
                setIsSuccessModalOpen(true);
                setFile(null);
                fetchPelamar(page, limit, debouncedSearch, filterKluster); // Refresh tabel otomatis
            }
        } catch (err) {
            const error = err as Error;
            setErrorMessage(error.message);
        }
    };

    // ==========================================
    // FUNGSI HANDLER CRUD MANUAL
    // ==========================================
    const handleEditSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingPelamar) return;
        setIsSubmitting(true);
        try {
            await updatePelamar(editingPelamar.id, editingPelamar);
            setEditingPelamar(null);
            fetchPelamar(page, limit, debouncedSearch, filterKluster);
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        setIsSubmitting(true);
        try {
            await deletePelamar(deletingId);
            setDeletingId(null);
            fetchPelamar(page, limit, debouncedSearch, filterKluster);
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto font-sans pb-10">
            {/* Header Halaman */}
            <div>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Database & Ingestion Pelamar</h1>
                <p className="text-sm text-slate-500 font-medium mt-1">Kelola data master pendaftar dan unggah manifest berkas baru ke sistem.</p>
            </div>

            {/* SECTION 1: AREA DROPZONE UPLOAD */}
            {canImport && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row gap-6 items-center">
                    <div 
                        onDragEnter={handleDrag} 
                        onDragOver={handleDrag} 
                        onDragLeave={handleDrag} 
                        onDrop={handleDrop}
                        onClick={!file ? () => fileInputRef.current?.click() : undefined}
                        className={`flex-1 w-full h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 text-center transition-all ${
                            file ? 'border-emerald-200 bg-emerald-50/10' : 
                            isDragActive ? 'border-emerald-600 bg-emerald-50/40' : 
                            'border-slate-200 bg-slate-50 hover:bg-slate-100/50 cursor-pointer'
                        }`}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".xlsx, .xls" 
                            className="hidden" 
                        />
                        {!file ? (
                            <div className="space-y-1">
                                <UploadCloud size={24} className="text-emerald-600 mx-auto" />
                                <p className="text-xs font-bold text-slate-700">Tarik berkas Excel ke sini atau klik untuk browse</p>
                                <p className="text-[10px] text-slate-400 font-medium">Sistem otomatis melewati kode pendaftar yang sudah terdaftar sebelumnya.</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 bg-white border border-emerald-100 p-3 rounded-xl shadow-sm">
                                <FileSpreadsheet size={20} className="text-emerald-600" />
                                <span className="text-xs font-bold text-slate-800 truncate max-w-xs">{file.name}</span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setFile(null); setErrorMessage(null); }} 
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="w-full md:w-auto flex flex-col justify-center">
                        <button
                            onClick={handleUpload} 
                            disabled={!file || loading}
                            className="bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50 text-xs flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                            Unggah & Sinkronisasikan
                        </button>
                    </div>
                </div>
            )}

            {/* Notifikasi Error Upload */}
            {errorMessage && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 p-4 rounded-xl text-red-700 text-xs font-medium">
                    <AlertTriangle size={16} className="mt-0.5" /> <p>{errorMessage}</p>
                </div>
            )}

            {/* SECTION 2: TABEL MASTER DATA PELAMAR */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                {/* Header Filter & Pencarian */}
                <div className="p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600" size={18} />
                        <input
                            type="text" 
                            placeholder="Cari Kode Pendaftar atau Nama Pendaftar..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
                        />
                    </div>
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select 
                            value={filterKluster} 
                            onChange={(e) => { setFilterKluster(e.target.value); setPage(1); }}
                            className="w-full pl-11 pr-4 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-600/20"
                        >
                            <option value="">Semua Kluster</option>
                            <option value="Afirmasi">Afirmasi</option>
                            <option value="Reguler">Reguler</option>
                        </select>
                    </div>
                </div>

                {/* Konten Tabel */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="p-5">Kode Pendaftar</th>
                                <th className="p-5">Nama Pendaftar</th>
                                <th className="p-5 text-center">Kluster</th>
                                <th className="p-5 text-center">Rapor</th>
                                <th className="p-5 text-center">Akademik</th>
                                <th className="p-5 text-center">Wawancara</th>
                                <th className="p-5 text-center">Status</th>
                                <th className="p-5 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100">
                            {loading && pelamarData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-20 text-center text-slate-400 font-medium">
                                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-3" size={32} />
                                        <p>Memuat database pelamar...</p>
                                    </td>
                                </tr>
                            ) : pelamarData.length > 0 ? (
                                pelamarData.map(pelamar => (
                                    <tr key={pelamar.id} className="hover:bg-emerald-50/20 transition-colors bg-white">
                                        <td className="p-5 font-mono text-xs font-bold text-emerald-700">{pelamar.kode_pendaftar}</td>
                                        <td className="p-5 font-bold text-slate-800 text-sm">{pelamar.nama}</td>
                                        <td className="p-5 text-center">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${pelamar.status_kluster === 'Afirmasi' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                                                {pelamar.status_kluster}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center font-medium text-slate-600">{pelamar.nilai_rapor}</td>
                                        <td className="p-5 text-center font-medium text-slate-600">{pelamar.nilai_tes_akademik}</td>
                                        <td className="p-5 text-center font-medium text-slate-600">{pelamar.nilai_wawancara}</td>
                                        <td className="p-5 text-center">
                                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">{pelamar.status_kelulusan.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {canUpdate && (
                                                    <button 
                                                        onClick={() => setEditingPelamar(pelamar)} 
                                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Edit Data"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button 
                                                        onClick={() => setDeletingId(pelamar.id)} 
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus Data"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="p-20 text-center text-slate-400 font-medium">
                                        Belum ada data pelamar di database master.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Paginasi */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100 gap-4">
                    <div className="text-xs text-slate-500 font-bold tracking-widest uppercase">
                        Menampilkan {pelamarData.length > 0 ? (meta.currentPage - 1) * meta.itemsPerPage + 1 : 0} - {Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)} dari {meta.totalItems} data
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={limit} 
                            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                            className="border border-slate-200 rounded-lg text-xs font-bold px-3 py-2 bg-white text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-emerald-600/20"
                        >
                            <option value={10}>10 Baris</option>
                            <option value={25}>25 Baris</option>
                            <option value={50}>50 Baris</option>
                        </select>
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg shadow-sm p-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.currentPage <= 1} className="px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-40 text-slate-600 hover:bg-slate-50 transition-colors">Prev</button>
                            <span className="px-3 py-1.5 text-xs font-black text-emerald-700 bg-emerald-50 rounded-md">{meta.currentPage} / {meta.totalPages || 1}</span>
                            <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.currentPage >= meta.totalPages || meta.totalPages === 0} className="px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-40 text-slate-600 hover:bg-slate-50 transition-colors">Next</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* KUMPULAN MODAL (SUCCESS, EDIT, DELETE)     */}
            {/* ========================================== */}

            {/* MODAL EDIT DATA */}
            {editingPelamar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <form onSubmit={handleEditSubmit} className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 bg-white">
                            <h2 className="text-lg font-bold text-slate-800">Edit Data Pelamar</h2>
                            <p className="text-xs text-slate-500 mt-1 font-mono">{editingPelamar.kode_pendaftar}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                                <input 
                                    type="text" required value={editingPelamar.nama} 
                                    onChange={e => setEditingPelamar({...editingPelamar, nama: e.target.value})} 
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Kluster</label>
                                    <select 
                                        value={editingPelamar.status_kluster} 
                                        onChange={e => setEditingPelamar({...editingPelamar, status_kluster: e.target.value as 'Afirmasi' | 'Reguler'})} 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none"
                                    >
                                        <option value="Reguler">Reguler</option>
                                        <option value="Afirmasi">Afirmasi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nilai Rapor</label>
                                    <input 
                                        type="number" step="0.01" required value={editingPelamar.nilai_rapor} 
                                        onChange={e => setEditingPelamar({...editingPelamar, nilai_rapor: Number(e.target.value)})} 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tes Akademik</label>
                                    <input 
                                        type="number" step="0.01" required value={editingPelamar.nilai_tes_akademik} 
                                        onChange={e => setEditingPelamar({...editingPelamar, nilai_tes_akademik: Number(e.target.value)})} 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Wawancara</label>
                                    <input 
                                        type="number" step="0.01" required value={editingPelamar.nilai_wawancara} 
                                        onChange={e => setEditingPelamar({...editingPelamar, nilai_wawancara: Number(e.target.value)})} 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" 
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button 
                                type="button" onClick={() => setEditingPelamar(null)} 
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 text-sm shadow-sm transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                type="submit" disabled={isSubmitting} 
                                className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 text-sm flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                            >
                                {isSubmitting && <Loader2 size={16} className="animate-spin" />} 
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL KONFIRMASI HAPUS */}
            {deletingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200 p-6 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner">
                            <Trash2 size={32} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Hapus Data Pelamar?</h2>
                        <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
                            Tindakan ini permanen dan tidak dapat dibatalkan. Log penghapusan akan dicatat di MongoDB.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setDeletingId(null)} 
                                className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                disabled={isSubmitting} 
                                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 text-sm flex justify-center items-center shadow-md shadow-red-600/20 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Ya, Hapus Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL UPLOAD SUKSES */}
            {isSuccessModalOpen && trxInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
                        <div className="p-8 flex flex-col items-center justify-center text-center pb-2">
                            <CheckCircle size={44} className="text-emerald-500 mb-3" />
                            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Sinkronisasi Selesai</h2>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{trxInfo.message}</p>
                        </div>
                        <div className="px-6 py-4 mx-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs">
                            <div className="flex justify-between font-medium">
                                <span className="text-slate-400">Data Baru Sukses Ingest:</span>
                                <span className="text-emerald-700 font-bold">{trxInfo.berhasil} Pelamar</span>
                            </div>
                            <div className="flex justify-between font-medium border-b border-slate-200/50 pb-2">
                                <span className="text-slate-400">Duplikat Terlewati (Skip):</span>
                                <span className="text-amber-600 font-bold">{trxInfo.duplikat} Pelamar</span>
                            </div>
                            <div className="flex items-start justify-between gap-4 pt-1 font-medium">
                                <span className="text-slate-400 flex items-center gap-1"><Database size={12}/>ID Log MongoDB:</span>
                                <span className="text-slate-700 font-mono font-bold break-all max-w-[260px] text-right select-all">{trxInfo.id_trx}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4 font-medium">
                                <span className="text-slate-400 flex items-center gap-1"><Server size={12}/>Arsip Storage S3:</span>
                                <span className="text-slate-700 font-mono font-bold truncate max-w-[260px]" title={trxInfo.s3_path}>{trxInfo.s3_path}</span>
                            </div>
                        </div>
                        <div className="p-5 flex justify-end">
                            <button 
                                onClick={() => setIsSuccessModalOpen(false)} 
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 text-xs shadow-md shadow-slate-900/20 transition-all active:scale-[0.98]"
                            >
                                Tutup & Perbarui Tabel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportPelamarPage;   