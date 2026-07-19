function Navbar({
  showNotifications,
  setShowNotifications,
  notificationCount,
   setNotificationCount,
  setShowLoginModal,
  setShowJoinModal
}) {
  console.log(
  "NAVBAR COUNT:",
  notificationCount
);

  const token = localStorage.getItem("token");

  


  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("username");

    alert("Logged out");

    window.location.reload();

  };

  return (

    <div
      style={{
        background: "#111",
        color: "white",
        padding: "15px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        borderRadius: "10px",
      }}
    >

      <h2>
  Stock Photo Website
</h2>

      <div>

        {token ? (

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >

            <button
              onClick={async () => {

  setShowNotifications(
    !showNotifications
  );

  const username =
    localStorage.getItem(
      "username"
    );

  await fetch(
    `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/notifications/read/${username}`,
    {
      method: "PUT"
    }
  );

  setNotificationCount(0);

}}
              style={{
                padding: "8px 15px",
                background: "#ff9800",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              🔔 {notificationCount}
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: "8px 15px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>

          </div>

        ) : (

  <div
    style={{
      display: "flex",
      gap: "10px",
    }}
  >
    <button
  onClick={() => setShowLoginModal(true)}
  style={{
    padding: "8px 15px",
    background: "#2196f3",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  }}
>
  Login
</button>

    <button
  onClick={() => setShowJoinModal(true)}
  style={{
    padding: "8px 15px",
    background: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  }}
>
  Join
</button>
  </div>

)}

      </div>

    </div>

  );

}

export default Navbar;