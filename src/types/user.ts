export type RoleScope = "GENERAL" | "PROVINSI" | "KABKOTA";

export interface PaginationMeta {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

export interface Role {
  id: string;
  name: string;
  scope: RoleScope;
  description?: string;
}

export interface UserRole {
  role: Role;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  roles: UserRole[];
  kodeProvinsi: number | null;
  kodeKabupaten: number | null;
  provinsiId: number | null;
  kabupatenId: number | null;
  provinsi?: { nama: string };
  kabupaten?: { nama: string };
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  roleIds: string[];
  kodeProvinsi: number | null;
  kodeKabupaten: number | null;
  provinsiId: number | null;
  kabupatenId: number | null;
}
