export interface PaginationMeta {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

export interface Permission {
  id: string;
  name: string;
}

export interface Menu {
  id: string;
  title: string;
  path: string;
  icon: string | null;
  order: number;
  parentId: string | null;
  parent?: Menu | null;
  children?: Menu[];
}

export interface RoleMenuAccess {
  menuId: string;
  permissionIds: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  menuAccess?: { menuId: string; permissionId: string }[];
}

export interface RoleFormData {
  name: string;
  description: string;
}