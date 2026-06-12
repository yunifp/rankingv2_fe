/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDashboard } from '../../hooks/useDashboard';
import { 
    CheckCircle, Award, GraduationCap, UserMinus, ArrowRight, 
    Clock, CheckCircle2, Loader2, AlertCircle, 
    TrendingUp, Building2, Target 
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const { stats, loading, error, fetchStats } = useDashboard();

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Tampilan Loading
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
                <p className="text-slate-500 font-medium">Memuat data analitik...</p>
            </div>
        );
    }

    // Tampilan Error
    if (error || !stats) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
                <AlertCircle className="text-red-500" size={48} />
                <p className="text-red-500 font-bold">{error || "Data tidak ditemukan"}</p>
                <button onClick={fetchStats} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200">Coba Lagi</button>
            </div>
        );
    }

    const { summary, kluster, prodi } = stats;

    // Data stat disesuaikan dengan data riil dari backend E-Ranking
    const statCards = [
        { title: 'Total Lolos', value: summary.Diterima || '0', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: 'Keseluruhan' },
        { title: 'Lolos (Afirmasi)', value: kluster?.Afirmasi?.diterima || '0', icon: Award, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', trend: 'Jalur Afirmasi' },
        { title: 'Lolos (Reguler)', value: kluster?.Reguler?.diterima || '0', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', trend: 'Jalur Reguler' },
        { title: 'Peserta Mundur', value: summary.Mengundurkan_Diri || '0', icon: UserMinus, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', trend: 'Butuh Pengganti' },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-sans pb-10">
            {/* WELCOME BANNER */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
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
                        <span className="text-sm font-bold tracking-wide">
                            {summary.Diproses > 0 ? `${summary.Diproses} Berkas Menunggu SPK` : 'Perankingan Selesai'}
                        </span>
                    </div>
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
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
                
                {/* Kolom Kiri: Tabel Keterisian Program Studi */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                                <TrendingUp className="text-emerald-600" size={20} /> Sebaran Keterisian Prodi
                            </h3>
                            <p className="text-xs font-medium text-slate-500 mt-1">Pemantauan real-time pemenuhan kuota per program studi.</p>
                        </div>
                        <button className="text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
                            Lihat Semua <ArrowRight size={12} />
                        </button>
                    </div>

                    <div className="overflow-x-auto flex-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 tracking-widest sticky top-0 z-10 shadow-sm border-b border-slate-100">
                                <tr>
                                    <th className="p-4 pl-6 md:pl-8">Program Studi & Kampus</th>
                                    <th className="p-4 text-center">Terisi / Kuota</th>
                                    <th className="p-4 pr-6 md:pr-8 w-32 md:w-48">Keterisian (%)</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-100">
                                {prodi && prodi.length > 0 ? prodi.map((p: any) => (
                                    <tr key={p.id_prodi} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 pl-6 md:pl-8">
                                            <p className="font-bold text-slate-700">{p.nama_prodi}</p>
                                            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                                                <Building2 size={12}/> {p.nama_pt}
                                            </p>
                                        </td>
                                        <td className="p-4 text-center font-mono text-slate-600">
                                            <span className={p.terisi >= p.kuota ? "text-emerald-600 font-black" : "font-bold"}>{p.terisi}</span> / {p.kuota}
                                        </td>
                                        <td className="p-4 pr-6 md:pr-8">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ${p.persentase_terisi >= 100 ? 'bg-emerald-500' : p.persentase_terisi >= 70 ? 'bg-amber-400' : 'bg-rose-400'}`} 
                                                        style={{ width: `${Math.min(p.persentase_terisi, 100)}%` }} 
                                                    />
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-500 w-8 text-right">{p.persentase_terisi}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="p-10 text-center text-slate-400 text-xs font-medium">Belum ada data program studi yang diproses.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Kolom Kanan: Distribusi Jalur & Dummy Log */}
                <div className="flex flex-col gap-6">
                    
                    {/* Kartu Distribusi Jalur */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2 mb-6">
                            <Target className="text-indigo-500" size={20} /> Distribusi Jalur Masuk
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Jalur Afirmasi</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Lolos: {kluster?.Afirmasi?.diterima || 0} dari {kluster?.Afirmasi?.total || 0} pendaftar</p>
                                    </div>
                                    <span className="text-sm font-black text-blue-600">
                                        {kluster?.Afirmasi?.total > 0 ? Math.round((kluster.Afirmasi.diterima / kluster.Afirmasi.total) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${kluster?.Afirmasi?.total > 0 ? (kluster.Afirmasi.diterima / kluster.Afirmasi.total) * 100 : 0}%` }} />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Jalur Reguler</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Lolos: {kluster?.Reguler?.diterima || 0} dari {kluster?.Reguler?.total || 0} pendaftar</p>
                                    </div>
                                    <span className="text-sm font-black text-purple-600">
                                        {kluster?.Reguler?.total > 0 ? Math.round((kluster.Reguler.diterima / kluster.Reguler.total) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${kluster?.Reguler?.total > 0 ? (kluster.Reguler.diterima / kluster.Reguler.total) * 100 : 0}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kartu Aktivitas Terkini (Statis/Dummy untuk saat ini) */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 flex-1">
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-5">Aktivitas Terkini</h3>
                        <div className="space-y-5">
                            {[
                                { msg: 'Data dashboard berhasil disinkronisasi', time: 'Baru saja', user: 'System' },
                                { msg: 'Login sistem berhasil', time: '5 menit yang lalu', user: user?.name || 'Administrator' },
                                { msg: `Menetapkan ${summary.Diterima} pendaftar lolos`, time: 'Hari ini', user: 'System Engine' },
                                { msg: `Status ${summary.Mengundurkan_Diri} pendaftar mundur`, time: 'Hari ini', user: 'Administrator' }
                            ].map((log, idx) => (
                                <div key={idx} className="flex gap-4 group cursor-pointer">
                                    <div className="mt-0.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50 group-hover:scale-125 transition-transform"></div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors leading-tight">{log.msg}</p>
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
        </div>
    );
};