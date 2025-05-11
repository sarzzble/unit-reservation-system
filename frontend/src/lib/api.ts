import axios from "axios";

const API_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - her istekte token'ı ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - token yenileme
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem("access_token", access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const login = async (studentNumber: string, password: string) => {
  try {
    const response = await api.post("/login/", {
      student_number: studentNumber,
      password: password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    console.warn("No refresh token found during logout");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    return;
  }

  try {
    await api.post("/logout/", {
      refresh: refreshToken,
    });
  } catch (error) {
    console.error("Logout error:", error);
    // Token iptal edilemese bile local storage'ı temizle
  } finally {
    // Her durumda local storage'ı temizle
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }
};

export const getUnits = async (selectedDate?: string) => {
  try {
    const response = await api.get("/units/", {
      params: { selected_date: selectedDate },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData: {
  student_number: string;
  email: string;
  first_name: string;
  last_name: string;
  student_class: string;
  password: string;
  password2: string;
}) => {
  try {
    const response = await api.post("/register/", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const makeReservation = async (reservationData: {
  unit: number;
  date: string;
  time_slot: string;
}) => {
  try {
    const response = await api.post("/reservation/make/", reservationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMyReservations = async () => {
  try {
    const response = await api.get("/my-reservations/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelReservation = async (reservationId: number) => {
  try {
    const response = await api.delete(`/reservation/cancel/${reservationId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
