export interface ProgramStudi {
    id_prodi: string;
    id_pt: string;
    jenjang: string;
    nama_prodi: string;
    kuota: number;
    boleh_buta_warna: boolean;
    pt?: {
        nama_pt: string;
        singkatan: string | null;
    };
}

export interface ProgramStudiResponse {
    success: boolean;
    data: ProgramStudi[];
    meta?: {
        totalItems: number;
        currentPage: number;
        itemsPerPage: number;
        totalPages: number;
    };
}