import { Routes, Route } from "react-router-dom";

import HomeSection from "./components/HomeSection";
import ExplorePage from "./pages/ExplorePage";
import FavoritesPage from "./pages/FavoritesPage";
import DownloadsPage from "./pages/DownloadsPage";
import UploadPage from "./pages/UploadPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";

export default function AppRouter(props) {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomeSection
            {...props.homeSectionProps}
          />
        }
      />

      <Route
        path="/explore"
        element={
          <ExplorePage />
        }
      />

      <Route
        path="/search"
        element={
          <ExplorePage />
        }
      />

      <Route
        path="/photos"
        element={
          <ExplorePage />
        }
      />

      <Route
        path="/vectors"
        element={
          <ExplorePage />
        }
      />

      <Route
        path="/psds"
        element={
          <ExplorePage />
        }
      />

      <Route
        path="/videos"
        element={
          <ExplorePage />
        }
      />

      <Route
        path="/templates"
        element={
          <ExplorePage />
        }
      />

      <Route
        path="/favorites"
        element={
          <FavoritesPage
            darkMode={props.darkMode}
            username={props.username}
          />
        }
      />

      <Route
        path="/downloads"
        element={
          <DownloadsPage
            darkMode={props.darkMode}
            username={props.username}
          />
        }
      />

      <Route
        path="/upload"
        element={
          <UploadPage
            darkMode={props.darkMode}
            username={props.username}
            fetchImages={props.fetchImages}
          />
        }
      />

      <Route
        path="/profile"
        element={
          <ProfilePage
            darkMode={props.darkMode}
            username={props.username}
          />
        }
      />

      <Route
        path="/dashboard"
        element={
          <DashboardPage
            dashboardProps={props.dashboardProps}
            darkMode={props.darkMode}
            userRole={props.userRole}
          />
        }
      />
    </Routes>
  );
}