// Custom hook to get authentication header
import { useCallback } from "react";

export const useAuthHeader = () => {
  // This will be used inside context providers
  return useCallback(() => {
    const language = localStorage.getItem("language") || "ar";
    return {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Accept-Language": language,
      },
    };
  }, []);
};
