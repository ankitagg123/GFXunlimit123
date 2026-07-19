import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function MyUploads() {

  const [images, setImages] =
    useState([]);

  const [editingImage, setEditingImage] =
    useState(null);

  const [editTitle, setEditTitle] =
    useState("");

  const [editCategory, setEditCategory] =
    useState("");

  const [editKeywords, setEditKeywords] =
    useState("");

  useEffect(() => {

    fetchMyUploads();

  }, []);

  const fetchMyUploads =
    async () => {

      try {

        const token =
          localStorage.getItem("token");

        const res =
          await axios.get(
            `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/my-uploads`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        setImages(res.data);

      } catch (err) {

        console.error(err);

      }

    };

  const deleteImage = async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this image?"
      );

    if (!confirmDelete) return;

    try {

      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/images/${id}`
      );
      toast.success(
  "Image deleted successfully 🗑"
);

      setImages(
        images.filter(
          (img) => img.id !== id
        )
      );

    } catch (err) {

      console.error(err);

    }

  };

  const editImage = (image) => {

    setEditingImage(image);

    setEditTitle(image.title);

    setEditCategory(image.category);

    setEditKeywords(image.keywords);

  };

  const saveImage = async () => {

    try {

      await axios.put(

        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/images/${editingImage.id}`,

        {
          title: editTitle,
          category: editCategory,
          keywords: editKeywords
        }

      );

      fetchMyUploads();

      setEditingImage(null);

    } catch (err) {

      console.error(err);

    }

  };

  return (

    <div
      style={{
        marginTop: "20px",
        marginBottom: "30px"
      }}
    >
      

      <h2>My Uploads</h2>

      <p>
        Total Uploads: {images.length}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(220px,1fr))",
          gap: "15px"
        }}
      >

        {images.map((image) => (

          <div
            key={image.id}
            style={{
  border: "1px solid #444",
  borderRadius: "10px",
  overflow: "hidden",
  background: "#1e1e1e"
}}
          >

            <img
              src={`${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/uploads/${image.filename}`}
              alt={image.title}
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover"
              }}
            />

            <div
              style={{
                padding: "10px",
                color: "white"
              }}
            >

              <strong>
  {image.title}
</strong>

<p>
  📂 {image.category}
</p>

<p>
  🏷 {image.keywords}
</p>

<p>
  ❤️ {image.likes || 0}
</p>

              <p>
                👁 {image.views || 0}
              </p>

              <p>
                ⬇ {image.downloads || 0}
              </p>

              <button
                onClick={() =>
                  deleteImage(image.id)
                }
                style={{
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginTop: "10px"
                }}
              >
                🗑 Delete
              </button>

              <button
                onClick={() =>
                  editImage(image)
                }
                style={{
                  background: "#2196f3",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginTop: "10px",
                  marginLeft: "10px"
                }}
              >
                ✏ Edit
              </button>

            </div>

          </div>

        ))}

      </div>

      {editingImage && (

        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >

          <div
  style={{
    background: "#1e1e1e",
    color: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "400px"
  }}
>

            <h3>Edit Image</h3>

            <label>
  <strong>Title</strong>
</label>

<input
  value={editTitle}
  onChange={(e) =>
    setEditTitle(e.target.value)
  }
  style={{
    width: "100%",
    marginBottom: "15px",
    padding: "8px",
    background: "#333",
    color: "white",
    border: "1px solid #555",
  }}
/>

<label>
  <strong>Category</strong>
</label>

<input
  value={editCategory}
  onChange={(e) =>
    setEditCategory(e.target.value)
  }
  style={{
    width: "100%",
    marginBottom: "15px",
    padding: "8px",
    background: "#333",
    color: "white",
    border: "1px solid #555",
  }}
/>

<label>
  <strong>Keywords</strong>
</label>

<input
  value={editKeywords}
  onChange={(e) =>
    setEditKeywords(e.target.value)
  }
  style={{
    width: "100%",
    marginBottom: "15px",
    padding: "8px",
    background: "#333",
    color: "white",
    border: "1px solid #555",
  }}
/>

            <button
              onClick={saveImage}
            >
              Save
            </button>

            <button
              onClick={() =>
                setEditingImage(null)
              }
              style={{
                marginLeft: "10px"
              }}
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </div>

  );

}

export default MyUploads;