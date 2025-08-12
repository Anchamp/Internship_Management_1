// app/dashboard/employee/page.tsx
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
  BarChart3,
  MessageSquare,
  Target,
} from "lucide-react";

// Import dashboard components
import DashboardScreen from "./dashboardscreen";
import EmployeeProfile from "./profile";
import NotificationModal from "./notificationmodal";
import UsersScreen from "./users";
import EmployeeAssignments from "./assignments"; // Import new assignments component

export default function EmployeeDashboard() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [organization, setOrganization] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [logOutModalOpen, setLogOutModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // Check authentication and load user data
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/sign-in");
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== "employee") {
      router.push("/sign-in");
      return;
    }

    setUserData(user);
    setUsername(user.username || "");
    setOrganization(user.organizationName || user.organization || "");
    setIsLoading(false);
  }, [router]);

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const openLogOutModal = () => {
    setLogOutModalOpen(true);
  };

  const closeLogOutModal = () => {
    setLogOutModalOpen(false);
  };

  const openNotificationModal = () => {
    setNotificationModalOpen(true);
  };

  const closeNotificationModal = () => {
    setNotificationModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/sign-in");
  };

  const getMenuItemClass = (tab: string) => {
    return `flex items-center ${
      isSidebarCollapsed ? "justify-center" : "space-x-3"
    } p-2 rounded-md ${
      activeTab === tab
        ? "bg-cyan-50 text-cyan-600"
        : "hover:bg-gray-50 text-gray-700"
    } font-medium text-sm w-full text-left transition-colors cursor-pointer`;
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardScreen organization={organization} onNavigate={handleNavigation} />;
      case "assignments":
        return <EmployeeAssignments />;
      case "interns":
        return <UsersScreen />;
      case "profile":
        return <EmployeeProfile />;
      case "schedule":
        return (
          <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm border">
            <div className="text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Schedule Management</h3>
              <p className="text-gray-500 mb-4">Manage your schedule and appointments</p>
              <div className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-600">
                Coming Soon
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm border">
            <div className="text-center">
              <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Settings</h3>
              <p className="text-gray-500 mb-4">Account and preferences</p>
              <div className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-600">
                Coming Soon
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardScreen organization={organization} onNavigate={handleNavigation} />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Employee Dashboard";
      case "assignments":
        return "Assignment Management";
      case "interns":
        return "My Interns";
      case "profile":
        return "My Profile";
      case "schedule":
        return "Schedule";
      case "settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Guidance Portal";
      case "assignments":
        return "Create, manage, and review assignments";
      case "interns":
        return "Manage Your Interns";
      case "profile":
        return "Account Information";
      case "schedule":
        return "Your Schedule";
      case "settings":
        return "Account and preferences";
      default:
        return "";
    }
  };

  const LogOutModal = () => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Logout</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
        <div className="flex space-x-3">
          <button
            onClick={closeLogOutModal}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarCollapsed ? "w-0 md:w-16" : "w-60 md:w-64"
        } bg-white shadow-md transition-all duration-300 fixed md:relative z-30 h-full overflow-hidden`}
      >
        {/* Logo Header */}
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

        {/* Sidebar Content */}
        <div className="p-3 flex flex-col justify-between h-[calc(100%-58px)]">
          {/* Navigation */}
          <nav className="space-y-1">
            {/* Dashboard */}
            <button
              onClick={() => handleNavigation("dashboard")}
              className={getMenuItemClass("dashboard")}
            >
              <Home className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </button>

            {/* Assignments - NEW */}
            <button
              onClick={() => handleNavigation("assignments")}
              className={getMenuItemClass("assignments")}
            >
              <FileText className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Assignments</span>}
            </button>

            {/* My Interns */}
            <button
              onClick={() => handleNavigation("interns")}
              className={getMenuItemClass("interns")}
            >
              <Users className="h-4 w-4" />
              {!isSidebarCollapsed && <span>My Interns</span>}
            </button>

            {/* Schedule */}
            <button
              onClick={() => handleNavigation("schedule")}
              className={getMenuItemClass("schedule")}
            >
              <Calendar className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Schedule</span>}
            </button>

            {/* My Profile */}
            <button
              onClick={() => handleNavigation("profile")}
              className={getMenuItemClass("profile")}
            >
              <User className="h-4 w-4" />
              {!isSidebarCollapsed && <span>My Profile</span>}
            </button>

            {/* Settings */}
            <button
              onClick={() => handleNavigation("settings")}
              className={getMenuItemClass("settings")}
            >
              <Settings className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Settings</span>}
            </button>
          </nav>

          {/* User Profile & Logout */}
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto w-full">
        {/* Header */}
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
                  {getPageTitle()}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {getPageSubtitle()}
                </p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={openNotificationModal}
                className="p-2 rounded-full hover:bg-gray-100 relative"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div className="h-8 w-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                {username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      {logOutModalOpen && <LogOutModal />}
      {notificationModalOpen && (
        <NotificationModal 
          isOpen={notificationModalOpen}
          onClose={closeNotificationModal}
        />
      )}
    </div>
  );
}