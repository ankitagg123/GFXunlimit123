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
    "Vectors",
    "Psd's",
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

  {[
    "All",
    "Nature",
    "Travel",
    "Business",
    "Technology",
    "People",
  ].map((collection) => (

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