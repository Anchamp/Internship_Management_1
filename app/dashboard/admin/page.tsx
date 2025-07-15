"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building,
  Calendar,
  Home,
  LogOut,
  Settings,
  User,
  UserPlus,
  Users,
  Menu,
  ClipboardList,
  MessageSquare,
  UsersIcon,
  Bell,
  Lock,
} from "lucide-react";
import AdminDashboardScreen from "./dashboardscreen";
import AdminProfile from "./profile";
import OnboardingScreen from "./onboarding";
import UsersScreen from "./users";
import TeamBuilding from "./teamBuilding";
import InternshipPosting from "./internshipposting";
import NotificationModal from "./notificationmodal"; // Import the new notification modal

export default function AdminDashboard() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [organizationName, setOrganizationName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [logOutModalOpen, setLogOutModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [profileSubmissionCount, setProfileSubmissionCount] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    //  initial state based on screen size
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Check authentication and load user data
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const userData = localStorage.getItem("user");

        if (!userData) {
          router.push("/sign-in");
          return;
        }

        const user = JSON.parse(userData);

        if (user.role !== "admin") {
          router.push(`/dashboard/${user.role}`);
          return;
        }

        try {
          const response = await fetch(`/api/users/${user.username}`);
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              setUsername(data.user.username || "Admin");
              setOrganizationName(
                data.user.organizationName || "Your Organization"
              );

              // Track profile submission count
              setProfileSubmissionCount(data.user.profileSubmissionCount || 0);
            }
          } else {
            setUsername(user.username || "Admin");
            setOrganizationName(user.organizationName || "Your Organization");
          }
        } catch (apiError) {
          console.warn("Couldn't fetch latest user data:", apiError);

          setUsername(user.username || "Admin");
          setOrganizationName(user.organizationName || "Your Organization");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/sign-in");
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleNavigation = (tab: string) => {
    // Only allow navigation to unlocked tabs
    if (
      profileSubmissionCount === 0 &&
      !["dashboard", "profile", "settings"].includes(tab)
    ) {
      return;
    }
    setActiveTab(tab);

    // For accessibility, focus on the selected tab if it exists
    setTimeout(() => {
      const element = document.querySelector(`[data-tab="${tab}"]`);
      if (element) {
        (element as HTMLElement).focus();
      }
    }, 100);
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

  // Check if a menu item should be locked
  const isMenuItemLocked = (menuItem: string) => {
    return (
      profileSubmissionCount === 0 &&
      !["dashboard", "profile", "settings"].includes(menuItem)
    );
  };

  // Get class for menu items
  const getMenuItemClass = (menuItem: string) => {
    const isLocked = isMenuItemLocked(menuItem);
    const isActive = activeTab === menuItem;

    return `flex items-center ${
      isSidebarCollapsed ? "justify-center" : "space-x-3"
    } p-2 rounded-md ${
      isActive
        ? "bg-cyan-50 text-cyan-600"
        : isLocked
        ? "text-gray-400 cursor-not-allowed"
        : "hover:bg-gray-50 text-gray-700 cursor-pointer"
    } font-medium text-sm ${isLocked ? "opacity-70" : ""}`;
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
            {/* Dashboard link */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("dashboard");
              }}
              className={getMenuItemClass("dashboard")}
              data-tab="dashboard"
            >
              <Home className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("users");
              }}
              className={getMenuItemClass("users")}
            >
              <Users className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Users</span>}
              {!isSidebarCollapsed && isMenuItemLocked("users") && (
                <Lock className="h-3 w-3 ml-auto text-gray-400" />
              )}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("onboarding");
              }}
              className={getMenuItemClass("onboarding")}
            >
              <UserPlus className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Onboarding</span>}
              {!isSidebarCollapsed && isMenuItemLocked("onboarding") && (
                <Lock className="h-3 w-3 ml-auto text-gray-400" />
              )}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("organization");
              }}
              className={getMenuItemClass("organization")}
            >
              <Building className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Organization</span>}
              {!isSidebarCollapsed && isMenuItemLocked("organization") && (
                <Lock className="h-3 w-3 ml-auto text-gray-400" />
              )}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("teambuilding");
              }}
              className={getMenuItemClass("teambuilding")}
            >
              <UsersIcon className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Team Building</span>}
              {!isSidebarCollapsed && isMenuItemLocked("teambuilding") && (
                <Lock className="h-3 w-3 ml-auto text-gray-400" />
              )}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("feedback");
              }}
              className={getMenuItemClass("feedback")}
            >
              <MessageSquare className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Feedback</span>}
              {!isSidebarCollapsed && isMenuItemLocked("feedback") && (
                <Lock className="h-3 w-3 ml-auto text-gray-400" />
              )}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("internships");
              }}
              className={getMenuItemClass("internships")}
            >
              <Calendar className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Internship Posting</span>}
              {!isSidebarCollapsed && isMenuItemLocked("internships") && (
                <Lock className="h-3 w-3 ml-auto text-gray-400" />
              )}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("profile");
              }}
              className={getMenuItemClass("profile")}
              data-tab="profile"
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
              className={getMenuItemClass("settings")}
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
                  <p className="text-xs text-gray-500">Administrator</p>
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

      {/* Main content */}
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
                    ? "Admin Dashboard"
                    : activeTab === "profile"
                    ? "My Profile"
                    : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {organizationName}
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
            <AdminDashboardScreen
              profileSubmissionCount={profileSubmissionCount}
              onNavigateToProfile={() => handleNavigation("profile")}
            />
          )}
          {activeTab === "profile" && <AdminProfile inDashboard={true} />}
          {activeTab === "onboarding" && profileSubmissionCount > 0 && (
            <OnboardingScreen />
          )}
          {activeTab === "users" && profileSubmissionCount > 0 && (
            <UsersScreen />
          )}
          {activeTab === "teambuilding" && profileSubmissionCount > 0 && (
            <TeamBuilding />
          )}
          {activeTab === "internships" && profileSubmissionCount > 0 && (
            <InternshipPosting />
          )}
          {activeTab === "organization" && profileSubmissionCount > 0 && (
            <div className="p-4 bg-white rounded-md shadow">
              <p className="text-lg font-medium">
                Organization section coming soon
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Manage your Organization details here.
              </p>
            </div>
          )}
          {activeTab === "feedback" && profileSubmissionCount > 0 && (
            <div className="p-4 bg-white rounded-md shadow">
              <p className="text-lg font-medium">
                Feedback management coming soon
              </p>
              <p className="text-sm text-gray-500 mt-2">
                View and manage feedback across mentors, panelists, and interns.
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
