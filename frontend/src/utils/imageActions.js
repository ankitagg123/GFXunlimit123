import axios from "axios";

export const likeImageRequest = async (id) => {
  return await axios.put(
    `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/images/${id}/like`
  );
};

export const downloadImageRequest = async (id) => {
  return await axios.put(
    `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/images/${id}/download`
  );
};

export const viewImageRequest = async (id) => {
  return await axios.put(
    `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/images/${id}/view`
  );
};