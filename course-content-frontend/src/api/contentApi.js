import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Check if the request URL is login, register, OR google
  const isAuthRequest =
    config.url.includes("/auth/login") ||
    config.url.includes("/auth/register") ||
    config.url.includes("/auth/google"); // 👈 ADD THIS

  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interaction Endpoints
export const toggleLike = (id) => api.post(`/interactions/${id}/like`);
export const getComments = (id) => api.get(`/interactions/${id}/comments`);
export const addComment = (id, text) =>
  api.post(`/interactions/${id}/comment`, { content: text });

// Update Profile Picture
export const updateProfilePicture = (formData) =>
  api.post("/users/profile-picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Fetch ALL contents (For Home Page)
export const fetchContents = () => api.get("/content");
// Google Login
export const googleLogin = (token) => api.post("/auth/google", { token });

// ✅ Fetch MY contents (For Dashboard)
export const fetchMyContents = () => api.get("/content/my");

// Chat endpoint
export const chatWithContent = (id, question) =>
  api.post(`/chat/${id}`, { question });

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