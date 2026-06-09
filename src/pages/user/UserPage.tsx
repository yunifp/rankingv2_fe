/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useAuthStore } from '../../store/useAuthStore';
import type { User, UserFormData } from '../../types/user';
import {
    Search, Plus, Edit, Trash2, User as UserIcon,
    Mail, Shield, X, ChevronDown, ChevronUp,
    Eye, EyeOff, Loader2, Inbox, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';

export const UserPage: React.FC = () => {
    const { users, roles, meta, isLoading, createUser, updateUser, deleteUser, fetchUsers } = useUsers();
    const { hasPermission } = useAuthStore();

    // Menggunakan permission string murni
const canCreate = hasPermission('/users', 'CREATE');
const canUpdate = hasPermission('/users', 'UPDATE');
const canDelete = hasPermission('/users', 'DELETE');

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>({
        name: '', email: '', password: '', roleIds: []
    });

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchUsers(page, limit);
    }, [page, limit, fetchUsers]);

    const processedUsers = useMemo(() => {
        let result = [...users];
        if (searchTerm) {
            const lowTerm = searchTerm.toLowerCase();
            result = result.filter(u =>
                u.name.toLowerCase().includes(lowTerm) ||
                u.email.toLowerCase().includes(lowTerm)
            );
        }
        if (sortConfig) {
            result.sort((a, b) => {
                const aVal = (a[sortConfig.key] || '').toString().toLowerCase();
                const bVal = (b[sortConfig.key] || '').toString().toLowerCase();
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [users, searchTerm, sortConfig]);

    const requestSort = (key: keyof User) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig?.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const openModal = (userTarget?: User) => {
        setShowPassword(false);
        if (userTarget) {
            setCurrentUser(userTarget);
            setFormData({
                name: userTarget.name,
                email: userTarget.email,
                roleIds: userTarget.roles.map((r: any) => r.role.id)
            });
        } else {
            setCurrentUser(null);
            setFormData({
                name: '', email: '', password: '', roleIds: []
            });
        }
        setIsModalOpen(true);
    };

    const toggleRole = (roleId: string) => {
        setFormData(prev => ({
            ...prev,
            roleIds: prev.roleIds.includes(roleId)
                ? prev.roleIds.filter(id => id !== roleId)
                : [...prev.roleIds, roleId]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = { ...formData };

        const result = currentUser
            ? await updateUser(currentUser.id, finalData)
            : await createUser(finalData);

        if (result.success) {
            setIsModalOpen(false);
            setSuccessMessage(currentUser ? "Data akun pengguna berhasil diperbarui!" : "Pengguna baru berhasil didaftarkan!");
            setIsSuccessModalOpen(true);
            fetchUsers(page, limit);
        } else {
            setErrorMessage(result.message || "Gagal memproses data. Silakan periksa kembali input Anda.");
            setIsErrorModalOpen(true);
        }
    };

    const confirmDelete = (id: string) => {
        setDeleteTargetId(id);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!deleteTargetId) return;
        const result = await deleteUser(deleteTargetId);
        if (result.success) {
            setIsDeleteModalOpen(false);
            setSuccessMessage("Akun pengguna berhasil dihapus secara permanen!");
            setIsSuccessModalOpen(true);
            fetchUsers(page, limit);
        } else {
            setIsDeleteModalOpen(false);
            setErrorMessage(result.message || "Gagal menghapus pengguna.");
            setIsErrorModalOpen(true);
        }
        setDeleteTargetId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Pengguna</h1>
                    <p className="text-sm text-slate-500 font-medium">Pengaturan akun pengguna dan peran sistem.</p>
                </div>
                {canCreate && (
                    <button onClick={() => openModal()} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:bg-blue-700 hover:shadow-lg transition-all font-semibold active:scale-95 transform">
                        <Plus size={18} /> Tambah User
                    </button>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text" placeholder="Cari nama atau email..."
                            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm font-medium shadow-sm transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="p-5 cursor-pointer hover:text-blue-600 transition-colors whitespace-nowrap" onClick={() => requestSort('name')}>
                                    <div className="flex items-center gap-2">
                                        Nama {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                    </div>
                                </th>
                                <th className="p-5 whitespace-nowrap">Email</th>
                                <th className="p-5 whitespace-nowrap">Roles</th>
                                {(canUpdate || canDelete) && <th className="p-5 text-center whitespace-nowrap">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {isLoading ? (
                                <tr><td colSpan={4} className="p-20 text-center text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" /> Memuat data...</td></tr>
                            ) : processedUsers.length > 0 ? (
                                processedUsers.map(userItem => (
                                    <tr key={userItem.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-5">
                                            <div className="font-semibold text-slate-800 text-base">{userItem.name}</div>
                                        </td>
                                        <td className="p-5 text-slate-600 font-medium">{userItem.email}</td>
                                        <td className="p-5">
                                            <div className="flex flex-wrap gap-2">
                                                {userItem.roles.map((ur: any, idx: number) => (
                                                    <span key={idx} className="bg-blue-50 text-blue-700 text-[10px] px-2.5 py-1 rounded-md font-bold border border-blue-100 uppercase tracking-wider">
                                                        {ur.role.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        {(canUpdate || canDelete) && (
                                            <td className="p-5">
                                                <div className="flex justify-center gap-2">
                                                    {canUpdate && <button onClick={() => openModal(userItem)} className="p-2 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all" title="Edit"><Edit size={18} /></button>}
                                                    {canDelete && <button onClick={() => confirmDelete(userItem.id)} className="p-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all" title="Hapus"><Trash2 size={18} /></button>}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="p-20 text-center"><Inbox className="mx-auto mb-3 text-slate-300" size={48} /> <p className="text-slate-500 font-medium">Data user belum tersedia.</p></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 gap-4">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wide">Total {meta.totalItems} User</div>
                    <div className="flex items-center gap-3">
                        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="border border-slate-200 rounded-lg text-xs font-bold px-3 py-2 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white text-slate-700 cursor-pointer shadow-sm">
                            <option value={10}>10 Baris</option>
                            <option value={25}>25 Baris</option>
                            <option value={50}>50 Baris</option>
                        </select>
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.currentPage <= 1} className="px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-40 hover:bg-slate-100 transition-colors text-slate-600">Prev</button>
                            <span className="px-3 py-1.5 text-xs font-black text-blue-700 bg-blue-50 rounded-md">{meta.currentPage} / {meta.totalPages || 1}</span>
                            <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.currentPage >= meta.totalPages || meta.totalPages === 0} className="px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-40 hover:bg-slate-100 transition-colors text-slate-600">Next</button>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-200">
                        <div className="p-7 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">{currentUser ? 'Edit Profil Pengguna' : 'Registrasi Pengguna Baru'}</h2>
                                <p className="text-xs text-blue-300 uppercase tracking-widest mt-1 font-semibold">Informasi Akun & Hak Akses</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-all bg-white/10 p-2 hover:bg-white/20 rounded-full text-slate-300 hover:text-white"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-7 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5"><UserIcon size={14} /> Nama Lengkap</label>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium shadow-sm text-slate-800 placeholder:text-slate-400" placeholder="Nama lengkap petugas..." />
                                </div>

                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5"><Mail size={14} /> Alamat Email</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium shadow-sm text-slate-800 placeholder:text-slate-400" placeholder="email@instansi.go.id" />
                                </div>

                                {!currentUser && (
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">Kata Sandi</label>
                                        <div className="relative">
                                            <input required type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full border border-slate-200 p-3.5 pr-12 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium shadow-sm font-mono text-slate-800 placeholder:text-slate-300" placeholder="••••••••" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1" tabIndex={-1}>
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5"><Shield size={14} /> Tentukan Role / Peran</label>
                                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-inner">
                                    {roles.map(role => (
                                        <label key={role.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${formData.roleIds.includes(role.id) ? 'bg-blue-50/50 border-blue-600 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                                            <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded" checked={formData.roleIds.includes(role.id)} onChange={() => toggleRole(role.id)} />
                                            <span className="text-xs font-bold uppercase tracking-wide">{role.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-sm">Batal</button>
                                <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:shadow-lg transition-all transform active:scale-95 text-sm">
                                    {currentUser ? 'Perbarui Akun' : 'Simpan User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isErrorModalOpen && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
                                <XCircle size={40} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Gagal!</h2>
                            <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
                                {errorMessage}
                            </p>
                        </div>
                        <div className="p-5 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={() => setIsErrorModalOpen(false)}
                                className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-md transition-all active:scale-95 text-sm"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 border border-red-100">
                                <AlertTriangle size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Hapus Pengguna?</h2>
                            <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
                                Apakah Anda yakin ingin menghapus akun pengguna ini secara permanen dari sistem?
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