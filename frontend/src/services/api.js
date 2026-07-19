import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5001",
});

// ======================
// IMAGES
// ======================

export const getImages = (params) => {
  return api.get("/images", { params });
};

export const getSingleImage = (id) => {
  return api.get(`/images/${id}`);
};

// ======================
// LIKE / FAVORITE / DOWNLOAD
// ======================

export const likeImage = (id) => {
  return api.post(`/images/${id}/like`);
};

export const addFavorite = (id) => {
  return api.post(`/favorites/${id}`);
};

export const downloadImage = (id) => {
  return api.post(`/images/${id}/download`);
};

export const shareImage = (id) => {
  return api.post(`/images/${id}/share`);
};

// ======================
// AUTH (future ready)
// ======================

export const login = (data) => {
  return api.post("/login", data);
};

export const register = (data) => {
  return api.post("/register", data);
};

export default api;