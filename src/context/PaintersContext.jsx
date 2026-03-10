import React, { createContext, useState, useCallback, useContext } from "react";
import axios from "axios";

export const PaintersContext = createContext();

export const PaintersProvider = ({ children }) => {
  const [painters, setPainters] = useState([]);
  const [painterGallery, setPainterGallery] = useState([]);
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

  const fetchPainters = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/painters`, getAuthHeader());
      setPainters(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch painters error:", err.message);
      setPainters([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, getAuthHeader]);

  const addPainter = async (painterData) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/painters`,
        painterData,
        getAuthHeader(),
      );
      setPainters((prev) => [...prev, res.data]);
      return { success: true };
    } catch (err) {
      alert(err.response?.data?.error || "Failed to register painter");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updatePainter = async (painterId, updatedData) => {
    try {
      setLoading(true);
      const isStatusUpdate = Object.prototype.hasOwnProperty.call(updatedData, "status");
      const url = isStatusUpdate
        ? `${API_URL}/painters/${painterId}/status`
        : `${API_URL}/painters/${painterId}`;

      await axios.put(url, updatedData, getAuthHeader());

      setPainters((prev) =>
        prev.map((p) =>
          p.id === Number(painterId)
            ? {
                ...p,
                ...updatedData,
                user:
                  p.user && isStatusUpdate
                    ? { ...p.user, status: updatedData.status === "accepted" }
                    : p.user,
              }
            : p,
        ),
      );
      return { success: true };
    } catch (err) {
      console.error("Update painter error:", err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const deletePainter = async (painterId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الفني؟")) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/painters/${painterId}`, getAuthHeader());
      setPainters((prev) => prev.filter((p) => p.id !== painterId));
      return { success: true };
    } catch (err) {
      console.error("Delete painter error:", err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updatePainterFinancials = async (painterId, financialData) => {
    try {
      setLoading(true);
      const res = await axios.put(
        `${API_URL}/painters/${painterId}/financial`,
        financialData,
        getAuthHeader(),
      );

      if (res.data.success) {
        setPainters((prev) =>
          prev.map((p) =>
            p.id === Number(painterId) ? { ...p, ...res.data.data } : p,
          ),
        );
        return { success: true };
      }
    } catch (err) {
      console.error("Update financial error:", err.response?.data?.error || err.message);
      alert(err.response?.data?.error || "فشل تحديث البيانات المالية");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const verifyPainter = async (painterId, isVerified) => {
    try {
      setLoading(true);
      const res = await axios.patch(
        `${API_URL}/api/admin/painters/verify/${painterId}`,
        {
          isVerified: isVerified,
          status: isVerified ? "accepted" : "rejected",
        },
        getAuthHeader(),
      );

      if (res.data.success) {
        setPainters((prev) =>
          prev.map((p) =>
            p.id === Number(painterId)
              ? {
                  ...p,
                  verificationStatus: isVerified ? "verified" : "rejected",
                  user: p.user ? { ...p.user, status: isVerified } : p.user,
                }
              : p,
          ),
        );
        return { success: true };
      }
    } catch (err) {
      console.error("Verification Error:", err.response?.data || err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const fetchPainterGallery = useCallback(async (painterId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/painter/gallery/${painterId}`,
      );
      setPainterGallery(res.data.data || []);
    } catch (err) {
      console.error("Fetch gallery error:", err.message);
      setPainterGallery([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const deleteGalleryItem = async (photoId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الصورة من المعرض؟")) return;
    try {
      setLoading(true);
      await axios.delete(
        `${API_URL}/api/painter/gallery/${photoId}`,
        getAuthHeader(),
      );
      setPainterGallery((prev) => prev.filter((item) => item.id !== photoId));
      return { success: true };
    } catch (err) {
      console.error("Delete gallery item error:", err.message);
      alert("فشل حذف الصورة");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaintersContext.Provider
      value={{
        painters,
        painterGallery,
        loading,
        fetchPainters,
        addPainter,
        updatePainter,
        deletePainter,
        updatePainterFinancials,
        verifyPainter,
        fetchPainterGallery,
        deleteGalleryItem,
      }}
    >
      {children}
    </PaintersContext.Provider>
  );
};

export const usePainters = () => useContext(PaintersContext);
