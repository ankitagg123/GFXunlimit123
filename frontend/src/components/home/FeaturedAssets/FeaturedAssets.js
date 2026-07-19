import { useEffect, useState } from "react";
import axios from "axios";

function FeaturedImages({
  featuredImages,
  darkMode,
  fetchSingleImage,
}) {
  const [liveFeaturedImages, setLiveFeaturedImages] = useState([]);

  useEffect(() => {
    const loadFeaturedImages = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/images`);
        const assets = Array.isArray(res.data?.images) ? res.data.images : [];
        const sortedAssets = [...assets].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 4);
        setLiveFeaturedImages(sortedAssets);
      } catch (err) {
        console.error("Failed to load featured images", err);
      }
    };

    loadFeaturedImages();

    const handleRefresh = () => {
      window.setTimeout(() => {
        loadFeaturedImages();
      }, 250);
    };

    window.addEventListener("asset-updated", handleRefresh);
    window.addEventListener("asset-refresh", handleRefresh);
    window.addEventListener("home-assets-refresh", handleRefresh);

    return () => {
      window.removeEventListener("asset-updated", handleRefresh);
      window.removeEventListener("asset-refresh", handleRefresh);
      window.removeEventListener("home-assets-refresh", handleRefresh);
    };
  }, []);
  return (
    <>
      <h2
        style={{
          marginBottom: "15px",
          marginTop: "30px",
        }}
      >
        ⭐ Featured Images
      </h2>

      <div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "15px",
    marginBottom: "30px",
  }}
>
  {(liveFeaturedImages.length > 0 ? liveFeaturedImages : featuredImages || []).map((image) => (
    <div
      key={`featured-${image.id}-${image.filename}`}
      onClick={() => fetchSingleImage(image.id)}
      style={{
        cursor: "pointer",
        borderRadius: "15px",
        overflow: "hidden",
        background: darkMode
          ? "#1e1e1e"
          : "white",
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <img
        src={`${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/uploads/${image.filename}`}
        alt={image.title}
        style={{
          width: "100%",
          height: "180px",
          objectFit: "cover",
        }}
      />

      <div
        style={{
          padding: "10px",
        }}
      >
        <strong>{image.title}</strong>

        <p>⬇ {image.downloads || 0}</p>
      </div>
    </div>
  ))}
</div>
    </>
  );
}

export default FeaturedImages;