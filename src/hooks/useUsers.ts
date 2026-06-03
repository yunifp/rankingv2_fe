/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import type { User, UserFormData, Role, PaginationMeta } from "../types/user";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      const resRoles = await api.get("/roles/all");
      setRoles(resRoles.data.data);
    } catch (err: any) {
      console.error("Gagal mengambil data roles:", err);
    }
  }, []);

  const fetchUsers = useCallback(async (page: number = 1, limit: number = 10) => {
    setIsLoading(true);
    try {
      const resUsers = await api.get(`/users?page=${page}&limit=${limit}`);
      setUsers(resUsers.data.data);
      if (resUsers.data.meta) {
        setMeta(resUsers.data.meta);
      }
    } catch (err: any) {
      console.error("Gagal mengambil data user:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = async (data: UserFormData) => {
    try {
      await api.post("/users", data);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Gagal membuat user",
      };
    }
  };

  const updateUser = async (id: string, data: UserFormData) => {
    try {
      await api.put(`/users/${id}`, data);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Gagal update user",
      };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Gagal menghapus user",
      };
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    users,
    roles,
    meta,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    fetchUsers,
  };
};