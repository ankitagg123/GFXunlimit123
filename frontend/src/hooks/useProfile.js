import { useEffect } from "react";
import axios from "axios";

export default function useProfile(setUserRole) {
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.role) {
          localStorage.setItem("userRole", res.data.role);
        }

        setUserRole(res.data.role);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, [setUserRole]);
}