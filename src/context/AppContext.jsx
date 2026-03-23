import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import i18n from "../i18n/i18n";

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
  const [paints, setPaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [colors, setColors] = useState([]);
  const [colorSystems, setColorSystems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [visits, setVisits] = useState([]);
  const [offers, setOffers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [walletHistory, setWalletHistory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [painterGallery, setPainterGallery] = useState([]);
  const [visitRequests, setVisitRequests] = useState([]);

  const [loadingStates, setLoadingStates] = useState({
    global: false, users: false, painters: false, vendors: false, paints: false,
    categories: false, reviews: false, colors: false, orders: false, visits: false,
    offers: false, customers: false, invoices: false, auditLogs: false,
  });
  
  const API_URL = getApiUrl();

  const setLoading = useCallback((key = "global", value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  }, []);

  const getAuthHeader = useCallback(() => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Accept-Language": language,
    },
  }), [language]);

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
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setUsers([]); }
    finally { setLoading("users", false); }
  }, [getAuthHeader, API_URL, setLoading]);

  const addUser = async (userData) => {
    try {
      setLoading("users", true);
      const res = await axios.post(`${API_URL}/signup`, userData);
      const newUser = res.data.user || res.data;
      setUsers((prev) => [...prev, newUser]);
      return { success: true };
    } catch (err) { alert(err.response?.data?.error || "Add user failed"); return { success: false }; }
    finally { setLoading("users", false); }
  };

  const updateUser = async (id, updatedData) => {
    try {
      setLoading("users", true);
      await axios.put(`${API_URL}/users/${id}`, updatedData, getAuthHeader());
      setUsers((prev) => prev.map((user) => user.id === Number(id) ? { ...user, ...updatedData } : user));
      await fetchPainters();
      await fetchVendors();
      return { success: true };
    } catch (err) { alert(err.response?.data?.error || "فشلت عملية التحديث"); return { success: false }; }
    finally { setLoading("users", false); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    try {
      setLoading("users", true);
      await axios.delete(`${API_URL}/users/${id}`, getAuthHeader());
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setPainters((prev) => prev.filter((p) => p.userId !== id));
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
        subCategories: cat.SubCategory || cat.subcategory || cat.subcategories || [],
      }));
      setCategories(processedData);
    } catch (err) { setCategories([]); }
  }, [getAuthHeader, API_URL]);

  const addSubCategory = async (subData) => {
    try {
      setLoading("categories", true);
      await axios.post(`${API_URL}/subcategories`, subData, getAuthHeader());
      await fetchCategories();
      return { success: true };
    } catch (err) { return { success: false }; }
    finally { setLoading("categories", false); }
  };

  const deleteSubCategory = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا التصنيف الفرعي؟")) return;
    try {
      setLoading("categories", true);
      await axios.delete(`${API_URL}/subcategories/${id}`, getAuthHeader());
      await fetchCategories();
      return { success: true };
    } catch (err) { return { success: false }; }
    finally { setLoading("categories", false); }
  };

  // ===============================
  // Painters
  // ===============================
  const updatePainterFinancials = async (painterId, financialData) => {
    try {
      setLoading("painters", true);
      const res = await axios.put(`${API_URL}/painters/${painterId}/financial`, financialData, getAuthHeader());
      if (res.data.success) {
        setPainters((prev) => prev.map((p) => p.id === Number(painterId) ? { ...p, ...res.data.data } : p));
        await fetchUsers();
        return { success: true };
      }
    } catch (err) { alert(err.response?.data?.error || "فشل تحديث البيانات المالية"); return { success: false }; }
    finally { setLoading("painters", false); }
  };

  const fetchPainters = useCallback(async () => {
    try {
      setLoading("painters", true);
      const res = await axios.get(`${API_URL}/painters`, getAuthHeader());
      setPainters(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setPainters([]); }
    finally { setLoading("painters", false); }
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
      setPainters((prev) => prev.map((p) => p.id === Number(painterId) ? { ...p, ...updatedData } : p));
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
        payload = { isApproved: updatedData.isApproved, commissionRate: updatedData.commissionRate };
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
      return { success: true };
    } catch (err) { return { success: false }; }
    finally { setLoading("vendors", false); }
  };

  const fetchReviews = useCallback(async () => {
    try {
      setLoading("reviews", true);
      const res = await axios.get(`${API_URL}/painter-reviews`, getAuthHeader());
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
      if (res.data) { await fetchVendors(); await fetchUsers(); return { success: true }; }
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

  const fetchPendingVendors = useCallback(async () => { await fetchVendors(); }, [fetchVendors]);

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
      setVisitRequests((prev) => prev.map((v) => (v.id === Number(id) ? { ...v, status } : v)));
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading("orders", true);
      const res = await axios.get(`${API_URL}/admin/orders`, getAuthHeader());
      setOrders(Array.isArray(res.data) ? res.data : []);
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
      if (newStatus === "completed") { await fetchVendors(); await fetchUsers(); }
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
      const res = await axios.get(`${API_URL}/offers`, getAuthHeader());
      setOffers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setOffers([]); }
    finally { setLoading("offers", false); }
  }, [getAuthHeader, API_URL, setLoading]);

  const addOffer = async (offerData) => {
    try {
      setLoading("offers", true);
      const res = await axios.post(`${API_URL}/offers`, offerData, getAuthHeader());
      setOffers((prev) => [res.data, ...prev]);
      return { success: true };
    } catch (err) { return { success: false }; }
    finally { setLoading("offers", false); }
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

  const toggleOfferStatus = async (id) => {
    try {
      const res = await axios.patch(`${API_URL}/offers/${id}`, {}, getAuthHeader());
      setOffers((prev) => prev.map((o) => o.id === Number(id) ? { ...o, isActive: res.data.isActive } : o));
      return { success: true };
    } catch (err) { return { success: false }; }
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
        setPainters((prev) => prev.map((p) => p.id === Number(painterId)
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
      const res = await axios.get(`${API_URL}/admin/orders/${id}`, getAuthHeader());
      return res.data;
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
        vendorId: parseInt(currentPaint.vendorId),
        categoryId: parseInt(currentPaint.categoryId),
        subCategoryId: currentPaint.subCategoryId ? parseInt(currentPaint.subCategoryId) : null,
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

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading("customers", true);
      const res = await axios.get(`${API_URL}/api/customers`, getAuthHeader());
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setCustomers([]); }
    finally { setLoading("customers", false); }
  }, [getAuthHeader, API_URL, setLoading]);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading("invoices", true);
      const res = await axios.get(`${API_URL}/api/invoices`, getAuthHeader());
      setInvoices(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setInvoices([]); }
    finally { setLoading("invoices", false); }
  }, [getAuthHeader, API_URL, setLoading]);

  const updateCreditLimit = async (customerId, newLimit) => {
    try {
      setLoading("customers", true);
      await axios.put(`${API_URL}/users/${customerId}`, { creditLimit: newLimit }, getAuthHeader());
      await fetchCustomers();
      return { success: true };
    } catch (err) { return { success: false }; }
    finally { setLoading("customers", false); }
  };

  const fetchPainterGallery = useCallback(async (painterId) => {
    try {
      setLoading("global", true);
      const res = await axios.get(`${API_URL}/api/painter/gallery/${painterId}`);
      setPainterGallery(res.data.data || []);
    } catch (err) { setPainterGallery([]); }
    finally { setLoading("global", false); }
  }, [API_URL, setLoading]);

  const deleteGalleryItem = async (photoId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الصورة من المعرض؟")) return;
    try {
      setLoading("global", true);
      await axios.delete(`${API_URL}/api/painter/gallery/${photoId}`, getAuthHeader());
      setPainterGallery((prev) => prev.filter((item) => item.id !== photoId));
      return { success: true };
    } catch (err) { alert("فشل حذف الصورة"); return { success: false }; }
    finally { setLoading("global", false); }
  };

  const addCategory = async (name) => {
    setLoading("categories", true);
    try {
      const res = await axios.post(`${API_URL}/categories`, { name_ar: name, name_en: name }, getAuthHeader());
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

  const updateCategory = async (id, newName) => {
    setLoading("categories", true);
    try {
      await axios.put(`${API_URL}/categories/${id}`, { name_ar: newName, name_en: newName }, getAuthHeader());
      setCategories((prev) => prev.map((cat) => cat.id === id ? { ...cat, name: newName } : cat));
      return { success: true };
    } catch (err) { alert(err.response?.data?.error || "فشل تحديث القسم"); return { success: false }; }
    finally { setLoading("categories", false); }
  };

  // ===============================
  // On Mount
  // ===============================
  useEffect(() => { document.body.dir = language === "ar" ? "rtl" : "ltr"; }, [language]);

  useEffect(() => {
    fetchUsers(); fetchPainters(); fetchVendors(); fetchPaints(); fetchCategories();
    fetchReviews(); fetchColorSystems(); fetchColors(); fetchOrders(); fetchVisits();
    fetchOffers(); fetchAuditLogs(); fetchCustomers(); fetchInvoices();
  }, [fetchUsers, fetchPainters, fetchVendors, fetchPaints, fetchCategories,
    fetchReviews, fetchColorSystems, fetchColors, fetchOrders, fetchVisits,
    fetchOffers, fetchAuditLogs, fetchCustomers, fetchInvoices]);

  return (
    <AppContext.Provider
      value={{
        users, painters, vendors, paints, language, categories, reviews, colors,
        colorSystems, orders, visits, offers, auditLogs, walletHistory,
        customers, invoices, painterGallery, loading: loadingStates.global, loadingStates,
        changeLanguage, fetchUsers, addUser, updateUser, deleteUser,
        fetchPainters, addPainter, updatePainter, deletePainter, updatePainterFinancials,
        fetchVendors, addVendor, updateVendor, deleteVendor,
        fetchPaints, deletePaint, importPaintsExcel, getPaintDetails,
        updatePaintQuantity, syncInventory, fetchCategories, addCategory,
        deleteCategory, updateCategory, addSubCategory, deleteSubCategory,
        fetchColorSystems, fetchColors, addColor, updateColor, deleteColor,
        toggleColorFavorite,
        fetchDesigns, fetchDesignById, createDesign, updateDesign, deleteDesign,
        fetchDesignComments, addDesignComment, deleteDesignComment,
        toggleDesignFavorite, fetchDesignFavoriteStatus, fetchDesignRequests, createDesignRequest,
        visitRequests, fetchVisitRequests, createVisitRequest, updateVisitRequestStatus,
        fetchOrders, getOrderDetails, updateOrderStatus,
        fetchVisits, updateVisit, updateVisitStatus, fetchOffers, addOffer,
        deleteOffer, toggleOfferStatus, fetchCustomers, fetchInvoices,
        updateCreditLimit, fetchReviews, deleteReview, verifyPainter,
        fetchAuditLogs, getUserById, processVendorPayout, fetchWalletHistory,
        fetchPainterGallery, deleteGalleryItem, updateVendorStatus, fetchPendingVendors,
        calculatePaint, convertColorMatch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
