/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
// Import icon baru: Eye, EyeOff, KeyRound
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff, KeyRound } from 'lucide-react';
import kemendagriLogo from '../../assets/logo_kemendagri.png';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // State untuk kontrol *show/hide* password
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
        // BG: Diubah ke gradient abu-biru muda agar card navy terlihat pop-out
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 p-4 relative overflow-hidden">

            {/* Background Decorative Elements - Warna disesuaikan ke Biru */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-900/5 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-full bg-sky-900/5 blur-3xl"></div>
            </div>

            {/* Lebar card dinaikkan sedikit (max-w-lg) karena teks judul panjang */}
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 z-10 transform transition-all duration-300 hover:shadow-blue-900/10">

                {/* Header Section - Diubah ke Biru Dongker (Slate/Blue mix) */}
                <div className="p-8 bg-gradient-to-b from-slate-900 to-blue-950 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 pattern-dots pointer-events-none opacity-30"></div>

                    {/* Logo Kemendagri */}
                    <div className="flex justify-center mb-5 relative z-10">
                        {/* Border logo disesuaikan ke biru */}
                        <div className="bg-white p-2 rounded-full shadow-lg border-2 border-blue-800/20">
                            <img
                                src={kemendagriLogo}
                                alt="Logo Kemendagri"
                                className="w-20 h-20 object-contain"
                            />
                        </div>
                    </div>

                    {/* Singkatan Baru */}
                    <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-md relative z-10">
                        SI<span className="text-sky-400">-</span>P3D
                    </h1>

                    {/* Nama Aplikasi Panjang */}
                    <p className="text-blue-100 text-xs mt-3 uppercase tracking-wider font-medium relative z-10 leading-relaxed max-w-sm mx-auto">
                        Sistem Informasi Pembinaan dan Pengendalian<br />Penataan Perangkat Daerah
                    </p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleLogin} className="p-8 space-y-6 bg-white">
                    {error && (
                        // Warna error disesuaikan ke biru tua/merah agar tetap kontras tapi masuk tema
                        <div className="bg-blue-50 flex items-center gap-3 text-blue-900 p-4 rounded-xl text-sm border border-blue-100 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-blue-100 p-1.5 rounded-full">
                                <KeyRound size={16} className="text-blue-900" />
                            </div>
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Input Email */}
                        <div className="relative group">
                            {/* Focus color ke blue-700 */}
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block tracking-wide group-focus-within:text-blue-700 transition-colors">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-700 transition-colors" size={20} />
                                <input
                                    type="email" required
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium placeholder:text-gray-300"
                                    placeholder="contoh@kemendagri.go.id"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Input Password dengan fitur Eye Toggle */}
                        <div className="relative group">
                            <div className="flex justify-between items-center mb-1 mr-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1 block tracking-wide group-focus-within:text-blue-700 transition-colors">
                                    Kata Sandi
                                </label>
                                {/* Tombol Lupa Password */}
                                <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                                    Lupa Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-700 transition-colors" size={20} />
                                <input
                                    // Tipe input dinamis berdasarkan state showPassword
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium placeholder:text-gray-300"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {/* Tombol Mata di sebelah kanan */}
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

                    {/* Button: Diubah ke gradient Biru Dongker */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-950 to-blue-800 hover:from-blue-900 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
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

                {/* Footer tambahan (opsional) */}
                {/* <div className="p-5 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">
                        Hak Cipta &copy; {new Date().getFullYear()} ditjen OTDA - Kemendagri
                    </p>
                </div> */}
            </div>
        </div>
    );
};