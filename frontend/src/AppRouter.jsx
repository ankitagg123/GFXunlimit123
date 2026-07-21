import { Routes, Route } from "react-router-dom";

import HomeSection from "./components/HomeSection";
import ExplorePage from "./pages/ExplorePage";
import FavoritesPage from "./pages/FavoritesPage";
import DownloadsPage from "./pages/DownloadsPage";
import UploadPage from "./pages/UploadPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import CompanyPage from "./components/CompanyPage";
import AdminEmailSettings from "./pages/AdminEmailSettings";
import AdminEmailTemplates from "./pages/AdminEmailTemplates";
import AdminEmailLogs from "./pages/AdminEmailLogs";
import AdminEmailQueue from "./pages/AdminEmailQueue";
import AdminNewsletter from "./pages/AdminNewsletter";
import AdminNotificationRules from "./pages/AdminNotificationRules";
import AdminEmailAnalytics from "./pages/AdminEmailAnalytics";

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

      <Route path="/about" element={<CompanyPage slug="about" />} />
      <Route path="/pricing" element={<CompanyPage slug="pricing" />} />
      <Route path="/careers" element={<CompanyPage slug="careers" />} />
      <Route path="/contact" element={<CompanyPage slug="contact" />} />
      <Route path="/admin/email" element={<AdminEmailSettings />} />
      <Route path="/admin/email/templates" element={<AdminEmailTemplates />} />
      <Route path="/admin/email/logs" element={<AdminEmailLogs />} />
      <Route path="/admin/email/queue" element={<AdminEmailQueue />} />
      <Route path="/admin/newsletter" element={<AdminNewsletter />} />
      <Route path="/admin/notification-rules" element={<AdminNotificationRules />} />
      <Route path="/admin/email/analytics" element={<AdminEmailAnalytics />} />
      <Route path="/admin/email/scheduled" element={<AdminEmailScheduled />} />
    </Routes>
  );
}