function Pagination(props) {
  const {
    currentPage,
    totalPages,
    totalImages,
    setCurrentPage,
  } = props;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginTop: "30px",
        flexWrap: "wrap",
      }}
    >
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(1)}
      >
        ⏮ First
      </button>

      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        ◀ Prev
      </button>

      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentPage(index + 1)}
          style={{
            fontWeight:
              currentPage === index + 1
                ? "bold"
                : "normal",
            background:
              currentPage === index + 1
                ? "#2196f3"
                : "",
            color:
              currentPage === index + 1
                ? "white"
                : "",
            borderRadius: "5px",
            margin: "0 3px",
          }}
        >
          {index + 1}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() =>
          setCurrentPage(currentPage + 1)
        }
      >
        Next ▶
      </button>

      <button
        disabled={currentPage === totalPages}
        onClick={() =>
          setCurrentPage(totalPages)
        }
      >
        Last ⏭
      </button>

      <p
        style={{
          marginTop: "15px",
          textAlign: "center",
          fontWeight: "bold",
          width: "100%",
        }}
      >
        Page {currentPage} of {totalPages}
      </p>

      <p
        style={{
          textAlign: "center",
          width: "100%",
        }}
      >
        Total Images: {totalImages}
      </p>
    </div>
  );
}

export default Pagination;