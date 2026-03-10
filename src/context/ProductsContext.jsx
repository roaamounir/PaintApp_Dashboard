import React, { createContext, useState, useCallback, useContext } from "react";
import axios from "axios";

export const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const [paints, setPaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [colorSystems, setColorSystems] = useState([]);
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

  const fetchPaints = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/paint`, getAuthHeader());
      setPaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch paints error:", err.message);
      setPaints([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, getAuthHeader]);

  const deletePaint = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/paint/${id}`, getAuthHeader());
      setPaints((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Delete paint error:", err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const importPaintsExcel = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axios.post(`${API_URL}/paint/import`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchPaints();
      return { success: true };
    } catch (err) {
      console.error("Import error:", err.message);
      return { success: false };
    }
  };

  const getPaintDetails = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/paint/${id}/details`);
      return res.data;
    } catch (err) {
      console.error("Fetch paint details error:", err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const updatePaintQuantity = async (id, newStock) => {
    try {
      setLoading(true);
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
        setPaints((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, stock: parseInt(newStock), availability: payload.availability } : p
          )
        );
        alert("تم تحديث المخزون بنجاح! ✅");
      }
    } catch (err) {
      console.error("Error Detail:", err.response?.data);
      alert("فشل التحديث");
    } finally {
      setLoading(false);
    }
  };

  const syncInventory = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/paint/sync`, {}, getAuthHeader());
      await fetchPaints();
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`, getAuthHeader());
      const processedData = res.data.map((cat) => ({
        ...cat,
        subCategories: cat.SubCategory || cat.subcategory || cat.subcategories || [],
      }));
      setCategories(processedData);
    } catch (err) {
      console.error("Fetch categories error:", err.message);
      setCategories([]);
    }
  }, [API_URL, getAuthHeader]);

  const addCategory = async (name) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/categories`,
        { name_ar: name, name_en: name },
        getAuthHeader()
      );
      setCategories((prev) => [...prev, res.data]);
      return { success: true };
    } catch (err) {
      alert(err.response?.data?.error || "فشل إضافة القسم");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/categories/${id}`, getAuthHeader());
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      return { success: true };
    } catch (err) {
      alert(err.response?.data?.error || "فشل حذف القسم");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id, newName) => {
    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/categories/${id}`,
        { name_ar: newName, name_en: newName },
        getAuthHeader()
      );
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? { ...cat, name: newName } : cat))
      );
      return { success: true };
    } catch (err) {
      alert(err.response?.data?.error || "فشل تحديث القسم");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const addSubCategory = async (subData) => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/subcategories`, subData, getAuthHeader());
      await fetchCategories();
      return { success: true };
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add sub-category");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const deleteSubCategory = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا التصنيف الفرعي؟")) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/subcategories/${id}`, getAuthHeader());
      await fetchCategories();
      return { success: true };
    } catch (err) {
      console.error("Delete sub-category error:", err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const fetchColorSystems = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/color-systems`);
      setColorSystems(res.data);
    } catch (err) {
      console.error("Fetch systems error:", err.message);
    }
  }, [API_URL]);

  const fetchColors = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const { systemId, search, userId } = filters;
      const res = await axios.get(`${API_URL}/colors`, {
        params: { systemId, search, userId },
      });
      setColors(res.data);
    } catch (err) {
      console.error("Fetch colors error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const addColor = async (colorData) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/colors`, colorData, getAuthHeader());
      setColors((prev) => [...prev, res.data]);
      return { success: true };
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add color");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updateColor = async (id, updatedData) => {
    try {
      setLoading(true);
      const res = await axios.put(`${API_URL}/colors/${id}`, updatedData, getAuthHeader());
      setColors((prev) =>
        prev.map((c) => (c.id === Number(id) ? { ...c, ...res.data } : c))
      );
      return { success: true };
    } catch (err) {
      alert(err.response?.data?.error || "Update color failed");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const deleteColor = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا اللون؟")) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/colors/${id}`, getAuthHeader());
      setColors((prev) => prev.filter((c) => c.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Delete color error:", err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const toggleColorFavorite = async (colorCode) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData) {
        alert("يرجى تسجيل الدخول أولاً");
        return;
      }
      await axios.post(
        `${API_URL}/colors/favorite`,
        { colorCode },
        getAuthHeader()
      );
      setColors((prev) =>
        prev.map((c) =>
          c.code === colorCode ? { ...c, isFavorite: !c.isFavorite } : c
        )
      );
      return { success: true };
    } catch (err) {
      console.error("Toggle favorite error:", err.message);
      return { success: false };
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        paints,
        categories,
        colors,
        colorSystems,
        loading,
        fetchPaints,
        deletePaint,
        importPaintsExcel,
        getPaintDetails,
        updatePaintQuantity,
        syncInventory,
        fetchCategories,
        addCategory,
        deleteCategory,
        updateCategory,
        addSubCategory,
        deleteSubCategory,
        fetchColorSystems,
        fetchColors,
        addColor,
        updateColor,
        deleteColor,
        toggleColorFavorite,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => useContext(ProductsContext);
