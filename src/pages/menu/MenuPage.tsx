/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { useMenus } from '../../hooks/useMenus';
import { useAuthStore } from '../../store/useAuthStore';
import type { Menu, MenuFormData } from '../../types/menu';
import { Search, Plus, Edit, Trash2, FolderTree, Layout, ChevronRight, X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export const MenuPage: React.FC = () => {
    const { menus, isLoading, createMenu, updateMenu, deleteMenu } = useMenus();

    const { hasPermission } = useAuthStore();

    const canCreate = hasPermission('/menus', 'CREATE');
    const canUpdate = hasPermission('/menus', 'UPDATE');
    const canDelete = hasPermission('/menus', 'DELETE');

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);
    const [formData, setFormData] = useState<MenuFormData>({
        title: '', path: '', icon: '', order: 0, parentId: null
    });

    // Success Modal States
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Delete Modal States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    // ==========================================
    // LOGIC: FLATTEN NESTED MENUS
    // ==========================================
    const flattenMenus = (items: Menu[], level = 0): (Menu & { level: number })[] => {
        return items.reduce((acc: any[], item) => {
            acc.push({ ...item, level });

            if (item.children && item.children.length > 0) {
                const sortedChildren = [...item.children].sort((a, b) => a.order - b.order);
                acc.push(...flattenMenus(sortedChildren, level + 1));
            }
            return acc;
        }, []);
    };

    const processedMenus = useMemo(() => {
        let flattened = flattenMenus(menus);

        if (searchTerm) {
            flattened = flattened.filter(m =>
                m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.path.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return flattened;
    }, [menus, searchTerm]);

    const openModal = (menu?: Menu) => {
        if (menu) {
            setCurrentMenu(menu);
            setFormData({
                title: menu.title,
                path: menu.path,
                icon: menu.icon || '',
                order: menu.order,
                parentId: menu.parentId
            });
        } else {
            setCurrentMenu(null);
            setFormData({ title: '', path: '', icon: '', order: 0, parentId: null });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = currentMenu
            ? await updateMenu(currentMenu.id, formData)
            : await createMenu(formData);

        if (result.success) {
            setIsModalOpen(false);
            setSuccessMessage(currentMenu ? "Data menu berhasil diperbarui!" : "Menu baru berhasil ditambahkan!");
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
        const result = await deleteMenu(deleteTargetId);
        if (result.success) {
            setIsDeleteModalOpen(false);
            setSuccessMessage("Data menu berhasil dihapus dari sistem!");
            setIsSuccessModalOpen(true);
        } else {
            alert(result.message);
        }
        setDeleteTargetId(null);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto font-sans pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Struktur Navigasi Menu</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Kelola menu utama dan submenu sidebar secara hierarkis.</p>
                </div>
                {canCreate && (
                    <button onClick={() => openModal()} className="bg-emerald-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-lg transition-all font-bold active:scale-[0.98] transform text-sm">
                        <Plus size={18} /> Tambah Menu
                    </button>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-white">
                    <div className="relative max-w-sm group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                        <input
                            type="text" placeholder="Cari menu..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none text-sm font-medium shadow-sm transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="p-5 w-20 text-center whitespace-nowrap">Order</th>
                                <th className="p-5 whitespace-nowrap">Nama Menu & Hierarki</th>
                                <th className="p-5 whitespace-nowrap">Path / URL</th>
                                <th className="p-5 whitespace-nowrap">Tipe</th>
                                {(canUpdate || canDelete) && (
                                    <th className="p-5 text-center whitespace-nowrap">Aksi</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={(canUpdate || canDelete) ? 5 : 4} className="p-20 text-center text-slate-400 font-medium">
                                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-3" size={32} />
                                        <p className="animate-pulse">Memuat struktur menu...</p>
                                    </td>
                                </tr>
                            ) : processedMenus.length > 0 ? (
                                processedMenus.map((menu: any) => (
                                    <tr key={menu.id} className={`${menu.level > 0 ? 'bg-slate-50/30' : 'bg-white'} hover:bg-emerald-50/30 transition-colors group`}>
                                        <td className="p-5 text-center">
                                            <span className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm border border-slate-100">
                                                {menu.order}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div
                                                className="flex items-center gap-2 text-slate-800"
                                                style={{ paddingLeft: `${menu.level * 24}px` }}
                                            >
                                                {menu.level > 0 && <ChevronRight size={14} className="text-slate-300" />}
                                                {menu.level > 0 ? (
                                                    <FolderTree size={16} className="text-slate-400" />
                                                ) : (
                                                    <Layout size={16} className="text-emerald-600" />
                                                )}
                                                <span className={menu.level === 0 ? 'font-bold' : 'font-semibold'}>
                                                    {menu.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <code className="text-[11px] bg-slate-50 text-slate-600 px-2.5 py-1.5 rounded-md font-bold border border-slate-100 shadow-sm tracking-wide">
                                                {menu.path || '(Dropdown Only)'}
                                            </code>
                                        </td>
                                        <td className="p-5">
                                            {menu.level === 0 ? (
                                                <span className="text-[10px] font-bold text-emerald-700 border border-emerald-100/50 px-3 py-1.5 rounded-lg bg-emerald-50 shadow-sm tracking-wider uppercase">PARENT</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-500 border border-slate-100 px-3 py-1.5 rounded-lg bg-slate-50 shadow-sm tracking-wider uppercase">SUBMENU</span>
                                            )}
                                        </td>
                                        {(canUpdate || canDelete) && (
                                            <td className="p-5">
                                                <div className="flex justify-center gap-2">
                                                    {canUpdate && (
                                                        <button onClick={() => openModal(menu)} className="p-2 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-lg transition-all active:scale-95" title="Edit">
                                                            <Edit size={16} />
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button onClick={() => confirmDelete(menu.id)} className="p-2 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all active:scale-95" title="Hapus">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={(canUpdate || canDelete) ? 5 : 4} className="p-20 text-center text-slate-400 font-medium">Menu tidak ditemukan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
                            <h2 className="text-lg font-bold tracking-tight">{currentMenu ? 'Edit Menu' : 'Tambah Menu Baru'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-all text-slate-400 hover:text-white bg-slate-800/50 p-2 hover:bg-slate-800 rounded-full"><X size={18} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-7 space-y-6">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-2 group">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-emerald-700 transition-colors">Nama Menu</label>
                                    <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full border border-slate-200 p-3.5 rounded-xl mt-1 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-semibold text-slate-800 shadow-sm transition-all" placeholder="Contoh: Kelola Dapil" />
                                </div>

                                <div className="group">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-emerald-700 transition-colors">Path URL</label>
                                    <input value={formData.path} onChange={e => setFormData({ ...formData, path: e.target.value })} className="w-full border border-slate-200 p-3.5 rounded-xl mt-1 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium text-slate-800 shadow-sm transition-all" placeholder="/dashboard/dapil" />
                                </div>

                                <div className="group">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-emerald-700 transition-colors">Icon (Lucide Name)</label>
                                    <input value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} className="w-full border border-slate-200 p-3.5 rounded-xl mt-1 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium text-slate-800 shadow-sm transition-all" placeholder="Database, Users, dll" />
                                </div>

                                <div className="group">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-emerald-700 transition-colors">Urutan (Order)</label>
                                    <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })} className="w-full border border-slate-200 p-3.5 rounded-xl mt-1 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-bold text-emerald-700 text-lg shadow-sm transition-all" />
                                </div>

                                <div className="group">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-emerald-700 transition-colors">Parent Menu</label>
                                    <select
                                        value={formData.parentId || ''}
                                        onChange={e => setFormData({ ...formData, parentId: e.target.value || null })}
                                        className="w-full border border-slate-200 p-3.5 rounded-xl mt-1 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-semibold text-slate-700 bg-white shadow-sm transition-all cursor-pointer"
                                    >
                                        <option value="">-- Menu Utama (Root) --</option>
                                        {menus.filter(m => !m.parentId && m.id !== currentMenu?.id).map(m => (
                                            <option key={m.id} value={m.id}>{m.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                                <button type="submit" className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 active:scale-[0.98]">
                                    <ChevronRight size={16} /> {currentMenu ? 'Simpan Perubahan' : 'Simpan Menu'}
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
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
                                <AlertTriangle size={40} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Hapus Menu?</h2>
                            <p className="text-[13px] text-slate-500 mt-2 font-medium leading-relaxed">
                                Apakah Anda yakin ingin menghapus menu ini? Tindakan ini mungkin akan memengaruhi navigasi aplikasi.
                            </p>
                        </div>
                        <div className="flex border-t border-slate-100 bg-slate-50">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-4 font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={executeDelete}
                                className="flex-1 py-4 font-bold text-white bg-red-500 hover:bg-red-600 transition-colors text-sm shadow-inner"
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
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-100">
                                <CheckCircle size={40} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Berhasil!</h2>
                            <p className="text-[13px] text-slate-500 mt-2 font-medium leading-relaxed">
                                {successMessage}
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={() => setIsSuccessModalOpen(false)}
                                className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-900 shadow-md transition-all active:scale-[0.98] text-sm"
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