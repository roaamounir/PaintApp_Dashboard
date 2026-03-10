import React, { createContext, useState, useContext } from "react";
import axios from "axios";

export const ServicesContext = createContext();

export const ServicesProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const getAuthHeader = () => {
    const language = localStorage.getItem("language") || "ar";
    return {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Accept-Language": language,
      },
    };
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/painter-reviews`, getAuthHeader());
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch reviews error:", err.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا التقييم؟")) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/painter-reviews/${id}`, getAuthHeader());
      setReviews((prev) => prev.filter((r) => r.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Delete review error:", err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const calculatePaint = async (calcData) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/services/calculate`,
        calcData,
        getAuthHeader()
      );
      return { success: true, data: res.data };
    } catch (err) {
      console.error("Calculation error:", err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const convertColorMatch = async (convertData) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/services/convert`,
        convertData,
        getAuthHeader()
      );
      return { success: true, data: res.data };
    } catch (err) {
      console.error("Conversion error:", err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServicesContext.Provider
      value={{
        reviews,
        loading,
        fetchReviews,
        deleteReview,
        calculatePaint,
        convertColorMatch,
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => useContext(ServicesContext);
