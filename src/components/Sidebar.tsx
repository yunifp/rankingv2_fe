/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import kemendagriLogo from '../assets/logo_kemendagri.png';

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

    const renderIcon = (iconName: string | null) => {
        if (!iconName) return <Icons.Circle size={16} />;
        const LucideIcon = (Icons as any)[iconName];
        return LucideIcon ? <LucideIcon size={20} /> : <Icons.HelpCircle size={20} />;
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
                className={`fixed top-0 left-0 z-50 h-screen bg-slate-900 border-r border-slate-800 text-slate-100 transition-all duration-300 shadow-2xl shadow-blue-900/20 flex flex-col
                ${isCollapsed ? 'w-20' : 'w-64'} 
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className={`h-16 flex items-center border-b border-slate-800/80 bg-slate-950/40 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'px-6'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`bg-white flex items-center justify-center flex-shrink-0 shadow-sm transition-all duration-300 ${isCollapsed ? 'w-8 h-8 rounded-lg p-1' : 'w-10 h-10 rounded-xl p-1.5'}`}>
                            <img
                                src={kemendagriLogo}
                                alt="Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {!isCollapsed && (
                            <span className="text-2xl font-black tracking-wide truncate text-white animate-in fade-in duration-300">
                                SI<span className="text-blue-500">-</span>P3D
                            </span>
                        )}
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 scrollbar-hide">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="animate-spin text-blue-500" size={24} />
                        </div>
                    ) : (
                        <ul className="space-y-1.5 px-3">
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
                                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 
                                                    ${isParentActive ? 'bg-slate-800/80 text-white shadow-inner' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}
                                                    ${isCollapsed ? 'justify-center' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={`min-w-[20px] ${isParentActive ? 'text-blue-400' : 'text-slate-500'}`}>
                                                            {renderIcon(menu.icon)}
                                                        </span>
                                                        {!isCollapsed && <span className="text-sm font-medium">{menu.title}</span>}
                                                    </div>
                                                    {!isCollapsed && (
                                                        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                                    )}
                                                </button>

                                                <div className={`overflow-hidden transition-all duration-300 ${isOpen && !isCollapsed ? 'max-h-96 mt-1' : 'max-h-0'}`}>
                                                    <ul className="space-y-1 pl-9 pr-2 py-1">
                                                        {menu.children.map((child: any) => {
                                                            const isChildActive = location.pathname === child.path;
                                                            return (
                                                                <li key={child.id}>
                                                                    <Link
                                                                        to={child.path}
                                                                        onClick={() => setIsMobileOpen(false)}
                                                                        className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200
                                                                        ${isChildActive
                                                                                ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-900/30 translate-x-1'
                                                                                : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'}`}
                                                                    >
                                                                        {child.title}
                                                                    </Link>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            </div>
                                        ) : (
                                            <Link
                                                to={menu.path || '#'}
                                                onClick={() => setIsMobileOpen(false)}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                                                ${location.pathname === menu.path
                                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-medium'
                                                        : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}
                                                ${isCollapsed ? 'justify-center' : ''}`}
                                            >
                                                <span className={`min-w-[20px] ${location.pathname === menu.path ? 'text-white' : 'text-slate-500'}`}>
                                                    {renderIcon(menu.icon)}
                                                </span>
                                                {!isCollapsed && <span className="text-sm font-medium truncate">{menu.title}</span>}
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