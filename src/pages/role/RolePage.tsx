/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { useRoles } from '../../hooks/useRoles';
import { useAuthStore } from '../../store/useAuthStore';
import type { Role, RoleFormData, RoleMenuAccess, Menu } from '../../types/role';
import {
    Search, Plus, Edit, Trash2, ShieldCheck, X,
    ChevronUp, ChevronDown, FolderTree, Layout, ChevronRight, CheckSquare,
    Globe, Map, MapPin, AlertTriangle, CheckCircle, Loader2, Eye, EyeOff
} from 'lucide-react';

export const RolePage: React.FC = () => {
    const {
        roles, meta, permissions, menus, isLoading,
        fetchRoles, createRole, updateRole, deleteRole, updateRoleAccess
    } = useRoles();

    const { hasPermission } = useAuthStore();

    const canCreate = hasPermission('/roles', 'CREATE');
    const canUpdate = hasPermission('/roles', 'UPDATE');
    const canDelete = hasPermission('/roles', 'DELETE');

    // --- Paginasi & Pencarian ---
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Role; direction: 'asc' | 'desc' } | null>(null);

    // --- State Modal ---
    const [isModalRoleOpen, setIsModalRoleOpen] = useState(false);
    const [isModalAccessOpen, setIsModalAccessOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState<Role | null>(null);

    // Success Modal States
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Delete Modal States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const [formData, setFormData] = useState<RoleFormData>({
        name: '', description: '', scope: 'GENERAL'
    });
    const [accessData, setAccessData] = useState<RoleMenuAccess[]>([]);

    useEffect(() => {
        fetchRoles(page, limit);
    }, [page, limit, fetchRoles]);

    // ==========================================
    // UI HELPER: SCOPE BADGE
    // ==========================================
    const ScopeBadge = ({ scope }: { scope: string }) => {
        switch (scope) {
            case 'GENERAL':
                return (
                    <span className="flex items-center gap-1.5 w-fit bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1.5 rounded-md border border-blue-100 uppercase tracking-wider shadow-sm">
                        <Globe size={14} /> GENERAL
                    </span>
                );
            case 'PROVINSI':
                return (
                    <span className="flex items-center gap-1.5 w-fit bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1.5 rounded-md border border-amber-100 uppercase tracking-wider shadow-sm">
                        <Map size={14} /> PROVINSI
                    </span>
                );
            case 'KABKOTA':
                return (
                    <span className="flex items-center gap-1.5 w-fit bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1.5 rounded-md border border-emerald-100 uppercase tracking-wider shadow-sm">
                        <MapPin size={14} /> KAB/KOTA
                    </span>
                );
            default:
                return null;
        }
    };

    // ==========================================
    // LOGIC: FILTER LOKAL
    // ==========================================
    const processedRoles = useMemo(() => {
        let result = [...roles];
        if (searchTerm) {
            result = result.filter(r =>
                r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.scope.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
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
    }, [roles, searchTerm, sortConfig]);

    const requestSort = (key: keyof Role) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig?.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    // ==========================================
    // LOGIC: MATRIX ACTIONS
    // ==========================================
    const flattenMenusForMatrix = (items: Menu[], level = 0): (Menu & { level: number })[] => {
        return items.reduce((acc: any[], item) => {
            acc.push({ ...item, level });
            if (item.children && item.children.length > 0) {
                const sortedChildren = [...item.children].sort((a, b) => a.order - b.order);
                acc.push(...flattenMenusForMatrix(sortedChildren, level + 1));
            }
            return acc;
        }, []);
    };

    const flatMenusMatrix = useMemo(() => flattenMenusForMatrix(menus), [menus]);

    const openModalAccess = (role: Role) => {
        setCurrentRole(role);
        const initialAccess: RoleMenuAccess[] = [];
        if (role.menuAccess) {
            const grouped = role.menuAccess.reduce((acc: any, curr) => {
                if (!acc[curr.menuId]) acc[curr.menuId] = [];
                acc[curr.menuId].push(curr.permissionId);
                return acc;
            }, {});
            Object.keys(grouped).forEach(mId => {
                initialAccess.push({ menuId: mId, permissionIds: grouped[mId] });
            });
        }
        setAccessData(initialAccess);
        setIsModalAccessOpen(true);
    };

    const toggleAccess = (menuId: string, permId: string) => {
        setAccessData(prev => {
            // Cari data permission khusus "VISIBILITY"
            const visibilityPerm = permissions.find(p => p.name.toUpperCase() === 'VISIBILITY');
            const visibilityId = visibilityPerm?.id;

            // Ambil array ID dari permission SELAIN "VISIBILITY"
            const otherPermIds = permissions.filter(p => p.id !== visibilityId).map(p => p.id);

            const existingMenu = prev.find(a => a.menuId === menuId);
            let newPermissionIds: string[] = [];

            if (existingMenu) {
                const hasPerm = existingMenu.permissionIds.includes(permId);
                newPermissionIds = hasPerm
                    ? existingMenu.permissionIds.filter(id => id !== permId)
                    : [...existingMenu.permissionIds, permId];
            } else {
                newPermissionIds = [permId];
            }

            // LOGIKA AUTO-VISIBILITY
            // Jika tombol yang ditekan BUKAN tombol visibility, kita cek apakah semua permission lainnya sudah tercentang
            if (visibilityId && permId !== visibilityId) {
                const hasAllOther = otherPermIds.length > 0 && otherPermIds.every(id => newPermissionIds.includes(id));

                // Jika semua permission lain tercentang dan VISIBILITY belum ada, tambahkan otomatis
                if (hasAllOther && !newPermissionIds.includes(visibilityId)) {
                    newPermissionIds.push(visibilityId);
                }
            }

            if (existingMenu) {
                return prev.map(a => a.menuId === menuId ? { ...a, permissionIds: newPermissionIds } : a);
            }
            return [...prev, { menuId, permissionIds: newPermissionIds }];
        });
    };

    const handleSelectAllInRow = (menuId: string) => {
        const allPermIds = permissions.map(p => p.id);
        const currentMenuAccess = accessData.find(a => a.menuId === menuId);
        const isAlreadyFull = currentMenuAccess?.permissionIds.length === allPermIds.length;

        setAccessData(prev => {
            const otherMenus = prev.filter(a => a.menuId !== menuId);
            if (isAlreadyFull) return otherMenus;
            return [...otherMenus, { menuId, permissionIds: allPermIds }];
        });
    };

    const handleSaveAccess = async () => {
        if (!currentRole) return;
        const res = await updateRoleAccess(currentRole.id, accessData);
        if (res.success) {
            setIsModalAccessOpen(false);
            setSuccessMessage("Akses Role " + currentRole.name + " berhasil disimpan!");
            setIsSuccessModalOpen(true);
            fetchRoles(page, limit);
        }
    };

    // ==========================================
    // LOGIC: CRUD ROLE
    // ==========================================
    const openModalRole = (role?: Role) => {
        setCurrentRole(role || null);
        setFormData({
            name: role?.name || '',
            description: role?.description || '',
            scope: role?.scope || 'GENERAL'
        });
        setIsModalRoleOpen(true);
    };

    const handleSubmitRole = async () => {
        let res;
        if (currentRole) {
            res = await updateRole(currentRole.id, formData);
        } else {
            res = await createRole(formData);
        }

        if (res.success) {
            setIsModalRoleOpen(false);
            setSuccessMessage(currentRole ? "Data role berhasil diperbarui!" : "Role baru berhasil ditambahkan!");
            setIsSuccessModalOpen(true);
            fetchRoles(page, limit);
        } else {
            alert(res.message);
        }
    };

    const confirmDelete = (id: string) => {
        setDeleteTargetId(id);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!deleteTargetId) return;
        const res = await deleteRole(deleteTargetId);
        if (res.success) {
            setIsDeleteModalOpen(false);
            setSuccessMessage("Role berhasil dihapus dari sistem!");
            setIsSuccessModalOpen(true);
            fetchRoles(page, limit);
        } else {
            alert(res.message);
        }
        setDeleteTargetId(null);
    };

    return (
        <div className="space-y-6">
            {/* --- HEADER TITLE & BUTTON --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Role & Akses</h1>
                    <p className="text-sm text-slate-500 font-medium">Definisikan peran dan batasan wilayah kerja pengguna.</p>
                </div>
                {canCreate && (
                    <button onClick={() => openModalRole()} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:bg-blue-700 hover:shadow-lg transition-all font-semibold active:scale-95 transform">
                        <Plus size={18} /> Tambah Role Baru
                    </button>
                )}
            </div>

            {/* --- MAIN CARD --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">

                {/* --- SEARCH BAR --- */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari role atau cakupan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm font-medium shadow-sm transition-all"
                        />
                    </div>
                </div>

                {/* --- TABLE TABLE --- */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="p-5 cursor-pointer hover:text-blue-600 transition-colors w-1/3 whitespace-nowrap" onClick={() => requestSort('name')}>
                                    <div className="flex items-center gap-2">
                                        Nama Role
                                        {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                    </div>
                                </th>
                                <th className="p-5 w-1/3 whitespace-nowrap">Scope / Cakupan</th>
                                {(canUpdate || canDelete) && <th className="p-5 text-center whitespace-nowrap">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan={3} className="p-20 text-center text-slate-400 font-medium"><Loader2 className="animate-spin mx-auto mb-2" />Memuat data...</td></tr>
                            ) : processedRoles.length > 0 ? (
                                processedRoles.map(role => (
                                    <tr key={role.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-5">
                                            <div className="font-semibold text-slate-800 text-base">{role.name}</div>
                                            <div className="text-xs text-slate-500 mt-1 font-medium">{role.description || 'Tidak ada deskripsi'}</div>
                                        </td>
                                        <td className="p-5">
                                            <ScopeBadge scope={role.scope} />
                                        </td>
                                        {(canUpdate || canDelete) && (
                                            <td className="p-5">
                                                <div className="flex justify-center gap-2">
                                                    {canUpdate && (
                                                        <>
                                                            <button onClick={() => openModalAccess(role)} className="p-2 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-lg transition-all" title="Konfigurasi Hak Akses"><ShieldCheck size={18} /></button>
                                                            <button onClick={() => openModalRole(role)} className="p-2 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all" title="Edit"><Edit size={18} /></button>
                                                        </>
                                                    )}
                                                    {canDelete && (
                                                        <button onClick={() => confirmDelete(role.id)} className="p-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all" title="Hapus"><Trash2 size={18} /></button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={3} className="p-20 text-center text-slate-400 font-medium">Data role belum tersedia.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- PAGINATION --- */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 gap-4">
                    <div className="text-xs text-slate-500 font-bold tracking-wide uppercase">
                        Menampilkan {roles.length > 0 ? (meta.currentPage - 1) * meta.itemsPerPage + 1 : 0} - {Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)} dari {meta.totalItems} data
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="border border-slate-200 rounded-lg text-xs font-bold px-3 py-2 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white text-slate-700 shadow-sm cursor-pointer"
                        >
                            <option value={10}>10 Baris</option>
                            <option value={25}>25 Baris</option>
                            <option value={50}>50 Baris</option>
                        </select>

                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg shadow-sm p-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={meta.currentPage <= 1}
                                className="px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors text-slate-600"
                            >
                                Prev
                            </button>
                            <span className="px-3 py-1.5 text-xs font-black text-blue-700 bg-blue-50 rounded-md">
                                {meta.currentPage} <span className="text-slate-400 mx-1">/</span> {meta.totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                disabled={meta.currentPage >= meta.totalPages || meta.totalPages === 0}
                                className="px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors text-slate-600"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODAL MATRIX AKSES --- */}
            {isModalAccessOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
                        <div className="p-7 border-b border-slate-800 flex justify-between items-center bg-slate-900 text-white">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Konfigurasi Hak Akses</h2>
                                <p className="text-xs text-blue-300 mt-1 uppercase tracking-widest font-semibold">Peran Terpilih: {currentRole?.name}</p>
                            </div>
                            <button onClick={() => setIsModalAccessOpen(false)} className="hover:rotate-90 transition-all bg-white/10 hover:bg-white/20 p-2 rounded-full text-slate-300 hover:text-white"><X size={20} /></button>
                        </div>

                        {/* Modifikasi disini: Membuat area yang scrollable khusus pada pembungkus tabel */}
                        <div className="flex-1 p-6 bg-slate-50 flex flex-col min-h-0 overflow-hidden">
                            <div className="border border-slate-200 rounded-2xl bg-white shadow-sm flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full border-collapse relative">
                                    <thead className="sticky top-0 z-20 bg-slate-50 shadow-sm ring-1 ring-slate-200">
                                        <tr>
                                            <th className="p-4 text-left text-[11px] uppercase tracking-wider font-bold text-slate-500 bg-slate-50">Modul & Submenu</th>
                                            {permissions.map(p => (
                                                <th key={p.id} className="p-4 text-center text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50/50 border-l border-white">
                                                    {p.name}
                                                </th>
                                            ))}
                                            <th className="p-4 text-center text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-100 border-l border-white">Beri Semua</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {flatMenusMatrix.map((menu: any) => {
                                            const currentMenuAccess = accessData.find(a => a.menuId === menu.id);
                                            const isAllSelected = currentMenuAccess?.permissionIds.length === permissions.length;

                                            return (
                                                <tr key={menu.id} className={`${menu.level > 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-blue-50/30 transition-colors`}>
                                                    <td className="p-4 border-r border-slate-100">
                                                        <div className="flex items-center gap-2" style={{ paddingLeft: `${menu.level * 24}px` }}>
                                                            {menu.level > 0 && <ChevronRight size={14} className="text-slate-300" />}
                                                            {menu.level > 0 ? <FolderTree size={16} className="text-slate-400" /> : <Layout size={16} className="text-blue-700" />}
                                                            <span className={`${menu.level === 0 ? 'font-bold text-slate-800 underline decoration-blue-100 decoration-4 underline-offset-4' : 'font-medium text-slate-600'}`}>
                                                                {menu.title}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {permissions.map(perm => {
                                                        const isVisibility = perm.name.toUpperCase() === 'VISIBILITY';
                                                        const isChecked = currentMenuAccess?.permissionIds.includes(perm.id) || false;

                                                        return (
                                                            <td key={perm.id} className="p-4 text-center border-r border-slate-100 bg-white">
                                                                {isVisibility ? (
                                                                    <div className="flex justify-center">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleAccess(menu.id, perm.id)}
                                                                            className={`p-1.5 rounded-lg transition-all border flex items-center justify-center ${isChecked ? 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 border-slate-200'}`}
                                                                            title={isChecked ? 'Menu Ditampilkan' : 'Menu Disembunyikan'}
                                                                        >
                                                                            {isChecked ? <Eye size={18} /> : <EyeOff size={18} />}
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <input
                                                                        type="checkbox"
                                                                        className="w-5 h-5 accent-blue-600 cursor-pointer rounded transition-transform active:scale-90 border-slate-300"
                                                                        checked={isChecked}
                                                                        onChange={() => toggleAccess(menu.id, perm.id)}
                                                                    />
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="p-4 text-center bg-slate-50/50">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSelectAllInRow(menu.id)}
                                                            className={`p-2 rounded-xl transition-all ${isAllSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-300 hover:text-blue-700'}`}
                                                        >
                                                            <CheckSquare size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-200 flex justify-end gap-3 bg-white">
                            <button onClick={() => setIsModalAccessOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all">Batal</button>
                            <button onClick={handleSaveAccess} className="px-8 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:shadow-lg transition-transform active:scale-95">
                                Simpan Konfigurasi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL CRUD ROLE (CREATE/EDIT) --- */}
            {isModalRoleOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-7 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{currentRole ? 'Perbarui Informasi Role' : 'Tambah Role Baru'}</h2>
                                <p className="text-xs text-slate-500 mt-1 font-medium">Atur profil dasar role dan cakupan wilayahnya.</p>
                            </div>
                            <button onClick={() => setIsModalRoleOpen(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nama Role</label>
                                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-semibold shadow-sm text-slate-800 placeholder:text-slate-400 transition-all" placeholder="e.g. ADMIN_PROVINSI" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cakupan Wilayah (Scope)</label>
                                <select
                                    value={formData.scope}
                                    onChange={e => setFormData({ ...formData, scope: e.target.value as any })}
                                    className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white font-semibold shadow-sm text-slate-800 transition-all cursor-pointer"
                                >
                                    <option value="GENERAL">GENERAL (Akses Seluruh Data)</option>
                                    <option value="PROVINSI">PROVINSI (Terbatas Provinsi Tertentu)</option>
                                    <option value="KABKOTA">KAB/KOTA (Terbatas Kabupaten Tertentu)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Deskripsi Singkat</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 h-28 text-sm font-medium shadow-sm resize-none custom-scrollbar text-slate-700 placeholder:text-slate-400 transition-all" placeholder="Jelaskan kegunaan role ini..." />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button onClick={() => setIsModalRoleOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                                <button
                                    onClick={handleSubmitRole}
                                    className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {currentRole ? 'Simpan Perubahan' : 'Buat Role'} <ChevronRight size={16} />
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
                            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 border border-red-100">
                                <AlertTriangle size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Hapus Role?</h2>
                            <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
                                Apakah Anda yakin ingin menghapus role ini? Pengguna yang menggunakan role ini akan kehilangan hak aksesnya.
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