import { useEffect, useState } from "react";
import axios from "axios";

function MyFavorites() {

  const [favorites, setFavorites] =
    useState([]);

  useEffect(() => {

    fetchFavorites();

  }, []);

  const fetchFavorites = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const res =
        await axios.get(
          `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/favorites`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      setFavorites(res.data);

    } catch (err) {

      console.error(err);

    }

  };
  const removeFavorite = async (imageId) => {

  try {

    const token =
      localStorage.getItem("token");

    await axios.delete(
      `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/favorites/${imageId}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    setFavorites(
      favorites.filter(
        (img) => img.id !== imageId
      )
    );

  } catch (err) {

    console.error(err);

  }

};

  return (

    <div style={{ marginTop: "20px" }}>

      <h2>⭐ My Favorites</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(220px,1fr))",
          gap: "15px"
        }}
      >

        {favorites.length === 0 ? (

          <p>No favorite images yet.</p>

        ) : (

          favorites.map((image, index) => (

            <div
              key={`favorite-${image.id}-${index}`}
              style={{
                background: "#1e1e1e",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.1)"
              }}
            >

              <img
                src={`${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/uploads/${image.filename}`}
                alt={image.title}
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover"
                }}
              />

              <div
  style={{
    padding: "10px",
    color: "white"
  }}
>

                <strong>
                  {image.title}
                </strong>

                <p>
                  ❤️ {image.likes || 0}
                </p>

                <p>
                  ⬇ {image.downloads || 0}
                </p>
                <button
  onClick={() =>
    removeFavorite(image.id)
  }
  style={{
    marginTop: "10px",
    padding: "8px 12px",
    background: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }}
>
  ❌ Remove
</button>

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );

}

export default MyFavorites;