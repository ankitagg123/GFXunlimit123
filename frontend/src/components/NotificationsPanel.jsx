export default function NotificationsPanel({
  showNotifications,
  notifications,
  darkMode,
}) {
  if (!showNotifications) return null;

  return (
    <div
      style={{
        background: darkMode ? "#1e1e1e" : "white",
        padding: "20px",
        borderRadius: "15px",
        marginBottom: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <h2>🔔 Notifications</h2>

      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            style={{
              padding: "10px",
              borderBottom: "1px solid #ddd",
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: "500",
              }}
            >
              {n.message}
            </p>

            <small
              style={{
                color: "#888",
              }}
            >
              Notification #{n.id}
            </small>
          </div>
        ))
      )}
    </div>
  );
}