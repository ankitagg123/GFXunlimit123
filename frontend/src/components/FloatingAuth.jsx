import "./FloatingAuth.css";

export default function FloatingAuth({
  darkMode,
  setShowLoginModal,
  setShowJoinModal,
}) {
  const token = localStorage.getItem("token");

  if (token) return null;

  return (
    <div className="floating-auth">
      <button
        className="floating-login-btn"
        onClick={() => setShowLoginModal(true)}
      >
        Login
      </button>

      <button
        className="floating-join-btn"
        onClick={() => setShowJoinModal(true)}
      >
        Join Free
      </button>
    </div>
  );
}