"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Bell,
  Check,
  Trash2,
} from "lucide-react";

// Custom function to format time ago
const formatTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const pastDate = new Date(date);
  const seconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

  // Define time intervals
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  // Calculate the appropriate interval
  if (seconds < intervals.minute) {
    return "just now";
  } else if (seconds < intervals.hour) {
    const minutes = Math.floor(seconds / intervals.minute);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (seconds < intervals.day) {
    const hours = Math.floor(seconds / intervals.hour);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (seconds < intervals.week) {
    const days = Math.floor(seconds / intervals.day);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else if (seconds < intervals.month) {
    const weeks = Math.floor(seconds / intervals.week);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else if (seconds < intervals.year) {
    const months = Math.floor(seconds / intervals.month);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  } else {
    const years = Math.floor(seconds / intervals.year);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  }
};

interface Notification {
  _id: string;
  userId: string;
  type: string;
  role?: string;
  requestorId?: string;
  requestorName?: string;
  status?: string;
  organizationId?: string;
  organizationName?: string;
  message?: string;
  createdAt: Date | string;
  read: boolean;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({
  isOpen,
  onClose,
}: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef<boolean>(false);

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && !fetchedRef.current) {
      fetchNotifications();
      fetchedRef.current = true;
    }

    return () => {
      // Reset the ref when component unmounts or modal closes
      if (!isOpen) {
        fetchedRef.current = false;
      }
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        throw new Error("User not found in local storage");
      }

      const user = JSON.parse(userData);

      // Enhanced ID detection - use all possible ID fields
      const userId = user._id || user.id || user.userId;

      console.log("Admin user data from localStorage:", user);
      console.log("Attempting to fetch notifications for user ID:", userId);

      if (!userId) {
        // If no ID is found, try to fetch by username
        const userResponse = await fetch(`/api/users/${user.username}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.user && (userData.user._id || userData.user.id)) {
            console.log(
              "Retrieved user ID from API:",
              userData.user._id || userData.user.id
            );

            // Update the notification fetch request with the new ID
            const response = await fetch(
              `/api/notifications/${userData.user._id || userData.user.id}`
            );
            const data = await response.json();

            console.log(
              `Found ${
                data.notifications ? data.notifications.length : 0
              } notifications using API-fetched ID`
            );

            const formattedNotifications =
              data.notifications?.map((notif: any) => ({
                ...notif,
                createdAt: new Date(notif.createdAt),
              })) || [];

            setNotifications(formattedNotifications);
            return;
          }
        }
        throw new Error("Could not determine user ID");
      }

      const response = await fetch(`/api/notifications/${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch notifications");
      }

      const data = await response.json();
      console.log(
        `Found ${
          data.notifications ? data.notifications.length : 0
        } notifications`
      );

      // Add additional debug if no notifications found
      if (!data.notifications || data.notifications.length === 0) {
        console.log("No notifications found. This could be because:");
        console.log("1. There are genuinely no notifications for this user");
        console.log(
          "2. The user ID in localStorage doesn't match the one used in the database"
        );
        console.log(
          "3. The notifications might be stored with a different user ID format"
        );
      }

      const formattedNotifications =
        data.notifications?.map((notif: any) => ({
          ...notif,
          createdAt: new Date(notif.createdAt),
        })) || [];

      setNotifications(formattedNotifications);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/mark-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        // Update the notification to be read
        setNotifications((prev) => {
          // Find the notification that was marked as read
          const markedNotification = prev.find(
            (notif) => notif._id === notificationId
          );

          if (!markedNotification) return prev;

          // Create an updated version of this notification with read=true
          const updatedNotification = { ...markedNotification, read: true };

          // Filter out all other notifications (keeping their original order)
          const otherNotifications = prev.filter(
            (notif) => notif._id !== notificationId
          );

          // Sort notifications: unread first, then read notifications
          return [
            ...otherNotifications.filter((notif) => !notif.read),
            ...otherNotifications.filter((notif) => notif.read),
            updatedNotification, // Put the newly read notification at the end
          ];
        });
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((notif) => notif._id !== notificationId)
        );
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const renderNotificationContent = (notification: Notification) => {
    switch (notification.type) {
      case "verification_request":
        return (
          <div className="flex flex-col">
            <div className="mb-1.5">
              <p className="font-semibold text-black text-sm">
                Profile Verification Request
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-xs text-black mt-1">
                {notification.message ||
                  "A user has submitted their profile for verification."}
              </p>
            </div>
          </div>
        );
      case "verification_response":
        return (
          <div className="flex flex-col">
            <p className="font-medium text-sm">
              Verification{" "}
              {notification.status === "verified" ? "Approved" : "Rejected"}
            </p>
            <p className="text-xs text-gray-700">{notification.message}</p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col">
            <p className="font-medium text-sm">{notification.type}</p>
            <p className="text-xs text-gray-700">
              {notification.message || "No additional details"}
            </p>
          </div>
        );
    }
  };

  const handleVerificationAction = async (
    requestorId: string,
    action: "approve" | "reject"
  ) => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) throw new Error("User not found");

      const user = JSON.parse(userData);
      const adminUsername = user.username;

      const response = await fetch("/api/admin/verify-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: requestorId,
          action,
          adminUsername,
        }),
      });

      if (response.ok) {
        fetchNotifications();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process verification");
      }
    } catch (err: any) {
      console.error("Verification action failed:", err);
      alert(`Failed to ${action} user: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-2 top-16 w-80 max-h-[80vh] bg-white rounded-lg shadow-xl z-50 border border-gray-200"
    >
      <div className="p-3 border-b flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-lg">
        <h3 className="text-sm font-bold text-gray-900 flex items-center">
          <Bell className="h-3.5 w-3.5 mr-2 text-cyan-600" />
          Notifications
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-1"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: "300px" }}>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm">No notifications found</p>
          </div>
        ) : (
          <ul className="p-2 space-y-2">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`p-2 border rounded-lg ${
                  notification.read
                    ? "bg-gray-50"
                    : "bg-cyan-50 border-cyan-200"
                } relative`}
              >
                <div className="absolute top-2 right-2 flex items-center space-x-1">
                  {/* Always show the check button, but disable it if already read */}
                  {!notification.read ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification._id);
                      }}
                      className="text-white bg-green-600 hover:bg-green-700 p-0.5 rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
                      title="Mark as read"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="text-white bg-gray-400 p-0.5 rounded-full w-5 h-5 flex items-center justify-center"
                      title="Already read"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                    className="text-white bg-red-500 p-0.5 hover:bg-red-600 rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
                    title="Delete notification"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-1">
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-cyan-600"></div>
                    )}
                  </div>
                  <div className="flex-1 pr-14">
                    {" "}
                    {/* Add right padding to accommodate the icons */}
                    {renderNotificationContent(notification)}
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(notification.createdAt)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
