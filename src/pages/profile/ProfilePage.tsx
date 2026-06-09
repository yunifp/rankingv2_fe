/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import {
    User as UserIcon, Lock, ShieldCheck, Map, MapPin,
    CheckCircle, XCircle, Loader2, Eye, EyeOff, KeyRound, Save,
    Globe, Mail, X
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
    const { user: sessionUser, token, refreshToken, login } = useAuthStore();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isRequestingOtp, setIsRequestingOtp] = useState(false);

    // Data dari server
    const [profileInfo, setProfileInfo] = useState<any>(null);

    // State Form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

    // State Modals
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // OTP Update Email States
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otp, setOtp] = useState('');
    const [pendingPayload, setPendingPayload] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/users/profile');
                const data = response.data.data;

                setProfileInfo(data);
                setFormData(prev => ({ ...prev, name: data.name, email: data.email }));
            } catch (error: any) {
                setErrorMessage(error.response?.data?.message || 'Gagal memuat data profil.');
                setIsErrorModalOpen(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const validateForm = () => {
        const { oldPassword, newPassword, confirmPassword } = formData;
        const isChangingPassword = oldPassword || newPassword || confirmPassword;

        if (isChangingPassword) {
            if (!oldPassword) return "Password lama wajib diisi.";
            if (!newPassword) return "Password baru wajib diisi.";
            if (!confirmPassword) return "Konfirmasi password wajib diisi.";
            if (newPassword.length < 6) return "Password baru minimal 6 karakter.";
            if (newPassword !== confirmPassword) return "Password baru dan konfirmasi tidak cocok.";
        }

        if (!formData.name.trim()) return "Nama tidak boleh kosong.";
        if (!formData.email.trim()) return "Email tidak boleh kosong.";
        return null;
    };

    const executeProfileUpdate = async (payload: any) => {
        setIsSaving(true);
        try {
            const response = await api.put('/users/profile', payload);

            setFormData(prev => ({ ...prev, oldPassword: '', newPassword: '', confirmPassword: '' }));
            setOtp('');
            setIsOtpModalOpen(false);
            setPendingPayload(null);

            setSuccessMessage('Profil Anda berhasil diperbarui!');
            setIsSuccessModalOpen(true);

            if (sessionUser && token && refreshToken) {
                const updatedUser = {
                    ...sessionUser,
                    name: response.data.data.name,
                    email: response.data.data.email
                };
                login(token, refreshToken, updatedUser);
            }
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil.');
            setIsErrorModalOpen(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setErrorMessage(validationError);
            setIsErrorModalOpen(true);
            return;
        }

        const payload: any = { name: formData.name, email: formData.email };
        if (formData.newPassword) {
            payload.oldPassword = formData.oldPassword;
            payload.newPassword = formData.newPassword;
            payload.confirmPassword = formData.confirmPassword;
        }

        if (formData.email !== profileInfo?.email) {
            setIsRequestingOtp(true);
            try {
                await api.post('/users/request-email-otp', { newEmail: formData.email });
                setPendingPayload(payload);
                setIsOtpModalOpen(true);
            } catch (error: any) {
                setErrorMessage(error.response?.data?.message || 'Gagal mengirim OTP ke email baru.');
                setIsErrorModalOpen(true);
            } finally {
                setIsRequestingOtp(false);
            }
        } else {
            executeProfileUpdate(payload);
        }
    };

    const handleVerifyOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) return;
        const finalPayload = { ...pendingPayload, otp };
        executeProfileUpdate(finalPayload);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
                <p className="text-slate-500 font-medium animate-pulse">Memuat informasi profil...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto font-sans pb-10">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Profil Pengguna</h1>
                <p className="text-sm text-slate-500 font-medium mt-1">Kelola informasi pribadi dan keamanan akun Anda.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                {/* --- KIRI: INFO PROFIL READONLY (ID Card Style) --- */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center relative overflow-hidden">
                        {/* Background Card */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-green-950 to-emerald-900">
                            <div className="absolute inset-0 bg-white/5 pattern-dots opacity-20 pointer-events-none"></div>
                        </div>
                        
                        <div className="relative z-10 flex flex-col items-center mt-6">
                            {/* Avatar Focus */}
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/10 border-4 border-white mb-5 text-emerald-800">
                                <UserIcon size={36} strokeWidth={2.5} />
                            </div>
                            
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{profileInfo?.name}</h2>
                            <p className="text-sm font-medium text-slate-500 mb-6 bg-slate-50 px-3 py-1 rounded-full mt-2 border border-slate-100">{profileInfo?.email}</p>

                            <div className="w-full text-left space-y-5 border-t border-slate-100 pt-6">
                                {/* Role Section */}
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                                        <ShieldCheck size={14} className="text-emerald-500" /> Role Akses
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {profileInfo?.roles.map((r: any) => (
                                            <span key={r.role.id} className="bg-emerald-50 text-emerald-700 text-[10px] px-3 py-1.5 rounded-lg font-bold border border-emerald-100/50 uppercase tracking-wider">
                                                {r.role.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Wilayah Section */}
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                                        <Map size={14} className="text-emerald-500" /> Wilayah Tugas
                                    </p>
                                    <div className="space-y-2">
                                        {profileInfo?.provinsi ? (
                                            <div className="flex items-center gap-3 text-[13px] text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                                                <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100"><Map size={14} className="text-amber-500" /></div>
                                                {profileInfo.provinsi.nama}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 text-[13px] text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                                                <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100"><Globe size={14} className="text-emerald-600" /></div>
                                                Pusat / Skala Nasional
                                            </div>
                                        )}
                                        {profileInfo?.kabupaten && (
                                            <div className="flex items-center gap-3 text-[13px] text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                                                <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100"><MapPin size={14} className="text-emerald-500" /></div>
                                                {profileInfo.kabupaten.nama}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- KANAN: FORM UPDATE --- */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 text-lg">Pembaruan Data</h3>
                            <p className="text-xs text-slate-500 mt-1">Pastikan data yang dimasukkan sudah benar dan valid.</p>
                        </div>

                        <div className="p-6 sm:p-8 space-y-8 flex-1">
                            {/* Basic Info */}
                            <div className="space-y-5">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <UserIcon size={14} /> Informasi Dasar
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2 group">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-emerald-700 transition-colors">Nama Lengkap</label>
                                        <input
                                            name="name" required value={formData.name} onChange={handleChange}
                                            className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-semibold text-slate-800 text-sm shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-emerald-700 transition-colors">Alamat Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                                            <input
                                                name="email" type="email" required value={formData.email} onChange={handleChange}
                                                className="w-full pl-11 pr-4 border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-semibold text-slate-800 text-sm shadow-sm"
                                            />
                                        </div>
                                        {formData.email !== profileInfo?.email && (
                                            <p className="text-[10px] text-amber-600 font-bold ml-1 mt-1.5 flex items-center gap-1">
                                                <ShieldCheck size={12}/> Verifikasi OTP diperlukan untuk email baru.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Security */}
                            <div className="space-y-5 pt-2">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <KeyRound size={14} /> Keamanan (Opsional)
                                </h4>
                                <p className="text-[11px] text-slate-400 mb-4 ml-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100 inline-block">
                                    💡 Biarkan kosong jika tidak ingin mengubah kata sandi.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2 group md:col-span-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-emerald-700 transition-colors">Password Lama</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                                            <input
                                                name="oldPassword" type={showPasswords.old ? "text" : "password"} value={formData.oldPassword} onChange={handleChange}
                                                className="w-full pl-11 pr-12 border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-medium text-slate-800 text-sm shadow-sm font-mono placeholder:font-sans placeholder:text-slate-300"
                                                placeholder="Masukkan password saat ini..."
                                            />
                                            <button type="button" onClick={() => togglePasswordVisibility('old')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                                                {showPasswords.old ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-emerald-700 transition-colors">Password Baru</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                                            <input
                                                name="newPassword" type={showPasswords.new ? "text" : "password"} value={formData.newPassword} onChange={handleChange}
                                                className="w-full pl-11 pr-12 border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-medium text-slate-800 text-sm shadow-sm font-mono placeholder:font-sans placeholder:text-slate-300"
                                                placeholder="Minimal 6 karakter"
                                            />
                                            <button type="button" onClick={() => togglePasswordVisibility('new')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                                                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-emerald-700 transition-colors">Konfirmasi Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                                            <input
                                                name="confirmPassword" type={showPasswords.confirm ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange}
                                                className="w-full pl-11 pr-12 border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-medium text-slate-800 text-sm shadow-sm font-mono placeholder:font-sans placeholder:text-slate-300"
                                                placeholder="Ulangi password baru"
                                            />
                                            <button type="button" onClick={() => togglePasswordVisibility('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                                                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex justify-end mt-auto">
                            <button
                                type="submit"
                                disabled={isSaving || isRequestingOtp}
                                className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                            >
                                {isSaving || isRequestingOtp ? <><Loader2 size={18} className="animate-spin" /> Memproses...</> : <><Save size={18} /> Simpan Perubahan</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* MODAL OTP (Verifikasi Email Baru) */}
            {isOtpModalOpen && (
                <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
                            <h2 className="text-lg font-bold tracking-tight">Verifikasi Email</h2>
                            <button onClick={() => { setIsOtpModalOpen(false); setOtp(''); }} className="hover:rotate-90 transition-all text-slate-400 hover:text-white bg-slate-800/50 p-2 hover:bg-slate-800 rounded-full"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleVerifyOtpSubmit} className="p-7 space-y-6">
                            <p className="text-[13px] text-slate-500 text-center font-medium leading-relaxed">
                                Kami telah mengirimkan kode OTP ke email baru Anda: <br />
                                <strong className="text-slate-800 block mt-1.5">{formData.email}</strong>
                            </p>
                            <div className="space-y-2 group">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-emerald-600 transition-colors">Kode OTP (6 Digit)</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                                    <input
                                        required autoFocus maxLength={6}
                                        value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 font-bold text-center text-lg tracking-[0.5em] text-slate-800 shadow-sm transition-all placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-300"
                                        placeholder="123456"
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={isSaving || otp.length < 6} className="w-full bg-emerald-600 text-white px-4 py-3.5 rounded-xl font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                    {isSaving ? <><Loader2 size={16} className="animate-spin" /> Memverifikasi...</> : 'Verifikasi & Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL ERROR */}
            {isErrorModalOpen && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
                                <XCircle size={40} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Gagal!</h2>
                            <p className="text-[13px] text-slate-500 mt-2 font-medium leading-relaxed">{errorMessage}</p>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <button onClick={() => setIsErrorModalOpen(false)} className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-900 shadow-md transition-all active:scale-[0.98] text-sm">
                                Tutup
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
                            <p className="text-[13px] text-slate-500 mt-2 font-medium leading-relaxed">{successMessage}</p>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <button onClick={() => setIsSuccessModalOpen(false)} className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-900 shadow-md transition-all active:scale-[0.98] text-sm">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};