/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff, KeyRound } from 'lucide-react';
import bpdpLogo from '../../assets/logo_bpdp.png';
import bgAuth from '../../assets/logo_auth.jpg'; // Import gambar background baru

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const loginStore = useAuthStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, refreshToken, user } = response.data;

            loginStore.login(token, refreshToken, user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal login. Periksa kembali email dan password Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans p-4">

            {/* LAYER 1: Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${bgAuth})` }}
            ></div>
            {/* LAYER 2: Gradient Overlay (Kuning/Emas Tipis Transparan) */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-amber-600/50 via-yellow-500/30 to-amber-700/40"></div>

            {/* Decorative Orbs (Opsional: Memberikan efek cahaya halus di atas overlay) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-full bg-green-500/10 blur-3xl"></div>
            </div>

            {/* LAYER 3: Form Card (Perhatikan z-10 agar berada di atas background) */}
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-100 z-10 transform transition-all duration-300">

                {/* Header Section */}
                <div className="p-8 bg-gradient-to-b from-green-950 to-emerald-900 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 pattern-dots pointer-events-none opacity-30"></div>

                    <div className="flex justify-center mb-5 relative z-10">
                        <div className="bg-white p-2 rounded-full shadow-lg border-2 border-emerald-800/20">
                            <img
                                src={bpdpLogo}
                                alt="Logo BPDP Kementan"
                                className="w-20 h-20 object-contain"
                            />
                        </div>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-md relative z-10">
                        E<span className="text-amber-400">-</span>RANKING
                    </h1>

                    <p className="text-green-100 text-xs mt-3 uppercase tracking-wider font-medium relative z-10 leading-relaxed max-w-sm mx-auto">
                        Sistem Aplikasi Perankingan<br />BPDP Kementerian Pertanian
                    </p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleLogin} className="p-8 space-y-6 bg-white">
                    {error && (
                        <div className="bg-red-50 flex items-center gap-3 text-red-700 p-4 rounded-xl text-sm border border-red-100 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-red-100 p-1.5 rounded-full">
                                <KeyRound size={16} className="text-red-700" />
                            </div>
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="relative group">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block tracking-wide group-focus-within:text-emerald-700 transition-colors">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-700 transition-colors" size={20} />
                                <input
                                    type="email" required
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all font-medium placeholder:text-gray-300"
                                    placeholder="contoh@pertanian.go.id"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="flex justify-between items-center mb-1 mr-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1 block tracking-wide group-focus-within:text-emerald-700 transition-colors">
                                    Kata Sandi
                                </label>
                                <Link to="/forgot-password" className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">
                                    Lupa Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-700 transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all font-medium placeholder:text-gray-300"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                                    title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-900 to-emerald-800 hover:from-green-800 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={22} />
                                <span>Mengautentikasi...</span>
                            </>
                        ) : (
                            <>
                                <LogIn size={22} />
                                <span>Masuk ke Sistem</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};