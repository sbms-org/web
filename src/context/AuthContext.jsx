import React, { useState } from "react";
import { AuthContext } from "./authContext";
import api from "../api/axiosInstance";

function readStoredUser() {
  const stored = localStorage.getItem("sbmsUser") || localStorage.getItem("adminUser");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Could not read the saved ServiceBook session.", error);
    localStorage.removeItem("sbmsUser");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("token");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);

  async function sendOtp(mobile) {
    setLoading(true);
    try {
      const response = await api.post("/auth/send-otp", { mobile });
      return {
        success: response.data?.success !== false,
        message: response.data?.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "We could not send your verification code.",
      };
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(mobile, otp) {
    setLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", { mobile, otp });
      if (response.data?.success === false) {
        return { success: false, message: response.data.message || "Verification failed." };
      }

      const payload = response.data?.data ?? response.data;
      const userData = payload?.user;
      const token = payload?.token;
      if (!userData || !token) {
        return { success: false, message: "The server returned an incomplete sign-in response." };
      }

      localStorage.setItem("token", token);
      localStorage.setItem("sbmsUser", JSON.stringify(userData));
      localStorage.removeItem("adminUser");
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "The code could not be verified.",
      };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("sbmsUser");
    localStorage.removeItem("adminUser");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, sendOtp, verifyOtp, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
