import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { addNotification } from "../utils/notificationUtils";

export default function useNotifications(
  setNotifications,
  setNotificationCount
) {

  useEffect(() => {

    const fetchNotifications = async () => {

      try {

        const username =
          localStorage.getItem("username");

        if (!username) return;

        const res =
          await axios.get(
            `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/notifications/${username}`
          );

        setNotifications(res.data);

        const countRes =
          await axios.get(
            `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/notifications/count/${username}`
          );

        setNotificationCount(
          Number(countRes.data.count)
        );

        localStorage.setItem(
          "notificationCount",
          res.data.length
        );

      } catch (err) {

        console.error(err);

      }

    };

    fetchNotifications();

  }, [setNotifications, setNotificationCount]);

  const notifySuccess = (message) => {

    toast.success(message);

    setNotifications((prev) => {

      const updated =
        addNotification(prev, message);

      setNotificationCount(updated.length);

      return updated;

    });

  };

  const notifyError = (message) => {

    toast.error(message);

  };

  const clearAllNotifications = () => {

    setNotifications([]);

    setNotificationCount(0);

  };

  return {

    notifySuccess,
    notifyError,
    clearAllNotifications,

  };

}