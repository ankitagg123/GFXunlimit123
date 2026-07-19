function FeaturedImages({
  featuredImages,
  darkMode,
  fetchSingleImage,
}) {
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
  {(featuredImages || []).map((image) => (
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