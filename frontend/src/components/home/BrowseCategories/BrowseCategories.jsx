import { useNavigate } from "react-router-dom";
import "./BrowseCategories.css";

const categories = [
  { icon: "📷", title: "Photos", slug: "photos" },
  { icon: "🎨", title: "Vectors", slug: "vectors" },
  { icon: "🖌️", title: "Psd's", slug: "psds" },
  { icon: "🎥", title: "Videos", slug: "videos" },
  { icon: "🖌", title: "Templates", slug: "templates" },
];

function BrowseCategories({ images = [] }) {
  const navigate = useNavigate();
  const getCategoryCount = (title) => {
    const normalizedTitle = title.toLowerCase();

    return (images || []).filter((image) => {
        const categoryText = `${image.category || ""} ${image.collection || ""} ${image.title || ""}`.toLowerCase();

        if (normalizedTitle === "photos") {
          return (
            categoryText.includes("photo") ||
            categoryText.includes("photography") ||
            categoryText.includes("images")
          );
        }

        if (normalizedTitle === "vectors") {
          return (
            categoryText.includes("vector") ||
            categoryText.includes("illustration")
          );
        }

        if (normalizedTitle === "psd's") {
          return categoryText.includes("psd");
        }

        if (normalizedTitle === "videos") {
          return (
            categoryText.includes("video") ||
            categoryText.includes("animation") ||
            categoryText.includes("videos")
          );
        return categoryText.includes("template");
      }

      return false;
    }).length;
  };

  return (
    <section className="browse-categories">
      <h2>Browse by Category</h2>

      <p>
        Find the perfect creative assets for every project.
      </p>

      <div className="category-grid">
        {categories.map((category) => {
          const count = getCategoryCount(category.title);

          return (
            <div
              key={category.title}
              className="category-card"
              onClick={() => navigate(`/${category.slug}?category=${encodeURIComponent(category.title)}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="category-icon">
                {category.icon}
              </div>

              <h3>{category.title}</h3>

              <span>{count} Assets</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default BrowseCategories;