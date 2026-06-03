/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import type {
  Role,
  RoleFormData,
  Permission,
  Menu,
  RoleMenuAccess,
  PaginationMeta,
} from "../types/role";

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 0,
  });

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mengambil Permissions dan Menus (Biasanya tidak berubah, bisa diambil sekali)
  const fetchConfigData = useCallback(async () => {
    try {
      const [resPerms, resMenus] = await Promise.all([
        api.get("/permissions/all"),
        api.get("/menus/all"),
      ]);
      setPermissions(resPerms.data.data);
      setMenus(resMenus.data.data);
    } catch (err: any) {
      console.error("Fetch Config Error:", err);
    }
  }, []);

  // Fetch Roles dengan Pagination
  const fetchRoles = useCallback(
    async (page: number = 1, limit: number = 10) => {
      setIsLoading(true);
      try {
        const res = await api.get(`/roles?page=${page}&limit=${limit}`);
        setRoles(res.data.data);
        if (res.data.meta) {
          setMeta(res.data.meta);
        }
      } catch (err: any) {
        console.error("Fetch Roles Error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const createRole = async (data: RoleFormData) => {
    try {
      await api.post("/roles", data);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  const updateRole = async (id: string, data: RoleFormData) => {
    try {
      await api.put(`/roles/${id}`, data);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  const deleteRole = async (id: string) => {
    try {
      await api.delete(`/roles/${id}`);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  const updateRoleAccess = async (
    roleId: string,
    accessData: RoleMenuAccess[],
  ) => {
    try {
      await api.put(`/roles/${roleId}/access`, { accessData });
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  useEffect(() => {
    fetchConfigData();
  }, [fetchConfigData]);

  return {
    roles,
    meta,
    permissions,
    menus,
    isLoading,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    updateRoleAccess,
  };
};
