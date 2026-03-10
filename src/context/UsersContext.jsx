import React, { createContext, useState, useCallback, useContext } from "react";
import axios from "axios";
import { useAuthHeader } from "./useAuth";

export const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const getAuthHeader = useAuthHeader();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/users`, getAuthHeader());
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch users error:", err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, API_URL]);

  const getUserById = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/users/${id}`, getAuthHeader());
      return res.data;
    } catch (err) {
      console.error("Fetch single user error:", err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, API_URL]);

  const addUser = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/signup`, userData);
      const newUser = res.data.user || res.data;
      setUsers((prev) => [...prev, newUser]);
      return { success: true };
    } catch (err) {
      alert(err.response?.data?.error || "Add user failed");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, updatedData) => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/users/${id}`, updatedData, getAuthHeader());
      setUsers((prev) =>
        prev.map((user) =>
          user.id === Number(id) ? { ...user, ...updatedData } : user,
        ),
      );
      return { success: true };
    } catch (err) {
      console.error("Error during update:", err.response);
      alert(err.response?.data?.error || "فشلت عملية التحديث");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/users/${id}`, getAuthHeader());
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Delete user error:", err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/customers`, getAuthHeader());
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch customers error:", err.message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, API_URL]);

  const updateCreditLimit = async (customerId, newLimit) => {
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/users/${customerId}`,
        { creditLimit: newLimit },
        getAuthHeader(),
      );
      await fetchCustomers();
      return { success: true };
    } catch (err) {
      console.error("Update credit error:", err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletHistory = useCallback(async (userId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/wallet/transactions/${userId}`,
        getAuthHeader(),
      );
      return res.data;
    } catch (err) {
      console.error("Fetch wallet history error:", err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, API_URL]);

  return (
    <UsersContext.Provider
      value={{
        users,
        customers,
        loading,
        fetchUsers,
        getUserById,
        addUser,
        updateUser,
        deleteUser,
        fetchCustomers,
        updateCreditLimit,
        fetchWalletHistory,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => useContext(UsersContext);
