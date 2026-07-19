import "./TrendingAssets.css";

function TrendingImages({
  trendingImages,
  darkMode,
  fetchSingleImage,
}) {
  return (
    <>
      <h2
        style={{
          marginTop: "30px",
          marginBottom: "15px",
        }}
      >
        🔥 Trending Images
      </h2>

      <div className="trending-grid">
        {(trendingImages || []).map((image) => (
          <div
            key={`trending-${image.id}-${image.filename}`}
            onClick={() => fetchSingleImage(image.id)}
            className="trending-card"
            style={{ background: darkMode ? "#1e1e1e" : "white" }}
          >
            <img
              src={`${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/uploads/${image.filename}`}
              alt={image.title}
            />

            <div className="meta">
              <strong>{image.title}</strong>

              <p>
                ⬇ {image.downloads || 0}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default TrendingImages;