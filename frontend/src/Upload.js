import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { limitWords, formatKeywords } from "./utils/uploadInputLimits";
import {
  DEFAULT_WATCH_CONFIG,
  WATCH_CONFIG_STORAGE_KEY,
  WATCH_COUNTRY_OPTIONS
} from "./utils/watchConfigOptions";

const CATEGORY_STORAGE_KEY = "asset-categories";
const COLLECTION_STORAGE_KEY = "asset-collections";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const DEFAULT_CATEGORY_OPTIONS = [
  { id: "default-images", name: "Images" },
  { id: "default-vector", name: "Vector/illustrations" },
  { id: "default-psd", name: "PSD" },
  { id: "default-videos", name: "Videos" },
  { id: "default-templates", name: "Templates" }
];

function Upload({ fetchImages }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [collection, setCollection] = useState("");
  const [availableCollections, setAvailableCollections] = useState([]);
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [image, setImage] = useState(null);
  const [watchConfig, setWatchConfig] = useState(DEFAULT_WATCH_CONFIG);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [liveTime, setLiveTime] = useState(new Date());

  // 🧠 cleanup preview URL to avoid memory leak
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
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

    const loadCategories = async () => {
      const fallbackCategories = getStoredCategories();
      setAvailableCategories(fallbackCategories);

      try {
        const res = await axios.get(
          `${API_BASE_URL}/categories`
        );
        const categories = Array.isArray(res.data) && res.data.length > 0 ? res.data : fallbackCategories;
        setAvailableCategories(categories);
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
      } catch (err) {
        console.error("Failed to load categories", err);
        setAvailableCategories(fallbackCategories);
      }
    };

    const loadCollections = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/collections`
        );
        const collections = Array.isArray(res.data) ? res.data : [];
        setAvailableCollections(collections);
        localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(collections));
      } catch (err) {
        console.error("Failed to load collections", err);
        try {
          const cachedCollections = localStorage.getItem(COLLECTION_STORAGE_KEY);
          if (cachedCollections) {
            const parsed = JSON.parse(cachedCollections);
            if (Array.isArray(parsed)) {
              setAvailableCollections(parsed);
            }
          }
        } catch (cacheErr) {
          console.error("Invalid cached collections", cacheErr);
        }
      }
    };

    const getStoredWatchConfig = () => {
      try {
        const cached = localStorage.getItem(WATCH_CONFIG_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalized = parsed
              .map((watch) => {
                if (watch && typeof watch === "object") {
                  const matchedOption = WATCH_COUNTRY_OPTIONS.find(
                    (option) => option.timezone === watch.timezone || option.label === watch.label
                  );
                  return matchedOption || watch;
                }
                return null;
              })
              .filter(Boolean)
              .slice(0, 7);

            if (normalized.length > 0) {
              return normalized;
            }
          }
        }
      } catch (err) {
        console.error("Invalid watch config", err);
      }
      return DEFAULT_WATCH_CONFIG;
    };

    const loadWatchConfig = () => {
      const config = getStoredWatchConfig();
      setWatchConfig(config);
    };

    loadCategories();
    loadCollections();
    loadWatchConfig();

    const handleCategoryUpdate = () => {
      loadCategories();
    };

    const handleCollectionUpdate = () => {
      loadCollections();
    };

    const handleWatchConfigUpdate = (event) => {
      if (event?.detail) {
        setWatchConfig(event.detail);
        return;
      }
      loadWatchConfig();
    };

    const handleStorageUpdate = (event) => {
      if (event.key === CATEGORY_STORAGE_KEY) {
        loadCategories();
      }
      if (event.key === WATCH_CONFIG_STORAGE_KEY) {
        loadWatchConfig();
      }
    };

    window.addEventListener("asset-categories-updated", handleCategoryUpdate);
    window.addEventListener("asset-collections-updated", handleCollectionUpdate);
    window.addEventListener("asset-watch-config-updated", handleWatchConfigUpdate);
    window.addEventListener("watch-config-updated", handleWatchConfigUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("asset-categories-updated", handleCategoryUpdate);
      window.removeEventListener("asset-collections-updated", handleCollectionUpdate);
      window.removeEventListener("asset-watch-config-updated", handleWatchConfigUpdate);
      window.removeEventListener("watch-config-updated", handleWatchConfigUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    const trimmedTitle = limitWords(title, 5);
    const trimmedDescription = limitWords(description, 10);
    const trimmedKeywords = formatKeywords(keywords, 14);

    if (!image || !trimmedTitle || category.length === 0 || !trimmedKeywords) {
      alert("All fields are required");
      return;
    }

    const formData = new FormData();

    formData.append("title", trimmedTitle);
    formData.append("category", category.join(","));
    formData.append("collection", collection);
    formData.append("keywords", trimmedKeywords);
    formData.append("description", trimmedDescription);
    formData.append("type", type);
    formData.append("image", image);

    try {
      setLoading(true);
setUploadProgress(0);

      const res = await axios.post(
  `${API_BASE_URL}/upload`,
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`
    },

    onUploadProgress: (progressEvent) => {
      const percentCompleted =
        Math.round(
          (progressEvent.loaded * 100) /
          progressEvent.total
        );

      setUploadProgress(
        percentCompleted
      );
    }
  }
);

console.log("UPLOAD SUCCESS:", res.data);
setUploadProgress(100);
      toast.success(
  "Image uploaded successfully!"
);

      fetchImages();

      // reset form safely
      setTitle("");
      setCategory([]);
      setCollection("");
      setType("");
      setDescription("");
      setKeywords("");
      setImage(null);

      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(null);

    } catch (err) {
      console.error(err);

      toast.error(
  err?.response?.data ||
  "Upload failed"
);
    } finally {

  setLoading(false);

  setTimeout(() => {
    setUploadProgress(0);
  }, 1500);

}
  };

  const isDisabled =
    !title || category.length === 0 || !keywords || !image || loading;

  const handleCategorySelection = (index, value) => {
    setCategory((prev) => {
      const next = [...prev];
      next[index] = value;
      return next.filter(Boolean);
    });
  };

  const getCategoryOptions = (index) => {
    const selectedInOtherField = index === 0 ? category[1] : category[0];
    return availableCategories.filter((option) => option.name !== selectedInOtherField);
  };

  const handleTitleChange = (e) => {
    setTitle(limitWords(e.target.value, 5));
  };

  const handleDescriptionChange = (e) => {
    setDescription(limitWords(e.target.value, 10));
  };

  const handleKeywordChange = (e) => {
    setKeywords(e.target.value);
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const formatted = formatKeywords(keywords, 14);
      setKeywords(formatted);
    }
  };

  return (
    <>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "30px",
          background: "#fff",
        }}
      >
        <h2>Upload Image</h2>

      <form onSubmit={handleUpload}>

        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
          <div style={{ flex: "0 0 220px", width: "220px" }}>
            <input
              type="text"
              placeholder="Title (max 5 words)"
              value={title}
              onChange={handleTitleChange}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
          </div>
          <div style={{ flex: "1 1 260px", minWidth: "220px" }}>
            <textarea
              placeholder="Description (max 10 words)"
              value={description}
              onChange={handleDescriptionChange}
              rows={1}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", minHeight: "42px", resize: "vertical" }}
            />
          </div>
          <div style={{ flex: "1 1 260px", minWidth: "220px" }}>
            <input
              type="text"
              placeholder="Keywords (max 14 words, Press Tab key to set Auto - format)"
              value={keywords}
              onChange={handleKeywordChange}
              onKeyDown={handleKeywordKeyDown}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
          </div>
        </div>

        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontWeight: "600",
          }}
        >
          Category (1 required, 2 max)
        </label>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "10px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "220px" }}>
            <select
              value={category[0] || ""}
              onChange={(e) => handleCategorySelection(0, e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
              }}
            >
              <option value="">Select primary category</option>
              {getCategoryOptions(0).map((categoryOption) => (
                <option key={categoryOption.id} value={categoryOption.name}>
                  {categoryOption.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: "220px" }}>
            <select
              value={category[1] || ""}
              onChange={(e) => handleCategorySelection(1, e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
              }}
            >
              <option value="">Select optional category</option>
              {getCategoryOptions(1).map((categoryOption) => (
                <option key={categoryOption.id} value={categoryOption.name}>
                  {categoryOption.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "220px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
              }}
            >
              Collection
            </label>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                background: "#fff",
              }}
            >
              <option value="">Select Collection</option>
              {availableCollections.map((collectionOption) => (
                <option key={collectionOption.id || collectionOption.name} value={collectionOption.name}>
                  {collectionOption.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: "220px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
              }}
            >
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                background: "#fff",
              }}
            >
              <option value="">Select Type</option>
              <option value="commercial">Commercial</option>
              <option value="editorial">Editorial</option>
            </select>
          </div>
        </div>

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.svg,.psd,.mp4,.mov,.avi,.mkv,.zip"
          onChange={(e) => {
            const file = e.target.files[0];

            if (!file) return;

            setImage(file);

            const url = URL.createObjectURL(file);

            setPreview(url);
          }}
          style={{
            marginBottom: "10px",
          }}
        />


        {preview && (
          <div style={{ marginBottom: "20px" }}>
            <img
              src={preview}
              alt="Preview"
              width="300"
              style={{ borderRadius: "10px" }}
            />
          </div>
        )}
{loading && (

  <div
    style={{
      marginBottom: "20px",
    }}
  >

    <div
      style={{
        width: "100%",
        height: "20px",
        background: "#ddd",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >

      <div
        style={{
          width: `${uploadProgress}%`,
          height: "100%",
          background: "#4caf50",
          transition: "0.3s",
        }}
      />

    </div>

    <p
      style={{
        marginTop: "8px",
        fontWeight: "bold",
      }}
    >
      Uploading...
      {" "}
      {uploadProgress}%
    </p>

  </div>

)}
        <button
          type="submit"
          disabled={isDisabled}
          style={{
            padding: "10px 20px",
            background: isDisabled ? "gray" : "#111",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isDisabled ? "not-allowed" : "pointer",
            marginTop: "20px",
          }}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

      </form>
      </div>

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 20,
          background: "rgba(0, 0, 0, 0.18)",
          backdropFilter: "blur(8px)",
          padding: "18px 16px 22px",
          display: "flex",
          justifyContent: "center",
          gap: "85px",
          flexWrap: "nowrap",
          overflowX: "auto",
        }}
      >
        <style>{`
          @keyframes rainbowSweep {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
        `}</style>
        {watchConfig.map((watch, index) => {
          return (
            <div
              key={watch.label}
              style={{
                width: "190px",
                minWidth: "190px",
                padding: "8px",
                borderRadius: "32px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.16)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 12px 28px rgba(0,0,0,0.24)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "230px",
                  borderRadius: "26px",
                  background: "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -8px 16px rgba(0,0,0,0.45)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "14px",
                  textAlign: "center",
                  color: "#ffffff",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "10px",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#d8d8d8",
                    fontWeight: 700,
                  }}
                >
                  <span style={{ fontSize: "16px" }}>{watch.flag}</span>
                  {watch.label}
                </div>
                <div
                  style={{
                    fontSize: "34px",
                    fontWeight: 800,
                    letterSpacing: "0.4px",
                    lineHeight: 1.05,
                    color: "#f8f8f8",
                    marginBottom: "10px",
                  }}
                >
                  {liveTime.toLocaleTimeString("en-IN", {
                    timeZone: watch.timezone,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.85)",
                    letterSpacing: "0.8px",
                  }}
                >
                  {liveTime.toLocaleDateString("en-IN", {
                    timeZone: watch.timezone,
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Upload;