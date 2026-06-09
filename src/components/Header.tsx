import React, { useState, useRef, useEffect } from 'react';
import { Menu, User as UserIcon, LogOut, Settings, Menu as MenuIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface HeaderProps {
    setIsMobileOpen: (isOpen: boolean) => void;
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setIsMobileOpen, isCollapsed, setIsCollapsed }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { user, logout } = useAuthStore();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsProfileOpen(false);
        logout();
    };

    const formatRole = (roleStr?: string) => {
        if (!roleStr) return 'User';
        return roleStr.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 z-10 relative transition-all duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                    <Menu size={24} />
                </button>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex p-2 -ml-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                >
                    <MenuIcon size={20} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>

                {/* Judul untuk versi mobile */}
                <h1 className="text-lg font-black text-slate-800 tracking-tight lg:hidden">
                    E<span className="text-amber-500">-</span>RANKING
                </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative" ref={dropdownRef}>
                    <div
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 cursor-pointer p-1.5 pr-4 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                    >
                        {/* Avatar dengan gaya modern */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 ring-2 ring-white">
                            <UserIcon size={16} strokeWidth={2.5} />
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-[13px] font-bold text-slate-700 leading-tight">
                                {user?.name || 'Pengguna'}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                                {formatRole(user?.roles?.[0]?.name)}
                            </p>
                        </div>
                    </div>

                    {/* Dropdown Profile */}
                    <div className={`absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 py-2 z-50 transform origin-top-right transition-all duration-200 ${isProfileOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}`}>
                        <div className="px-4 py-3 border-b border-slate-50 md:hidden mb-1">
                            <p className="text-sm font-bold text-slate-800">{user?.name || 'Pengguna'}</p>
                            <p className="text-xs text-slate-500">{formatRole(user?.roles?.[0]?.name)}</p>
                        </div>

                        <Link
                            to="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-[13px] font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                            <Settings size={16} />
                            Pengaturan Profil
                        </Link>

                        <div className="h-px bg-slate-50 my-1 mx-2"></div>

                        <button
                            onClick={handleLogout}
                            className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-[13px] text-red-600 hover:bg-red-50 font-semibold transition-colors"
                        >
                            <LogOut size={16} />
                            Keluar Sistem
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};