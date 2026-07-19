import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header({
  totalImages,
  heroStats,
  trendingKeywords = [],
  setSearch,
  setShowJoinModal,
  setJoinModalAccountType,
}) {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const isLoggedIn = Boolean(
    typeof window !== "undefined" && localStorage.getItem("token")
  );

  const handleSearch = () => {
    const trimmed = searchText.trim();
    if (!trimmed) return;
    setSearch(trimmed);
    if (window.setActivePage) {
      window.setActivePage("explore");
    }
    navigate(`/search?type=${encodeURIComponent(trimmed)}`);
  };

  const handleExplore = () => {
    setSearch("");
    if (window.setActivePage) {
      window.setActivePage("explore");
    }
    navigate("/explore");
  };

  const handleContributorClick = () => {
    if (setJoinModalAccountType) {
      setJoinModalAccountType("contributor");
    }
    if (setShowJoinModal) {
      setShowJoinModal(true);
    }
  };

  return (
    <section className="hero">

      <div className="blob blob1"></div>
      <div className="blob blob2"></div>
      <div className="blob blob3"></div>

      <div className="hero-content">

        <div className="hero-badge">
          ✨ World's Next Creative Marketplace
        </div>

        <h1>
          Discover Millions of
          <br />
          Creative Stock Assets
        </h1>

        <p>
          Browse{" "}
          <strong>
            {Number(totalImages).toLocaleString()}+
          </strong>{" "}
          royalty-free photos, vectors,
          illustrations, PSD files,
          templates and creative assets
          from creators around the world.
        </p>

        <div className="hero-search">

          <input
            value={searchText}
            placeholder="Search photos, vectors, illustrations, PSD, templates..."
            onChange={(e) =>
              setSearchText(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button
            onClick={handleSearch}
          >
            🔍 Search
          </button>

        </div>

        {trendingKeywords.length > 0 && (

          <div className="hero-tags">

            <span className="tag-title">
              Trending
            </span>

            {trendingKeywords.map((item) => (

              <button
                key={item.keyword}
                className="hero-tag"
                onClick={() => {
                  setSearch(item.keyword);
                  if (window.setActivePage) {
                    window.setActivePage("explore");
                  }
                  navigate(`/search?type=${encodeURIComponent(item.keyword)}`);
                }}
              >
                {item.keyword}
              </button>

            ))}

          </div>

        )}

        <div className="hero-actions">

          <button
  className="primary-btn"
  onClick={handleExplore}
>
  Explore Assets
</button>

          {!isLoggedIn && (
            <button className="secondary-btn" onClick={handleContributorClick}>
              Become a Contributor
            </button>
          )}

        </div>

        <div className="hero-stats">

  <div>
    <h2>
      {heroStats?.totalAssets?.toLocaleString() || 0}
    </h2>
    <span>Total Assets</span>
  </div>

  <div>
    <h2>
      {heroStats?.totalSearches?.toLocaleString() || 0}
    </h2>
    <span>Total Searches</span>
  </div>

  <div>
    <h2>
      {heroStats?.totalDownloads?.toLocaleString() || 0}
    </h2>
    <span>Total Downloads</span>
  </div>

  <div>
    <h2>
      {heroStats?.todayVisitors?.toLocaleString() || 0}
    </h2>
    <span>Today's Visitors</span>
  </div>

</div>

      </div>

    </section>
  );
}

export default Header;