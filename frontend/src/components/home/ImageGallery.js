import { useEffect, useState } from "react";
import axios from "axios";

function ImageGallery(props) {

  const {
    search,
    setSearch,
    setCurrentPage,
    sortType,
setSortType,
selectedCategory,
setSelectedCategory,
selectedCollection,
setSelectedCollection,
  } = props;

  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/collections`);
        const nextCollections = Array.isArray(res.data) ? res.data.map((item) => item.name).filter(Boolean) : [];
        setCollections(nextCollections);
      } catch (err) {
        console.error("Failed to load collections", err);
      }
    };

    loadCollections();
  }, []);

  return (
    <>
      {/* SEARCH */}

      <input
        type="text"
        placeholder="Search images..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        style={{
          width: "100%",
          padding: "14px",
          marginBottom: "20px",
          borderRadius: "12px",
          border: "1px solid #ccc",
        }}
      />
      {/* SORT */}

<select
  value={sortType}
  onChange={(e) => {
    setSortType(e.target.value);
    setCurrentPage(1);
  }}
  style={{
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "20px",
  }}
>
  <option value="newest">
    Newest First
  </option>

  <option value="oldest">
    Oldest First
  </option>

  <option value="likes">
    Most Liked
  </option>

  <option value="downloads">
    Most Downloaded
  </option>

  <option value="views">
    Most Viewed
  </option>
</select>
{/* CATEGORY */}

<h3 style={{ marginBottom: "10px" }}>
  📂 Categories
</h3>

<div
  style={{
    marginBottom: "25px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  }}
>
  {[
    "All",
    "Photos",
    "PSD",
    "Videos",
    "Templates",
  ].map((cat) => (

    <button
      key={cat}
      onClick={() => {
        setSelectedCategory(cat);
        setCurrentPage(1);
      }}
      style={{
        padding: "10px 18px",
        borderRadius: "30px",
        border: "none",
        cursor: "pointer",
        background:
          selectedCategory === cat
            ? "#2196f3"
            : "#ddd",
        color:
          selectedCategory === cat
            ? "white"
            : "black",
      }}
    >
      {cat}
    </button>

  ))}
</div>
{/* COLLECTION */}

<h3 style={{ marginBottom: "10px" }}>
  📁 Collections
</h3>

<div
  style={{
    marginBottom: "25px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  }}
>

  {["All", ...collections].map((collection) => (

    <button
      key={collection}
      onClick={() => {
        setSelectedCollection(collection);
        setCurrentPage(1);
      }}
      style={{
        padding: "10px 18px",
        borderRadius: "30px",
        border: "none",
        cursor: "pointer",
        background:
          selectedCollection === collection
            ? "#4caf50"
            : "#ddd",
        color:
          selectedCollection === collection
            ? "white"
            : "black",
      }}
    >
      📁 {collection}
    </button>

  ))}

</div>
    </>
  );
}

export default ImageGallery;