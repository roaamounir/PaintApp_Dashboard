import React, { createContext, useState, useCallback, useContext } from "react";
import axios from "axios";

export const VendorsContext = createContext();

export const VendorsProvider = ({ children }) => {
  const [vendors, setVendors] = useState([]);
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

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/vendors?t=${Date.now()}`,
        getAuthHeader(),
      );
      setVendors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch vendors error:", err.message);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, getAuthHeader]);

  const addVendor = async (vendorData) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/vendors`,
        vendorData,
        getAuthHeader(),
      );
      setVendors((prev) => [...prev, res.data]);
      return { success: true };
    } catch (err) {
      alert(err.response?.data?.error || "Failed to register vendor");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

const updateVendor = async (vendorId, updatedData) => {
  try {
    setLoading(true);
    
    const isStatusUpdate = Object.prototype.hasOwnProperty.call(updatedData, "isApproved");

    const url = isStatusUpdate
      ? `${API_URL}/vendors/approve/${vendorId}`
      : `${API_URL}/vendors/${vendorId}`;

    const payload = isStatusUpdate
      ? {
          isApproved: updatedData.isApproved,
          commissionRate: updatedData.commissionRate,
        }
      : {
          shopName: updatedData.shopName,
          address: updatedData.address,
          city: updatedData.city,
          phone: updatedData.phone, 
          email: updatedData.email,
          taxRegistration: updatedData.taxRegistration, 
          companyType: updatedData.companyType, 
        };

    const res = await axios.put(url, payload, getAuthHeader());

    if (res.data) {
      const updatedItem = res.data.vendor || res.data; 
      
      setVendors((prev) =>
        prev.map((v) => (v.id === vendorId ? { ...v, ...updatedItem } : v))
      );

      await fetchVendors(); 
      
      return { success: true, data: updatedItem };
    }
  } catch (err) {
    console.error("Update Error Details:", err.response?.data || err.message);
    alert(err.response?.data?.error || "فشل تحديث البيانات");
    return { success: false };
  } finally {
    setLoading(false);
  }
};

  const deleteVendor = async (id) => {
    if (!window.confirm("هل أنت متأكد؟")) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/vendors/${id}`, getAuthHeader());
      setVendors((prev) => prev.filter((v) => v.userId !== id));
      return { success: true };
    } catch (err) {
      console.error("Delete error:", err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updateVendorStatus = async (vendorId, updatedData) => {
    try {
      setLoading(true);
      const url = `${API_URL}/vendors/approve/${vendorId}`;
      const res = await axios.put(url, updatedData, getAuthHeader());

      if (res.data) {
        await fetchVendors();
        return { success: true };
      }
    } catch (err) {
      console.error("Update status error:", err.message);
      alert(err.response?.data?.error || "فشل تحديث حالة التاجر");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const processVendorPayout = async (vendorId) => {
    if (!window.confirm("هل تأكدت من تحويل المبلغ للتاجر يدوياً؟")) return;
    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/vendors/${vendorId}/payout`,
        {},
        getAuthHeader(),
      );
      await fetchVendors();
      return { success: true };
    } catch (err) {
      console.error("Payout error:", err.response?.data?.error || err.message);
      alert(err.response?.data?.error || "فشل عملية الصرف");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return (
    <VendorsContext.Provider
      value={{
        vendors,
        loading,
        fetchVendors,
        addVendor,
        updateVendor,
        deleteVendor,
        updateVendorStatus,
        processVendorPayout,
      }}
    >
      {children}
    </VendorsContext.Provider>
  );
};

export const useVendors = () => useContext(VendorsContext);
