import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
});

export const addContentLink = (url, description) =>
  api.post("/content/link", { url, description });

// ✅ Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Check if the request URL is auth-related (public)
  const isAuthRequest =
    config.url.includes("/auth/login") ||
    config.url.includes("/auth/register") ||
    config.url.includes("/auth/google");

  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- AUTHENTICATION ---
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);
export const googleLogin = (token) => api.post("/auth/google", { token });
export const changePassword = (data) => api.put("/users/password", data);
// --- CONTENT MANAGEMENT ---

// ✅ FIXED: Correct Endpoint (/my-contents)
export const fetchMyContents = () => api.get("/content/my-contents");

//// Fetch ALL contents (Public Feed)
//export const fetchContents = () => api.get("/content");

// ✅ FIXED: Added Pagination Parameters
export const fetchContents = (page = 0) =>
  api.get(`/content?page=${page}&size=10`);


// ✅ FIXED: Removed manual 'Content-Type' header.
// The browser sets this automatically with the correct boundary for FormData.
export const uploadFile = (file, description, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("description", description || "");

  return api.post("/content", formData, {
    onUploadProgress,
  });
};

export const deleteContent = (id) => api.delete(`/content/${id}`);
export const downloadFile = (id) => api.get(`/content/${id}/download`, { responseType: "blob" });

// --- AI FEATURES ---
// ✅ FIXED: Added "/generate" to match Backend Controller
export const generateSummary = (id) => api.post(`/content/${id}/summary/generate`);

export const getSummary = (id) => api.get(`/content/${id}/summary`);

export const chatWithContent = (fileId, message) => api.post("/chat", { fileId, message });
// --- PROFILE ---
// Note: For profile pic, we also let browser handle the boundary, so no manual Content-Type here either
export const updateProfilePicture = (formData) => api.post("/users/profile-picture", formData);

// --- SOCIAL INTERACTIONS ---
export const toggleLike = (id) => api.post(`/interactions/${id}/like`);
export const getComments = (id) => api.get(`/interactions/${id}/comments`);
export const addComment = (id, text) => api.post(`/interactions/${id}/comment`, { content: text });

// --- NOTIFICATIONS ---
export const getNotifications = () => api.get("/notifications");
export const getUnreadCount = () => api.get("/notifications/count");
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put("/notifications/read-all");

export default api;