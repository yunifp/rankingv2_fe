export interface PerguruanTinggi {
  id_pt: string;
  nama_pt: string;
  nama_pt_odoo?: string | null;
  kode_pt?: string | null;
  singkatan?: string | null;
  jenis?: string | null;
  alamat?: string | null;
  kota?: string | null;
  kode_pos?: string | null;
  no_telepon_pt?: string | null;
  email?: string | null;
  website?: string | null;
  nama_pimpinan?: string | null;
  status_aktif: boolean;
}

export interface PerguruanTinggiResponse {
  success: boolean;
  data: PerguruanTinggi[];
  meta?: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
}