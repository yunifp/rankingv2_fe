/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import type { Permission, PermissionFormData } from "../types/permission";

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/permissions");
      setPermissions(response.data.data);
    } catch (err: any) {
      console.error("Gagal mengambil data permission:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPermission = async (data: PermissionFormData) => {
    try {
      await api.post("/permissions", data);
      await fetchPermissions();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Gagal membuat",
      };
    }
  };

  const deletePermission = async (id: string) => {
    try {
      await api.delete(`/permissions/${id}`);
      await fetchPermissions();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Gagal menghapus",
      };
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    isLoading,
    createPermission,
    deletePermission,
    refresh: fetchPermissions,
  };
};
