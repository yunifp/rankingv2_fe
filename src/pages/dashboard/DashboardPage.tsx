import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { 
    CheckCircle, Award, GraduationCap, UserMinus,  ArrowRight, Clock, CheckCircle2, BarChart3
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
    const { user } = useAuthStore();

    // Data stat disesuaikan dengan kelolosan E-Ranking BPDP Kementan
    const stats = [
        { title: 'Total Lolos', value: '700', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: 'Keseluruhan' },
        { title: 'Lolos (Afirmasi)', value: '295', icon: Award, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', trend: 'Jalur Afirmasi' },
        { title: 'Lolos (Reguler)', value: '405', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', trend: 'Jalur Reguler' },
        { title: 'Peserta Mundur', value: '0', icon: UserMinus, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', trend: 'Butuh Pengganti' },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto font-sans pb-10">
            {/* WELCOME BANNER */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Background Pattern Lembut */}
                <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-bl from-emerald-900/5 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10 space-y-2 text-center md:text-left w-full md:w-auto">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                        Selamat Datang, <span className="text-emerald-600">{user?.name || 'Administrator'}</span>! 👋
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-xl leading-relaxed">
                        Ini adalah pusat kendali sistem <strong className="text-emerald-700">E-Ranking BPDP Kementerian Pertanian</strong>. Pantau ringkasan data peserta beasiswa, proses verifikasi, dan hasil seleksi di sini.
                    </p>
                </div>

                <div className="relative z-10 hidden md:flex items-center gap-3">
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        <span className="text-sm font-bold tracking-wide">Status: Perankingan Selesai</span>
                    </div>
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.border} border shadow-inner transition-transform group-hover:scale-105`}>
                                <stat.icon size={22} className={stat.color} strokeWidth={2.5} />
                            </div>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* CONTENT AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom Kiri: Grafik/Informasi Utama */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Sebaran Kelolosan</h3>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">Statistik kelolosan berdasarkan regional dan jalur afirmasi/reguler.</p>
                        </div>
                        <button className="text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            Laporan Lengkap <ArrowRight size={12} />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 p-10 min-h-[250px]">
                        <BarChart3 size={40} className="text-slate-300 mb-4" />
                        <p className="text-sm font-bold text-slate-600">Grafik Sebaran Belum Tersedia</p>
                        <p className="text-xs font-medium text-slate-400 mt-1 text-center max-w-xs">Modul visualisasi data sedang dalam tahap integrasi dengan hasil perankingan final.</p>
                    </div>
                </div>

                {/* Kolom Kanan: Log Aktivitas Terbaru */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-6">Aktivitas Terkini</h3>
                    <div className="space-y-5">
                        {/* Dummy Logs Context E-Ranking */}
                        {[
                            { msg: 'Login sistem berhasil', time: 'Baru saja', user: 'Admin Pusat' },
                            { msg: 'Menetapkan 700 peserta lolos seleksi', time: '1 jam yang lalu', user: 'System' },
                            { msg: 'Mengupdate status 3 peserta mundur', time: 'Kemarin, 14:30', user: 'Admin Pusat' },
                            { msg: 'Menyesuaikan kuota cadangan', time: 'Kemarin, 10:15', user: 'Admin Pusat' }
                        ].map((log, idx) => (
                            <div key={idx} className="flex gap-4 group cursor-pointer">
                                <div className="mt-0.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50 group-hover:scale-125 transition-transform"></div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors leading-tight">{log.msg}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <Clock size={10} /> {log.time}
                                        </span>
                                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap">{log.user}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};