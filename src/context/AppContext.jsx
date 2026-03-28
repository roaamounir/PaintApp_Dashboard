import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import i18n from "../i18n/i18n";
import { getJwtPayload } from "../utils/jwtUser.js";

const defaultContextValue = {
  language: "ar",
  changeLanguage: () => {},
};

export const AppContext = createContext(defaultContextValue);

const getApiUrl = () => {
  const env = import.meta.env.VITE_API_URL;
  if (env && String(env).trim()) return String(env).replace(/\/$/, "");
  if (typeof window !== "undefined") return `${window.location.origin}/api-backend`;
  return "http://localhost:5000";
};

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "ar");
  const [users, setUsers] = useState([]);
  const [painters, setPainters] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [paints, setPaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [colors, setColors] = useState([]);
  const [colorSystems, setColorSystems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [visits, setVisits] = useState([]);
  const [offers, setOffers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [walletHistory, setWalletHistory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [painterGallery, setPainterGallery] = useState([]);
  const [visitRequests, setVisitRequests] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);

  const [loadingStates, setLoadingStates] = useState({
    global: false, users: false, painters: false, vendors: false, designers: false, paints: false,
    categories: false, reviews: false, colors: false, orders: false, visits: false,
    offers: false, coupons: false, invoices: false, auditLogs: false,
  });
  
  const API_URL = getApiUrl();

  const setLoading = useCallback((key = "global", value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  }, []);

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem("token");
    const headers = { "Accept-Language": language };
    if (token) headers.Authorization = `Bearer ${token}`;
    return { headers };
  }, [language]);

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
    i18n.changeLanguage(newLang);
    document.body.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  // ===============================
  // Users
  // ===============================
  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading("auditLogs", true);
      const res = await axios.get(`${API_URL}/audit-logs`, getAuthHeader());
      setAuditLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setAuditLogs([]); }
    finally { setLoading("auditLogs", false); }
  }, [getAuthHeader, API_URL, setLoading]);

  const getUserById = useCallback(async (id) => {
    try {
      setLoading("users", true);
      const res = await axios.get(`${API_URL}/users/${id}`, getAuthHeader());
      return res.data;
    } catch (err) { return null; }
    finally { setLoading("users", false); }
  }, [getAuthHeader, API_URL, setLoading]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading("users", true);
      const res = await axios.get(`${API_URL}/users`, getAuthHeader());
      const list = Array.isArray(res.data) ? res.data : [];
      setUsers(
        list.map((u) => ({
          ...u,
          status:
            u.status !== undefined
              ? u.status
              : u.isActive !== false && u.isActive !== 0,
        })),
      );
    } catch (err) { setUsers([]); }
    finally { setLoading("users", false); }
  }, [getAuthHeader, API_URL, setLoading]);

  const addUser = async (userData) => {
    try {
      setLoading("users", true);
      const res = await axios.post(`${API_URL}/signup`, userData);
      const raw = res.data.user || res.data;
      const newUser = {
        ...raw,
        status:
          raw.status !== undefined
            ? raw.status
            : raw.isActive !== false && raw.isActive !== 0,
      };
      setUsers((prev) => [...prev, newUser]);
      return { success: true };
    } catch (err) { alert(err.response?.data?.error || "Add user failed"); return { success: false }; }
    finally { setLoading("users", false); }
  };

  const updateUser = async (id, updatedData) => {
    try {
      if (!localStorage.getItem("token")) {
        alert(i18n.t("users.alerts.session_expired", { defaultValue: "انتهت الجلسة. سجّل الدخول مرة أخرى." }));
        window.location.href = "/login";
        return { success: false };
      }
      setLoading("users", true);
      const res = await axios.put(`${API_URL}/users/${id}`, updatedData, getAuthHeader());
      const server = res.data;
      const merged =
        server && typeof server === "object" && server.id !== undefined
          ? {
              ...server,
              status:
                server.status !== undefined
                  ? server.status
                  : server.isActive !== false && server.isActive !== 0,
            }
          : null;
      setUsers((prev) =>
        prev.map((user) =>
          String(user.id) === String(id)
            ? { ...user, ...updatedData, ...(merged || {}) }
            : user,
        ),
      );
      await fetchPainters();
      await fetchVendors();
      return { success: true };
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        alert(
          err.response?.data?.error ||
            i18n.t("users.alerts.session_expired", { defaultValue: "انتهت الجلسة أو التوكن غير صالح. سجّل الدخول مرة أخرى." }),
        );
        window.location.href = "/login";
        return { success: false };
      }
      alert(err.response?.data?.error || "فشلت عملية التحديث");
      return { success: false };
    }
    finally { setLoading("users", false); }
  };

  const uploadUserAvatarForUser = async (id, file) => {
    if (!id || !file) return { success: false, error: "Missing user or file" };
    try {
      setLoading("users", true);
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await axios.post(`${API_URL}/users/${id}/avatar`, formData, getAuthHeader());
      const avatarUrl = res.data?.avatarUrl || null;
      if (avatarUrl) {
        setUsers((prev) =>
          prev.map((u) => (String(u.id) === String(id) ? { ...u, avatarUrl } : u)),
        );
      }
      return { success: true, avatarUrl };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Avatar upload failed" };
    } finally {
      setLoading("users", false);
    }
  };

  const deleteUser = async (id, mode = "soft") => {
    if (!window.confirm(mode === "hard" ? "هل تريد حذف المستخدم نهائيًا؟" : "هل أنت متأكد من حذف هذا المستخدم؟")) return;
    try {
      setLoading("users", true);
      await axios.delete(`${API_URL}/users/${id}?mode=${mode === "hard" ? "hard" : "soft"}`, getAuthHeader());
      if (mode === "hard") {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setPainters((prev) => prev.filter((p) => p.userId !== id));
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            String(u.id) === String(id)
              ? { ...u, status: false, isActive: false }
              : u,
          ),
        );
      }
      return { success: true };
    } catch (err) { return { success: false }; }
    finally { setLoading("users", false); }
  };

  // ===============================
  // Paints
  // ===============================
  const fetchPaints = useCallback(async () => {
    try {
      setLoading("paints", true);
      const res = await axios.get(`${API_URL}/paints`, getAuthHeader());
      setPaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setPaints([]); }
    finally { setLoading("paints", false); }
  }, [getAuthHeader, API_URL, setLoading]);

  const deletePaint = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      setLoading("paints", true);
      await axios.delete(`${API_URL}/paint/${id}`, getAuthHeader());
      setPaints((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) { return { success: false }; }
    finally { setLoading("paints", false); }
  };

  const importPaintsExcel = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axios.post(`${API_URL}/paint/import`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "multipart/form-data" },
      });
      await fetchPaints();
      return { success: true };
    } catch (err) { return { success: false }; }
  };

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`, getAuthHeader());
      const processedData = res.data.map((cat) => ({
        ...cat,
        subCategories: [],
      }));
      setCategories(processedData);
    } catch (err) { setCategories([]); }
  }, [getAuthHeader, API_URL]);

  const addSubCategory = async () => ({ success: false });

  const deleteSubCategory = async () => ({ success: false });

  // ===============================
  // Painters
  // ===============================
  const updatePainterFinancials = async (painterId, financialData) => {
    try {
      setLoading("painters", true);
      const res = await axios.put(`${API_URL}/painters/${painterId}/financial`, financialData, getAuthHeader());
      if (res.data.success) {
        setPainters((prev) => prev.map((p) => String(p.id) === String(painterId) ? { ...p, ...res.data.data } : p));
        await fetchUsers();
        return { success: true };
      }
    } catch (err) { alert(err.response?.data?.error || "فشل تحديث البيانات المالية"); return { success: false }; }
    finally { setLoading("painters", false); }
  };

  const fetchPainters = useCallback(async (params = {}) => {
    try {
      setLoading("painters", true);
      const res = await axios.get(`${API_URL}/painters`, { params, ...getAuthHeader() });
      const list = Array.isArray(res.data) ? res.data : [];
      setPainters(list);
      return list;
    } catch (err) {
      setPainters([]);
      return [];
    } finally {
      setLoading("painters", false);
    }
  }, [getAuthHeader, API_URL, setLoading]);

  const addPainter = async (painterData) => {
    try {
      setLoading("painters", true);
      const res = await axios.post(`${API_URL}/painters`, painterData, getAuthHeader());
      setPainters((prev) => [...prev, res.data]);
      await fetchUsers();
      return { success: true };
    } catch (err) { alert(err.response?.data?.error || "Failed to register painter"); return { success: false }; }
    finally { setLoading("painters", false); }
  };

  const updatePainter = async (painterId, updatedData) => {
    try {
      setLoading("painters", true);
      const isStatusUpdate = Object.prototype.hasOwnProperty.call(updatedData, "status");
      const url = isStatusUpdate ? `${API_URL}/painters/${painterId}/status` : `${API_URL}/painters/${painterId}`;
      await axios.put(url, updatedData, getAuthHeader());
      setPainters((prev) => prev.map((p) => String(p.id) === String(painterId) ? { ...p, ...updatedData } : p));
      return { success: true };
    } catch (err) { return { success: false }; }
    finally { setLoading("painters", false); }
  };

  const deletePainter = async (painterId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الفني؟")) return;
    try {
      setLoading("painters", true);
      await axios.delete(`${API_URL}/painters/${painterId}`, getAuthHeader());
      setPainters((prev) => prev.filter((p) => p.id !== painterId));
      await fetchUsers();
      return { success: true };
    } catch (err) { return { success: false }; }
    finally { setLoading("painters", false); }
  };

  // ===============================
  // Vendors
  // ===============================
  const fetchVendors = useCallback(async () => {
    try {
      setLoading("vendors", true);
      const res = await axios.get(`${API_URL}/vendors?t=${Date.now()}`, getAuthHeader());
      setVendors(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setVendors([]); }
    finally { setLoading("vendors", false); }
  }, [getAuthHeader, API_URL, setLoading]);

  const fetchPendingVendors = useCallback(async () => {
    try {
      setLoading("vendors", true);
      const res = await axios.get(`${API_URL}/vendor-requests?t=${Date.now()}`, getAuthHeader());
      setPendingVendors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setPendingVendors([]);
    } finally {
      setLoading("vendors", false);
    }
  }, [getAuthHeader, API_URL, setLoading]);

  const addVendor = async (vendorData) => {
    try {
      setLoading("vendors", true);
      const res = await axios.post(`${API_URL}/vendors`, vendorData, getAuthHeader());
      setVendors((prev) => [...prev, res.data]);
      await fetchUsers();
      return { success: true };
    } catch (err) { alert(err.response?.data?.error || "Failed to register vendor"); return { success: false }; }
    finally { setLoading("vendors", false); }
  };

  const updateVendor = async (vendorId, updatedData) => {
    try {
      setLoading("vendors", true);
      const isStatusUpdate = Object.prototype.hasOwnProperty.call(updatedData, "isApproved");
      const url = isStatusUpdate ? `${API_URL}/vendors/approve/${vendorId}` : `${API_URL}/vendors/${vendorId}`;
      
      let payload;
      if (isStatusUpdate) {
        payload = { isApproved: updatedData.isApproved };
        if (updatedData.paymentStatus !== undefined) payload.paymentStatus = updatedData.paymentStatus;
        if (updatedData.commissionRate != null && updatedData.commissionRate !== "") {
          payload.commissionRate = updatedData.commissionRate;
        }
      } else {
        payload = {
          shopName: updatedData.shopName,
          address: updatedData.address,
          city: updatedData.city,
          taxRegistration: updatedData.taxRegistration || null,
          companyType: updatedData.companyType || null,
        };
      }
      
      const res = await axios.put(url, payload, getAuthHeader());
      if (res.data) {
        setVendors((prev) => prev.map((v) => {
          if (v.id === vendorId || v.userId === vendorId) {
            return { ...v, ...updatedData };
          }
          return v;
        }));
        await fetchUsers();
        return { success: true };
      }
    } catch (err) { 
      console.error("Update vendor error:", err);
      return { success: false }; 
    }
    finally { setLoading("vendors", false); }
  };

  const deleteVendor = async (id) => {
    if (!window.confirm("هل أنت متأكد؟")) return;
    try {
      setLoading("vendors", true);
      await axios.delete(`${API_URL}/vendors/${id}`, getAuthHeader());
      setVendors((prev) => prev.filter((v) => v.userId !== id));
      await fetchUsers();
      await fetchPendingVendors();
      return { success: true };
    } catch (err) { return { success: false }; }
    finally { setLoading("vendors", false); }
  };

  const fetchDesigners = useCallback(async () => {
    try {
      setLoading("designers", true);
      const res = await axios.get(`${API_URL}/designers?t=${Date.now()}`, getAuthHeader());
      setDesigners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setDesigners([]);
    } finally {
      setLoading("designers", false);
    }
  }, [getAuthHeader, API_URL, setLoading]);

  const updateDesigner = async (userId, payload) => {
    try {
      setLoading("designers", true);
      const res = await axios.put(`${API_URL}/designers/${userId}`, payload, getAuthHeader());
      if (res.data) {
        setDesigners((prev) =>
          prev.map((d) =>
            String(d.userId) === String(userId) ? { ...d, ...res.data } : d,
          ),
        );
        return { success: true, data: res.data };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    } finally {
      setLoading("designers", false);
    }
    return { success: false };
  };

  const deleteDesigner = async (userId) => {
    if (!window.confirm("هل أنت متأكد من حذف المصمم؟")) return { success: false };
    try {
      setLoading("designers", true);
      await axios.delete(`${API_URL}/designers/${userId}`, getAuthHeader());
      setDesigners((prev) => prev.filter((d) => String(d.userId) !== String(userId)));
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Failed to delete designer" };
    } finally {
      setLoading("designers", false);
    }
  };

  const fetchReviews = useCallback(async (params = {}) => {
    try {
      setLoading("reviews", true);
      const res = await axios.get(`${API_URL}/painter-reviews`, { params, ...getAuthHeader() });
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setReviews([]); }
    finally { setLoading("reviews", false); }
  }, [getAuthHeader, API_URL, setLoading]);

  const deleteReview = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا التقييم؟")) return;
    try {
      setLoading("reviews", true);
      await axios.delete(`${API_URL}/painter-reviews/${id}`, getAuthHeader());
      setReviews((prev) => prev.filter((r) => r.id !== id));
      return { success: true };
    } catch (err) { return { success: false }; }
    finally { setLoading("reviews", false); }
  };

  const addReview = async (payload) => {
    try {
      setLoading("reviews", true);
      const res = await axios.post(`${API_URL}/painter-reviews`, payload, getAuthHeader());
      const created = res.data;
      if (created) {
        setReviews((prev) => [created, ...prev]);
      }
      await fetchReviews();
      return { success: true, data: created };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    } finally {
      setLoading("reviews", false);
    }
  };

  const fetchColorSystems = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/color-systems`);
      setColorSystems(res.data);
    } catch (err) { console.error(err.message); }
  }, [API_URL]);

  const fetchColors = useCallback(async (filters = {}) => {
    try {
      setLoading("colors", true);
      const { systemId, search, userId } = filters;
      const res = await axios.get(`${API_URL}/colors`, { params: { systemId, search, userId } });
      setColors(res.data);
    } catch (err) { console.error(err.message); }
    finally { setLoading("colors", false); }
  }, [API_URL, setLoading]);

  const toggleColorFavorite = async (colorCode) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData) { alert("يرجى تسجيل الدخول أولاً"); return; }
      await axios.post(`${API_URL}/colors/favorite`, { colorCode }, getAuthHeader());
      setColors((prev) => prev.map((c) => c.code === colorCode ? { ...c, isFavorite: !c.isFavorite } : c));
      return { success: true };
    } catch (err) { return { success: false }; }
  };

  const updateVendorStatus = async (vendorId, updatedData) => {
    try {
      setLoading("vendors", true);
      const res = await axios.put(`${API_URL}/vendors/approve/${vendorId}`, updatedData, getAuthHeader());
      if (res.data) {
        await fetchVendors();
        await fetchUsers();
        await fetchPendingVendors();
        return { success: true };
      }
    } catch (err) { alert(err.response?.data?.error || "فشل تحديث حالة التاجر"); return { success: false }; }
    finally { setLoading("vendors", false); }
  };

  const processVendorPayout = async (vendorId) => {
    if (!window.confirm("هل تأكدت من تحويل المبلغ للتاجر يدوياً؟")) return;
    try {
      setLoading("vendors", true);
      await axios.post(`${API_URL}/vendors/${vendorId}/payout`, {}, getAuthHeader());
      await fetchVendors(); await fetchUsers();
      return { success: true };
    } catch (err) { alert(err.response?.data?.error || "فشل عملية الصرف"); return { success: false }; }
    finally { setLoading("vendors", false); }
  };

  const createWholesaleRequest = async (payload) => {
    try {
      const res = await axios.post(`${API_URL}/wholesale-requests`, payload, getAuthHeader());
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const createVendorUpgradeRequest = async (payload) => {
    try {
      const res = await axios.post(`${API_URL}/vendor-requests`, payload, getAuthHeader());
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  // ===============================
  // Colors CRUD
  // ===============================
  const addColor = async (colorData) => {
    try {
      setLoading("colors", true);
      const res = await axios.post(`${API_URL}/colors`, colorData, getAuthHeader());
      setColors((prev) => [...prev, res.data]);
      return { success: true };
    } catch (err) { alert(err.response?.data?.error || "Failed to add color"); return { success: false }; }
    finally { setLoading("colors", false); }
  };

  const updateColor = async (id, updatedData) => {
    try {
      setLoading("colors", true);
      const res = await axios.put(`${API_URL}/colors/${id}`, updatedData, getAuthHeader());
      setColors((prev) => prev.map((c) => c.id === Number(id) ? { ...c, ...res.data } : c));
      return { success: true };
    } catch (err) { alert(err.response?.data?.error || "Update color failed"); return { success: false }; }
    finally { setLoading("colors", false); }
  };

  const deleteColor = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا اللون؟")) return;
    try {
      setLoading("colors", true);
      await axios.delete(`${API_URL}/colors/${id}`, getAuthHeader());
      setColors((prev) => prev.filter((c) => c.id !== id));
      return { success: true };
    } catch (err) { return { success: false }; }
    finally { setLoading("colors", false); }
  };

  // ===============================
  // Designs (المصمم + التصاميم)
  // ===============================
  const fetchDesigns = useCallback(async (params = {}) => {
    try {
      const res = await axios.get(`${API_URL}/designs`, { params, ...getAuthHeader() });
      return res.data;
    } catch (err) { throw err; }
  }, [API_URL, getAuthHeader]);

  const fetchDesignById = useCallback(async (id) => {
    try {
      const res = await axios.get(`${API_URL}/designs/${id}`, getAuthHeader());
      return res.data;
    } catch (err) { throw err; }
  }, [API_URL, getAuthHeader]);

  const createDesign = async (data) => {
    try {
      const res = await axios.post(`${API_URL}/designs`, data, getAuthHeader());
      return { success: true, data: res.data };
    } catch (err) { return { success: false, error: err.response?.data?.error }; }
  };

  const uploadDesignImage = async (file) => {
    if (!file) return { success: false, error: "Image file is required" };
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post(`${API_URL}/designs/image`, formData, getAuthHeader());
      return { success: true, imageUrl: res.data?.imageUrl };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Failed to upload image" };
    }
  };

  const updateDesign = async (id, data) => {
    try {
      const res = await axios.put(`${API_URL}/designs/${id}`, data, getAuthHeader());
      return { success: true, data: res.data };
    } catch (err) { return { success: false, error: err.response?.data?.error }; }
  };

  const deleteDesign = async (id) => {
    try {
      await axios.delete(`${API_URL}/designs/${id}`, getAuthHeader());
      return { success: true };
    } catch (err) { return { success: false, error: err.response?.data?.error }; }
  };

  const fetchDesignComments = useCallback(async (designId) => {
    try {
      const res = await axios.get(`${API_URL}/designs/${designId}/comments`, getAuthHeader());
      return res.data;
    } catch (err) { throw err; }
  }, [API_URL, getAuthHeader]);

  const addDesignComment = async (designId, text) => {
    try {
      const res = await axios.post(`${API_URL}/designs/${designId}/comments`, { text }, getAuthHeader());
      return { success: true, data: res.data };
    } catch (err) { return { success: false, error: err.response?.data?.error }; }
  };

  const deleteDesignComment = async (designId, commentId) => {
    try {
      await axios.delete(`${API_URL}/designs/${designId}/comments/${commentId}`, getAuthHeader());
      return { success: true };
    } catch (err) { return { success: false, error: err.response?.data?.error }; }
  };

  const toggleDesignFavorite = async (designId) => {
    try {
      const res = await axios.post(`${API_URL}/designs/${designId}/favorite`, {}, getAuthHeader());
      return { success: true, favorited: res.data?.favorited };
    } catch (err) { return { success: false, error: err.response?.data?.error }; }
  };

  const fetchDesignFavoriteStatus = useCallback(async (designId) => {
    try {
      const res = await axios.get(`${API_URL}/designs/${designId}/favorite`, getAuthHeader());
      return res.data?.favorited ?? false;
    } catch { return false; }
  }, [API_URL, getAuthHeader]);

  const fetchDesignRequests = useCallback(async (designId) => {
    try {
      const res = await axios.get(`${API_URL}/designs/${designId}/requests`, getAuthHeader());
      return res.data;
    } catch (err) { throw err; }
  }, [API_URL, getAuthHeader]);

  const createDesignRequest = async (designId, data) => {
    try {
      const res = await axios.post(`${API_URL}/designs/${designId}/requests`, data, getAuthHeader());
      return { success: true, data: res.data };
    } catch (err) { return { success: false, error: err.response?.data?.error }; }
  };

  // ===============================
  // Visit Requests (طلب زيارة من الفني: التاريخ، الوقت، المساحة، العنوان)
  // ===============================
  const fetchVisitRequests = useCallback(async (params = {}) => {
    try {
      setLoading("visits", true);
      const res = await axios.get(`${API_URL}/visit-requests`, { params, ...getAuthHeader() });
      const list = Array.isArray(res.data) ? res.data : [];
      setVisitRequests(list);
      return list;
    } catch (err) {
      setVisitRequests([]);
      return [];
    } finally {
      setLoading("visits", false);
    }
  }, [API_URL, getAuthHeader, setLoading]);

  const createVisitRequest = async (data) => {
    try {
      const res = await axios.post(`${API_URL}/visit-requests`, data, getAuthHeader());
      setVisitRequests((prev) => [res.data, ...prev]);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const updateVisitRequestStatus = async (id, status) => {
    try {
      const res = await axios.put(`${API_URL}/visit-requests/${id}/status`, { status }, getAuthHeader());
      setVisitRequests((prev) => prev.map((v) => (String(v.id) === String(id) ? { ...v, status } : v)));
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading("orders", true);
      const payload = getJwtPayload();
      let localRole = null;
      try {
        localRole = JSON.parse(localStorage.getItem("user") || "{}")?.role || null;
      } catch {
        localRole = null;
      }
      const role = payload?.role || localRole;
      const isAdmin = role === "admin";
      const url = isAdmin ? `${API_URL}/admin/orders` : `${API_URL}/orders`;
      const res = await axios.get(url, getAuthHeader());
      let list = Array.isArray(res.data) ? res.data : [];
      if (!isAdmin) {
        let u = {};
        try {
          u = JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
          u = {};
        }
        const fallbackUser = {
          id: u.id,
          name: u.name,
          phone: u.phone,
          email: u.email,
          city: u.city || "",
        };
        list = list.map((o) => ({
          ...o,
          orderNumber: o.orderNumber || `ORD-${String(o.id).slice(0, 8)}`,
          source: o.source || "wholesale",
          user: o.user || fallbackUser,
        }));
      }
      setOrders(list);
    } catch (err) { setOrders([]); }
    finally { setLoading("orders", false); }
  }, [getAuthHeader, API_URL, setLoading]);

  const fetchVisits = useCallback(async () => {
    try {
      setLoading("visits", true);
      const res = await axios.get(`${API_URL}/admin/visits`, getAuthHeader());
      setVisits(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setVisits([]); }
    finally { setLoading("visits", false); }
  }, [getAuthHeader, API_URL, setLoading]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading("orders", true);
      await axios.put(`${API_URL}/admin/orders/${orderId}`, { status: newStatus }, getAuthHeader());
      if (newStatus === "delivered" || newStatus === "completed") {
        await fetchVendors();
        await fetchUsers();
      }
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      return { success: true };
    } catch (err) { return { success: false }; }
    finally { setLoading("orders", false); }
  };

  const updateVisitStatus = async (visitId, newStatus) => {
    try {
      setLoading("visits", true);
      await axios.put(`${API_URL}/admin/visits/${visitId}`, { status: newStatus }, getAuthHeader());
      setVisits((prev) => prev.map((v) => v.id === visitId ? { ...v, status: newStatus } : v));
      return { success: true };
    } catch (err) { return { success: false }; }
    finally { setLoading("visits", false); }
  };

  const calculatePaint = async (calcData) => {
    try {
      setLoading("global", true);
      const res = await axios.post(`${API_URL}/services/calculate`, calcData, getAuthHeader());
      return { success: true, data: res.data };
    } catch (err) { return { success: false, error: err.message }; }
    finally { setLoading("global", false); }
  };

  const convertColorMatch = async (convertData) => {
    try {
      setLoading("global", true);
      const res = await axios.post(`${API_URL}/services/convert`, convertData, getAuthHeader());
      return { success: true, data: res.data };
    } catch (err) { return { success: false, error: err.message }; }
    finally { setLoading("global", false); }
  };

  // ===============================
  // Offers
  // ===============================
  const fetchOffers = useCallback(async () => {
    try {
      setLoading("offers", true);
      const res = await axios.get(`${API_URL}/offers?type=offer`, getAuthHeader());
      setOffers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setOffers([]); }
    finally { setLoading("offers", false); }
  }, [getAuthHeader, API_URL, setLoading]);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading("coupons", true);
      const res = await axios.get(`${API_URL}/coupons`, getAuthHeader());
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setCoupons([]);
    } finally {
      setLoading("coupons", false);
    }
  }, [getAuthHeader, API_URL, setLoading]);

  const addOffer = async (offerData) => {
    try {
      setLoading("offers", true);
      const res = await axios.post(`${API_URL}/offers`, { ...offerData, campaignType: "offer" }, getAuthHeader());
      setOffers((prev) => [res.data, ...prev]);
      return { success: true };
    } catch (err) { return { success: false }; }
    finally { setLoading("offers", false); }
  };

  const addCoupon = async (couponData) => {
    try {
      setLoading("coupons", true);
      const res = await axios.post(`${API_URL}/coupons`, { ...couponData, campaignType: "coupon" }, getAuthHeader());
      setCoupons((prev) => [res.data, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false };
    } finally {
      setLoading("coupons", false);
    }
  };

  const deleteOffer = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العرض؟")) return;
    try {
      setLoading("offers", true);
      await axios.delete(`${API_URL}/offers/${id}`, getAuthHeader());
      setOffers((prev) => prev.filter((o) => o.id !== id));
      return { success: true };
    } catch (err) { return { success: false }; }
    finally { setLoading("offers", false); }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;
    try {
      setLoading("coupons", true);
      await axios.delete(`${API_URL}/coupons/${id}`, getAuthHeader());
      setCoupons((prev) => prev.filter((o) => o.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false };
    } finally {
      setLoading("coupons", false);
    }
  };

  const updateOffer = async (id, offerData) => {
    try {
      setLoading("offers", true);
      const res = await axios.put(`${API_URL}/offers/${id}`, offerData, getAuthHeader());
      setOffers((prev) => prev.map((o) => (String(o.id) === String(id) ? { ...o, ...res.data } : o)));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Failed to update offer" };
    } finally {
      setLoading("offers", false);
    }
  };

  const updateCoupon = async (id, couponData) => {
    try {
      setLoading("coupons", true);
      const res = await axios.put(
        `${API_URL}/coupons/${id}`,
        { ...couponData, campaignType: "coupon" },
        getAuthHeader(),
      );
      setCoupons((prev) => prev.map((o) => (String(o.id) === String(id) ? { ...o, ...res.data } : o)));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Failed to update coupon" };
    } finally {
      setLoading("coupons", false);
    }
  };

  const toggleOfferStatus = async (id) => {
    try {
      const res = await axios.patch(`${API_URL}/offers/${id}`, {}, getAuthHeader());
      setOffers((prev) => prev.map((o) => o.id === Number(id) ? { ...o, isActive: res.data.isActive } : o));
      return { success: true };
    } catch (err) { return { success: false }; }
  };

  const toggleCouponStatus = async (id) => {
    try {
      const row = coupons.find((c) => String(c.id) === String(id));
      if (!row) return { success: false };
      const res = await axios.patch(
        `${API_URL}/coupons/${id}`,
        { isActive: !Boolean(row.isActive) },
        getAuthHeader(),
      );
      const nextActive = res.data?.isActive ?? !Boolean(row.isActive);
      setCoupons((prev) => prev.map((c) => (String(c.id) === String(id) ? { ...c, isActive: nextActive } : c)));
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  const fetchWalletHistory = useCallback(async (userId) => {
    try {
      setLoading("global", true);
      const res = await axios.get(`${API_URL}/wallet/transactions/${userId}`, getAuthHeader());
      setWalletHistory(res.data);
    } catch (err) { setWalletHistory([]); }
    finally { setLoading("global", false); }
  }, [getAuthHeader, API_URL, setLoading]);

  const verifyPainter = async (painterId, isVerified) => {
    try {
      setLoading("painters", true);
      const res = await axios.patch(`${API_URL}/api/admin/painters/verify/${painterId}`,
        { isVerified, status: isVerified ? "accepted" : "rejected" }, getAuthHeader());
      if (res.data.success) {
        setPainters((prev) => prev.map((p) => String(p.id) === String(painterId)
          ? { ...p, verificationStatus: isVerified ? "verified" : "rejected", user: p.user ? { ...p.user, status: isVerified } : p.user }
          : p));
        await fetchPainters();
        return { success: true };
      }
    } catch (err) { return { success: false }; }
    finally { setLoading("painters", false); }
  };

  const getPaintDetails = useCallback(async (id) => {
    try {
      setLoading("paints", true);
      const res = await axios.get(`${API_URL}/paint/${id}`);
      return res.data;
    } catch (err) { return null; }
    finally { setLoading("paints", false); }
  }, [API_URL, setLoading]);

  const getOrderDetails = useCallback(async (id) => {
    try {
      setLoading("orders", true);
      const payload = getJwtPayload();
      const isAdmin = payload?.role === "admin";
      const url = isAdmin ? `${API_URL}/admin/orders/${id}` : `${API_URL}/orders/${id}`;
      const res = await axios.get(url, getAuthHeader());
      const data = res.data;
      if (!isAdmin && data && !data.user) {
        try {
          const u = JSON.parse(localStorage.getItem("user") || "{}");
          return {
            ...data,
            user: { id: u.id, name: u.name, phone: u.phone, email: u.email },
          };
        } catch {
          return data;
        }
      }
      return data;
    } catch (err) { return null; }
    finally { setLoading("orders", false); }
  }, [getAuthHeader, API_URL, setLoading]);

  const updateVisit = async (visitId, updatedData) => {
    try {
      setLoading("visits", true);
      const payload = {
        visitDate: updatedData.visitDate,
        area: Number(updatedData.area),
        painterId: updatedData.painterId ? Number(updatedData.painterId) : null,
        status: updatedData.status,
        visitTime: updatedData.visitTime,
        city: updatedData.city,
        region: updatedData.region,
      };
      const res = await axios.put(`${API_URL}/admin/visits/${visitId}`, payload, getAuthHeader());
      const updatedVisitFromServer = res.data.visit || res.data;
      setVisits((prev) => prev.map((v) => v.id === Number(visitId) ? { ...v, ...updatedVisitFromServer } : v));
      return { success: true };
    } catch (err) { alert("حدث خطأ أثناء حفظ البيانات"); return { success: false }; }
    finally { setLoading("visits", false); }
  };

  const updatePaintQuantity = async (id, newStock) => {
    try {
      setLoading("paints", true);
      const currentPaint = paints.find((p) => p.id === id);
      if (!currentPaint) return;
      const payload = {
        name: currentPaint.name,
        description: currentPaint.description || null,
        price: parseFloat(currentPaint.price),
        stock: parseInt(newStock),
        image: currentPaint.image || null,
        coverage: parseFloat(currentPaint.coverage) || 0,
        coatHours: parseInt(currentPaint.coatHours) || 0,
        dryDays: parseInt(currentPaint.dryDays) || 0,
        base: currentPaint.base,
        finish: currentPaint.finish,
        unit: currentPaint.unit,
        usage: currentPaint.usage,
        vendorId: null,
        categoryId: String(currentPaint.categoryId ?? ""),
        minStockLevel: parseInt(currentPaint.minStockLevel) || 5,
        availability: parseInt(newStock) > 0 ? "in_stock" : "out_of_stock",
        barcode: currentPaint.barcode || null,
        status: currentPaint.status || "available",
      };
      const res = await axios.put(`${API_URL}/paint/${id}`, payload, getAuthHeader());
      if (res.status === 200) {
        setPaints((prev) => prev.map((p) => p.id === id ? { ...p, stock: parseInt(newStock), availability: payload.availability } : p));
        alert("تم تحديث المخزون بنجاح! ✅");
      }
    } catch (err) { alert("فشل التحديث"); }
    finally { setLoading("paints", false); }
  };

  const syncInventory = async () => {
    try {
      setLoading("paints", true);
      await axios.post(`${API_URL}/paint/sync`, {}, getAuthHeader());
      await fetchPaints();
      return { success: true };
    } finally { setLoading("paints", false); }
  };

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading("invoices", true);
      const res = await axios.get(`${API_URL}/api/invoices`, getAuthHeader());
      let list = Array.isArray(res.data) ? res.data : [];
      const payload = getJwtPayload();
      if (payload?.role !== "admin" && payload?.id) {
        list = list.filter((inv) => inv.customer?.id === payload.id);
      }
      setInvoices(list);
    } catch (err) { setInvoices([]); }
    finally { setLoading("invoices", false); }
  }, [getAuthHeader, API_URL, setLoading]);

  const fetchPainterGallery = useCallback(async (painterId) => {
    try {
      setLoading("global", true);
      const res = await axios.get(`${API_URL}/painters/${painterId}`, getAuthHeader());
      setPainterGallery(res.data.gallery || []);
    } catch (err) {
      setPainterGallery([]);
    } finally {
      setLoading("global", false);
    }
  }, [API_URL, getAuthHeader, setLoading]);

  const deleteGalleryItem = async (photoId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الصورة من المعرض؟")) return;
    try {
      setLoading("global", true);
      await axios.delete(`${API_URL}/painters/gallery/${photoId}`, getAuthHeader());
      setPainterGallery((prev) => prev.filter((item) => item.id !== photoId));
      return { success: true };
    } catch (err) {
      alert(err.response?.data?.error || "فشل حذف الصورة");
      return { success: false };
    } finally {
      setLoading("global", false);
    }
  };

  const addPainterGalleryItem = async (painterId, file) => {
    if (!painterId || !file) return { success: false, error: "Missing painter or file" };
    try {
      setLoading("global", true);
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post(
        `${API_URL}/painters/${painterId}/gallery`,
        formData,
        getAuthHeader(),
      );
      if (res.data?.id) {
        setPainterGallery((prev) => [res.data, ...prev]);
      }
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "فشل إضافة الصورة" };
    } finally {
      setLoading("global", false);
    }
  };

  const updatePainterGalleryItem = async (photoId, file) => {
    if (!photoId || !file) return { success: false, error: "Missing photo or file" };
    try {
      setLoading("global", true);
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.patch(
        `${API_URL}/painters/gallery/${photoId}`,
        formData,
        getAuthHeader(),
      );
      const updated = res.data || {};
      setPainterGallery((prev) =>
        prev.map((item) => (item.id === photoId ? { ...item, ...updated } : item)),
      );
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "فشل تحديث الصورة" };
    } finally {
      setLoading("global", false);
    }
  };

  const addCategory = async ({ nameAr, nameEn, offerId = null }) => {
    setLoading("categories", true);
    try {
      const payload = {
        name_ar: String(nameAr || "").trim(),
        name_en: String(nameEn || "").trim(),
        offerId,
      };
      const res = await axios.post(`${API_URL}/categories`, payload, getAuthHeader());
      setCategories((prev) => [...prev, res.data]);
      return { success: true };
    } catch (err) { alert(err.response?.data?.error || "فشل إضافة القسم"); return { success: false }; }
    finally { setLoading("categories", false); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    try {
      setLoading("categories", true);
      await axios.delete(`${API_URL}/categories/${id}`, getAuthHeader());
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      return { success: true };
    } catch (err) { alert(err.response?.data?.error || "فشل حذف القسم"); return { success: false }; }
    finally { setLoading("categories", false); }
  };

  const updateCategory = async (id, { nameAr, nameEn }) => {
    setLoading("categories", true);
    try {
      const payload = {
        name_ar: String(nameAr || "").trim(),
        name_en: String(nameEn || "").trim(),
      };
      await axios.put(`${API_URL}/categories/${id}`, payload, getAuthHeader());
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === id
            ? {
                ...cat,
                nameAr: payload.name_ar,
                nameEn: payload.name_en,
                name:
                  language === "ar"
                    ? payload.name_ar || payload.name_en || cat.name
                    : payload.name_en || payload.name_ar || cat.name,
              }
            : cat,
        ),
      );
      return { success: true };
    } catch (err) { alert(err.response?.data?.error || "فشل تحديث القسم"); return { success: false }; }
    finally { setLoading("categories", false); }
  };

  const updateCategoryOffer = async (id, offerId) => {
    setLoading("categories", true);
    try {
      await axios.put(
        `${API_URL}/categories/${id}`,
        { offerId: offerId || null },
        getAuthHeader(),
      );
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? { ...cat, offerId: offerId || null } : cat)),
      );
      return { success: true };
    } catch (err) {
      alert(err.response?.data?.error || "فشل تحديث عرض القسم");
      return { success: false };
    } finally {
      setLoading("categories", false);
    }
  };

  // ===============================
  // On Mount
  // ===============================
  useEffect(() => { document.body.dir = language === "ar" ? "rtl" : "ltr"; }, [language]);

  useEffect(() => {
    const role = getJwtPayload()?.role;
    if (role === "vendor") {
      fetchPaints();
      fetchCategories();
      fetchOrders();
      fetchInvoices();
      fetchOffers();
      fetchCoupons();
      return;
    }
    fetchUsers(); fetchPainters(); fetchVendors(); fetchDesigners(); fetchPaints(); fetchCategories();
    fetchReviews(); fetchColorSystems(); fetchColors(); fetchOrders(); fetchVisits();
    fetchOffers(); fetchCoupons(); fetchAuditLogs(); fetchInvoices();
  }, [fetchUsers, fetchPainters, fetchVendors, fetchDesigners, fetchPaints, fetchCategories,
    fetchReviews, fetchColorSystems, fetchColors, fetchOrders, fetchVisits,
    fetchOffers, fetchCoupons, fetchAuditLogs, fetchInvoices]);

  return (
    <AppContext.Provider
      value={{
        users, painters, vendors, pendingVendors, designers, paints, language, categories, reviews, colors,
        colorSystems, orders, visits, offers, coupons, auditLogs, walletHistory,
        invoices, painterGallery, loading: loadingStates.global, loadingStates,
        changeLanguage, fetchUsers, addUser, updateUser, uploadUserAvatarForUser, deleteUser,
        fetchPainters, addPainter, updatePainter, deletePainter, updatePainterFinancials,
        fetchVendors, addVendor, updateVendor, deleteVendor,
        fetchDesigners, updateDesigner, deleteDesigner,
        fetchPaints, deletePaint, importPaintsExcel, getPaintDetails,
        updatePaintQuantity, syncInventory, fetchCategories, addCategory,
        deleteCategory, updateCategory, updateCategoryOffer, addSubCategory, deleteSubCategory,
        fetchColorSystems, fetchColors, addColor, updateColor, deleteColor,
        toggleColorFavorite,
        fetchDesigns, fetchDesignById, createDesign, uploadDesignImage, updateDesign, deleteDesign,
        fetchDesignComments, addDesignComment, deleteDesignComment,
        toggleDesignFavorite, fetchDesignFavoriteStatus, fetchDesignRequests, createDesignRequest,
        visitRequests, fetchVisitRequests, createVisitRequest, updateVisitRequestStatus,
        fetchOrders, getOrderDetails, updateOrderStatus,
        fetchVisits, updateVisit, updateVisitStatus, fetchOffers, addOffer, updateOffer,
        deleteOffer, toggleOfferStatus, fetchCoupons, addCoupon, updateCoupon,
        deleteCoupon, toggleCouponStatus, fetchInvoices,
        fetchReviews, addReview, deleteReview, verifyPainter,
        fetchAuditLogs, getUserById, processVendorPayout, fetchWalletHistory,
        fetchPainterGallery, deleteGalleryItem, addPainterGalleryItem, updatePainterGalleryItem,
        updateVendorStatus, fetchPendingVendors,
        createWholesaleRequest, createVendorUpgradeRequest,
        calculatePaint, convertColorMatch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
