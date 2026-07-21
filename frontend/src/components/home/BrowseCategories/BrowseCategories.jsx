import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./BrowseCategories.css";

const getLiveAssets = async () => {
  const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/images`);
  return Array.isArray(res.data?.images) ? res.data.images : [];
};

const collections = [
  { icon: "📷", title: "Photos", slug: "photos" },
  { icon: "🎨", title: "Vectors", slug: "vectors" },
  { icon: "🖌️", title: "PSD", slug: "psds" },
  { icon: "🎥", title: "Videos", slug: "videos" },
  { icon: "🖌", title: "Templates", slug: "templates" },
];

function BrowseCategories() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);

  const loadLiveAssets = async () => {
    try {
      const assets = await getLiveAssets();
      setImages(assets);
    } catch (err) {
      console.error("Failed to load live assets for homepage browse view", err);
    }
  };

  useEffect(() => {
    loadLiveAssets();

    const handleAssetUpdate = () => {
      window.setTimeout(() => {
        loadLiveAssets();
      }, 250);
    };

    window.addEventListener("asset-updated", handleAssetUpdate);
    window.addEventListener("asset-refresh", handleAssetUpdate);
    window.addEventListener("asset-updated-detail", handleAssetUpdate);
    window.addEventListener("home-assets-refresh", handleAssetUpdate);

    return () => {
      window.removeEventListener("asset-updated", handleAssetUpdate);
      window.removeEventListener("asset-refresh", handleAssetUpdate);
      window.removeEventListener("asset-updated-detail", handleAssetUpdate);
      window.removeEventListener("home-assets-refresh", handleAssetUpdate);
    };
  }, []);

  const getCollectionCount = (title) => {
    const normalizedTitle = title.toLowerCase();

    return (images || []).filter((image) => {
      const assetText = `${image.category || ""} ${image.collection || ""} ${image.title || ""}`.toLowerCase();

      if (normalizedTitle === "photos") {
        return assetText.includes("photo") || assetText.includes("photography") || assetText.includes("images");
      }

      if (normalizedTitle === "vectors") {
        return assetText.includes("vector") || assetText.includes("illustration");
      }

      if (normalizedTitle === "psd") {
        return assetText.includes("psd");
      }

      if (normalizedTitle === "videos") {
        return assetText.includes("video") || assetText.includes("animation") || assetText.includes("videos");
      }

      if (normalizedTitle === "templates") {
        return assetText.includes("template");
      }

      return false;
    }).length;
  };

  return (
    <section className="browse-categories">
      <h2>Browse Collections</h2>

      <p>
        Discover live approved assets for every project.
      </p>

      <div className="category-grid">
        {collections.map((collection) => {
          const count = getCollectionCount(collection.title);

          return (
            <div
              key={collection.title}
              className="category-card"
              onClick={() => navigate(`/${collection.slug}?collection=${encodeURIComponent(collection.title)}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="category-icon">{collection.icon}</div>
              <h3>{collection.title}</h3>
              <span>{count} Assets</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default BrowseCategories;