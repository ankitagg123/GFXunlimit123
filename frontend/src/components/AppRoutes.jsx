import { useLocation } from "react-router-dom";
import HomeSection from "./HomeSection";
import ExplorePage from "../pages/ExplorePage";
import FavoritesPage from "../pages/FavoritesPage";
import DownloadsPage from "../pages/DownloadsPage";
import UploadPage from "../pages/UploadPage";
import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";
import PaymentsPage from "../pages/PaymentsPage";
import ContributorPage from "../pages/ContributorPage";
import MyUploadsPage from "../pages/MyUploadsPage";
import AdminPage from "../pages/AdminPage";
import CompanyPage from "./CompanyPage";

export default function AppRoutes(props) {
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname === "/about") return <CompanyPage slug="about" />;
  if (pathname === "/pricing") return <CompanyPage slug="pricing" />;
  if (pathname === "/careers") return <CompanyPage slug="careers" />;
  if (pathname === "/contact") return <CompanyPage slug="contact" />;

  return (
    <>
      {/* HOME */}
      {props.activePage === "home" && (
        <HomeSection
          homePageProps={props.homeSectionProps.homePageProps}
        />
      )}

      {/* EXPLORE */}
      {props.activePage === "explore" && (
        <ExplorePage
          galleryProps={props.homeSectionProps.galleryProps}

          loading={props.homeSectionProps.containerProps.loading}

          filteredImages={props.homeSectionProps.containerProps.filteredImages}

          currentPage={props.homeSectionProps.containerProps.currentPage}

          totalPages={props.homeSectionProps.containerProps.totalPages}

          totalImages={props.homeSectionProps.containerProps.totalImages}

          setCurrentPage={props.homeSectionProps.containerProps.setCurrentPage}

          selectedImage={props.homeSectionProps.containerProps.selectedImage}

          setSelectedImage={props.homeSectionProps.containerProps.setSelectedImage}

          darkMode={props.homeSectionProps.containerProps.darkMode}

          relatedImages={props.homeSectionProps.containerProps.relatedImages}

          fetchSingleImage={props.homeSectionProps.containerProps.fetchSingleImage}

          goToPreviousImage={props.homeSectionProps.containerProps.goToPreviousImage}

          goToNextImage={props.homeSectionProps.containerProps.goToNextImage}

          likeImage={props.homeSectionProps.containerProps.likeImage}

          addFavorite={props.homeSectionProps.containerProps.addFavorite}

          downloadImage={props.homeSectionProps.containerProps.downloadImage}

          shareImage={props.homeSectionProps.containerProps.shareImage}

          selectedContributor={props.homeSectionProps.popupProps.selectedContributor}

          setSelectedContributor={props.homeSectionProps.popupProps.setSelectedContributor}

          contributorImages={props.homeSectionProps.popupProps.contributorImages}

          contributorLikes={props.homeSectionProps.popupProps.contributorLikes}

          contributorViews={props.homeSectionProps.popupProps.contributorViews}

          contributorDownloads={props.homeSectionProps.popupProps.contributorDownloads}

          contributorBestImage={props.homeSectionProps.popupProps.contributorBestImage}
        />
      )}

      {/* DASHBOARD */}
      {(props.activePage === "dashboard" || props.activePage === "customer") && (
        <DashboardPage
          dashboardProps={props.dashboardProps}
          darkMode={props.darkMode}
          userRole={props.userRole}
        />
      )}

      {/* FAVORITES */}
      {props.activePage === "favorites" && (
        <FavoritesPage
          darkMode={props.darkMode}
          username={props.username}
        />
      )}

      {/* DOWNLOADS */}
      {props.activePage === "downloads" && (
        <DownloadsPage
          darkMode={props.darkMode}
          username={props.username}
        />
      )}

      {/* UPLOAD */}
      {props.activePage === "upload" && (
        <UploadPage
          darkMode={props.darkMode}
          username={props.username}
          fetchImages={props.fetchImages}
        />
      )}

      {/* PROFILE */}
      {props.activePage === "profile" && (
        <ProfilePage
          darkMode={props.darkMode}
          username={props.username}
        />
      )}
      {props.activePage === "payments" && (
        <PaymentsPage />
      )}
      {props.activePage === "myuploads" && (
        <MyUploadsPage />
      )}
      {props.activePage === "admin" && (
        props.userRole === "admin" ? (
          <AdminPage />
        ) : (
          <div style={{ padding: 40 }}>
            <h2>Access denied</h2>
            <p>This page is for admins only. Please login as an admin to view this page.</p>
          </div>
        )
      )}
      {props.activePage === "contributor" && (
        props.userRole === "contributor" ? (
          <ContributorPage dashboardProps={props.dashboardProps} />
        ) : (
          <div style={{ padding: 40 }}>
            <h2>Access denied</h2>
            <p>This page is for contributors only. Please login as a contributor to view this page.</p>
          </div>
        )
      )}
    </>
  );
}