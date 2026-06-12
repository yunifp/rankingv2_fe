/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useRanking } from '../../hooks/useRanking';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api'; 
import { 
    Trophy, PlayCircle, Loader2, XOctagon, CheckCircle2, 
    UserX, Sparkles, RotateCcw, AlertTriangle, Quote,
    Search, Filter, Building2, GraduationCap, FileSpreadsheet, Printer,
    X, FileText, Calculator, MapPin // Ditambahkan icon untuk Modal Slide-over
} from 'lucide-react';

// Kumpulan Quotes Motivasi & Hadist Integritas
const INTEGRITY_QUOTES = [
    { text: "Barangsiapa yang menipu (berbuat curang), maka ia bukan golongan kami.", source: "HR. Muslim" },
    { text: "Kejujuran akan mengantarkan kepada kebaikan, dan kebaikan akan mengantarkan ke surga.", source: "HR. Bukhari & Muslim" },
    { text: "Tinggalkanlah apa yang meragukanmu kepada apa yang tidak meragukanmu. Sesungguhnya kejujuran adalah ketenangan.", source: "HR. Tirmidzi" },
    { text: "Setiap orang yang berkhianat akan membawa panji pengkhianatannya pada hari kiamat sebagai tanda kehinaan.", source: "HR. Bukhari & Muslim" },
    { text: "Integritas adalah melakukan hal yang benar, bahkan ketika tidak ada satu orang pun yang melihat.", source: "C.S. Lewis" },
    { text: "Berbuat adillah, karena adil itu lebih dekat kepada takwa.", source: "QS. Al-Ma'idah: 8" },
    { text: "Satu kebohongan mungkin bisa menyelamatkanmu hari ini, tapi ia akan menghancurkan masa depanmu.", source: "Anonim" },
];

const RankingPage = () => {
    // Ditambahkan 'downloadExportData' untuk menarik data cetak/excel
    const { results, meta, loading, isGenerating, fetchResults, generateRanking, setMundur, resetAllRanking, downloadExportData } = useRanking();
    const { hasPermission } = useAuthStore();
    const canGenerate = hasPermission('/rank', 'UPDATE');
    const canReset = hasPermission('/rank', 'DELETE');

    // ==========================================
    // STATE FILTER & PAGINASI
    // ==========================================
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterPt, setFilterPt] = useState('');
    const [filterProdi, setFilterProdi] = useState('');
    const [filterKluster, setFilterKluster] = useState('');

    // Master Data untuk Dropdown Filter
    const [listPt, setListPt] = useState<any[]>([]);
    const [listProdi, setListProdi] = useState<any[]>([]);

    // ==========================================
    // STATE ANTARMUKA MODAL & PROCESSING
    // ==========================================
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const [resignTarget, setResignTarget] = useState<{ id: string; nama: string } | null>(null);
    const [selectedPelamar, setSelectedPelamar] = useState<any | null>(null); // Ditambahkan untuk Detail Slide-over
    
    const [isProcessingOpen, setIsProcessingOpen] = useState(false);
    const [processType, setProcessType] = useState<'generate' | 'reset' | 'resign'>('generate');
    const [processStatus, setProcessStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [progress, setProgress] = useState(0);
    const [currentQuote, setCurrentQuote] = useState(INTEGRITY_QUOTES[0]);

    // ==========================================
    // EFFECTS (PENGAMBILAN DATA)
    // ==========================================
    
    // 1. Ambil Master Data Perguruan Tinggi & Prodi untuk dropdown filter
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const resPt = await api.get('/perguruan-tinggi?limit=500');
                const resProdi = await api.get('/program-studi?limit=2000');
                setListPt(resPt.data.data || []);
                setListProdi(resProdi.data.data || []);
            } catch (err) { console.error("Gagal load filter data", err); }
        };
        fetchFilters();
    }, []);

    // 2. Debounce untuk input pencarian agar tidak spam API
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(1); }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // 3. Tarik data ranking setiap kali filter/halaman berubah
    useEffect(() => {
        fetchResults(page, limit, debouncedSearch, filterPt, filterProdi, filterKluster);
    }, [page, limit, debouncedSearch, filterPt, filterProdi, filterKluster]);

    // Handler Filter Prodi dinamis (Hanya tampilkan prodi dari PT yang dipilih)
    const filteredListProdi = filterPt ? listProdi.filter(p => p.id_pt === filterPt) : listProdi;

    // ==========================================
    // FUNGSI EKSPOR EXCEL & PDF
    // ==========================================
    const handleExportExcel = async () => {
        try {
            const rawData = await downloadExportData();
            if (!rawData || rawData.length === 0) {
                alert("Tidak ada data kelulusan yang bisa diekspor.");
                return;
            }

            let csvContent = "No,Kode Pendaftar,Nama Pendaftar,Jalur Masuk,Skor Akhir,Status Kelulusan,Perguruan Tinggi,Program Studi\n";
            
            rawData.forEach((item: any, index: number) => {
                const nomor = index + 1;
                const kode = item.kode_pendaftar;
                const nama = item.nama.replace(/,/g, ''); 
                const jalur = item.status_kluster;
                const skor = item.status_kluster === 'Afirmasi' && item.ranking?.skor_afirmasi > 0 
                    ? item.ranking.skor_afirmasi.toFixed(4) 
                    : item.ranking?.skor_reguler?.toFixed(4) || "0.0000";
                const status = item.status_kelulusan;
                const kampus = item.prodi_diterima?.pt?.nama_pt ? item.prodi_diterima.pt.nama_pt.replace(/,/g, '') : "-";
                const prodiName = item.prodi_diterima?.nama_prodi ? item.prodi_diterima.nama_prodi.replace(/,/g, '') : "-";

                csvContent += `${nomor},${kode},${nama},${jalur},${skor},${status},${kampus},${prodiName}\n`;
            });

            // Format BOM UTF-8
            const BOM = "\uFEFF";
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            
            link.setAttribute("href", url);
            link.setAttribute("download", `LAPORAN_FINAL_SELEKSI_ERANKING_${new Date().getFullYear()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handlePrintPDF = () => {
        window.print();
    };

    // ==========================================
    // FUNGSI ANIMASI & AKSI
    // ==========================================
    const randomizeQuote = () => {
        const random = INTEGRITY_QUOTES[Math.floor(Math.random() * INTEGRITY_QUOTES.length)];
        setCurrentQuote(random);
    };

    const runProcessAnimation = async (type: 'generate' | 'reset' | 'resign', apiCall: () => Promise<any>) => {
        setIsConfirmOpen(false);
        setIsResetConfirmOpen(false);
        setResignTarget(null);
        setSelectedPelamar(null); // Ditambahkan agar slide-over tertutup saat proses jalan
        
        setProcessType(type);
        setProcessStatus('loading');
        setProgress(0);
        randomizeQuote();
        setIsProcessingOpen(true);

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return prev;
                }
                const increment = Math.floor(Math.random() * 10) + 2;
                return Math.min(prev + increment, 90);
            });
        }, 150);

        try {
            await apiCall();
            clearInterval(interval);
            setProgress(100);
            setProcessStatus('success');
            // Refresh data tabel dengan state filter yang sedang aktif
            fetchResults(page, limit, debouncedSearch, filterPt, filterProdi, filterKluster);
        } catch (error: any) {
            clearInterval(interval);
            setProcessStatus('error');
            alert(error.message);
        }
    };

    const handleGenerate = () => runProcessAnimation('generate', generateRanking);
    const handleReset = () => runProcessAnimation('reset', resetAllRanking);
    const confirmResign = () => {
        if (resignTarget) {
            runProcessAnimation('resign', () => setMundur(resignTarget.id));
        }
    };

    const openResignModal = (id: string, nama: string) => {
        randomizeQuote(); 
        setResignTarget({ id, nama });
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-sans pb-10">
            
            {/* CSS KHUSUS UNTUK CETAK PDF/KERTAS */}
            <style>{`
                @media print {
                    body { background: #fff; color: #000; padding: 0; margin: 0; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .print-table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #000 !important; }
                    .print-table th, .print-table td { border: 1px solid #000 !important; padding: 8px !important; font-size: 11px !important; color: #000 !important; }
                    .print-table th { background-color: #f2f2f2 !important; font-weight: bold !important; text-transform: uppercase !important; }
                    @page { size: A4 landscape; margin: 15mm 10mm 15mm 10mm; }
                }
                .print-only { display: none; }
            `}</style>

            {/* KOP SURAT (HANYA MUNCUL DI PDF/CETAK) */}
            <div className="print-only text-center space-y-1 border-b-4 border-double border-black pb-4 mb-6">
                <h2 className="text-lg font-black tracking-wide text-black uppercase">KEMENTERIAN PERTANIAN REPUBLIK INDONESIA</h2>
                <h3 className="text-base font-extrabold text-black uppercase">BADAN PENGELOLA DANA PERKEBUNAN KELAPA SAWIT (BPDPKS)</h3>
                <p className="text-xs text-black font-medium">Laporan Lampiran Hasil Perankingan Akhir Seleksi Beasiswa</p>
                <p className="text-[10px] font-mono text-slate-500 text-right mt-2">Waktu Cetak Dokumen: {new Date().toLocaleString('id-ID')}</p>
            </div>

            {/* ========================================== */}
            {/* TOP BAR HEADER                             */}
            {/* ========================================== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <Trophy className="text-amber-500" /> Hasil Perankingan SPK
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Jalankan algoritma SAW & Matchmaking, lalu kelola hasil kelulusan Pendaftar Beasiswa.
                    </p>
                </div>

                <div className="flex gap-3">
                    {canReset && (
                        <button 
                            onClick={() => setIsResetConfirmOpen(true)}
                            disabled={isGenerating || isProcessingOpen}
                            className="bg-red-50 text-red-600 px-5 py-3 rounded-xl font-bold border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                        >
                            <RotateCcw size={18} />
                            Reset Total
                        </button>
                    )}
                    {canGenerate && (
                        <button 
                            onClick={() => setIsConfirmOpen(true)}
                            disabled={isGenerating || isProcessingOpen}
                            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                        >
                            <PlayCircle size={18} />
                            Jalankan Engine Perankingan
                        </button>
                    )}
                </div>
            </div>

            {/* ========================================== */}
            {/* KONTEN UTAMA (FILTER + TABEL + PAGINASI)   */}
            {/* ========================================== */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                
                {/* TOOLBAR FILTER & SEARCH */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row gap-4 no-print">
                    {/* Search */}
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600" size={18} />
                        <input 
                            type="text" placeholder="Cari Nama / Kode Pendaftar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
                        />
                    </div>
                    
                    {/* Filters & Export Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[180px]">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select value={filterPt} onChange={(e) => { setFilterPt(e.target.value); setFilterProdi(''); setPage(1); }} className="w-full pl-11 pr-4 py-3 appearance-none bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-600/20 truncate">
                                <option value="">Semua Universitas</option>
                                {listPt.map(pt => <option key={pt.id_pt} value={pt.id_pt}>{pt.nama_pt}</option>)}
                            </select>
                        </div>
                        <div className="relative min-w-[180px]">
                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select value={filterProdi} onChange={(e) => { setFilterProdi(e.target.value); setPage(1); }} className="w-full pl-11 pr-4 py-3 appearance-none bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-600/20 truncate">
                                <option value="">Semua Program Studi</option>
                                {filteredListProdi.map(prodi => <option key={prodi.id_prodi} value={prodi.id_prodi}>{prodi.nama_prodi}</option>)}
                            </select>
                        </div>
                        <div className="relative min-w-[140px]">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select value={filterKluster} onChange={(e) => { setFilterKluster(e.target.value); setPage(1); }} className="w-full pl-11 pr-4 py-3 appearance-none bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-600/20">
                                <option value="">Semua Jalur</option>
                                <option value="Afirmasi">Afirmasi</option>
                                <option value="Reguler">Reguler</option>
                            </select>
                        </div>

                        {/* Garis Pembatas */}
                        <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block"></div>

                        {/* Tombol Export & Cetak */}
                        <button 
                            onClick={handleExportExcel} title="Ekspor data ke Excel"
                            className="p-3 bg-white hover:bg-slate-50 text-emerald-600 border border-slate-200 rounded-xl shadow-sm transition-colors"
                        >
                            <FileSpreadsheet size={18} />
                        </button>
                        <button 
                            onClick={handlePrintPDF} title="Cetak Dokumen PDF"
                            className="p-3 bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 rounded-xl shadow-sm transition-colors"
                        >
                            <Printer size={18} />
                        </button>
                    </div>
                </div>

                {/* TABEL HASIL */}
                <div className="overflow-x-auto flex-1 min-h-[400px]">
                    <table className="w-full text-left border-collapse whitespace-nowrap print-table">
                        <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="p-5">Pendaftar</th>
                                <th className="p-5 text-center">Jalur Masuk</th>
                                <th className="p-5 text-center">Skor Akhir (V)</th>
                                <th className="p-5 text-center">Status</th>
                                <th className="p-5">Kampus & Prodi Diterima</th>
                                <th className="p-5 text-center no-print">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100">
                            {loading && !isProcessingOpen ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center text-slate-400 font-medium">
                                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-2" size={28} />
                                        <p>Memuat lembar hasil...</p>
                                    </td>
                                </tr>
                            ) : results.length > 0 ? (
                                results.map((row: any) => (
                                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                        {/* TRIGGER SLIDE-OVER DIHAPUS DARI NAMA (Dikembalikan menjadi teks biasa) */}
                                        <td className="p-5">
                                            <p className="font-bold text-slate-800">{row.nama}</p>
                                            <p className="text-xs font-mono text-slate-500 mt-0.5">{row.kode_pendaftar}</p>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`px-2 py-1 border rounded-md text-[10px] font-bold uppercase ${
                                                row.status_kluster === 'Afirmasi' ? 'bg-purple-50 border-purple-100 text-purple-700' : 'bg-blue-50 border-blue-100 text-blue-700'
                                            }`}>
                                                {row.status_kluster}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center font-mono font-bold text-slate-700">
                                            {row.status_kluster === 'Afirmasi' && row.ranking?.skor_afirmasi > 0 
                                                ? row.ranking.skor_afirmasi.toFixed(4) 
                                                : row.ranking?.skor_reguler?.toFixed(4) || "0.0000"}
                                        </td>
                                        <td className="p-5 text-center">
                                            {row.status_kelulusan === "Diterima" && <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold"><CheckCircle2 size={12}/> DITERIMA</span>}
                                            {row.status_kelulusan === "Ditolak" && <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full text-[10px] font-bold"><XOctagon size={12}/> DITOLAK</span>}
                                            {row.status_kelulusan === "Mengundurkan_Diri" && <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-bold"><UserX size={12}/> RESIGN</span>}
                                        </td>
                                        <td className="p-5">
                                            {row.prodi_diterima ? (
                                                <div>
                                                    <p className="font-bold text-slate-700">{row.prodi_diterima.nama_prodi}</p>
                                                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <Building2 size={12}/> {row.prodi_diterima.pt?.nama_pt || 'Universitas tidak diketahui'}
                                                    </p>
                                                </div>
                                            ) : <span className="text-slate-400 font-normal italic">- Belum Terisi -</span>}
                                        </td>
                                        <td className="p-5 text-center no-print">
                                            {/* TOMBOL AKSI: DITAMBAHKAN TOMBOL DETAIL DI SINI */}
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => setSelectedPelamar(row)}
                                                    className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200 shadow-sm flex items-center gap-1"
                                                >
                                                    <FileText size={12} /> Detail
                                                </button>
                                                
                                                {row.status_kelulusan === "Diterima" && canGenerate && (
                                                    <button 
                                                        onClick={() => openResignModal(row.id, row.nama)}
                                                        className="text-[10px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors border border-amber-200 shadow-sm"
                                                    >
                                                        Set Mundur
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center text-slate-400 font-medium">
                                        Data tidak ditemukan dengan filter yang dipilih.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER PAGINATION */}
                {meta && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100 gap-4 no-print">
                        <div className="text-xs text-slate-500 font-bold tracking-widest uppercase">
                            Menampilkan {results.length > 0 ? (meta.currentPage - 1) * meta.itemsPerPage + 1 : 0} - {Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)} dari {meta.totalItems} data
                        </div>
                        <div className="flex items-center gap-3">
                            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="border border-slate-200 rounded-lg text-xs font-bold px-3 py-2 bg-white text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-emerald-600/20">
                                <option value={10}>10 Baris</option>
                                <option value={25}>25 Baris</option>
                                <option value={50}>50 Baris</option>
                                <option value={100}>100 Baris</option>
                            </select>
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg shadow-sm p-1">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.currentPage <= 1} className="px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-40 text-slate-600 hover:bg-slate-50">Prev</button>
                                <span className="px-3 py-1.5 text-xs font-black text-emerald-700 bg-emerald-50 rounded-md">{meta.currentPage} / {meta.totalPages || 1}</span>
                                <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.currentPage >= meta.totalPages || meta.totalPages === 0} className="px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-40 text-slate-600 hover:bg-slate-50">Next</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* TANDA TANGAN DOKUMEN RESMI (HANYA MUNCUL DI PDF) */}
            <div className="print-only mt-12 flex justify-end text-black font-sans">
                <div className="w-72 text-center space-y-16">
                    <div>
                        <p className="text-xs">Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="text-xs font-bold uppercase mt-1">Direktur Utama BPDPKS,</p>
                    </div>
                    <div>
                        <p className="text-xs font-black underline uppercase">.................................................</p>
                        <p className="text-[10px] font-bold text-slate-700 tracking-wider">NIP / KODE OTORISASI DOKUMEN</p>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* SLIDE-OVER: DETAIL PROFIL PENDAFTAR        */}
            {/* ========================================== */}
            {selectedPelamar && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-all no-print">
                    <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        
                        {/* Header Slide-over */}
                        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">{selectedPelamar.nama}</h2>
                                <p className="text-sm font-mono text-slate-500 mt-1">{selectedPelamar.kode_pendaftar}</p>
                                <div className="flex gap-2 mt-3">
                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border ${selectedPelamar.status_kluster === 'Afirmasi' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                        Jalur {selectedPelamar.status_kluster}
                                    </span>
                                    {selectedPelamar.status_kelulusan === "Diterima" && <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">LULUS</span>}
                                    {selectedPelamar.status_kelulusan === "Ditolak" && <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border bg-red-50 text-red-700 border-red-200">TIDAK LOLOS</span>}
                                </div>
                            </div>
                            <button onClick={() => setSelectedPelamar(null)} className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body Detail Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            
                            {/* Section 1: Nilai Mentah */}
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <FileText size={14} /> Atribut Penilaian (Mentah)
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Nilai Rapor</p>
                                        <p className="text-xl font-black text-slate-800 mt-1">{selectedPelamar.nilai_rapor}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Nilai Wawancara</p>
                                        <p className="text-xl font-black text-slate-800 mt-1">{selectedPelamar.nilai_wawancara}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Tes Akademik</p>
                                        <p className="text-xl font-black text-slate-800 mt-1">{selectedPelamar.nilai_tes_akademik}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Buta Warna?</p>
                                        <p className={`text-sm font-bold mt-1 ${selectedPelamar.is_buta_warna ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {selectedPelamar.is_buta_warna ? 'YA (Buta Warna)' : 'TIDAK'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Kalkulasi Skor Akhir */}
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Calculator size={14} /> Skor Normalisasi SAW (V)
                                </h3>
                                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-bold text-slate-600">Skor Afirmasi (30%)</span>
                                        <span className="text-lg font-mono font-black text-emerald-700">{selectedPelamar.ranking?.skor_afirmasi?.toFixed(4) || "0.0000"}</span>
                                    </div>
                                    <div className="w-full h-px bg-emerald-100 my-2"></div>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-sm font-bold text-slate-600">Skor Reguler (70%)</span>
                                        <span className="text-lg font-mono font-black text-emerald-700">{selectedPelamar.ranking?.skor_reguler?.toFixed(4) || "0.0000"}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3: Riwayat Pilihan Prodi */}
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <MapPin size={14} /> Riwayat Pilihan Prodi
                                </h3>
                                <div className="space-y-3">
                                    {selectedPelamar.pilihan_prodi && selectedPelamar.pilihan_prodi.length > 0 ? (
                                        selectedPelamar.pilihan_prodi.map((pilihan: any, idx: number) => {
                                            const isAccepted = selectedPelamar.id_prodi_diterima === pilihan.id_prodi;
                                            return (
                                                <div key={idx} className={`p-4 rounded-xl border ${isAccepted ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'} relative overflow-hidden`}>
                                                    {isAccepted && <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg uppercase">Diterima</div>}
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 mt-0.5">
                                                            {pilihan.prioritas}
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold text-sm ${isAccepted ? 'text-emerald-800' : 'text-slate-700'}`}>{pilihan.prodi?.nama_prodi || 'Nama Prodi'}</p>
                                                            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1"><Building2 size={10}/> {pilihan.prodi?.pt?.nama_pt || 'Nama Kampus'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center p-6 bg-slate-50 border border-slate-100 rounded-2xl border-dashed">
                                            <p className="text-xs font-medium text-slate-400">Data riwayat pilihan belum termuat.</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Pastikan API backend telah memuat relasi 'pilihan_prodi'.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                        </div>

                        {/* Footer Slide-over */}
                        <div className="p-6 border-t border-slate-100 bg-white">
                            <button onClick={() => setSelectedPelamar(null)} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-slate-800 shadow-md transition-all">
                                Tutup Panel
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* KUMPULAN MODAL (TIDAK ADA YANG DIRUBAH)    */}
            {/* ========================================== */}

            {/* Modal Konfirmasi Generate */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 no-print">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center animate-in zoom-in-95 duration-150">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                            <PlayCircle size={32} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Eksekusi Algoritma?</h2>
                        <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed font-medium">
                            Sistem akan mengalkulasi bobot matriks SAW, membagi kuota otomatis, dan mengunci status kelulusan pendaftar.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsConfirmOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm transition-colors">Batal</button>
                            <button onClick={handleGenerate} className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 text-sm flex justify-center items-center shadow-md transition-all active:scale-[0.98]">
                                Ya, Jalankan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Reset */}
            {isResetConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 no-print">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center animate-in zoom-in-95 duration-150 border-t-4 border-red-500">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-sm">
                            <AlertTriangle size={32} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Reset Total Sistem?</h2>
                        <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed font-medium">
                            <span className="text-red-500 font-bold">PERINGATAN KERAS!</span> Seluruh hasil perankingan akan dihapus dan status pendaftar dikembalikan ke "Diproses".
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsResetConfirmOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm transition-colors">Batal</button>
                            <button onClick={handleReset} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 text-sm flex justify-center items-center shadow-md shadow-red-600/20 transition-all active:scale-[0.98]">
                                Ya, Reset Semua
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Set Mundur (Resign) */}
            {resignTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 no-print">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 text-center animate-in zoom-in-95 duration-150 border-t-4 border-amber-500">
                        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-sm">
                            <UserX size={32} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Set Mundur Pendaftar?</h2>
                        <p className="text-sm text-slate-700 mt-1 font-bold">{resignTarget.nama}</p>
                        <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed font-medium">
                            Status kelulusan akan dicabut dan kuota prodi dikembalikan. <br/>Tindakan ini <span className="text-amber-600 font-bold">tidak dapat dibatalkan</span>.
                        </p>

                        <div className="mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 relative text-left">
                            <Quote size={20} className="text-slate-200 absolute -top-3 -left-2 transform -scale-x-100 bg-white rounded-full p-1" />
                            <p className="text-[11px] text-slate-600 font-medium italic leading-relaxed">
                                "{currentQuote.text}"
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1.5 text-right">
                                — {currentQuote.source}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setResignTarget(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm transition-colors">Batal</button>
                            <button onClick={confirmResign} className="flex-1 py-3 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 text-sm flex justify-center items-center shadow-md shadow-amber-600/20 transition-all active:scale-[0.98]">
                                Ya, Set Mundur
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Progress Bar Loading & Success */}
            {isProcessingOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 transition-all no-print">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300 border border-slate-100">
                        
                        {processStatus === 'loading' && (
                            <div className="space-y-8">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto border animate-pulse ${
                                    processType === 'generate' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                    processType === 'reset' ? 'bg-red-50 text-red-600 border-red-100' :
                                    'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                    <Loader2 size={26} className="animate-spin" />
                                </div>
                                
                                <div className="space-y-1">
                                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                                        {processType === 'generate' ? 'Memproses Matriks Perankingan...' : 
                                         processType === 'reset' ? 'Mereset Data Sistem...' : 
                                         'Memproses Pengunduran Diri...'}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {processType === 'generate' ? 'Melakukan normalisasi SAW dan matchmaking kuota prodi.' : 
                                         processType === 'reset' ? 'Mengosongkan riwayat dan mengembalikan status pendaftar.' :
                                         'Mencabut status kelulusan dan mengalokasikan ulang kuota prodi.'}
                                    </p>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40 p-[2px]">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-300 ease-out ${
                                                processType === 'generate' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 
                                                processType === 'reset' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                                                'bg-gradient-to-r from-amber-500 to-orange-500'
                                            }`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono font-bold px-1">
                                        <span>STATUS: {processType === 'generate' ? 'CALCULATING_MATRIX' : processType === 'reset' ? 'FLUSHING_DATABASE' : 'REVERTING_ALLOCATION'}</span>
                                        <span className={
                                            processType === 'generate' ? 'text-emerald-600' : 
                                            processType === 'reset' ? 'text-red-600' : 'text-amber-600'
                                        }>{progress}%</span>
                                    </div>
                                </div>

                                <div className="mt-8 bg-slate-50 border border-slate-100 rounded-2xl p-5 relative">
                                    <Quote size={24} className="text-slate-200 absolute -top-3 -left-2 transform -scale-x-100 bg-white rounded-full p-1" />
                                    <p className="text-xs text-slate-600 font-medium italic leading-relaxed">
                                        "{currentQuote.text}"
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-2 text-right">
                                        — {currentQuote.source}
                                    </p>
                                </div>
                            </div>
                        )}

                        {processStatus === 'success' && (
                            <div className="space-y-6 animate-in fade-in zoom-in-90 duration-300">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border shadow-md relative ${
                                    processType === 'generate' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 
                                    processType === 'reset' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                    'bg-amber-50 text-amber-500 border-amber-100'
                                }`}>
                                    <CheckCircle2 size={36} />
                                    {processType === 'generate' && <Sparkles className="absolute -top-1 -right-1 text-amber-400 animate-bounce" size={16} />}
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">
                                        {processType === 'generate' ? 'Kalkulasi SPK Sukses!' : 
                                         processType === 'reset' ? 'Reset Sistem Selesai' : 
                                         'Pengunduran Diri Berhasil'}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-semibold px-4 leading-relaxed">
                                        {processType === 'generate' 
                                            ? "Seluruh berkas pendaftar berstatus 'Diproses' telah berhasil dialokasikan secara adil berdasarkan kriteria bobot SAW."
                                            : processType === 'reset'
                                            ? "Seluruh skor pendaftar telah dihapus dan siap untuk diranking ulang dari awal."
                                            : "Kuota berhasil dikembalikan ke program studi. Log riwayat telah dicatat di sistem audit."}
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <button 
                                        onClick={() => setIsProcessingOpen(false)}
                                        className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all active:scale-[0.97]"
                                    >
                                        Tutup & Lihat Hasil Lembar Kerja
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RankingPage;