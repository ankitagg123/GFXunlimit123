function ImageGrid(props) {

 const {
  filteredImages,
  darkMode,
  fetchSingleImage,
  likeImage,
  addFavorite,
  downloadImage,
  shareImage,
} = props;

  return (
  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fill, minmax(320px, 1fr))",
      gap: "25px",
    }}
  >
    {filteredImages.map((image) => (

      <div
  key={`featured-${image.id}-${image.filename}`}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-5px)";
    e.currentTarget.style.boxShadow =
      "0 12px 25px rgba(0,0,0,0.18)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow =
      "0 6px 18px rgba(0,0,0,0.1)";
  }}
  style={{
    borderRadius: "18px",
    overflow: "hidden",
    background: darkMode ? "#1e1e1e" : "white",
    boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
    transition: "0.3s",
  }}
>
  <img
    src={`${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/uploads/${image.filename}`}
    alt={image.title}
    width="100%"
    onClick={() => fetchSingleImage(image.id)}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "scale(1.08)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "scale(1)";
    }}
    style={{
      height: "250px",
      objectFit: "cover",
      cursor: "pointer",
      transition: "0.4s",
    }}
  />

  <div
  style={{
    padding: "15px",
  }}
>
  <h3>{image.title}</h3>

  <p>
    📂 {image.category}
  </p>

  <p>
    📁 {image.collection || "General"}
  </p>

  <p
    style={{
      color: "red",
      fontWeight: "bold",
    }}
  >
    👤 {image.uploaded_by}
  </p>

  <p>
    🏷 {image.keywords}
  </p>

  <p>
    ❤️ {image.likes || 0}
    {" "}
    | 👁 {image.views || 0}
  </p>

  <p>
    ⬇ {image.downloads || 0}
  </p>

  <p>
    📅{" "}
    {new Date(image.created_at).toLocaleDateString()}
  </p>
  <div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  }}
>
  <button
    onClick={() => likeImage(image.id)}
    style={{
      flex: 1,
      padding: "10px",
      background: "hotpink",
      color: "white",
      border: "none",
      borderRadius: "8px",
    }}
  >
    ❤️ Like
  </button>

  <button
    onClick={() => addFavorite(image.id)}
    style={{
      flex: 1,
      padding: "10px",
      background: "#ff5722",
      color: "white",
      border: "none",
      borderRadius: "8px",
    }}
  >
    ⭐ Favorite
  </button>

  <button
    onClick={() => downloadImage(image)}
    style={{
      flex: 1,
      padding: "10px",
      background: "#2196f3",
      color: "white",
      border: "none",
      borderRadius: "8px",
    }}
  >
    ⬇ Download
  </button>

  <button
    onClick={() => shareImage(image)}
    style={{
      padding: "10px 15px",
      background: "#9c27b0",
      color: "white",
      border: "none",
      borderRadius: "8px",
    }}
  >
    📤 Share
  </button>
</div>
</div>
</div>

    ))}
  </div>
);

}

export default ImageGrid;