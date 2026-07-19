import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import useDashboardImages from "./hooks/useDashboardImages";
import HomePage from "./pages/HomePage";
import FloatingAuth from "./components/FloatingAuth";
import AppRoutes from "./components/AppRoutes";
import useLeaderboard from "./hooks/useLeaderboard";
import useDashboard from "./hooks/useDashboard";
import useContributorPage from "./hooks/useContributorPage";
import useNotifications from "./hooks/useNotifications";
import useImageActions from "./hooks/useImageActions";
import useTrendingKeywords from "./hooks/useTrendingKeywords";
import useImages from "./hooks/useImages";
import useContributorStats from "./hooks/useContributorStats";
import useEarnings from "./hooks/useEarnings";
import useFilteredImages from "./hooks/useFilteredImages";
import useKeyboardNavigation from "./hooks/useKeyboardNavigation";
import useImageNavigation from "./hooks/useImageNavigation";
import useContributorPopup from "./hooks/useContributorPopup";
import useContributorPageStats from "./hooks/useContributorPageStats";
import AppHeader from "./components/AppHeader";
import useNotificationLoader from "./hooks/useNotificationLoader";
import useContributorNavigation from "./hooks/useContributorNavigation";
import Footer from "./components/Footer";
import useHeroStats from "./hooks/useHeroStats";
import AnalyticsDashboard from "./components/dashboard/AnalyticsDashboard";
import useProfile from "./hooks/useProfile";
import useGalleryNavigation from "./hooks/useGalleryNavigation";
import HomePageContainer from "./pages/HomePageContainer";
import DashboardContainer from "./pages/DashboardContainer";
import HomeSection from "./components/HomeSection";
import FavoritesPage from "./pages/FavoritesPage";
import DownloadsPage from "./pages/DownloadsPage";
import UploadPage from "./pages/UploadPage";
import ProfilePage from "./pages/ProfilePage";




import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";
import { ToastContainer } from "react-toastify";
import useMonthlyDownloads from "./hooks/useMonthlyDownloads";
import "react-toastify/dist/ReactToastify.css";
import { applyTheme, getInitialDarkMode } from "./utils/theme";

function App() {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const username =
  localStorage.getItem(
    "username"
  );
  
  const [userRole, setUserRole] =
  useState("");
  useProfile(setUserRole);

/* =========================================
   IMAGE DATA
========================================= */
  const [images, setImages] = useState([]);
  
  const [leaderboard, setLeaderboard] =
  useState([]);
  const heroStats =
useHeroStats();
useEffect(() => {
  if (process.env.NODE_ENV === "test") return;

  axios.post(
    `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/track-visitor`
  );

}, []);
  const [monthlyDownloads, setMonthlyDownloads] = useState([]);
  useMonthlyDownloads(setMonthlyDownloads);
  
  const [activePage, setActivePage] =
useState("home");
window.setActivePage = setActivePage;
/* =========================================
   NOTIFICATIONS
========================================= */
  const [notifications, setNotifications] =
  useState([]);
  const [notificationCount, setNotificationCount] =
  useState(0);
  const {
  notifySuccess,
  notifyError,
  clearAllNotifications,
} = useNotifications(
  setNotifications,
  setNotificationCount
);

const [showNotifications, setShowNotifications] =
  useState(false);
  const [totalLikes, setTotalLikes] =
  useState(0);

  /* =========================================
   AUTHENTICATION
========================================= */
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinModalAccountType, setJoinModalAccountType] = useState("");

const [totalDownloads, setTotalDownloads] =
  useState(0);

const [totalViews, setTotalViews] =
  useState(0);
  /* =========================================
   GALLERY
========================================= */
  const [search, setSearch] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("type") || "";
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category") || "All";
    return categoryParam;
  });
    const [selectedCollection, setSelectedCollection] =
  useState("All");

  const [selectedImage, setSelectedImage] =
    useState(null);
    const {
  likeImage: hookLikeImage,
  addFavorite: hookAddFavorite,
  downloadImage: hookDownloadImage,
  shareImage: hookShareImage,
} = useImageActions({
  images,
  setImages,
  selectedImage,
  setSelectedImage,
  notifySuccess,
  notifyError,
});

/* =========================================
   CONTRIBUTOR
========================================= */
    const [selectedContributor, setSelectedContributor] =
  useState(null);
  const {
  viewContributorPage,
  setViewContributorPage,
  testSetContributor,
} = useContributorNavigation();
    const [relatedImages, setRelatedImages] =
  useState([]);
/*******************************************
   UI SETTINGS
********************************************/
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

  const [sortType, setSortType] =
    useState("newest");

  const [loading, setLoading] =
    useState(true);
    const [currentPage, setCurrentPage] =
  useState(1);
  const [totalPages, setTotalPages] =
  useState(1);
  // NOW call the hook
  const [totalImages, setTotalImages] =
  useState(0);

const imagesPerPage = 12;
useLeaderboard(
  currentPage,
  setLeaderboard
);
const {
  fetchImages,
  fetchSingleImage,
} = useImages({
  currentPage,
  imagesPerPage,
  images,
  setImages,
  setLoading,
  setTotalImages,
  setTotalLikes,
  setTotalDownloads,
  setTotalViews,
  setTotalPages,
  selectedImage,
  setSelectedImage,
  setRelatedImages,
});
  /* =========================================
   DASHBOARD
========================================= */
  const {
  dashboardStats,
  fetchDashboardStats,
} = useDashboard();
  const [earningsStats, setEarningsStats] =
  useState({
    total_earnings: 0,
    total_downloads: 0,
    total_images: 0
  });
const {
  contributorRank,
  nextRank,
  maxUploads,
  contributorXP,
  contributorLevel,
  currentLevelXP,
  avgDownloadsPerImage,
  likeRate,
  viewDownloadRate,
  reputationScore,
  reputationTier,
  rawScore,
  monthsOld,
} = useContributorStats(
  dashboardStats
);

const nextLevelXP = 100;
const earningsChartData = [
  {
    month: "Jan",
    earnings: 20,
  },
  {
    month: "Feb",
    earnings: 35,
  },
  {
    month: "Mar",
    earnings: 50,
  },
  {
    month: "Apr",
    earnings: 80,
  },
  {
    month: "May",
    earnings: 120,
  },
  {
    month: "Jun",
    earnings: 180,
  },
];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nextSearch = params.get("type") || "";
    const nextCategory = params.get("category") || "All";
    const pathCategoryMap = {
      "/photos": "Photos",
      "/vectors": "Vectors",
      "/psds": "Psd's",
      "/videos": "Videos",
      "/templates": "Templates",
    };
    const nextPathCategory = pathCategoryMap[location.pathname] || nextCategory;
    setSearch(nextSearch);
    setSelectedCategory(nextPathCategory);
  }, [location.search, location.pathname]);

  useEffect(() => {
    const path = location.pathname;

    if (path === "/") {
      setActivePage("home");
      return;
    }

    if (
      path === "/explore" ||
      path === "/search" ||
      ["/photos", "/vectors", "/psds", "/videos", "/templates"].includes(path)
    ) {
      setActivePage("explore");
      return;
    }

    if (path === "/favorites") {
      setActivePage("favorites");
      return;
    }

    if (path === "/downloads") {
      setActivePage("downloads");
      return;
    }

    if (path === "/upload") {
      setActivePage("upload");
      return;
    }

    if (path === "/profile") {
      setActivePage("profile");
      return;
    }

    if (path === "/payments") {
      setActivePage("payments");
      return;
    }

    if (path === "/contributor") {
      setActivePage("contributor");
      return;
    }

    if (path === "/admin") {
      setActivePage("admin");
      return;
    }

    if (path === "/myuploads") {
      setActivePage("myuploads");
      return;
    }

    if (path === "/customer") {
      setActivePage("customer");
      return;
    }

    if (path === "/dashboard") {
      setActivePage("dashboard");
    }
  }, [location.pathname]);

  useEarnings({
  token,
  setEarningsStats,
});

  

useNotificationLoader({
  setNotifications,
  setNotificationCount,
});
const trendingKeywords = useTrendingKeywords();

  /* DOWNLOAD IMAGE */

/* SHARE IMAGE */
const filteredImages = useFilteredImages({
  images,
  search,
  selectedCategory,
  selectedCollection,
  sortType,
});
const {
  featuredImages,
  trendingImages,
  topImage,
  topFiveImages,
} = useDashboardImages(images);

  const [serverTrendingImages, setServerTrendingImages] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/images/trending?limit=5`
        );
        setServerTrendingImages(res.data || []);
      } catch (err) {
        console.error("Failed to load server trending images", err);
      }
    };

    fetchTrending();
  }, []);
  
  const {
  contributorPageImages,
  contributorPageLikes,
  contributorPageViews,
  contributorPageDownloads,
  estimatedEarnings,
  contributorEarnings,
  monthlyEarnings,
  topContributorImages,
  topEarningImage,
  contributorBadge,
  nextLevel,
  progress,
  targetDownloads,
  contributorLeaderboard,
} = useContributorPageStats(
  images,
  viewContributorPage
);
  
  const {
  contributorImages,
  contributorLikes,
  contributorViews,
  contributorDownloads,
  contributorBestImage,
} = useContributorPopup(
  images,
  selectedContributor
);

  const {
  goToNextImage,
  goToPreviousImage,
} = useImageNavigation({
  filteredImages,
  selectedImage,
  fetchSingleImage,
});

  useKeyboardNavigation({
  selectedImage,
  setSelectedImage,
  goToNextImage,
  goToPreviousImage,
  filteredImages,
});
const homePageProps = {
  darkMode,
  username,
  totalImages,
  images,
  trendingKeywords,
  setSearch,
  setShowJoinModal,
  setJoinModalAccountType,
  heroStats,
  contributorRank,
  contributorLevel,
  topImage,
  setActivePage,
  featuredImages,
  trendingImages: serverTrendingImages,
  fetchSingleImage,
  leaderboard,
  contributorPageImages,
  contributorPageLikes,
  contributorPageViews,
  contributorPageDownloads,
  estimatedEarnings,
  topContributorImages,
  contributorBadge,
  topEarningImage,
  nextLevel,
  progress,
  targetDownloads,
  contributorEarnings,
  monthlyEarnings,
};
const galleryProps = {
  search,
  setSearch,
  setCurrentPage,
  sortType,
  setSortType,
  selectedCategory,
  setSelectedCategory,
  selectedCollection,
  setSelectedCollection,
};
const containerProps = {
  loading,
  filteredImages,
  currentPage,
  totalPages,
  totalImages,
  setCurrentPage,
  selectedImage,
  setSelectedImage,
  darkMode,
  relatedImages,
  fetchSingleImage,
  goToPreviousImage,
  goToNextImage,
  likeImage: hookLikeImage,
  addFavorite: hookAddFavorite,
  downloadImage: hookDownloadImage,
  shareImage: hookShareImage,
};
const popupProps = {
  selectedContributor,
  setSelectedContributor,
  contributorImages,
  contributorLikes,
  contributorViews,
  contributorDownloads,
  contributorBestImage,
};
  
  return (

    <div
      style={{
        padding: "20px",
        background: darkMode
          ? "#121212"
          : "#f5f5f5",
        minHeight: "100vh",
        color: darkMode
          ? "white"
          : "black",
      }}
    >

{/*
<HomePage
  totalImages={totalImages}
  totalLikes={totalLikes}
  totalDownloads={totalDownloads}
  totalViews={totalViews}

  dashboardStats={dashboardStats}
  setActivePage={setActivePage}

  search={search}
  setSearch={setSearch}
    featuredImages={featuredImages}
    trendingImages={trendingImages}
    leaderboard={leaderboard}
  darkMode={darkMode}
  fetchSingleImage={fetchSingleImage}

  
/>
*/}

      <AppHeader
  showNotifications={showNotifications}
  setShowNotifications={setShowNotifications}
  notificationCount={notificationCount}
  setNotificationCount={setNotificationCount}
  setShowLoginModal={setShowLoginModal}
  setShowJoinModal={setShowJoinModal}
  showLoginModal={showLoginModal}
  showJoinModal={showJoinModal}
  joinModalAccountType={joinModalAccountType}
  setJoinModalAccountType={setJoinModalAccountType}
  darkMode={darkMode}
  notifications={notifications}
  setActivePage={setActivePage}
  setDarkMode={setDarkMode}
  userRole={userRole}
/>

     <AppRoutes
  activePage={activePage}
  username={username}
  darkMode={darkMode}
  userRole={userRole}
  fetchImages={fetchImages}
  homeSectionProps={{
    homePageProps,
    galleryProps,
    containerProps,
    popupProps,
  }}
  dashboardProps={{
    username,
    contributorRank,
    contributorLevel,
    reputationScore,
    rawScore,
    reputationTier,
    monthsOld,
    contributorXP,
    currentLevelXP,
    nextLevelXP,
    dashboardStats,
    maxUploads,
    nextRank,
    contributorBadge,
    earningsStats,
    avgDownloadsPerImage,
    likeRate,
    viewDownloadRate,
    darkMode,
  }}
/>

<ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop={true}
  closeOnClick={true}
  pauseOnHover={true}
  draggable={true}
  theme="light"
/>
      <FloatingAuth
  darkMode={darkMode}
  setShowLoginModal={setShowLoginModal}
  setShowJoinModal={setShowJoinModal}
/>
      <Footer
  onOpenLogin={() => setShowLoginModal(true)}
  onOpenJoin={(type) => {
    setJoinModalAccountType(type);
    setShowJoinModal(true);
  }}
  isLoggedIn={Boolean(token)}
/>

    </div>

  );

}

export default App;