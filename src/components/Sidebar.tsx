/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import bpdpLogo from '../assets/logo_bpdp.png';

interface SidebarProps {
    isMobileOpen: boolean;
    setIsMobileOpen: (isOpen: boolean) => void;
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed
}) => {
    const location = useLocation();
    const [menus, setMenus] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);

    const renderIcon = (iconName: string | null, isActive: boolean) => {
        if (!iconName) return <Icons.Circle size={18} strokeWidth={isActive ? 2.5 : 2} />;
        const LucideIcon = (Icons as any)[iconName];
        return LucideIcon ? <LucideIcon size={18} strokeWidth={isActive ? 2.5 : 2} /> : <Icons.HelpCircle size={18} />;
    };

    useEffect(() => {
        const fetchMyMenus = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/menus/my-menus');
                setMenus(response.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyMenus();
    }, []);

    useEffect(() => {
        if (menus.length > 0) {
            menus.forEach((menu: any) => {
                const isChildActive = menu.children?.some((c: any) => c.path === location.pathname);
                if (isChildActive) {
                    setOpenSubmenus((prev) =>
                        prev.includes(menu.id) ? prev : [...prev, menu.id]
                    );
                }
            });
        }
    }, [location.pathname, menus]);

    const toggleSubmenu = (id: string) => {
        if (isCollapsed) setIsCollapsed(false);
        setOpenSubmenus((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    return (
        <>
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 left-0 z-50 h-screen bg-white border-r border-slate-100 flex flex-col transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
                ${isCollapsed ? 'w-20' : 'w-64'} 
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Header Sidebar */}
                <div className={`h-16 flex items-center border-b border-slate-100 bg-white/50 backdrop-blur-xl transition-all duration-300 ${isCollapsed ? 'justify-center' : 'px-6'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-8 h-8' : 'w-9 h-9'}`}>
                            <img
                                src={bpdpLogo}
                                alt="Logo BPDP"
                                className="w-full h-full object-contain drop-shadow-sm"
                            />
                        </div>

                        {!isCollapsed && (
                            <span className="text-xl font-extrabold tracking-tight text-slate-800 animate-in fade-in duration-300">
                                E<span className="text-amber-500">-</span>RANKING
                            </span>
                        )}
                    </div>
                </div>

                {/* Navigasi */}
                <nav className="flex-1 overflow-y-auto py-5 scrollbar-hide">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="animate-spin text-emerald-500" size={24} />
                        </div>
                    ) : (
                        <ul className="space-y-1 px-3">
                            {menus.map((menu) => {
                                const isOpen = openSubmenus.includes(menu.id);
                                const hasChildren = menu.children && menu.children.length > 0;
                                const isParentActive = location.pathname === menu.path || 
                                                       menu.children?.some((c: any) => c.path === location.pathname);

                                return (
                                    <li key={menu.id}>
                                        {hasChildren ? (
                                            <div>
                                                <button
                                                    onClick={() => toggleSubmenu(menu.id)}
                                                    className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 
                                                    ${isParentActive 
                                                        ? 'bg-emerald-50/50 text-emerald-800 font-semibold' 
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                                    } ${isCollapsed ? 'justify-center' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <span className={`transition-colors duration-200 ${isParentActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                                            {renderIcon(menu.icon, isParentActive)}
                                                        </span>
                                                        {!isCollapsed && <span className="text-[14px] tracking-wide">{menu.title}</span>}
                                                    </div>
                                                    {!isCollapsed && (
                                                        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-600' : ''}`} />
                                                    )}
                                                </button>

                                                <div className={`overflow-hidden transition-all duration-300 ${isOpen && !isCollapsed ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                                    {/* Garis vertikal tipis untuk kesan tree/hirarki modern */}
                                                    <div className="relative pl-4">
                                                        <div className="absolute left-6 top-0 bottom-2 w-px bg-slate-100"></div>
                                                        <ul className="space-y-1 pl-6 pr-2 py-1">
                                                            {menu.children.map((child: any) => {
                                                                const isChildActive = location.pathname === child.path;
                                                                return (
                                                                    <li key={child.id} className="relative">
                                                                        {/* Indicator bullet untuk submenu */}
                                                                        <div className={`absolute -left-[17px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-200 z-10 
                                                                            ${isChildActive ? 'bg-emerald-500 ring-4 ring-white' : 'bg-transparent'}`}>
                                                                        </div>
                                                                        
                                                                        <Link
                                                                            to={child.path}
                                                                            onClick={() => setIsMobileOpen(false)}
                                                                            className={`block px-3 py-2 text-[13px] rounded-lg transition-all duration-200
                                                                            ${isChildActive
                                                                                    ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20'
                                                                                    : 'text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-800'}`}
                                                                        >
                                                                            {child.title}
                                                                        </Link>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Link
                                                to={menu.path || '#'}
                                                onClick={() => setIsMobileOpen(false)}
                                                className={`group flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200
                                                ${location.pathname === menu.path
                                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-semibold'
                                                        : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'}
                                                ${isCollapsed ? 'justify-center' : ''}`}
                                            >
                                                <span className={`transition-colors duration-200 ${location.pathname === menu.path ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                                    {renderIcon(menu.icon, location.pathname === menu.path)}
                                                </span>
                                                {!isCollapsed && <span className="text-[14px] tracking-wide truncate">{menu.title}</span>}
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </nav>
            </aside>
        </>
    );
};