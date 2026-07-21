import React from "react";

export default function EmailActionButton({ icon, label, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "13px 14px",
        borderRadius: "14px",
        background: color,
        color: "white",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontWeight: 600
      }}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}
