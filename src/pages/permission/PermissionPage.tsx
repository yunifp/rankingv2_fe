import React, { useState, useMemo } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuthStore } from '../../store/useAuthStore';
import { Search, Plus, Trash2, ChevronUp, ChevronDown, Key, X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export const PermissionPage: React.FC = () => {
    const { permissions, isLoading, createPermission, deletePermission } = usePermissions();

    const { hasPermission } = useAuthStore();

    const canCreate = hasPermission('/permissions', 'CREATE');
    const canDelete = hasPermission('/permissions', 'DELETE');

    // State Tabel
    const [searchTerm, setSearchTerm] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // State Modal Tambah
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [permissionName, setPermissionName] = useState('');

    // Success Modal States
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Delete Modal States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    // Logic Search & Sort
    const processedData = useMemo(() => {
        let result = [...permissions];
        if (searchTerm) {
            result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        result.sort((a, b) => {
            if (sortDirection === 'asc') return a.name.localeCompare(b.name);
            return b.name.localeCompare(a.name);
        });
        return result;
    }, [permissions, searchTerm, sortDirection]);

    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const paginatedData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await createPermission({ name: permissionName.toUpperCase() });
        if (result.success) {
            setIsModalOpen(false);
            setPermissionName('');
            setSuccessMessage("Permission berhasil ditambahkan!");
            setIsSuccessModalOpen(true);
        } else {
            alert(result.message);
        }
    };

    const confirmDelete = (id: string) => {
        setDeleteTargetId(id);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!deleteTargetId) return;
        const result = await deletePermission(deleteTargetId);
        if (result.success) {
            setIsDeleteModalOpen(false);
            setSuccessMessage("Permission berhasil dihapus secara permanen!");
            setIsSuccessModalOpen(true);
        } else {
            alert(result.message);
        }
        setDeleteTargetId(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Permission</h1>
                    <p className="text-sm text-slate-500 font-medium">Definisikan aksi/tindakan yang tersedia di dalam sistem.</p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:bg-blue-700 hover:shadow-lg transition-all font-semibold active:scale-95 transform"
                    >
                        <Plus size={18} /> Tambah Action
                    </button>
                )}
            </div>

            {/* Tabel Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari aksi (cth: READ)..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm font-medium shadow-sm transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th
                                    className="p-5 cursor-pointer hover:text-blue-600 transition-colors w-1/2 whitespace-nowrap"
                                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                                >
                                    <div className="flex items-center gap-2">
                                        Nama Permission {sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </div>
                                </th>
                                <th className="p-5 w-1/4 whitespace-nowrap">ID Resource</th>
                                {canDelete && (
                                    <th className="p-5 text-center w-1/4 whitespace-nowrap">Aksi</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {isLoading ? (
                                <tr><td colSpan={canDelete ? 3 : 2} className="p-20 text-center text-slate-400 font-medium"><Loader2 className="animate-spin mx-auto mb-2" />Memuat data...</td></tr>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm border border-blue-100">
                                                    <Key size={16} />
                                                </div>
                                                <span className="font-bold text-slate-800 tracking-wide text-sm">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-xs font-mono text-slate-400 font-medium">{p.id}</td>

                                        {canDelete && (
                                            <td className="p-5">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => confirmDelete(p.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all"
                                                        title="Hapus Permission"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={canDelete ? 3 : 2} className="p-20 text-center text-slate-400 font-medium">Belum ada permission yang terdaftar.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 gap-4">
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wide">
                            Menampilkan {paginatedData.length} dari {processedData.length} data
                        </div>
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg shadow-sm p-1">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors text-slate-600"
                            >
                                Prev
                            </button>
                            <span className="px-3 py-1.5 text-xs font-black text-blue-700 bg-blue-50 rounded-md">
                                {currentPage} <span className="text-slate-400 mx-1">/</span> {totalPages}
                            </span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors text-slate-600"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Tambah */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
                            <h2 className="text-lg font-bold tracking-tight">Tambah Action</h2>
                            <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-all text-slate-400 hover:text-white bg-slate-800/50 p-2 hover:bg-slate-800 rounded-full"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-7 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nama Permission</label>
                                <input
                                    required autoFocus
                                    value={permissionName}
                                    onChange={(e) => setPermissionName(e.target.value)}
                                    className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-semibold shadow-sm transition-all uppercase text-slate-800 placeholder:text-slate-300 placeholder:normal-case"
                                    placeholder="Contoh: EXPORT, APPROVE"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 font-medium ml-1">* Format yang direkomendasikan adalah SNAKE_CASE.</p>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 font-bold text-slate-500 text-sm hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-7 py-2.5 rounded-xl font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:shadow-lg transition-all text-sm active:scale-95"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI DELETE */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 border border-red-100">
                                <AlertTriangle size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Hapus Action?</h2>
                            <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
                                Apakah Anda yakin ingin menghapus permission ini? Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div className="flex border-t border-slate-100">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={executeDelete}
                                className="flex-1 py-4 font-bold text-red-600 hover:bg-red-50 transition-colors border-l border-slate-100"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL SUKSES */}
            {isSuccessModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-green-100">
                                <CheckCircle size={40} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Berhasil!</h2>
                            <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
                                {successMessage}
                            </p>
                        </div>
                        <div className="p-5 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={() => setIsSuccessModalOpen(false)}
                                className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-md transition-all active:scale-95 text-sm"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};