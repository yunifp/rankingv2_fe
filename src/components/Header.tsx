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
        <header className="h-16 bg-white shadow-sm border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 z-10 relative transition-all duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                    <Menu size={24} />
                </button>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                >
                    <MenuIcon size={22} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>

                <h1 className="text-xl font-extrabold text-blue-900 tracking-wider lg:hidden">SI-P3D</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative" ref={dropdownRef}>
                    <div
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 cursor-pointer p-1.5 pr-3 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white shadow-sm">
                            <UserIcon size={16} />
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-bold text-slate-700 leading-tight">
                                {user?.name || 'Guest'}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                                {formatRole(user?.roles?.[0]?.name)}
                            </p>
                        </div>
                    </div>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 transform origin-top-right transition-all">
                            <div className="px-4 py-3 border-b border-slate-100 md:hidden">
                                <p className="text-sm font-bold text-slate-800">{user?.name || 'Guest'}</p>
                                <p className="text-xs text-slate-500">{formatRole(user?.roles?.[0]?.name)}</p>
                            </div>

                            <Link
                                to="/profile"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-700 transition-colors"
                            >
                                <Settings size={16} />
                                Pengaturan Profil
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                            >
                                <LogOut size={16} />
                                Keluar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};