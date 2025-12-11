import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// ✅ Add Interceptor to attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



// Fetch ALL contents (For Home Page)
export const fetchContents = () => api.get("/content");

// ✅ Fetch MY contents (For Dashboard)
export const fetchMyContents = () => api.get("/content/my");

// Auth endpoints
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);

// User endpoints
export const changePassword = (data) => api.put("/users/password", data);


// ✅ FIXED: Added 'description' to the arguments list
export const uploadFile = (file, description, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("description", description || "");

  return api.post("/content", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
};

export const downloadFile = (id) => api.get(`/content/${id}/download`, { responseType: "blob" });
export const deleteContent = (id) => api.delete(`/content/${id}`);
export const generateSummary = (id) => api.post(`/content/${id}/summary`);
export const getSummary = (id) => api.get(`/content/${id}/summary`);

export default api;