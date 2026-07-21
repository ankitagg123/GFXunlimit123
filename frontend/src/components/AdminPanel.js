import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Pagination from "./Pagination";
import EmailActionButton from "./EmailActionButton";
import AdminEmailSettings from "../pages/AdminEmailSettings";
import AdminEmailTemplates from "../pages/AdminEmailTemplates";
import AdminEmailLogs from "../pages/AdminEmailLogs";
import AdminEmailQueue from "../pages/AdminEmailQueue";
import AdminNewsletter from "../pages/AdminNewsletter";
import AdminNotificationRules from "../pages/AdminNotificationRules";
import AdminEmailAnalytics from "../pages/AdminEmailAnalytics";
import AdminEmailScheduled from "../pages/AdminEmailScheduled";
import { limitWords, formatKeywords } from "../utils/uploadInputLimits";

const CATEGORY_STORAGE_KEY = "asset-categories";
const COLLECTION_STORAGE_KEY = "asset-collections";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const DEFAULT_CATEGORY_OPTIONS = [
  { id: "default-images", name: "Images" },
  { id: "default-vector", name: "Vector/illustrations" },
  { id: "default-psd", name: "PSD" },
  { id: "default-videos", name: "Videos" },
  { id: "default-templates", name: "Templates" }
];

function AdminPanel() {
  const location = useLocation();
  const statusParam = new URLSearchParams(location.search).get("status") || "pending";
  const tabParam = new URLSearchParams(location.search).get("tab") || "";
  const statusFilter = statusParam.toLowerCase();

  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [users, setUsers] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryError, setNewCategoryError] = useState("");
  const [newCollection, setNewCollection] = useState("");
  const [deleteWarning, setDeleteWarning] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    categoryPrimary: "",
    categorySecondary: "",
    collection: "",
    keywords: "",
    description: "",
    type: ""
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [deleteConfirmationUser, setDeleteConfirmationUser] = useState(null);
  const [userFilter, setUserFilter] = useState("all");
  const [userEditForm, setUserEditForm] = useState({
    full_name: "",
    username: "",
    email: "",
    role: "",
    identity_number: "",
    credits: "",
    status: "",
    password: ""
  });
  const [viewingCategoryId, setViewingCategoryId] = useState(null);
  const [viewingCollectionId, setViewingCollectionId] = useState(null);
  const [showCategoryGrid, setShowCategoryGrid] = useState(false);
  const [showCollectionGrid, setShowCollectionGrid] = useState(false);
  const [brandingLogoFile, setBrandingLogoFile] = useState(null);
  const [brandingFaviconFile, setBrandingFaviconFile] = useState(null);
  const [brandingConfig, setBrandingConfig] = useState({});
  const [brandingMessage, setBrandingMessage] = useState("");
  const [brandingUploading, setBrandingUploading] = useState(false);
  const [editingCategoryInModal, setEditingCategoryInModal] = useState(null);
  const [editingCategoryNameInModal, setEditingCategoryNameInModal] = useState("");
  const [editingCollectionInModal, setEditingCollectionInModal] = useState(null);
  const [editingCollectionNameInModal, setEditingCollectionNameInModal] = useState("");
  const [selectedImageForStatus, setSelectedImageForStatus] = useState(null);
  const [selectedImageStatus, setSelectedImageStatus] = useState("approved");
  const PAYMENT_GATEWAY_STORAGE_KEY = "payment-gateways";
  const PAYMENT_GATEWAY_OPTIONS = ["Google Pay", "Paytm", "Credit Card", "PayPal", "Razorpay"];
  const SOCIAL_LINKS_STORAGE_KEY = "footer-social-links";
  const SOCIAL_LINKS_EVENT = "footer-social-links-changed";
  const DEFAULT_SOCIAL_LINKS = [
    { platform: "twitter", url: "https://twitter.com" },
    { platform: "instagram", url: "https://instagram.com" },
    { platform: "facebook", url: "https://facebook.com" },
    { platform: "", url: "" },
    { platform: "", url: "" }
  ];
  const SOCIAL_LINK_OPTIONS = [
    { value: "", label: "Select platform" },
    { value: "twitter", label: "Twitter" },
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "youtube", label: "YouTube" },
    { value: "pinterest", label: "Pinterest" },
    { value: "tiktok", label: "TikTok" },
    { value: "snapchat", label: "Snapchat" },
    { value: "reddit", label: "Reddit" },
    { value: "telegram", label: "Telegram" },
    { value: "discord", label: "Discord" },
    { value: "github", label: "GitHub" },
    { value: "dribbble", label: "Dribbble" },
    { value: "behance", label: "Behance" },
    { value: "medium", label: "Medium" },
    { value: "mastodon", label: "Mastodon" },
    { value: "x", label: "X" }
  ];
  const getStoredPaymentGateways = () => {
    if (typeof window === "undefined") return PAYMENT_GATEWAY_OPTIONS;
    try {
      const stored = localStorage.getItem(PAYMENT_GATEWAY_STORAGE_KEY);
      if (!stored) return PAYMENT_GATEWAY_OPTIONS;
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : PAYMENT_GATEWAY_OPTIONS;
    } catch (err) {
      console.error("Failed to load stored payment gateways", err);
      return PAYMENT_GATEWAY_OPTIONS;
    }
  };
  const [enabledPaymentGateways, setEnabledPaymentGateways] = useState(getStoredPaymentGateways);
  const getStoredSocialLinks = () => {
    if (typeof window === "undefined") return DEFAULT_SOCIAL_LINKS;
    try {
      const stored = localStorage.getItem(SOCIAL_LINKS_STORAGE_KEY);
      if (!stored) return DEFAULT_SOCIAL_LINKS;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return parsed.map((item) => ({
          platform: item?.platform || "",
          url: item?.url || ""
        }));
      }
    } catch (err) {
      console.error("Failed to load stored social links", err);
    }
    return DEFAULT_SOCIAL_LINKS;
  };
  const [socialLinks, setSocialLinks] = useState(getStoredSocialLinks);
  const [socialLinksMessage, setSocialLinksMessage] = useState("");

  const [emailModal, setEmailModal] = useState(null);
  const EMAIL_MODAL_TITLES = {
    settings: 'Email Configuration',
    templates: 'Email Templates',
    rules: 'Notification Rules',
    newsletter: 'Newsletter Manager',
    queue: 'Email Queue',
    logs: 'Email Logs',
    analytics: 'Email Analytics',
    scheduled: 'Scheduled Emails'
  };

  // Test function removed — Email card remains local-only

  const persistSocialLinks = (nextLinks) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SOCIAL_LINKS_STORAGE_KEY, JSON.stringify(nextLinks));
      window.dispatchEvent(new Event(SOCIAL_LINKS_EVENT));
    }
  };

  const updateSocialLink = (index, updates) => {
    setSocialLinks((prev) => prev.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...updates } : item
    ));
    setSocialLinksMessage("");
  };

  const saveSocialLinks = () => {
    persistSocialLinks(socialLinks);
    setSocialLinksMessage("Social links saved");
  };

  useEffect(() => {
    fetchCategories();
    fetchCollections();

    if (tabParam === "controls") {
      fetchCategories();
      fetchCollections();
      fetchBrandingConfig();
    } else if (tabParam === "live-assets") {
      fetchApprovedImages();
    } else if (tabParam === "users") {
      fetchUsers();
    } else {
      fetchImages();
    }
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, tabParam]);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/admin/images`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setImages(res.data.filter((image) => image.status?.toLowerCase() === statusFilter));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApprovedImages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/admin/images`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const approvedImages = Array.isArray(res.data)
        ? res.data.filter((image) => image.status?.toLowerCase() === "approved")
        : [];
      setImages(approvedImages);
      return approvedImages;
    } catch (err) {
      console.error(err);
      setImages([]);
      return [];
    }
  };

  const getStoredCategories = () => {
    try {
      const cachedCategories = localStorage.getItem(CATEGORY_STORAGE_KEY);
      if (cachedCategories) {
        const parsed = JSON.parse(cachedCategories);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error("Invalid cached categories", err);
    }

    return DEFAULT_CATEGORY_OPTIONS;
  };

  const persistCategories = (nextCategories) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(nextCategories));
    }
  };

  const persistCollections = (nextCollections) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(nextCollections));
    }
  };

  const fetchCategories = async () => {
    const fallbackCategories = getStoredCategories();
    setCategories(fallbackCategories);
    persistCategories(fallbackCategories);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/admin/categories`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const nextCategories = Array.isArray(res.data) && res.data.length > 0 ? res.data : fallbackCategories;
      setCategories(nextCategories);
      persistCategories(nextCategories);
    } catch (err) {
      console.error(err);
      setCategories(fallbackCategories);
      persistCategories(fallbackCategories);
    }
  };

  const fetchCollections = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/admin/collections`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const nextCollections = Array.isArray(res.data) ? res.data : [];
      setCollections(nextCollections);
      persistCollections(nextCollections);
    } catch (err) {
      console.error(err);
      const cachedCollections = localStorage.getItem(COLLECTION_STORAGE_KEY);
      if (cachedCollections) {
        try {
          const parsed = JSON.parse(cachedCollections);
          if (Array.isArray(parsed)) {
            setCollections(parsed);
          }
        } catch (cacheErr) {
          console.error(cacheErr);
        }
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  const fetchBrandingConfig = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/branding`);
      setBrandingConfig(res.data || {});
    } catch (err) {
      console.error(err);
    }
  };

  const uploadBranding = async (event) => {
    event.preventDefault();

    if (!brandingLogoFile && !brandingFaviconFile) {
      setBrandingMessage("Choose at least one file to upload.");
      return;
    }

    try {
      setBrandingUploading(true);
      setBrandingMessage("");
      const token = localStorage.getItem("token");
      const formData = new FormData();
      if (brandingLogoFile) formData.append("logo", brandingLogoFile);
      if (brandingFaviconFile) formData.append("favicon", brandingFaviconFile);

      const res = await axios.post(
        `${API_BASE_URL}/admin/branding`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setBrandingConfig(res.data || {});
      setBrandingLogoFile(null);
      setBrandingFaviconFile(null);
      setBrandingMessage("Branding updated successfully.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("branding-updated"));
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.response?.data || err.message || "Failed to update branding.";
      setBrandingMessage(errorMessage);
    } finally {
      setBrandingUploading(false);
    }
  };

  const updateUserFormField = (field, value) => {
    setUserEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const filteredUsers = users.filter((user) => {
    if (userFilter === "all") return true;
    if (userFilter === "admin") return String(user.role || "").toLowerCase() === "admin";
    if (userFilter === "blocked") return String(user.status || "").toLowerCase() === "blocked";
    return String(user.status || "").toLowerCase() === userFilter;
  });

  const startEditingUser = (user) => {
    setEditingUserId(user.id);
    setIsUserModalOpen(true);
    setUserEditForm({
      full_name: user.full_name || "",
      username: user.username || "",
      email: user.email || "",
      role: user.role || "",
      identity_number: user.identity_number || "",
      credits: user.credits != null ? String(user.credits) : "",
      status: user.status || "",
      password: ""
    });
  };

  const cancelEditingUser = () => {
    setEditingUserId(null);
    setIsUserModalOpen(false);
    setUserEditForm({
      full_name: "",
      username: "",
      email: "",
      role: "",
      identity_number: "",
      credits: "",
      status: "",
      password: ""
    });
  };

  const openDeleteConfirmation = (user) => {
    setDeleteConfirmationUser(user);
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmationUser(null);
  };

  const saveUserDetails = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        full_name: userEditForm.full_name,
        username: userEditForm.username,
        email: userEditForm.email,
        role: userEditForm.role,
        identity_number: userEditForm.identity_number,
        credits: userEditForm.credits !== "" ? Number(userEditForm.credits) : null,
        status: userEditForm.status,
        password: userEditForm.password || undefined
      };

      let res;
      if (id == null) {
        res = await axios.post(
          `${API_BASE_URL}/admin/users`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        res = await axios.put(
          `${API_BASE_URL}/admin/users/${id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      const savedUser = res.data;
      setUsers((prev) => {
        if (id == null) {
          return [savedUser, ...prev];
        }
        return prev.map((user) => (user.id === id ? savedUser : user));
      });
      setEditingUserId(null);
      setIsUserModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const activateUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE_URL}/admin/users/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUsers((prev) => prev.map((user) => (user.id === id ? res.data : user)));
    } catch (err) {
      console.error(err);
    }
  };

  const blockUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE_URL}/admin/users/${id}/block`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res.data) {
        setUsers((prev) => prev.map((user) => (user.id === id ? res.data : user)));
      }
      await fetchUsers();
    } catch (err) {
      console.error("Block user failed", err);
      alert(
        err.response?.data ||
          err.message ||
          "Failed to block user. Please try again."
      );
    }
  };

  const deleteUser = async (id) => {
    if (!id) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/admin/users/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUsers((prev) => prev.filter((user) => user.id !== id));
      if (editingUserId === id) {
        cancelEditingUser();
      }
      setDeleteConfirmationUser(null);
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data ||
          err.message ||
          "Failed to delete user. Please try again."
      );
    }
  };

  const addCategory = async () => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) {
      setNewCategoryError("Category name is required");
      return;
    }

    setNewCategoryError("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/admin/categories`,
        { name: trimmedCategory },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCategories((prev) => {
        const nextCategories = [...prev, res.data];
        persistCategories(nextCategories);
        return nextCategories;
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("asset-categories-updated"));
      }
      setNewCategory("");
    } catch (err) {
      console.error(err);
      setNewCategoryError("Unable to add category");
    }
  };

  const addCollection = async () => {
    if (!newCollection.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/admin/collections`,
        { name: newCollection.trim() },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCollections((prev) => {
        const nextCollections = [...prev, res.data];
        persistCollections(nextCollections);
        return nextCollections;
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("asset-collections-updated"));
      }
      setNewCollection("");
      setDeleteWarning(null);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCategory = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/admin/categories/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCategories((prev) => {
        const nextCategories = prev.filter((category) => category.id !== id);
        persistCategories(nextCategories);
        return nextCategories;
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("asset-categories-updated"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCollection = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/admin/collections/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCollections((prev) => {
        const nextCollections = prev.filter((collectionItem) => collectionItem.id !== id);
        persistCollections(nextCollections);
        return nextCollections;
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("asset-collections-updated"));
      }
      setDeleteWarning(null);
    } catch (err) {
      if (err?.response?.status === 409 && err?.response?.data) {
        setDeleteWarning({
          collection: err.response.data,
          assetCount: err.response.data?.assetCount || 0,
          assets: err.response.data?.assets || []
        });
        return;
      }
      console.error(err);
    }
  };

  const startEditingCollection = (collectionItem) => {
    setEditingCollectionInModal(collectionItem.id);
    setEditingCollectionNameInModal(collectionItem.name || "");
  };

  const startEditingCategory = (categoryItem) => {
    setEditingCategoryInModal(categoryItem.id);
    setEditingCategoryNameInModal(categoryItem.name || "");
  };

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(images.length / pageSize));
  const pageImages = images.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleCategories = categories.length > 0 ? categories : DEFAULT_CATEGORY_OPTIONS;
  const visibleCollections = collections.length > 0 ? collections : [];

  const parseCategoryValues = (categoryValue) => {
    const values = String(categoryValue || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      categoryPrimary: values[0] || "",
      categorySecondary: values[1] || ""
    };
  };

  const openImage = (image, shouldEdit = false) => {
    setSelectedImage(image);
    setIsEditing(shouldEdit);
    const categoryValues = parseCategoryValues(image.category);
    setEditForm({
      title: image.title || "",
      categoryPrimary: categoryValues.categoryPrimary,
      categorySecondary: categoryValues.categorySecondary,
      collection: image.collection || "",
      keywords: image.keywords || "",
      description: image.description || "",
      type: image.type || ""
    });
  };

  const closeModal = async () => {
    setSelectedImage(null);
    setIsEditing(false);
    if (tabParam === "live-assets") {
      await fetchApprovedImages();
    }
  };

  const resetEditForm = (image) => {
    const resetCategoryValues = parseCategoryValues(image?.category);
    setEditForm({
      title: image?.title || "",
      categoryPrimary: resetCategoryValues.categoryPrimary,
      categorySecondary: resetCategoryValues.categorySecondary,
      collection: image?.collection || "",
      keywords: image?.keywords || "",
      description: image?.description || "",
      type: image?.type || ""
    });
  };

  const setEditField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const getCategoryOptions = (index) => {
    const selectedInOtherField = index === 0 ? editForm.categorySecondary : editForm.categoryPrimary;
    return visibleCategories.filter((option) => option.name !== selectedInOtherField);
  };

  const handleEditTitleChange = (e) => {
    setEditField("title", limitWords(e.target.value, 5));
  };

  const handleEditDescriptionChange = (e) => {
    setEditField("description", limitWords(e.target.value, 10));
  };

  const handleEditKeywordChange = (e) => {
    setEditField("keywords", e.target.value);
  };

  const handleEditKeywordKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      setEditField("keywords", formatKeywords(editForm.keywords, 14));
    }
  };

  const saveDetails = async () => {
    if (!selectedImage) return;

    try {
      const token = localStorage.getItem("token");
      const categoryValue = [editForm.categoryPrimary, editForm.categorySecondary]
        .filter(Boolean)
        .join(",");

      const payload = {
        title: editForm.title,
        category: categoryValue,
        collection: editForm.collection || selectedImage.collection || "",
        keywords: editForm.keywords,
        description: editForm.description,
        type: editForm.type
      };

      const res = await axios.put(
        `${API_BASE_URL}/images/${selectedImage.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const updated = res.data || {};
      const nextCategoryValue = [editForm.categoryPrimary, editForm.categorySecondary]
        .filter(Boolean)
        .join(",");
      const nextCollectionValue = editForm.collection || selectedImage.collection || updated.collection || "";
      const merged = {
        ...selectedImage,
        ...updated,
        title: editForm.title,
        category: nextCategoryValue,
        collection: nextCollectionValue,
        keywords: editForm.keywords,
        description: editForm.description,
        type: editForm.type
      };

      const finalMergedImage = {
        ...merged,
        collection: nextCollectionValue,
        category: nextCategoryValue,
        title: editForm.title,
        keywords: editForm.keywords,
        description: editForm.description,
        type: editForm.type
      };

      setSelectedImage(finalMergedImage);
      setImages((prev) => prev.map((image) => (Number(image.id) === Number(finalMergedImage.id) ? finalMergedImage : image)));
      await fetchCollections();
      if (tabParam === "live-assets") {
        const refreshedImages = await fetchApprovedImages();
        const nextMergedImage = refreshedImages.find((image) => Number(image.id) === Number(finalMergedImage.id)) || finalMergedImage;
        const serverMergedImage = {
          ...nextMergedImage,
          collection: nextCollectionValue,
          category: nextCategoryValue,
          title: editForm.title,
          keywords: editForm.keywords,
          description: editForm.description,
          type: editForm.type
        };
        setSelectedImage(serverMergedImage);
        setImages((prev) => {
          const normalizedPrev = Array.isArray(prev) ? prev : [];
          if (refreshedImages.length > 0) {
            return refreshedImages.map((image) => Number(image.id) === Number(serverMergedImage.id) ? serverMergedImage : image);
          }
          return normalizedPrev.map((image) => (Number(image.id) === Number(serverMergedImage.id) ? serverMergedImage : image));
        });
      }
      if (typeof window !== "undefined") {
        const refreshPayload = {
          ...merged,
          collection: nextCollectionValue,
          category: nextCategoryValue,
          title: editForm.title,
          keywords: editForm.keywords,
          description: editForm.description,
          type: editForm.type
        };
        window.dispatchEvent(new Event("asset-updated"));
        window.dispatchEvent(new CustomEvent("asset-updated-detail", { detail: refreshPayload }));
        window.dispatchEvent(new Event("asset-refresh"));
        window.dispatchEvent(new Event("asset-collections-updated"));
        window.dispatchEvent(new Event("home-assets-refresh"));
      }
      setIsEditing(false);
      await closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const approveImage = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/admin/approve/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchImages();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteImage = async (id) => {
    const confirmDelete = window.confirm("Permanently delete this image?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/images/${id}`);
      if (tabParam === "live-assets") {
        fetchApprovedImages();
      } else {
        fetchImages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const rejectImage = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/admin/reject/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (tabParam === "live-assets") {
        fetchApprovedImages();
      } else {
        fetchImages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isLiveAssetsTab = tabParam === "live-assets";
  const isUsersTab = tabParam === "users";
  const shouldShowImageGrid = tabParam !== "controls" && !isUsersTab;

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Admin Panel</h2>

      {shouldShowImageGrid && <p>Total Images: {images.length}</p>}

      {isUsersTab ? (
        <div style={{ display: "grid", gap: "20px" }}>
          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              background: "#fafafa"
            }}
          >
            <h3>User Management</h3>
            <p style={{ color: "#555", marginTop: "-4px" }}>Manage contributor and other admin users.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "16px", alignItems: "center" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {[
                  { key: "all", label: "All" },
                  { key: "admin", label: "Admin" },
                  { key: "active", label: "Active" },
                  { key: "pending", label: "Pending" },
                  { key: "blocked", label: "Blocked" }
                ].map((button) => (
                  <button
                    key={button.key}
                    type="button"
                    onClick={() => setUserFilter(button.key)}
                    style={{
                      background: userFilter === button.key ? "#1565c0" : "#e0e0e0",
                      color: userFilter === button.key ? "white" : "#333",
                      border: userFilter === button.key ? "2px solid #0d47a1" : "1px solid transparent",
                      boxShadow: userFilter === button.key ? "0 2px 10px rgba(21, 101, 192, 0.2)" : "none",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => startEditingUser({
                  id: null,
                  full_name: "",
                  username: "",
                  email: "",
                  role: "",
                  identity_number: "",
                  credits: 0,
                  status: "active"
                })}
                style={{
                  marginLeft: "auto",
                  background: "#43a047",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Add New
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "14px",
                marginTop: "16px"
              }}
            >
              {filteredUsers.length === 0 ? (
                <p>No users found.</p>
              ) : (
                filteredUsers.map((user) => {
                  const normalizedStatus = String(user.status || "").trim().toLowerCase();
                  const displayStatus = normalizedStatus || "unknown";

                  return (
                    <div
                      key={user.id}
                      style={{
                        padding: "14px",
                        borderRadius: "10px",
                        border: "1px solid #ddd",
                        background: "white",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px"
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{user.full_name || user.username || "Unnamed user"}</div>
                      <div style={{ color: "#555" }}>Username: {user.username || "-"}</div>
                      <div style={{ color: "#555" }}>Email: {user.email || "-"}</div>
                      <div style={{ color: "#555" }}>Role: {user.role || "-"}</div>
                      <div style={{ color: "#555" }}>Status: {displayStatus}</div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                        <button
                          type="button"
                          onClick={() => activateUser(user.id)}
                          style={{
                            background: "#43a047",
                            color: "white",
                            border: "none",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            cursor: "pointer"
                          }}
                        >
                          Activate
                        </button>
                        <button
                          type="button"
                          onClick={() => blockUser(user.id)}
                          style={{
                            background: "#f57c00",
                            color: "white",
                            border: "none",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            cursor: "pointer"
                          }}
                        >
                          Block
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditingUser(user)}
                          style={{
                            background: "#1976d2",
                            color: "white",
                            border: "none",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            cursor: "pointer"
                          }}
                        >
                          Modify
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteConfirmation(user)}
                          style={{
                            background: "#e53935",
                            color: "white",
                            border: "none",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            cursor: "pointer"
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {deleteConfirmationUser && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.55)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px",
                  zIndex: 1150
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: "420px",
                    background: "white",
                    borderRadius: "14px",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ padding: "18px 20px", borderBottom: "1px solid #eee" }}>
                    <h3 style={{ margin: 0 }}>Confirm delete</h3>
                  </div>
                  <div style={{ padding: "20px", display: "grid", gap: "14px" }}>
                    <p style={{ margin: 0 }}>
                      Are you sure you want to permanently delete <strong>{deleteConfirmationUser.full_name || deleteConfirmationUser.username || "this user"}</strong>? This action cannot be undone.
                    </p>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={closeDeleteConfirmation}
                        style={{
                          background: "#757575",
                          color: "white",
                          border: "none",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(deleteConfirmationUser?.id)}
                        style={{
                          background: "#e53935",
                          color: "white",
                          border: "none",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          cursor: "pointer"
                        }}
                      >
                        Confirm delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isUserModalOpen && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.55)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px",
                  zIndex: 1100
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: "620px",
                    background: "white",
                    borderRadius: "14px",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ margin: 0 }}>Edit User</h3>
                      <p style={{ margin: "8px 0 0", color: "#666" }}>Update user details and save changes.</p>
                    </div>
                    <button
                      type="button"
                      onClick={cancelEditingUser}
                      style={{
                        background: "transparent",
                        color: "#333",
                        border: "none",
                        fontSize: "18px",
                        cursor: "pointer"
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div style={{ padding: "16px", display: "grid", gap: "10px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.85rem", color: "#333" }}>Full name</span>
                      <input
                        type="text"
                        value={userEditForm.full_name}
                        onChange={(e) => updateUserFormField("full_name", e.target.value)}
                        placeholder="Full name"
                        style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
                      />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.85rem", color: "#333" }}>Username</span>
                      <input
                        type="text"
                        value={userEditForm.username}
                        onChange={(e) => updateUserFormField("username", e.target.value)}
                        placeholder="Username"
                        style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
                      />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.85rem", color: "#333" }}>Email</span>
                      <input
                        type="email"
                        value={userEditForm.email}
                        onChange={(e) => updateUserFormField("email", e.target.value)}
                        placeholder="Email"
                        style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
                      />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.85rem", color: "#333" }}>Role</span>
                      <select
                        value={userEditForm.role}
                        onChange={(e) => updateUserFormField("role", e.target.value)}
                        style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }}
                      >
                        <option value="">Role</option>
                        <option value="admin">Admin</option>
                        <option value="customer">Customer</option>
                        <option value="contributor">Contributor</option>
                        <option value="user">User</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.85rem", color: "#333" }}>ID #</span>
                      <input
                        type="text"
                        value={userEditForm.identity_number}
                        onChange={(e) => updateUserFormField("identity_number", e.target.value)}
                        placeholder="ID #"
                        style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
                      />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.85rem", color: "#333" }}>Credits</span>
                      <input
                        type="number"
                        value={userEditForm.credits}
                        onChange={(e) => updateUserFormField("credits", e.target.value)}
                        placeholder="Credits"
                        style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
                      />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.85rem", color: "#333" }}>Status</span>
                      <select
                        value={userEditForm.status}
                        onChange={(e) => updateUserFormField("status", e.target.value)}
                        style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }}
                      >
                        <option value="">Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                        <option value="blocked">Blocked</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "4px", gridColumn: "1 / -1" }}>
                      <span style={{ fontSize: "0.85rem", color: "#333" }}>Password</span>
                      <input
                        type="password"
                        value={userEditForm.password}
                        onChange={(e) => updateUserFormField("password", e.target.value)}
                        placeholder="Password"
                        style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
                      />
                    </label>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", gridColumn: "1 / -1", marginTop: "4px" }}>
                      <button
                        type="button"
                        onClick={() => saveUserDetails(editingUserId)}
                        style={{
                          background: "#43a047",
                          color: "white",
                          border: "none",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          cursor: "pointer"
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingUser}
                        style={{
                          background: "#757575",
                          color: "white",
                          border: "none",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : tabParam === "controls" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              background: "#fafafa"
            }}
          >
            <h3>Manage Categories</h3>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.95rem", color: "#333", fontWeight: 600 }}>Add new Category</span>
              <input
                type="text"
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
            </label>
            <button
              type="button"
              onClick={addCategory}
              style={{
                background: "#2196f3",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%",
                marginBottom: "12px"
              }}
            >
              Add Category
            </button>
            {newCategoryError && <p style={{ color: "#d32f2f", marginTop: "-4px", marginBottom: "10px" }}>{newCategoryError}</p>}
            <button
              type="button"
              onClick={() => setShowCategoryGrid(true)}
              style={{
                background: "#1976d2",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              View Categories
            </button>
          </div>

          <div
            style={{
              padding: "8px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              background: "#fafafa",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              minHeight: "100%"
            }}
          >
            <h3 style={{ margin: 0 }}>Website Branding</h3>
            <form onSubmit={uploadBranding} style={{ display: "grid", gap: "12px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.95rem", color: "#333", fontWeight: 600 }}>Add new Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBrandingLogoFile(e.target.files?.[0] || null)}
                  style={{ padding: "10px", background: "white", borderRadius: "8px", border: "1px solid #ccc" }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.95rem", color: "#333", fontWeight: 600 }}>Add new Favicon</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBrandingFaviconFile(e.target.files?.[0] || null)}
                  style={{ padding: "10px", background: "white", borderRadius: "8px", border: "1px solid #ccc" }}
                />
              </label>
              <button
                type="submit"
                style={{
                  background: "#2196f3",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  width: "100%"
                }}
                disabled={brandingUploading}
              >
                {brandingUploading ? "Saving..." : "Save Branding"}
              </button>
            </form>
            {brandingConfig?.logo || brandingConfig?.favicon ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", paddingTop: "4px" }}>
                {brandingConfig.logo && (
                  <img
                    src={`${API_BASE_URL}${brandingConfig.logo}`}
                    alt="Current logo"
                    style={{ height: "36px", width: "auto", objectFit: "contain" }}
                  />
                )}
                {brandingConfig.favicon && (
                  <img
                    src={`${API_BASE_URL}${brandingConfig.favicon}`}
                    alt="Current favicon"
                    style={{ height: "24px", width: "24px", objectFit: "contain" }}
                  />
                )}
              </div>
            ) : null}
            {brandingMessage ? <p style={{ margin: 0, color: brandingMessage.includes("Failed") ? "#d32f2f" : "#2e7d32" }}>{brandingMessage}</p> : null}
          </div>

          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              background: "#fafafa"
            }}
          >
            <h3>Active Collections</h3>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.95rem", color: "#333", fontWeight: 600 }}>Add new Collection</span>
              <input
                type="text"
                placeholder="New collection name"
                value={newCollection}
                onChange={(e) => setNewCollection(e.target.value)}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
            </label>
            <button
              type="button"
              onClick={addCollection}
              style={{
                background: "#2196f3",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%",
                marginBottom: "12px"
              }}
            >
              Add Collection
            </button>

            <button
              type="button"
              onClick={() => setShowCollectionGrid(true)}
              style={{
                background: "#1976d2",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              View Collections
            </button>

            {deleteWarning && (
              <div
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid #f4b183",
                  background: "#fff8e1",
                  color: "#8a4b00"
                }}
              >
                <strong>Unable to delete this collection.</strong>
                <div style={{ marginTop: "6px" }}>
                  It currently contains {deleteWarning.assetCount || 0} asset{(deleteWarning.assetCount || 0) === 1 ? "" : "s"}.
                </div>
                {deleteWarning.assets?.length > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <div>Assets:</div>
                    <ul style={{ margin: "6px 0 0 18px" }}>
                      {deleteWarning.assets.map((asset) => (
                        <li key={asset.id}>{asset.title || asset.filename || "Unnamed asset"}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              background: "#fafafa"
            }}
          >
            <h3>Company</h3>
            <div style={{ display: "grid", gap: "10px" }}>
              {[
                { label: "About Us", href: "/about" },
                { label: "Pricing", href: "/pricing" },
                { label: "Careers", href: "/careers" },
                { label: "Contact", href: "/contact" }
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#1976d2",
                    color: "white",
                    border: "none",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    textAlign: "center",
                    textDecoration: "none",
                    fontSize: "0.95rem"
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              background: "#fafafa"
            }}
          >
            <h3>Payment Gateway</h3>
            <p style={{ color: "#555", marginTop: "-4px", fontSize: "0.95rem" }}>Select the payment methods you want to offer to customers.</p>
            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
              {PAYMENT_GATEWAY_OPTIONS.map((gateway) => {
                const isEnabled = enabledPaymentGateways.includes(gateway);
                return (
                  <label
                    key={gateway}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      background: isEnabled ? "#eef6ff" : "white",
                      cursor: "pointer"
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "#333" }}>{gateway}</span>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => {
                        setEnabledPaymentGateways((prev) => {
                          const next = prev.includes(gateway)
                            ? prev.filter((item) => item !== gateway)
                            : [...prev, gateway];
                          if (typeof window !== "undefined") {
                            localStorage.setItem(PAYMENT_GATEWAY_STORAGE_KEY, JSON.stringify(next));
                          }
                          return next;
                        });
                      }}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              background: "#fafafa"
            }}
          >
            <h3>Legal & Resources</h3>
            <div style={{ display: "grid", gap: "10px" }}>
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms & Conditions", href: "/terms-and-conditions" },
                { label: "Cookie Policy", href: "/cookie-policy" },
                { label: "Help Center", href: "/help-center" },
                { label: "Developers", href: "/developers" },
                { label: "Partners", href: "/partners" }
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#1976d2",
                    color: "white",
                    border: "none",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    textAlign: "center",
                    textDecoration: "none",
                    fontSize: "0.95rem"
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: "10px 16px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              background: "#fafafa",
              maxWidth: "520px",
              alignSelf: "start"
            }}
          >
            <h3 style={{ margin: "4px 0 6px" }}>Social Media</h3>
            <p style={{ color: "#555", margin: "0 0 8px", fontSize: "0.9rem" }}>Set the footer social links using a platform dropdown and URL field.</p>
            <div style={{ display: "grid", gap: "8px" }}>
              {socialLinks.map((item, index) => {
                const selectedPlatforms = socialLinks.map((entry) => entry.platform);
                return (
                  <div key={`${item.platform}-${index}`} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <select
                      value={item.platform}
                      onChange={(e) => updateSocialLink(index, { platform: e.target.value })}
                      style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid #ccc", background: "white", minWidth: "110px" }}
                    >
                      {SOCIAL_LINK_OPTIONS.map((option) => (
                        <option
                          key={option.value || "empty"}
                          value={option.value}
                          disabled={selectedPlatforms.includes(option.value) && option.value !== item.platform}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="url"
                      value={item.url}
                      placeholder="https://"
                      onChange={(e) => updateSocialLink(index, { url: e.target.value })}
                      style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid #ccc", flex: 1 }}
                    />
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={saveSocialLinks}
              style={{
                marginTop: "10px",
                background: "#1976d2",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Save Social Links
            </button>
            {socialLinksMessage ? <div style={{ marginTop: "8px", color: "#2e7d32", fontSize: "0.9rem" }}>{socialLinksMessage}</div> : null}
          </div>

          <div
            style={{
              padding: "22px",
              borderRadius: "16px",
              border: "1px solid #dde3ea",
              background: "#fbfdff",
              boxShadow: "0 14px 45px rgba(15, 23, 42, 0.08)",
              borderLeft: "5px solid #1976d2"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <span style={{ fontSize: "1.35rem" }}>📧</span>
              <div>
                <h3 style={{ margin: 0 }}>Email Management</h3>
                <div style={{ color: "#55606f", fontSize: "0.92rem", lineHeight: 1.4 }}>Quick access to email settings, templates, alerts, queue, and analytics.</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: "14px", marginTop: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                <EmailActionButton icon="⚙️" label="Email Configuration" color="#ED2224" onClick={() => setEmailModal('settings')} />
                <EmailActionButton icon="📄" label="Email Templates" color="#1976d2" onClick={() => setEmailModal('templates')} />
                <EmailActionButton icon="🔔" label="Notification Rules" color="#43a047" onClick={() => setEmailModal('rules')} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                <EmailActionButton icon="📰" label="Newsletter Manager" color="#f57c00" onClick={() => setEmailModal('newsletter')} />
                <EmailActionButton icon="📬" label="Email Queue" color="#757575" onClick={() => setEmailModal('queue')} />
                <EmailActionButton icon="🧾" label="Email Logs" color="#9c27b0" onClick={() => setEmailModal('logs')} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                <EmailActionButton icon="⏰" label="Scheduled Emails" color="#00695c" onClick={() => setEmailModal('scheduled')} />
                <EmailActionButton icon="📩" label="Test Email" color="#0288d1" onClick={() => setEmailModal('settings')} />
                <EmailActionButton icon="📊" label="Email Analytics" color="#d84315" onClick={() => setEmailModal('analytics')} />
              </div>
            </div>
          </div>

            {emailModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }}>
                <div style={{ width: '95%', maxWidth: 1000, background: 'white', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #eee' }}>
                    <h3 style={{ margin: 0 }}>{EMAIL_MODAL_TITLES[emailModal] || (emailModal ? emailModal.charAt(0).toUpperCase() + emailModal.slice(1) : '')}</h3>
                    <button onClick={() => setEmailModal(null)} style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer', padding: 8 }}>✕</button>
                  </div>
                  <div style={{ padding: 14, maxHeight: '80vh', overflow: 'auto' }}>
                    {emailModal === 'settings' && <AdminEmailSettings />}
                    {emailModal === 'templates' && <AdminEmailTemplates />}
                    {emailModal === 'logs' && <AdminEmailLogs />}
                    {emailModal === 'queue' && <AdminEmailQueue />}
                    {emailModal === 'newsletter' && <AdminNewsletter />}
                    {emailModal === 'rules' && <AdminNotificationRules />}
                    {emailModal === 'analytics' && <AdminEmailAnalytics />}
                    {emailModal === 'scheduled' && <AdminEmailScheduled />}
                  </div>
                </div>
              </div>
            )}

          {/* Category Modal */}
          {viewingCategoryId && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                zIndex: 1150
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  background: "white",
                  borderRadius: "14px",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                  overflow: "hidden"
                }}
              >
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #eee" }}>
                  <h3 style={{ margin: 0 }}>Category Details</h3>
                </div>
                <div style={{ padding: "20px", display: "grid", gap: "14px" }}>
                  <p style={{ margin: 0 }}>
                    <strong>Name:</strong> {visibleCategories.find(c => c.id === viewingCategoryId)?.name || "Unnamed"}
                  </p>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => {
                        startEditingCategory(visibleCategories.find(c => c.id === viewingCategoryId));
                        setViewingCategoryId(null);
                      }}
                      style={{
                        background: "#1976d2",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Modify
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteCategory(viewingCategoryId);
                        setViewingCategoryId(null);
                      }}
                      style={{
                        background: "#e53935",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewingCategoryId(null)}
                      style={{
                        background: "#757575",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collection Modal */}
          {viewingCollectionId && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                zIndex: 1150
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  background: "white",
                  borderRadius: "14px",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                  overflow: "hidden"
                }}
              >
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #eee" }}>
                  <h3 style={{ margin: 0 }}>Collection Details</h3>
                </div>
                <div style={{ padding: "20px", display: "grid", gap: "14px" }}>
                  <p style={{ margin: 0 }}>
                    <strong>Name:</strong> {visibleCollections.find(c => c.id === viewingCollectionId)?.name || "Unnamed"}
                  </p>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => {
                        startEditingCollection(visibleCollections.find(c => c.id === viewingCollectionId));
                        setViewingCollectionId(null);
                      }}
                      style={{
                        background: "#1976d2",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Modify
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteCollection(viewingCollectionId);
                        setViewingCollectionId(null);
                      }}
                      style={{
                        background: "#e53935",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewingCollectionId(null)}
                      style={{
                        background: "#757575",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category Grid Modal */}
          {showCategoryGrid && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                zIndex: 1150
              }}
            >
              <div
                style={{
                  width: "90%",
                  maxWidth: "1000px",
                  maxHeight: "80vh",
                  background: "white",
                  borderRadius: "14px",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                  overflow: "auto",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #eee", position: "sticky", top: 0, background: "white" }}>
                  <h3 style={{ margin: 0 }}>Categories</h3>
                </div>
                <div style={{ padding: "20px", flex: 1 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                    {visibleCategories.map((categoryItem) => (
                      <div
                        key={categoryItem.id}
                        style={{
                          padding: "14px",
                          borderRadius: "12px",
                          border: "1px solid #ddd",
                          background: "white",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          color: "#111",
                          textAlign: "center",
                          minHeight: "100px"
                        }}
                      >
                        <span style={{ color: "#111", fontWeight: 600, fontSize: "0.95rem" }}>{categoryItem.name || "Unnamed category"}</span>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategoryInModal(categoryItem.id);
                              setEditingCategoryNameInModal(categoryItem.name || "");
                            }}
                            style={{
                              background: "#1976d2",
                              color: "white",
                              border: "none",
                              padding: "8px 16px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontSize: "0.9rem"
                            }}
                          >
                            Modify
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteCategory(categoryItem.id);
                              setShowCategoryGrid(false);
                            }}
                            style={{
                              background: "#e53935",
                              color: "white",
                              border: "none",
                              padding: "8px 16px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontSize: "0.9rem"
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "18px 20px", borderTop: "1px solid #eee", textAlign: "right", background: "white" }}>
                  <button
                    type="button"
                    onClick={() => setShowCategoryGrid(false)}
                    style={{
                      background: "#757575",
                      color: "white",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Collection Grid Modal */}
          {showCollectionGrid && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                zIndex: 1150
              }}
            >
              <div
                style={{
                  width: "90%",
                  maxWidth: "1000px",
                  maxHeight: "80vh",
                  background: "white",
                  borderRadius: "14px",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                  overflow: "auto",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #eee", position: "sticky", top: 0, background: "white" }}>
                  <h3 style={{ margin: 0 }}>Collections</h3>
                </div>
                <div style={{ padding: "20px", flex: 1 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                    {visibleCollections.length === 0 ? (
                      <span style={{ color: "#777" }}>No active collections yet.</span>
                    ) : (
                      visibleCollections.map((collectionItem) => (
                        <div
                          key={collectionItem.id}
                          style={{
                            padding: "14px",
                            borderRadius: "12px",
                            border: "1px solid #ddd",
                            background: "white",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                            color: "#111",
                            textAlign: "center",
                            minHeight: "100px"
                          }}
                        >
                          <span style={{ color: "#111", fontWeight: 600, fontSize: "0.95rem" }}>{collectionItem.name || "Unnamed collection"}</span>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCollectionInModal(collectionItem.id);
                                setEditingCollectionNameInModal(collectionItem.name || "");
                              }}
                              style={{
                                background: "#1976d2",
                                color: "white",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.9rem"
                              }}
                            >
                              Modify
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteCollection(collectionItem.id);
                                setShowCollectionGrid(false);
                              }}
                              style={{
                                background: "#e53935",
                                color: "white",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.9rem"
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div style={{ padding: "18px 20px", borderTop: "1px solid #eee", textAlign: "right", background: "white" }}>
                  <button
                    type="button"
                    onClick={() => setShowCollectionGrid(false)}
                    style={{
                      background: "#757575",
                      color: "white",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Category Modal */}
          {editingCategoryInModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                zIndex: 1160
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  background: "white",
                  borderRadius: "14px",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                  overflow: "hidden"
                }}
              >
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #eee" }}>
                  <h3 style={{ margin: 0 }}>Edit Category</h3>
                </div>
                <div style={{ padding: "20px", display: "grid", gap: "14px" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "0.9rem", color: "#333", fontWeight: 500 }}>Category Name</span>
                    <input
                      type="text"
                      value={editingCategoryNameInModal}
                      onChange={(e) => setEditingCategoryNameInModal(e.target.value)}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        fontSize: "1rem"
                      }}
                    />
                  </label>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={async () => {
                        const trimmedName = editingCategoryNameInModal.trim();
                        if (!trimmedName) return;

                        try {
                          const token = localStorage.getItem("token");
                          const res = await axios.put(
                            `${API_BASE_URL}/admin/categories/${editingCategoryInModal}`,
                            { name: trimmedName },
                            {
                              headers: { Authorization: `Bearer ${token}` }
                            }
                          );
                          setCategories((prev) => {
                            const nextCategories = prev.map((categoryItem) => (categoryItem.id === editingCategoryInModal ? res.data : categoryItem));
                            persistCategories(nextCategories);
                            return nextCategories;
                          });
                          if (typeof window !== "undefined") {
                            window.dispatchEvent(new Event("asset-categories-updated"));
                          }
                          setEditingCategoryInModal(null);
                          setEditingCategoryNameInModal("");
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      style={{
                        background: "#43a047",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryInModal(null);
                        setEditingCategoryNameInModal("");
                      }}
                      style={{
                        background: "#757575",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Collection Modal */}
          {editingCollectionInModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                zIndex: 1160
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  background: "white",
                  borderRadius: "14px",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                  overflow: "hidden"
                }}
              >
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #eee" }}>
                  <h3 style={{ margin: 0 }}>Edit Collection</h3>
                </div>
                <div style={{ padding: "20px", display: "grid", gap: "14px" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "0.9rem", color: "#333", fontWeight: 500 }}>Collection Name</span>
                    <input
                      type="text"
                      value={editingCollectionNameInModal}
                      onChange={(e) => setEditingCollectionNameInModal(e.target.value)}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        fontSize: "1rem"
                      }}
                    />
                  </label>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={async () => {
                        const trimmedName = editingCollectionNameInModal.trim();
                        if (!trimmedName) return;

                        try {
                          const token = localStorage.getItem("token");
                          const res = await axios.put(
                            `${API_BASE_URL}/admin/collections/${editingCollectionInModal}`,
                            { name: trimmedName },
                            {
                              headers: { Authorization: `Bearer ${token}` }
                            }
                          );
                          setCollections((prev) => {
                            const nextCollections = prev.map((collectionItem) => (collectionItem.id === editingCollectionInModal ? res.data : collectionItem));
                            persistCollections(nextCollections);
                            return nextCollections;
                          });
                          if (typeof window !== "undefined") {
                            window.dispatchEvent(new Event("asset-collections-updated"));
                            window.dispatchEvent(new Event("asset-refresh"));
                            window.dispatchEvent(new Event("asset-updated"));
                            window.dispatchEvent(new Event("home-assets-refresh"));
                          }
                          if (tabParam === "live-assets") {
                            await fetchApprovedImages();
                          }
                          setEditingCollectionInModal(null);
                          setEditingCollectionNameInModal("");
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      style={{
                        background: "#43a047",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCollectionInModal(null);
                        setEditingCollectionNameInModal("");
                      }}
                      style={{
                        background: "#757575",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {isLiveAssetsTab && (
            <div
              style={{
                marginBottom: "20px",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #ddd",
                background: "#fafafa"
              }}
            >
              <h3>Live Assets</h3>
              <p style={{ color: "#555", marginTop: "-4px" }}>Manage currently approved assets that are visible on the site.</p>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginTop: "20px"
            }}
          >
            {pageImages.map((image) => (
              <div
                key={image.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "12px",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  background: "#fff"
                }}
              >
                <img
                  src={`${API_BASE_URL}/uploads/${image.filename}`}
                  alt={image.title}
                  style={{
                    width: "100%",
                    minHeight: "120px",
                    maxHeight: "150px",
                    objectFit: "cover",
                    borderRadius: "6px"
                  }}
                />
                <p style={{ margin: "0", fontSize: "0.85rem", color: "#555" }}>Title: {image.title}</p>
                <p style={{ margin: "0", fontSize: "0.85rem", color: "#555" }}>Collection: {image.collection || "-"}</p>
                <p style={{ margin: "0", fontSize: "0.85rem", color: "#555" }}>Type: {image.type || "-"}</p>
                <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                  <button
                    onClick={() => openImage(image, true)}
                    style={{
                      flex: 1,
                      background: "#2196f3",
                      color: "white",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setSelectedImageForStatus(image)}
                    style={{
                      flex: 1,
                      background: "#43a047",
                      color: "white",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    Active
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Image Status Modal */}
          {selectedImageForStatus && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                zIndex: 1150
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  background: "white",
                  borderRadius: "14px",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                  overflow: "hidden"
                }}
              >
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #eee" }}>
                  <h3 style={{ margin: 0 }}>Update Status</h3>
                </div>
                <div style={{ padding: "20px", display: "grid", gap: "14px" }}>
                  <p style={{ margin: 0 }}>
                    <strong>Asset:</strong> {selectedImageForStatus.title}
                  </p>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "0.9rem", color: "#333", fontWeight: 500 }}>Select Status</span>
                    <select
                      value={selectedImageStatus}
                      onChange={(e) => setSelectedImageStatus(e.target.value)}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        background: "white",
                        fontSize: "1rem"
                      }}
                    >
                      <option value="approved">Approved</option>
                      <option value="reject">Reject</option>
                      <option value="delete">Delete</option>
                    </select>
                  </label>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedImageStatus === "approved") {
                          approveImage(selectedImageForStatus.id);
                        } else if (selectedImageStatus === "reject") {
                          rejectImage(selectedImageForStatus.id);
                        } else if (selectedImageStatus === "delete") {
                          deleteImage(selectedImageForStatus.id);
                        }
                        setSelectedImageForStatus(null);
                        setSelectedImageStatus("approved");
                      }}
                      style={{
                        background: "#43a047",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImageForStatus(null);
                        setSelectedImageStatus("approved");
                      }}
                      style={{
                        background: "#757575",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLiveAssetsTab && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalImages={images.length}
              setCurrentPage={setCurrentPage}
            />
          )}

          {selectedImage && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "20px",
                zIndex: 1000
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "880px",
                  background: "white",
                  borderRadius: "12px",
                  overflow: "auto",
                  maxHeight: "90vh",
                  padding: "24px",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0 }}>{selectedImage.title}</h3>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        background: "#1976d2",
                        color: "white",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={closeModal}
                      style={{
                        background: "#eee",
                        color: "#222",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px", marginTop: "20px" }}>
                  <img
                    src={`${API_BASE_URL}/uploads/${selectedImage.filename}`}
                    alt={selectedImage.title}
                    style={{ width: "100%", borderRadius: "12px", objectFit: "cover", maxHeight: "420px" }}
                  />

                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {isEditing ? (
                      <>
                        <label>
                          Title (max 5 words)
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={handleEditTitleChange}
                            style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }}
                          />
                        </label>
                        <label>
                          Description (max 10 words)
                          <textarea
                            value={editForm.description}
                            onChange={handleEditDescriptionChange}
                            rows={5}
                            style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }}
                          />
                        </label>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
                          Category (1 required, 2 max)
                        </label>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: "220px" }}>
                            <select
                              aria-label="Select primary category"
                              value={editForm.categoryPrimary}
                              onChange={(e) => setEditField("categoryPrimary", e.target.value)}
                              style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }}
                            >
                              <option value="">Select primary category</option>
                              {getCategoryOptions(0).map((categoryItem) => (
                                <option key={categoryItem.id} value={categoryItem.name}>{categoryItem.name}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ flex: 1, minWidth: "220px" }}>
                            <select
                              aria-label="Select optional category"
                              value={editForm.categorySecondary}
                              onChange={(e) => setEditField("categorySecondary", e.target.value)}
                              style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }}
                            >
                              <option value="">Select optional category</option>
                              {getCategoryOptions(1).map((categoryItem) => (
                                <option key={`${categoryItem.id}-secondary`} value={categoryItem.name}>{categoryItem.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: "220px" }}>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
                              Collection
                            </label>
                            <select
                              aria-label="Collection"
                              value={editForm.collection}
                              onChange={(e) => setEditField("collection", e.target.value)}
                              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                            >
                              <option value="">Select Collection</option>
                              {visibleCollections.map((collectionItem) => (
                                <option key={collectionItem.id} value={collectionItem.name}>{collectionItem.name}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ flex: 1, minWidth: "220px" }}>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
                              Type
                            </label>
                            <select
                              value={editForm.type}
                              onChange={(e) => setEditField("type", e.target.value)}
                              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                            >
                              <option value="">Select Type</option>
                              <option value="commercial">Commercial</option>
                              <option value="editorial">Editorial</option>
                            </select>
                          </div>
                        </div>
                        <label>
                          Keywords (max 14 words, Press Tab key to set Auto - format)
                          <input
                            type="text"
                            value={editForm.keywords}
                            onChange={handleEditKeywordChange}
                            onKeyDown={handleEditKeywordKeyDown}
                            style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }}
                          />
                        </label>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <button
                            onClick={saveDetails}
                            style={{
                              background: "green",
                              color: "white",
                              border: "none",
                              padding: "10px 16px",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={async () => {
                              setIsEditing(false);
                              resetEditForm(selectedImage);
                              await closeModal();
                            }}
                            style={{
                              background: "#eee",
                              color: "#222",
                              border: "none",
                              padding: "10px 16px",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p><strong>Description:</strong> {selectedImage.description || "Not provided"}</p>
                        <p><strong>Category:</strong> {selectedImage.category || "-"}</p>
                        <p><strong>Collection:</strong> {selectedImage.collection || "-"}</p>
                        <p><strong>Type:</strong> {selectedImage.type || "-"}</p>
                        <p><strong>Keywords:</strong> {selectedImage.keywords || "-"}</p>
                        <p><strong>Status:</strong> {selectedImage.status}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminPanel;
