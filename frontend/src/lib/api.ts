import axios from "axios";
import { getCookie, setCookie, deleteCookie } from "./auth";
import { TeacherReservation, Student } from "@/interfaces";

const API_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - her istekte token'ı ekle
api.interceptors.request.use(
  (config) => {
    const token = getCookie("access_token");
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
        const refreshToken = getCookie("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        setCookie("access_token", access, 1); // 1 gün

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Token yenileme başarısız olduğunda tüm token'ları temizle
        deleteCookie("access_token");
        deleteCookie("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const login = async (
  studentNumber: string,
  password: string,
  is_staff: boolean = false
) => {
  try {
    const response = await api.post("/login/", {
      student_number: studentNumber,
      password: password,
      is_staff: is_staff,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  const refreshToken = getCookie("refresh_token");

  if (!refreshToken) {
    console.warn("No refresh token found during logout");
    deleteCookie("access_token");
    deleteCookie("refresh_token");
    localStorage.removeItem("user");
    return;
  }

  try {
    await api.post("/logout/", {
      refresh: refreshToken,
    });
  } catch (error) {
    console.error("Logout error:", error);
    // Token iptal edilemese bile cookie'leri temizle
  } finally {
    // Her durumda cookie'leri temizle
    deleteCookie("access_token");
    deleteCookie("refresh_token");
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

export const getReservations = async (
  student_number?: string
): Promise<TeacherReservation[]> => {
  const params = student_number ? { student_number } : {};
  const response = await api.get("/reservations/", { params });
  return response.data;
};

export const cancelReservation = async (reservationId: number) => {
  try {
    const response = await api.delete(`/reservation/cancel/${reservationId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (userData: { email: string }) => {
  try {
    const response = await api.put("/update/", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserInfo = async () => {
  try {
    const response = await api.get("/user/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (passwordData: {
  current_password: string;
  new_password: string;
  new_password2: string;
}) => {
  try {
    const response = await api.post("/change-password/", passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePastReservations = async () => {
  try {
    const response = await api.delete("/reservation/delete-past/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteSinglePastReservation = async (id: number) => {
  try {
    const response = await api.delete(`/reservation/delete-past/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendMessage = async (data: {
  recipient: number;
  title: string;
  content: string;
}) => {
  const response = await api.post("/messages/", data);
  return response.data;
};

export const getMessages = async () => {
  const response = await api.get("/messages/");
  return response.data;
};

export const deleteMessage = async (id: number) => {
  try {
    const response = await api.delete(`/messages/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAllMessages = async () => {
  try {
    const response = await api.delete("/messages/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const patchMessageRead = async (id: number) => {
  try {
    const response = await api.patch(`/messages/${id}/`, { is_read: true });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDutyTeacherByDate = async (date: string) => {
  try {
    const response = await api.get("/duty-teacher/", { params: { date } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Öğrenci listeleme (filtreleme ve sıralama destekli)
export const getStudents = async (
  params: {
    search?: string;
    student_class?: string;
    ordering?: string;
  } = {}
): Promise<Student[]> => {
  try {
    const response = await api.get("/student/", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTeachers = async () => {
  const response = await api.get("/teachers/");
  return response.data;
};

export default api;
