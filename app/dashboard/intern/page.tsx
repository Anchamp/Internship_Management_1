"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Home,
  LogOut,
  Settings,
  User,
  Menu,
  ClipboardList,
  Calendar,
  MessageSquare,
  Briefcase,
  Upload,
  Users,
  Search,
  Presentation,
  Star,
  BookOpen,
  Bell
} from "lucide-react";
import InternDashboardScreen from "./dashboardscreen";
import InternProfileSettings from "./profile-settings";
import FindApplyInternships from "./find-apply-internships";
import MyApplications from "./my-applications";

export default function InternDashboard() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [profileComplete, setProfileComplete] = useState<boolean>(false);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [logOutModalOpen, setLogOutModalOpen] = useState(false);

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

        if (user.role !== "intern") {
          router.push(`/dashboard/${user.role}`);
          return;
        }

        setUsername(user.username || "Intern");

        // Check profile completeness and load notifications
        try {
          const response = await fetch(`/api/users/${user.username}`);
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              // Check if mandatory fields are filled
              const isComplete = !!(
                data.user.fullName &&
                data.user.email &&
                data.user.phone &&
                data.user.dob &&
                data.user.university &&
                data.user.degree &&
                data.user.major &&
                data.user.graduationYear &&
                data.user.skills &&
                data.user.internshipGoals &&
                data.user.resumeFile &&
                data.user.idDocumentFile
              );
              setProfileComplete(isComplete);
              
              // Count unread notifications
              const unreadCount = data.user.notifications?.filter((notif: any) => !notif.read).length || 0;
              setUnreadNotifications(unreadCount);
            }
          }
        } catch (error) {
          console.warn("Couldn't fetch user profile data:", error);
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

  // Refresh profile completion when returning to dashboard
  useEffect(() => {
    if (activeTab === "dashboard") {
      const refreshProfileCompletion = async () => {
        try {
          const userData = localStorage.getItem("user");
          if (userData) {
            const user = JSON.parse(userData);
            const response = await fetch(`/api/users/${user.username}`);
            if (response.ok) {
              const data = await response.json();
              if (data.user) {
                const isComplete = !!(
                  data.user.fullName &&
                  data.user.email &&
                  data.user.phone &&
                  data.user.dob &&
                  data.user.university &&
                  data.user.degree &&
                  data.user.major &&
                  data.user.graduationYear &&
                  data.user.skills &&
                  data.user.internshipGoals &&
                  data.user.resumeFile &&
                  data.user.idDocumentFile
                );
                setProfileComplete(isComplete);
              }
            }
          }
        } catch (error) {
          console.error("Error refreshing profile completion:", error);
        }
      };

      refreshProfileCompletion();
    }
  }, [activeTab]);

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
    setActiveTab(tab);
  };

  const handleProfileUpdate = () => {
    // Refresh profile completion and return to dashboard
    setActiveTab("dashboard");
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
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md ${
                activeTab === "dashboard"
                  ? "bg-cyan-50 text-cyan-600"
                  : "hover:bg-gray-50 text-gray-700"
              } font-medium text-sm w-full text-left transition-colors`}
            >
              <Home className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </button>

            {/* My Teams */}
            <button
              onClick={() => handleNavigation("my-teams")}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md ${
                activeTab === "my-teams"
                  ? "bg-cyan-50 text-cyan-600"
                  : "hover:bg-gray-50 text-gray-700"
              } font-medium text-sm w-full text-left transition-colors`}
            >
              <Users className="h-4 w-4" />
              {!isSidebarCollapsed && <span>My Teams</span>}
            </button>

            {/* Internships */}
            <button
              onClick={() => handleNavigation("internships")}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md ${
                activeTab === "internships"
                  ? "bg-cyan-50 text-cyan-600"
                  : "hover:bg-gray-50 text-gray-700"
              } font-medium text-sm w-full text-left transition-colors`}
            >
              <Search className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Find Internships</span>}
            </button>

            {/* My Applications */}
            <button
              onClick={() => handleNavigation("my-applications")}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md ${
                activeTab === "my-applications"
                  ? "bg-cyan-50 text-cyan-600"
                  : "hover:bg-gray-50 text-gray-700"
              } font-medium text-sm w-full text-left transition-colors`}
            >
              <FileText className="h-4 w-4" />
              {!isSidebarCollapsed && <span>My Applications</span>}
            </button>

            {/* Project Details */}
            <button
              onClick={() => handleNavigation("project-details")}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md ${
                activeTab === "project-details"
                  ? "bg-cyan-50 text-cyan-600"
                  : "hover:bg-gray-50 text-gray-700"
              } font-medium text-sm w-full text-left transition-colors`}
            >
              <BookOpen className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Project Details</span>}
            </button>

            {/* Weekly Reports */}
            <button
              onClick={() => handleNavigation("weekly-reports")}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md ${
                activeTab === "weekly-reports"
                  ? "bg-cyan-50 text-cyan-600"
                  : "hover:bg-gray-50 text-gray-700"
              } font-medium text-sm w-full text-left transition-colors`}
            >
              <ClipboardList className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Weekly Reports</span>}
            </button>

            {/* Demo Presentation */}
            <button
              onClick={() => handleNavigation("demo-presentation")}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md ${
                activeTab === "demo-presentation"
                  ? "bg-cyan-50 text-cyan-600"
                  : "hover:bg-gray-50 text-gray-700"
              } font-medium text-sm w-full text-left transition-colors`}
            >
              <Presentation className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Demo Presentation</span>}
            </button>

            {/* Feedback & Reviews */}
            <button
              onClick={() => handleNavigation("feedback")}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md ${
                activeTab === "feedback"
                  ? "bg-cyan-50 text-cyan-600"
                  : "hover:bg-gray-50 text-gray-700"
              } font-medium text-sm w-full text-left transition-colors relative`}
            >
              <Star className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Feedback & Reviews</span>}
              {/* Notification badge */}
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Team Communication */}
            <button
              onClick={() => handleNavigation("team-communication")}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md ${
                activeTab === "team-communication"
                  ? "bg-cyan-50 text-cyan-600"
                  : "hover:bg-gray-50 text-gray-700"
              } font-medium text-sm w-full text-left transition-colors`}
            >
              <MessageSquare className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Team Communication</span>}
            </button>

            {/* Profile & Settings */}
            <button
              onClick={() => handleNavigation("profile-settings")}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md ${
                activeTab === "profile-settings"
                  ? "bg-cyan-50 text-cyan-600"
                  : "hover:bg-gray-50 text-gray-700"
              } font-medium text-sm w-full text-left transition-colors relative`}
            >
              <Settings className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Settings</span>}
              {/* Profile incomplete indicator */}
              {!profileComplete && (
                <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-2 w-2"></span>
              )}
            </button>
          </nav>

          {/* Bottom Section - User Profile & Logout */}
          <div className="mt-auto border-t pt-3 space-y-3">
            {/* User Profile */}
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
                  <p className="font-medium text-gray-900 text-sm">{username}</p>
                  <p className="text-xs text-gray-500">Intern</p>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={openLogOutModal}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-2"
              } p-2 rounded-md hover:bg-red-50 text-red-600 w-full text-left font-medium text-sm transition-colors`}
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
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  {activeTab === "dashboard"
                    ? "Intern Portal"
                    : activeTab === "my-teams"
                    ? "My Teams"
                    : activeTab === "internships"
                    ? "Find Internships"
                    : activeTab === "my-applications"
                    ? "My Applications"
                    : activeTab === "project-details"
                    ? "Project Details"
                    : activeTab === "weekly-reports"
                    ? "Weekly Reports"
                    : activeTab === "demo-presentation"
                    ? "Demo Presentation"
                    : activeTab === "feedback"
                    ? "Feedback & Reviews"
                    : activeTab === "team-communication"
                    ? "Team Communication"
                    : activeTab === "profile-settings"
                    ? "Profile & Settings"
                    : "Intern Portal"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {activeTab === "dashboard"
                    ? `Welcome, ${username}`
                    : activeTab === "my-teams"
                    ? "Team Projects & Collaboration"
                    : activeTab === "internships"
                    ? "Find & Apply for Internships"
                    : activeTab === "my-applications"
                    ? "Track Application Status"
                    : activeTab === "project-details"
                    ? "View Assigned Projects"
                    : activeTab === "weekly-reports"
                    ? "Submit Progress Reports"
                    : activeTab === "demo-presentation"
                    ? "Schedule & Present Demo"
                    : activeTab === "feedback"
                    ? "View Evaluations"
                    : activeTab === "team-communication"
                    ? "Chat with Team"
                    : activeTab === "profile-settings"
                    ? "Manage Account"
                    : `Welcome, ${username}`}
                </p>
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

        {/* Main Dashboard Content */}
        <main className="p-4 sm:p-6">
          {activeTab === "dashboard" && (
            <InternDashboardScreen
              profileComplete={profileComplete}
              username={username}
              onNavigate={handleNavigation}
            />
          )}
          {activeTab === "profile-settings" && (
            <InternProfileSettings
              inDashboard={true}
              onProfileUpdate={handleProfileUpdate}
            />
          )}
          {activeTab === "internships" && <FindApplyInternships />}
          {activeTab === "my-applications" && <MyApplications />}
          {activeTab === "my-teams" && (
            <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm border">
              <div className="text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">My Teams</h3>
                <p className="text-gray-500 mb-4">Team collaboration features coming soon</p>
                <div className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-600">
                  Coming Soon
                </div>
              </div>
            </div>
          )}
          {activeTab === "project-details" && (
            <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm border">
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Project Details</h3>
                <p className="text-gray-500 mb-4">View and manage your assigned projects</p>
                <div className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-600">
                  Coming Soon
                </div>
              </div>
            </div>
          )}
          {activeTab === "weekly-reports" && (
            <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm border">
              <div className="text-center">
                <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Weekly Reports</h3>
                <p className="text-gray-500 mb-4">Submit your weekly progress reports</p>
                <div className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-600">
                  Coming Soon
                </div>
              </div>
            </div>
          )}
          {activeTab === "demo-presentation" && (
            <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm border">
              <div className="text-center">
                <Presentation className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Demo Presentation</h3>
                <p className="text-gray-500 mb-4">Schedule and present your project demos</p>
                <div className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-600">
                  Coming Soon
                </div>
              </div>
            </div>
          )}
          {activeTab === "feedback" && (
            <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm border">
              <div className="text-center">
                <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Feedback & Reviews</h3>
                <p className="text-gray-500 mb-4">View feedback and evaluations from mentors</p>
                <div className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-600">
                  Coming Soon
                </div>
              </div>
            </div>
          )}
          {activeTab === "team-communication" && (
            <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm border">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Team Communication</h3>
                <p className="text-gray-500 mb-4">Chat and collaborate with your team members</p>
                <div className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-600">
                  Coming Soon
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      {logOutModalOpen && <LogOutModal />}
    </div>
  );
}
