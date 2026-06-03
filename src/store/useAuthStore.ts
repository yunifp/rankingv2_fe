import { create } from "zustand";

export interface MenuAccess {
  id: string;
  title: string;
  path: string;
  icon: string | null;
  order: number;
  parentId: string | null;
  permissions: string[];
}

export interface RoleInfo {
  name: string;
  scope: "GENERAL" | "PROVINSI" | "KABKOTA";
}

export interface User {
  id: string;
  name: string;
  email: string;
  kodeProvinsi: number | null;
  kodeKabupaten: number | null;
  roles: RoleInfo[];
  menus: MenuAccess[];
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  hasPermission: (path: string, permission: string) => boolean; // Dibuat string agar lebih fleksibel menampung custom permission dari database
}

// Fungsi helper untuk inisialisasi state secara aman dari LocalStorage
const getUserFromStorage = (): User | null => {
  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data from localStorage", error);
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem("token") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  user: getUserFromStorage(),

  login: (token, refreshToken, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, refreshToken, user });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    sessionStorage.clear();

    set({ token: null, refreshToken: null, user: null });

    // Hard Redirect untuk membuang memori state SPA
    window.location.replace("/login");
  },

  hasPermission: (path, permission) => {
    const user = get().user;

    if (!user || !user.menus) return false;

    // Cari menu yang path-nya sama persis dengan yang diminta
    const menu = user.menus.find((m) => m.path === path);
    if (!menu) return false;

    // Cek apakah di menu tersebut user punya permission (contoh: READ, CREATE)
    return menu.permissions.includes(permission);
  },
}));
