export interface Permission {
  id: string;
  name: string; // Contoh: READ, CREATE, UPDATE, DELETE
}

export interface PermissionFormData {
  name: string;
}
