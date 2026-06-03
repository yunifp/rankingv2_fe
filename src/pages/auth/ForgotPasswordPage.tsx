/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Mail, Lock, KeyRound, Loader2, ArrowLeft, CheckCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import kemendagriLogo from '../../assets/logo_kemendagri.png';

export const ForgotPasswordPage: React.FC = () => {

    // State Manajemen Langkah (Step 1: Email, Step 2: OTP, Step 3: Password Baru, Step 4: Sukses)
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

    // Form States
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- STEP 1: Request OTP ---
    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/forgot-password', { email });
            setStep(2); // Lanjut ke input OTP
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal memproses permintaan. Coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 2: Verifikasi OTP ---
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/verify-otp', { email, otp });
            setStep(3); // Lanjut ke input password baru
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kode OTP tidak valid atau sudah kedaluwarsa.');
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 3: Reset Password ---
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return setError('Konfirmasi password tidak cocok.');
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            setStep(4); // Sukses!
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal mereset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 p-4 relative overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-900/5 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-full bg-sky-900/5 blur-3xl"></div>
            </div>

            <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 transform transition-all duration-500 animate-in zoom-in-95">

                {/* Header Section */}
                <div className="p-8 bg-gradient-to-b from-slate-900 to-blue-950 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 pattern-dots pointer-events-none opacity-30"></div>

                    <div className="flex justify-center mb-5 relative z-10">
                        <div className="bg-white p-3 rounded-full shadow-lg border-2 border-blue-800/20">
                            <img
                                src={kemendagriLogo}
                                alt="Logo Kemendagri"
                                className="w-16 h-16 object-contain"
                            />
                        </div>
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-md relative z-10 mb-2">
                        {step === 1 && "Lupa Password?"}
                        {step === 2 && "Verifikasi OTP"}
                        {step === 3 && "Buat Password Baru"}
                        {step === 4 && "Berhasil!"}
                    </h1>
                    <p className="text-blue-100 text-sm font-medium relative z-10">
                        {step === 1 && "Masukkan email terdaftar untuk menerima kode OTP."}
                        {step === 2 && "Cek kotak masuk email Anda untuk kode 6 digit."}
                        {step === 3 && "Pastikan password baru Anda kuat dan aman."}
                        {step === 4 && "Password Anda telah berhasil diperbarui."}
                    </p>
                </div>

                <div className="p-8 bg-white">
                    {/* Menampilkan Error Global */}
                    {error && (
                        <div className="mb-6 bg-red-50 flex items-center gap-3 text-red-700 p-4 rounded-xl text-sm border border-red-100 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-red-100 p-1.5 rounded-full">
                                <ShieldCheck size={16} className="text-red-700" />
                            </div>
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}

                    {/* ==================================================== */}
                    {/* STEP 1: FORM EMAIL */}
                    {/* ==================================================== */}
                    {step === 1 && (
                        <form onSubmit={handleRequestOtp} className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="relative group">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wide group-focus-within:text-blue-700 transition-colors">
                                    Alamat Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-700 transition-colors" size={20} />
                                    <input
                                        type="email" required autoFocus
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium placeholder:text-slate-300"
                                        placeholder="email.anda@instansi.go.id"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-950 to-blue-800 hover:from-blue-900 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <><Loader2 className="animate-spin" size={20} /> Memproses...</> : 'Kirim Kode OTP'}
                            </button>

                            <div className="text-center pt-2">
                                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-700 transition-colors">
                                    <ArrowLeft size={16} /> Kembali ke Login
                                </Link>
                            </div>
                        </form>
                    )}

                    {/* ==================================================== */}
                    {/* STEP 2: FORM OTP */}
                    {/* ==================================================== */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="relative group">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wide group-focus-within:text-blue-700 transition-colors">
                                    Kode OTP (6 Digit)
                                </label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-700 transition-colors" size={20} />
                                    <input
                                        type="text" required autoFocus maxLength={6}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-bold text-lg tracking-[0.5em] placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-300"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading || otp.length < 6}
                                className="w-full bg-gradient-to-r from-blue-950 to-blue-800 hover:from-blue-900 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <><Loader2 className="animate-spin" size={20} /> Memverifikasi...</> : 'Verifikasi OTP'}
                            </button>

                            <div className="text-center pt-2">
                                <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-700 transition-colors">
                                    <ArrowLeft size={16} /> Ganti Email
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ==================================================== */}
                    {/* STEP 3: FORM PASSWORD BARU */}
                    {/* ==================================================== */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-5 animate-in slide-in-from-right-4">
                            <div className="relative group">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wide group-focus-within:text-blue-700 transition-colors">
                                    Password Baru
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-700 transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"} required autoFocus minLength={6}
                                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium placeholder:text-slate-300"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wide group-focus-within:text-blue-700 transition-colors">
                                    Ulangi Password Baru
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-700 transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"} required minLength={6}
                                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium placeholder:text-slate-300"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading || !newPassword || !confirmPassword}
                                className="w-full bg-gradient-to-r from-blue-950 to-blue-800 hover:from-blue-900 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            >
                                {loading ? <><Loader2 className="animate-spin" size={20} /> Menyimpan...</> : 'Simpan Password Baru'}
                            </button>
                        </form>
                    )}

                    {/* ==================================================== */}
                    {/* STEP 4: SUCCESS */}
                    {/* ==================================================== */}
                    {step === 4 && (
                        <div className="text-center animate-in zoom-in duration-300 py-6">
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-green-100/50">
                                <CheckCircle size={48} className="text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Selesai!</h3>
                            <p className="text-slate-500 mb-8 font-medium">Akun Anda sudah bisa diakses kembali dengan password yang baru.</p>
                            <Link
                                to="/login"
                                className="w-full inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                            >
                                Pergi ke Halaman Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};