export const addNotification = (
  notifications,
  message
) => {

  return [
    {
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString(),
    },
    ...notifications,
  ];

};

export const clearNotifications = () => {
  return [];
};

export const getNotificationCount = (
  notifications
) => {
  return notifications.length;
};