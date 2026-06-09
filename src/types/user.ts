export interface PaginationMeta {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

export interface Role {
  id: string;
  name: string;
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
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  roleIds: string[];
}