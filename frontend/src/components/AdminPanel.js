import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Pagination from "./Pagination";
import { DEFAULT_WATCH_CONFIG } from "../utils/watchConfigOptions";

const CATEGORY_STORAGE_KEY = "asset-categories";
const DEFAULT_CATEGORY_OPTIONS = [
  { id: "default-images", name: "Images" },
  { id: "default-vector", name: "Vector/illustrations" },
  { id: "default-psd", name: "PSD" },
  { id: "default-videos", name: "Videos" },
  { id: "default-templates", name: "Templates" }
];

function AdminPanel() {
  const location = useLocation();
  const statusParam = new URLSearchParams(location.search).get("status") || "pending";
  const tabParam = new URLSearchParams(location.search).get("tab") || "";
  const statusFilter = statusParam.toLowerCase();

  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    keywords: "",
    description: "",
    type: ""
  });

  useEffect(() => {
    if (tabParam === "controls") {
      fetchCategories();
    } else {
      fetchImages();
    }
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, tabParam]);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/admin/images`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setImages(res.data.filter((image) => image.status?.toLowerCase() === statusFilter));
    } catch (err) {
      console.error(err);
    }
  };

  const getStoredCategories = () => {
    try {
      const cachedCategories = localStorage.getItem(CATEGORY_STORAGE_KEY);
      if (cachedCategories) {
        const parsed = JSON.parse(cachedCategories);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error("Invalid cached categories", err);
    }

    return DEFAULT_CATEGORY_OPTIONS;
  };

  const persistCategories = (nextCategories) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(nextCategories));
    }
  };


  const fetchCategories = async () => {
    const fallbackCategories = getStoredCategories();
    setCategories(fallbackCategories);
    persistCategories(fallbackCategories);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/admin/categories`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const nextCategories = Array.isArray(res.data) && res.data.length > 0 ? res.data : fallbackCategories;
      setCategories(nextCategories);
      persistCategories(nextCategories);
    } catch (err) {
      console.error(err);
      setCategories(fallbackCategories);
      persistCategories(fallbackCategories);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/admin/categories`,
        { name: newCategory.trim() },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCategories((prev) => {
        const nextCategories = [...prev, res.data];
        persistCategories(nextCategories);
        return nextCategories;
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("asset-categories-updated"));
      }
      setNewCategory("");
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCategory = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/admin/categories/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCategories((prev) => {
        const nextCategories = prev.filter((category) => category.id !== id);
        persistCategories(nextCategories);
        return nextCategories;
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("asset-categories-updated"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(images.length / pageSize));
  const pageImages = images.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleCategories = categories.length > 0 ? categories : DEFAULT_CATEGORY_OPTIONS;

  const openImage = (image) => {
    setSelectedImage(image);
    setIsEditing(false);
    setEditForm({
      title: image.title || "",
      category: image.category || "",
      keywords: image.keywords || "",
      description: image.description || "",
      type: image.type || ""
    });
  };

  const closeModal = () => {
    setSelectedImage(null);
    setIsEditing(false);
  };

  const setEditField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveDetails = async () => {
    if (!selectedImage) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/images/${selectedImage.id}`,
        {
          title: editForm.title,
          category: editForm.category,
          keywords: editForm.keywords
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const updated = res.data;
      const merged = {
        ...selectedImage,
        ...updated,
        description: editForm.description,
        type: editForm.type
      };

      setSelectedImage(merged);
      setImages((prev) => prev.map((image) => (image.id === merged.id ? merged : image)));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const approveImage = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/admin/approve/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchImages();
    } catch (err) {
      console.error(err);
    }
  };

  const rejectImage = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/admin/reject/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchImages();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteImage = async (id) => {
    const confirmDelete = window.confirm("Permanently delete this image?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/images/${id}`);
      fetchImages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Admin Panel</h2>

      {tabParam !== "controls" && <p>Total Images: {images.length}</p>}

      {tabParam === "controls" ? (
        <div
          style={{
            marginBottom: "30px",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            background: "#fafafa"
          }}
        >
          <h3>Upload Category Controls</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
            <input
              type="text"
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <button
              type="button"
              onClick={addCategory}
              style={{
                background: "#2196f3",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Add Category
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {visibleCategories.map((categoryItem) => (
              <div
                key={categoryItem.id}
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: "1px solid #ddd",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#111"
                }}
              >
                <span style={{ color: "#111", fontWeight: 600 }}>{categoryItem.name || "Unnamed category"}</span>
                <button
                  type="button"
                  onClick={() => deleteCategory(categoryItem.id)}
                  style={{
                    background: "#e53935",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

        </div>
      ) : (
        <>
          <div
            style={{
              marginBottom: "30px",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              background: "#fafafa"
            }}
          >
            <h3>Manage Categories</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {visibleCategories.map((categoryItem) => (
                <div
                  key={categoryItem.id}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#111"
                  }}
                >
                  <span style={{ color: "#111", fontWeight: 600 }}>{categoryItem.name || "Unnamed category"}</span>
                  <button
                    type="button"
                    onClick={() => deleteCategory(categoryItem.id)}
                    style={{
                      background: "#e53935",
                      color: "white",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(240px, 1fr))",
              gap: "20px",
              marginTop: "20px"
            }}
          >
            {pageImages.map((image) => (
              <div
                key={image.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  borderRadius: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  background: "#fff"
                }}
              >
                <img
                  src={`${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/uploads/${image.filename}`}
                  alt={image.title}
                  onClick={() => openImage(image)}
                  style={{
                    width: "100%",
                    minHeight: "150px",
                    maxHeight: "180px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                />

                <h4>{image.title}</h4>
                <p>Category: {image.category}</p>
                <p>Type: {image.type || "-"}</p>
                <p>Keywords: {image.keywords}</p>
                <p>Status: <strong>{image.status}</strong></p>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => openImage(image)}
                    style={{
                      background: "#2196f3",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => approveImage(image.id)}
                    style={{
                      background: "green",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => rejectImage(image.id)}
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    ❌ Reject
                  </button>
                  <button
                    onClick={() => deleteImage(image.id)}
                    style={{
                      background: "#333",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalImages={images.length}
            setCurrentPage={setCurrentPage}
          />

          {selectedImage && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "20px",
                zIndex: 1000
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "880px",
                  background: "white",
                  borderRadius: "12px",
                  overflow: "auto",
                  maxHeight: "90vh",
                  padding: "24px",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0 }}>{selectedImage.title}</h3>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        background: "#1976d2",
                        color: "white",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={closeModal}
                      style={{
                        background: "#eee",
                        color: "#222",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px", marginTop: "20px" }}>
                  <img
                    src={`${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/uploads/${selectedImage.filename}`}
                    alt={selectedImage.title}
                    style={{ width: "100%", borderRadius: "12px", objectFit: "cover", maxHeight: "420px" }}
                  />

                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {isEditing ? (
                      <>
                        <label>
                          Title
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditField("title", e.target.value)}
                            style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }}
                          />
                        </label>
                        <label>
                          Description
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditField("description", e.target.value)}
                            rows={5}
                            style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }}
                          />
                        </label>
                        <label>
                          Category
                          <input
                            type="text"
                            value={editForm.category}
                            onChange={(e) => setEditField("category", e.target.value)}
                            style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }}
                          />
                        </label>
                        <label>
                          Type
                          <input
                            type="text"
                            value={editForm.type}
                            onChange={(e) => setEditField("type", e.target.value)}
                            style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }}
                          />
                        </label>
                        <label>
                          Keywords
                          <input
                            type="text"
                            value={editForm.keywords}
                            onChange={(e) => setEditField("keywords", e.target.value)}
                            style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }}
                          />
                        </label>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <button
                            onClick={saveDetails}
                            style={{
                              background: "green",
                              color: "white",
                              border: "none",
                              padding: "10px 16px",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setEditForm({
                                title: selectedImage.title || "",
                                category: selectedImage.category || "",
                                keywords: selectedImage.keywords || "",
                                description: selectedImage.description || "",
                                type: selectedImage.type || ""
                              });
                            }}
                            style={{
                              background: "#eee",
                              color: "#222",
                              border: "none",
                              padding: "10px 16px",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p><strong>Description:</strong> {selectedImage.description || "Not provided"}</p>
                        <p><strong>Category:</strong> {selectedImage.category || "-"}</p>
                        <p><strong>Type:</strong> {selectedImage.type || "-"}</p>
                        <p><strong>Keywords:</strong> {selectedImage.keywords || "-"}</p>
                        <p><strong>Status:</strong> {selectedImage.status}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminPanel;
