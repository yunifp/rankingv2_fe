/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import type { Menu, MenuFormData } from "../types/menu";

export const useMenus = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [flatMenus, setFlatMenus] = useState<Menu[]>([]); // Untuk dropdown parent
  const [isLoading, setIsLoading] = useState(false);

  const fetchMenus = useCallback(async () => {
    setIsLoading(true);
    try {
      // Kita ambil data menu dalam bentuk list (bukan nested) untuk mempermudah CRUD di tabel
      const response = await api.get("/menus");
      // Jika backend Anda mengembalikan nested (parentId: null saja),
      // pastikan Anda punya endpoint yang mengembalikan flat list atau mapping di sini.
      setMenus(response.data.data);
      setFlatMenus(response.data.data);
    } catch (err: any) {
      console.error("Gagal mengambil menu:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMenu = async (data: MenuFormData) => {
    try {
      await api.post("/menus", data);
      await fetchMenus();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Gagal membuat menu",
      };
    }
  };

  const updateMenu = async (id: string, data: MenuFormData) => {
    try {
      await api.put(`/menus/${id}`, data);
      await fetchMenus();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Gagal update menu",
      };
    }
  };

  const deleteMenu = async (id: string) => {
    try {
      await api.delete(`/menus/${id}`);
      await fetchMenus();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Gagal menghapus",
      };
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  return {
    menus,
    flatMenus,
    isLoading,
    createMenu,
    updateMenu,
    deleteMenu,
    refresh: fetchMenus,
  };
};
