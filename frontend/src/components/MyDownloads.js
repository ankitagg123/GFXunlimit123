import { useEffect, useState } from "react";
import axios from "axios";

function MyDownloads() {

  const [downloads, setDownloads] =
    useState([]);

  useEffect(() => {

    fetchDownloads();

  }, []);

  const fetchDownloads = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const res =
        await axios.get(
          `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/my-downloads`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      setDownloads(
        res.data
      );

    } catch (err) {

      console.error(err);

    }

  };

  return (

    <div
      style={{
        marginTop: "20px"
      }}
    >

      <h2>
        ⬇ My Downloads
      </h2>

      {downloads.length === 0 ? (

        <p>
          No downloads yet.
        </p>

      ) : (

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill,minmax(220px,1fr))",
            gap: "15px"
          }}
        >

          {downloads.map((image) => (

            <div
              key={
                image.id +
                image.downloaded_at
              }
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
                  ⬇ Downloaded
                </p>

                <p>
                  {new Date(
                    image.downloaded_at
                  ).toLocaleString()}
                </p>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}
export default MyDownloads;