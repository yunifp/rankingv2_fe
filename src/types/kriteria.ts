export type TipeKriteria = 'benefit' | 'cost';
export type StatusKluster = 'Afirmasi' | 'Reguler';

export interface Kriteria {
    kode_kriteria: string;
    nama_kriteria: string;
    tipe: TipeKriteria;
    bobot: number;
    kluster: StatusKluster;
}

export interface KriteriaResponse {
    success: boolean;
    data: Kriteria[];
}