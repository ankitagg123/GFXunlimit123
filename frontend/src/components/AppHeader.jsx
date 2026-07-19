import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AppHeader.css";
import { toast } from "react-toastify";

import LoginModal from "./LoginModal";
import JoinModal from "./JoinModal";
import NavigationMenu from "./dashboard/NavigationMenu";
import NotificationsPanel from "./NotificationsPanel";

export default function AppHeader({
  showNotifications,
  setShowNotifications,
  notificationCount,
  setNotificationCount,
  setShowLoginModal,
  setShowJoinModal,
  showLoginModal,
  showJoinModal,
  joinModalAccountType,
  setJoinModalAccountType,
  darkMode,
  notifications,
  setActivePage,
  setDarkMode,
  userRole,
}) {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const storedRole = (localStorage.getItem("userRole") || "").toLowerCase();
  const resolvedRole = (userRole || storedRole || "").toLowerCase();
  const isCustomerUser = !!token && resolvedRole === "customer";
  const isContributorUser = !!token && resolvedRole === "contributor";
  const isAdminUser = !!token && resolvedRole === "admin";

  const handleLogoClick = () => {
    if (setActivePage) {
      setActivePage("home");
    }
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    // Redirect to homepage and force a full reload so app state resets
    window.location.href = "/";
  };

  const handleNavigate = (path, page) => {
    if (setActivePage) {
      setActivePage(page);
    }
    navigate(path);
  };

  const handleSearch = (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    const trimmed = searchTerm.trim();
    const target = trimmed ? `/explore?type=${encodeURIComponent(trimmed)}` : "/explore";

    handleNavigate(target, "explore");
    setSearchTerm("");
  };

  const [showCreditsMenu, setShowCreditsMenu] = useState(false);
  const [creditsMessage, setCreditsMessage] = useState("");
  const creditsDropdownRef = useRef(null);

  useEffect(() => {
    if (!showCreditsMenu) return;

    const onDocClick = (e) => {
      if (
        creditsDropdownRef.current &&
        !creditsDropdownRef.current.contains(e.target)
      ) {
        setShowCreditsMenu(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showCreditsMenu]);

  const addCredits = async (amount) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/credits/add`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            credits: amount,
            payment_method: "manual",
            transaction_id: null,
            amount_paid: null,
            currency: "INR",
          }),
        }
      );

      setShowCreditsMenu(false);
      toast.success(`${amount} credits added successfully`);
      // notify other parts of the app (Profile) to refresh credits
      try {
        window.dispatchEvent(new Event('creditsUpdated'));
      } catch (err) {
        // ignore
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add credits");
    }
  };

  return (
    <>
      {/* =========================
          PREMIUM HEADER
      ========================== */}

      <header className={`app-header ${darkMode ? "dark" : ""}`}>
        <div className="app-header-container">
          <div
  className="logo"
  onClick={handleLogoClick}
  style={{ cursor: "pointer" }}
  role="button"
  tabIndex={0}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleLogoClick();
    }
  }}
>
  <span className="logo-red">GFX</span>
  <span className="logo-dark">
    unlimit
  </span>
</div>

          {isCustomerUser && (
            <div className="header-nav">
              <button
                className="nav-link-btn"
                onClick={() => handleNavigate("/explore", "explore")}
              >
                Explore
              </button>
              <button
                className="nav-link-btn"
                onClick={() => handleNavigate("/favorites", "favorites")}
              >
                My Collections
              </button>
              <input
                className="search-input"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search"
              />
              
              <button
                className="nav-link-btn"
                onClick={() => handleNavigate("/customer", "customer")}
              >
                My Account
              </button>
              <button
                className="nav-link-btn"
                onClick={() => handleNavigate("/profile", "profile")}
              >
                Profile
              </button>
              <div className="credits-dropdown credits-right" ref={creditsDropdownRef}>
                <button
                  className="nav-link-btn"
                  onClick={() => setShowCreditsMenu(!showCreditsMenu)}
                >
                  Add Credits
                </button>
                {showCreditsMenu && (
                  <div className={`credits-menu ${darkMode ? 'dark' : ''}`}>
                    <button onClick={() => addCredits(100)}>+100 Credits</button>
                    <button onClick={() => addCredits(200)}>+200 Credits</button>
                    <button onClick={() => addCredits(500)}>+500 Credits</button>
                    <button onClick={() => addCredits(1000)}>+1000 Credits</button>
                  </div>
                )}
              </div>
              <button
                className="nav-link-btn"
                onClick={() => {
                  handleNavigate('/payments', 'payments');
                  try {
                    window.dispatchEvent(new Event('paymentsRequested'));
                  } catch (err) {
                    // ignore
                  }
                }}
              >
                Payment History
              </button>
            </div>
          )}

          {isContributorUser && (
            <div className="header-nav">
              <button
                className="nav-link-btn"
                onClick={() => handleNavigate("/upload", "upload")}
              >
                Uploads
              </button>

              <button
                className="nav-link-btn"
                onClick={() => handleNavigate("/myuploads", "myuploads")}
              >
                My Uploads
              </button>

              <button
                className="nav-link-btn"
                onClick={() => handleNavigate("/dashboard?tab=earnings", "dashboard")}
              >
                Earnings
              </button>

              <button
                className="nav-link-btn"
                onClick={() => {
                  handleNavigate('/payments', 'payments');
                  try { window.dispatchEvent(new Event('paymentsRequested')); } catch (err) {}
                }}
              >
                Payment History
              </button>

              <button
                className="nav-link-btn"
                onClick={() => handleNavigate("/profile", "profile")}
              >
                Profile
              </button>

              <button
                className="nav-link-btn"
                onClick={() => handleNavigate("/favorites", "favorites")}
              >
                My Collection
              </button>
            </div>
          )}

          {isAdminUser && (
            <div className="header-nav">
              <button
                className="nav-link-btn"
                onClick={() => handleNavigate("/admin?status=pending", "admin")}
              >
                Pending
              </button>
              <button
                className="nav-link-btn"
                onClick={() => handleNavigate("/admin?status=reviewed", "admin")}
              >
                Reviewed
              </button>
              <button
                className="nav-link-btn"
                onClick={() => handleNavigate("/admin?status=approved", "admin")}
              >
                Approved
              </button>
              <button
                className="nav-link-btn"
                onClick={() => handleNavigate("/admin?status=rejected", "admin")}
              >
                Rejected
              </button>
              <button
                className="nav-link-btn"
                onClick={() => handleNavigate("/admin?tab=myaccount", "admin")}
              >
                My Account
              </button>
              <button
                className="nav-link-btn"
                onClick={() => handleNavigate("/profile", "profile")}
              >
                Profile
              </button>
              <button
                className="nav-link-btn"
                onClick={() => handleNavigate("/admin?tab=controls", "admin")}
              >
                Controls
              </button>
            </div>
          )}

          <div className="header-actions">
            <button
              className="darkmode-btn"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀ Light" : "🌙 Dark"}
            </button>

            {token && (
              <button className="darkmode-btn" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =========================
          LOGIN / REGISTER MODALS
      ========================== */}

      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <JoinModal
        show={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        accountType={joinModalAccountType}
        setAccountType={setJoinModalAccountType}
      />

      {/* =========================
          DASHBOARD NAVIGATION
      ========================== */}

      

      {/* =========================
          NOTIFICATIONS
      ========================== */}

      <NotificationsPanel
        showNotifications={showNotifications}
        notifications={notifications}
        darkMode={darkMode}
      />
    </>
  );
}