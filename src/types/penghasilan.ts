export interface PenghasilanOrtu {
    id: string;
    rentang_penghasilan: string;
    poin: number;
    is_active: boolean;
}

export interface PenghasilanOrtuResponse {
    success: boolean;
    data: PenghasilanOrtu[];
}