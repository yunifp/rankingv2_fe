 import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Variable untuk antrian request
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Fungsi untuk menambah antrian
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Fungsi untuk menjalankan antrian setelah refresh berhasil
const onRrefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Jika sedang ada proses refresh, masukkan request ini ke antrian
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        // Gunakan axios dasar agar tidak kena interceptor ini lagi
        const { data } = await axios.post(`${baseURL}/refresh`, { refreshToken });

        // SESUAIKAN: Apakah data.token atau data.data.token atau data.accessToken?
        const newToken = data.token || data.accessToken || data.data?.token; 

        if (!newToken) throw new Error("Token baru tidak ditemukan di response");

        localStorage.setItem("token", newToken);
        
        // Jalankan antrian request yang tadi tertunda
        onRrefreshed(newToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        // Hanya logout jika refresh token benar-benar expired atau tidak valid
        handleLogout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}