export interface Pelamar {
    id: string;
    kode_pendaftar: string;
    nama: string;
    status_kluster: 'Afirmasi' | 'Reguler';
    nilai_wawancara: number;
    nilai_tes_akademik: number;
    nilai_rapor: number;
    status_kelulusan: string;
    pilihan?: Array<{
        prioritas: number;
        prodi: {
            nama_prodi: string;
            pt: { nama_pt: string; singkatan: string | null }
        }
    }>;
}

export interface ImportPelamarResponse {
    success: boolean;
    message: string;
    data: {
        id_trx: string;
        s3_path: string;
        totalBerhasil: number;
        totalDuplikat: number;
    };
}

export interface PelamarPaginatedResponse {
    success: boolean;
    data: Pelamar[];
    meta: {
        totalItems: number;
        currentPage: number;
        itemsPerPage: number;
        totalPages: number;
    };
}