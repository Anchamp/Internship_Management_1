// app/dashboard/intern/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Users,
  Settings,
  LogOut,
  Menu,
  ClipboardList,
  FileText,
  Bell,
  User,
  Calendar,
  Folder,
  BookOpen,
  Presentation,
  BarChart3,
  MessageSquare,
  Star,
} from "lucide-react";

// Import dashboard components
import InternDashboardScreen from "./dashboardscreen";
import InternProfileSettings from "./profile-settings";
import FindApplyInternships from "./find-apply-internships";
import MyApplications from "./my-applications";
import MyTeams from "./my-teams";
import ProjectDetails from "./project-details";
import WeeklyReports from "./weekly-reports";
import DemoPresentation from "./demo-presentation";
import InternAssignments from "./assignments"; // Import new assignments component

export default function InternDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logOutModalOpen, setLogOutModalOpen] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [profileComplete, setProfileComplete] = useState<boolean>(false);
  const router = useRouter();

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

  useEffect(() => {
    // Check authentication and load user data
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/sign-in");
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== "intern") {
      router.push("/sign-in");
      return;
    }

    setUserData(user);
    setUsername(user.username || "");
    setProfileComplete(user.profileComplete || false);
    setIsLoading(false);
  }, [router]);

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/sign-in");
  };

  const handleProfileUpdate = () => {
    setProfileComplete(true);
  };

  const openLogOutModal = () => {
    setLogOutModalOpen(true);
  };

  const closeLogOutModal = () => {
    setLogOutModalOpen(false);
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
        return (
          <InternDashboardScreen
            profileComplete={profileComplete}
            username={username}
            onNavigate={handleNavigation}
          />
        );
      case "assignments":
        return <InternAssignments />;
      case "my-teams":
        return <MyTeams />;
      case "project-details":
        return <ProjectDetails />;
      case "weekly-reports":
        return <WeeklyReports />;
      case "demo-presentation":
        return <DemoPresentation />;
      case "profile-settings":
        return (
          <InternProfileSettings
            inDashboard={true}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      case "internships":
        return <FindApplyInternships />;
      case "my-applications":
        return <MyApplications />;
      case "feedback":
        return (
          <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm border">
            <div className="text-center">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Feedback & Reviews</h3>
              <p className="text-gray-500 mb-4">View evaluations from mentors and panelists</p>
              <div className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-600">
                Coming Soon
              </div>
            </div>
          </div>
        );
      case "team-communication":
        return (
          <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm border">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Team Communication</h3>
              <p className="text-gray-500 mb-4">Chat and collaborate with your team</p>
              <div className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-600">
                Coming Soon
              </div>
            </div>
          </div>
        );
      default:
        return (
          <InternDashboardScreen
            profileComplete={profileComplete}
            username={username}
            onNavigate={handleNavigation}
          />
        );
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Intern Dashboard";
      case "assignments":
        return "My Assignments";
      case "my-teams":
        return "My Teams";
      case "project-details":
        return "Project Details";
      case "weekly-reports":
        return "Weekly Reports";
      case "demo-presentation":
        return "Demo Presentation";
      case "profile-settings":
        return "Profile Settings";
      case "internships":
        return "Find Internships";
      case "my-applications":
        return "My Applications";
      case "feedback":
        return "Feedback & Reviews";
      case "team-communication":
        return "Team Communication";
      default:
        return "Dashboard";
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Welcome to your internship journey";
      case "assignments":
        return "View and submit your assignments";
      case "my-teams":
        return "Collaborate with your team members";
      case "project-details":
        return "Track your project progress";
      case "weekly-reports":
        return "Submit your weekly progress reports";
      case "demo-presentation":
        return "Prepare your final demonstration";
      case "profile-settings":
        return "Manage your profile and preferences";
      case "internships":
        return "Find & Apply for Internships";
      case "my-applications":
        return "Track Application Status";
      case "feedback":
        return "View Evaluations";
      case "team-communication":
        return "Chat with Team";
      default:
        return `Welcome, ${username}`;
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
              {!isSidebarCollapsed && <span>My Assignments</span>}
            </button>

            {/* My Teams */}
            <button
              onClick={() => handleNavigation("my-teams")}
              className={getMenuItemClass("my-teams")}
            >
              <Users className="h-4 w-4" />
              {!isSidebarCollapsed && <span>My Teams</span>}
            </button>

            {/* Project Details */}
            <button
              onClick={() => handleNavigation("project-details")}
              className={getMenuItemClass("project-details")}
            >
              <Folder className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Projects</span>}
            </button>

            {/* Weekly Reports */}
            <button
              onClick={() => handleNavigation("weekly-reports")}
              className={getMenuItemClass("weekly-reports")}
            >
              <BookOpen className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Weekly Reports</span>}
            </button>

            {/* Demo Presentation */}
            <button
              onClick={() => handleNavigation("demo-presentation")}
              className={getMenuItemClass("demo-presentation")}
            >
              <Presentation className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Demo</span>}
            </button>

            {/* Find Internships */}
            <button
              onClick={() => handleNavigation("internships")}
              className={getMenuItemClass("internships")}
            >
              <BarChart3 className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Find Internships</span>}
            </button>

            {/* My Applications */}
            <button
              onClick={() => handleNavigation("my-applications")}
              className={getMenuItemClass("my-applications")}
            >
              <FileText className="h-4 w-4" />
              {!isSidebarCollapsed && <span>My Applications</span>}
            </button>

            {/* Feedback */}
            <button
              onClick={() => handleNavigation("feedback")}
              className={getMenuItemClass("feedback")}
            >
              <Star className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Feedback</span>}
            </button>

            {/* Team Communication */}
            <button
              onClick={() => handleNavigation("team-communication")}
              className={getMenuItemClass("team-communication")}
            >
              <MessageSquare className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Team Communication</span>}
            </button>

            {/* Profile Settings */}
            <button
              onClick={() => handleNavigation("profile-settings")}
              className={getMenuItemClass("profile-settings")}
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
                {userData?.username?.charAt(0).toUpperCase()}
              </div>
              {!isSidebarCollapsed && (
                <div className="ml-3">
                  <p className="font-medium text-black text-sm">{userData?.username}</p>
                  <p className="text-xs text-gray-500">Intern</p>
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
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  2
                </span>
              </button>
              
              <div className="h-8 w-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                {userData?.username?.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Profile completion indicator */}
            {!profileComplete && activeTab === "dashboard" && (
              <div className="flex items-center space-x-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                <Bell className="h-4 w-4" />
                <span>Complete your profile</span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4">
          {renderContent()}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {logOutModalOpen && <LogOutModal />}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
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
      )}
    </div>
  );
}