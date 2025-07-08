"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  Clock,
  FileText,
  Home,
  LogOut,
  Settings,
  User,
  Users,
  Menu,
  ClipboardList,
  Bell,
} from "lucide-react";
import DashboardScreen from "./dashboardscreen";
import EmployeeProfile from "./profile";
import NotificationModal from "./notificationmodal"; // Import the notification modal

export default function EmployeeDashboard() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [organization, setOrganization] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [logOutModalOpen, setLogOutModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false); // Add state for notification modal

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    // Set initial state based on screen size
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Check authentication and load user data
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Get username from localStorage (temporary until full auth implementation)
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          router.push("/sign-in");
          return;
        }

        const { username, role } = JSON.parse(storedUser);

        // Check if user is a employee
        if (role !== "employee") {
          router.push(`/dashboard/${role}`);
          return;
        }

        // Fetch user data from MongoDB to get the most up-to-date info
        try {
          const response = await fetch(`/api/users/${username}`);
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              setUsername(data.user.username || "Employee");
              setOrganization(
                data.user.organizationName || data.user.organization || "none"
              );
            }
          }
        } catch (apiError) {
          console.warn("Couldn't fetch latest user data:", apiError);
          // Fall back to localStorage data if API call fails
          setUsername(username || "Employee");
          const user = JSON.parse(storedUser);
          setOrganization(user.organization || user.organizationName || "none");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Redirect to sign-in page
    router.push("/sign-in");
  };

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Navigation handler
  const handleNavigation = (tab: string) => {
    // Simply set the active tab - don't redirect for profile
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const openLogOutModal = () => setLogOutModalOpen(true);
  const closeLogOutModal = () => setLogOutModalOpen(false);

  const openNotificationModal = () => setNotificationModalOpen(true);
  const closeNotificationModal = () => {
    setNotificationModalOpen(false);
  };

  const LogOutModal = () => {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-[30%] max-h-[90vh] overflow-hidden">
          <div className="p-5 border-b flex justify-center items-center sticky top-0 bg-white z-10">
            <h3 className="text-xl font-bold text-gray-900">
              Are you sure you want to log out?
            </h3>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="w-full flex items-center justify-around">
              <button
                className="cursor-pointer text-black bg-white border p-3 rounded-sm"
                onClick={closeLogOutModal}
              >
                Cancel
              </button>
              <button
                className="cursor-pointer text-white bg-red-500 p-3 rounded-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - with reduced sizes */}
      <div
        className={`${
          isSidebarCollapsed ? "w-0 md:w-16" : "w-60 md:w-64"
        } bg-white shadow-md transition-all duration-300 fixed md:relative z-30 h-full overflow-hidden`}
      >
        <div className="p-3 border-b flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-cyan-500/20">
                <ClipboardList className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-cyan-700">
                InternshipHub
              </span>
            </div>
          )}
          {isSidebarCollapsed && (
            <div className="h-7 w-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-cyan-500/20 mx-auto">
              <ClipboardList className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col justify-between h-[calc(100%-58px)]">
          <nav className="space-y-1">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("dashboard");
              }}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md ${
                activeTab === "dashboard"
                  ? "bg-cyan-50 text-cyan-600"
                  : "hover:bg-gray-50 text-gray-700"
              } font-medium text-sm`}
            >
              <Home className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("interns");
              }}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md ${
                activeTab === "interns"
                  ? "bg-cyan-50 text-cyan-600"
                  : "hover:bg-gray-50 text-gray-700"
              } font-medium text-sm`}
            >
              <Users className="h-4 w-4" />
              {!isSidebarCollapsed && <span>My Interns</span>}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("assignments");
              }}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md ${
                activeTab === "assignments"
                  ? "bg-cyan-50 text-cyan-600"
                  : "hover:bg-gray-50 text-gray-700"
              } font-medium text-sm`}
            >
              <FileText className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Assignments</span>}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("schedule");
              }}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md ${
                activeTab === "schedule"
                  ? "bg-cyan-50 text-cyan-600"
                  : "hover:bg-gray-50 text-gray-700"
              } font-medium text-sm`}
            >
              <Calendar className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Schedule</span>}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("profile");
              }}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md ${
                activeTab === "profile"
                  ? "bg-cyan-50 text-cyan-600"
                  : "hover:bg-gray-50 text-gray-700"
              } font-medium text-sm`}
            >
              <User className="h-4 w-4" />
              {!isSidebarCollapsed && <span>My Profile</span>}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("settings");
              }}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md ${
                activeTab === "settings"
                  ? "bg-cyan-50 text-cyan-600"
                  : "hover:bg-gray-50 text-gray-700"
              } font-medium text-sm`}
            >
              <Settings className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Settings</span>}
            </a>
          </nav>

          <div className="mt-auto border-t pt-3 space-y-3">
            <div
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : ""
              } p-1.5`}
            >
              <div className="h-8 w-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {username.charAt(0).toUpperCase()}
              </div>
              {!isSidebarCollapsed && (
                <div className="ml-3">
                  <p className="font-medium text-black text-sm">{username}</p>
                  <p className="text-xs text-gray-500">Employee</p>
                </div>
              )}
            </div>

            <button
              onClick={openLogOutModal}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-2"
              } p-2 rounded-md hover:bg-red-50 text-red-600 w-full text-left font-medium text-sm`}
            >
              <LogOut className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay when sidebar is open on mobile */}
      {!isSidebarCollapsed && (
        <div
          className="md:hidden fixed inset-0 bg-gray-900/50 z-20"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main content - with reduced sizes */}
      <div className="flex-1 overflow-auto w-full">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="p-3 sm:p-4 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-1.5 mr-2 rounded-md hover:bg-gray-100 text-gray-500"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-black">
                  {activeTab === "dashboard"
                    ? "Employee Dashboard"
                    : activeTab === "profile"
                    ? "My Profile"
                    : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {activeTab === "dashboard"
                    ? "Guidance Portal"
                    : activeTab === "profile"
                    ? "Account Information"
                    : activeTab === "interns"
                    ? "Manage Your Interns"
                    : activeTab === "assignments"
                    ? "Manage Assignments"
                    : activeTab === "schedule"
                    ? "Your Schedule"
                    : activeTab === "settings"
                    ? "Account Settings"
                    : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center ml-auto gap-3">
              {/* Responsive welcome message */}
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md shadow-md">
                <p className="text-sm sm:text-base font-semibold text-white tracking-wide whitespace-nowrap">
                  Welcome back, {username}
                </p>
              </div>

              {/* Notification icon with dropdown positioning */}
              <div className="relative">
                <button
                  onClick={openNotificationModal}
                  className="relative p-2 rounded-full hover:bg-gray-100 text-gray-700"
                >
                  <Bell className="h-5 w-5" />
                </button>
                {notificationModalOpen && (
                  <NotificationModal
                    isOpen={notificationModalOpen}
                    onClose={closeNotificationModal}
                  />
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-3 sm:p-4">
          {activeTab === "dashboard" && (
            <DashboardScreen organization={organization} />
          )}
          {activeTab === "profile" && <EmployeeProfile inDashboard={true} />}
          {activeTab === "interns" && (
            <div className="p-4 bg-white rounded-md shadow">
              <p className="text-lg font-medium">Interns section coming soon</p>
            </div>
          )}
          {activeTab === "assignments" && (
            <div className="p-4 bg-white rounded-md shadow">
              <p className="text-lg font-medium">
                Assignments section coming soon
              </p>
            </div>
          )}
          {activeTab === "schedule" && (
            <div className="p-4 bg-white rounded-md shadow">
              <p className="text-lg font-medium">
                Schedule section coming soon
              </p>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="p-4 bg-white rounded-md shadow">
              <p className="text-lg font-medium">
                Settings section coming soon
              </p>
            </div>
          )}
        </main>
      </div>
      {logOutModalOpen && <LogOutModal />}
    </div>
  );
}
