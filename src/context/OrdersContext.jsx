import React, { createContext, useState, useCallback, useContext } from "react";
import axios from "axios";

export const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [visits, setVisits] = useState([]);
  const [offers, setOffers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const getAuthHeader = useCallback(() => {
    const language = localStorage.getItem("language") || "ar";
    return {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Accept-Language": language,
      },
    };
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/orders`, getAuthHeader());
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch orders error:", err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, getAuthHeader]);

  const getOrderDetails = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/orders/${id}`, getAuthHeader());
      return res.data;
    } catch (err) {
      console.error("Fetch order details error:", err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_URL, getAuthHeader]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/admin/orders/${orderId}`,
        { status: newStatus },
        getAuthHeader()
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      return { success: true };
    } catch (err) {
      console.error("Update order error:", err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const fetchVisits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/visits`, getAuthHeader());
      setVisits(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch visits error:", err.message);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, getAuthHeader]);

  const updateVisit = async (visitId, updatedData) => {
    try {
      setLoading(true);
      const payload = {
        visitDate: updatedData.visitDate,
        area: Number(updatedData.area),
        painterId: updatedData.painterId ? Number(updatedData.painterId) : null,
        status: updatedData.status,
        visitTime: updatedData.visitTime,
        city: updatedData.city,
        region: updatedData.region,
      };
      const res = await axios.put(
        `${API_URL}/admin/visits/${visitId}`,
        payload,
        getAuthHeader()
      );
      const updatedVisitFromServer = res.data.visit || res.data;
      setVisits((prev) =>
        prev.map((v) =>
          v.id === Number(visitId) ? { ...v, ...updatedVisitFromServer } : v
        )
      );
      return { success: true };
    } catch (err) {
      console.error("خطأ في التحديث:", err.response?.data || err.message);
      alert("حدث خطأ أثناء حفظ البيانات");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updateVisitStatus = async (visitId, newStatus) => {
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/admin/visits/${visitId}`,
        { status: newStatus },
        getAuthHeader()
      );
      setVisits((prev) =>
        prev.map((v) => (v.id === visitId ? { ...v, status: newStatus } : v))
      );
      return { success: true };
    } catch (err) {
      console.error("Update visit error:", err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/offers`, getAuthHeader());
      setOffers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch offers error:", err.message);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, getAuthHeader]);

  const addOffer = async (offerData) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/offers`, offerData, getAuthHeader());
      setOffers((prev) => [res.data, ...prev]);
      return { success: true };
    } catch (err) {
      console.error("Add offer error:", err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const deleteOffer = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العرض؟")) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/offers/${id}`, getAuthHeader());
      setOffers((prev) => prev.filter((o) => o.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Delete offer error:", err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const toggleOfferStatus = async (id) => {
    try {
      const res = await axios.patch(`${API_URL}/offers/${id}`, {}, getAuthHeader());
      setOffers((prev) =>
        prev.map((o) =>
          o.id === Number(id) ? { ...o, isActive: res.data.isActive } : o
        )
      );
      return { success: true };
    } catch (err) {
      console.error("Toggle status error:", err.message);
      return { success: false };
    }
  };

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/invoices`, getAuthHeader());
      setInvoices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch invoices error:", err.message);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, getAuthHeader]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/audit-logs`, getAuthHeader());
      setAuditLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch audit logs error:", err.message);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, getAuthHeader]);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        visits,
        offers,
        invoices,
        auditLogs,
        loading,
        fetchOrders,
        getOrderDetails,
        updateOrderStatus,
        fetchVisits,
        updateVisit,
        updateVisitStatus,
        fetchOffers,
        addOffer,
        deleteOffer,
        toggleOfferStatus,
        fetchInvoices,
        fetchAuditLogs,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);
