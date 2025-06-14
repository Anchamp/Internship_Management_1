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
//import MyTeamsScreen from "./my-teams";
//import FindInternshipsScreen from "./find-internships";
//import InternshipRequestScreen from "./internship-request";
//import MyApplicationsScreen from "./my-applications";
//import ProjectDetailsScreen from "./project-details";
//import WeeklyReportsScreen from "./weekly-reports";
//import DemoPresentationScreen from "./demo-presentation";
//import FeedbackEvaluationsScreen from "./feedback-evaluations";
//import TeamCommunicationScreen from "./team-communication";

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
        <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
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
    )
  }
  const sidebarItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: Home, 
      description: "Overview & Quick Stats" 
    },
    { 
      id: "my-teams", 
      label: "My Teams", 
      icon: Users, 
      description: "Team Projects & Collaboration" 
    },
    { 
      id: "find-internships", 
      label: "Find Internships", 
      icon: Search, 
      description: "Browse Opportunities" 
    },
    { 
      id: "internship-request", 
      label: "Apply for Internship", 
      icon: Upload, 
      description: "Submit Application" 
    },
    { 
      id: "my-applications", 
      label: "My Applications", 
      icon: FileText, 
      description: "Track Application Status" 
    },
    { 
      id: "project-details", 
      label: "Project Details", 
      icon: Briefcase, 
      description: "View Assigned Projects" 
    },
    { 
      id: "weekly-reports", 
      label: "Weekly Reports", 
      icon: ClipboardList, 
      description: "Submit Progress Reports" 
    },
    { 
      id: "demo-presentation", 
      label: "Demo Presentation", 
      icon: Presentation, 
      description: "Schedule & Present Demo" 
    },
    { 
      id: "feedback-evaluations", 
      label: "Feedback & Evaluations", 
      icon: Star, 
      description: "View Feedback & Ratings" 
    },
    { 
      id: "team-communication", 
      label: "Team Communication", 
      icon: MessageSquare, 
      description: "Chat with Team Members" 
    },
    { 
      id: "profile-settings", 
      label: "Profile & Settings", 
      icon: Settings, 
      description: "Manage Account & Preferences" 
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${
        isSidebarCollapsed ? "w-16" : "w-64"
      } flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-800">Intern Portal</h1>
                <p className="text-xs text-gray-500">Welcome, {username}</p>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full text-left p-3 rounded-md transition-colors flex items-center ${
                    isActive
                      ? "bg-cyan-100 text-cyan-700 border-r-4 border-cyan-500"
                      : "text-gray-700 hover:bg-gray-50"
                  } ${isSidebarCollapsed ? "justify-center" : ""}`}
                  title={isSidebarCollapsed ? item.label : ""}
                >
                  <IconComponent className={`h-5 w-5 ${isSidebarCollapsed ? "" : "mr-3"}`} />
                  {!isSidebarCollapsed && (
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  )}
                  {!isSidebarCollapsed && item.id === "profile-settings" && !profileComplete && (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  {!isSidebarCollapsed && item.id === "team-communication" && unreadNotifications > 0 && (
                    <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {unreadNotifications}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={openLogOutModal}
            className={`w-full text-left p-3 rounded-md text-red-600 hover:bg-red-50 transition-colors flex items-center ${
              isSidebarCollapsed ? "justify-center" : ""
            }`}
            title={isSidebarCollapsed ? "Logout" : ""}
          >
            <LogOut className={`h-5 w-5 ${isSidebarCollapsed ? "" : "mr-3"}`} />
            {!isSidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {activeTab === "dashboard"
                    ? "Dashboard"
                    : activeTab === "profile-settings"
                    ? "Profile & Settings"
                    : sidebarItems.find(item => item.id === activeTab)?.label || "Dashboard"}
                </h1>
                <p className="text-sm text-gray-500">
                  {activeTab === "dashboard"
                    ? "Overview of your internship journey"
                    : sidebarItems.find(item => item.id === activeTab)?.description || ""}
                </p>
              </div>
            </div>

            {/* Profile completion indicator */}
            {!profileComplete && (
              <div className="flex items-center space-x-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                <Bell className="h-4 w-4" />
                <span>Complete your profile</span>
              </div>
            )}

            {/* Welcome message */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 rounded-md shadow-md">
              <p className="text-sm font-semibold text-white">
                Welcome back, {username}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
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
          {activeTab === "my-teams" && (
            <div className="p-4 bg-white rounded-md shadow">
              <p className="text-lg font-medium">My Teams section coming soon</p>
            </div>
          )}
          {activeTab === "find-internships" && (
            <div className="p-4 bg-white rounded-md shadow">
              <p className="text-lg font-medium">Find Internships section coming soon</p>
            </div>
          )}
          {activeTab === "internship-request" && (
            <div className="p-4 bg-white rounded-md shadow">
              <p className="text-lg font-medium">Internship Request section coming soon</p>
            </div>
          )}
          {activeTab === "my-applications" && (
            <div className="p-4 bg-white rounded-md shadow">
              <p className="text-lg font-medium">My Applications section coming soon</p>
            </div>
          )}
          {activeTab === "project-details" && (
            <div className="p-4 bg-white rounded-md shadow">
              <p className="text-lg font-medium">Project Details section coming soon</p>
            </div>
          )}
          {activeTab === "weekly-reports" && (
            <div className="p-4 bg-white rounded-md shadow">
              <p className="text-lg font-medium">Weekly Reports section coming soon</p>
            </div>
          )}
          {activeTab === "demo-presentation" && (
            <div className="p-4 bg-white rounded-md shadow">
              <p className="text-lg font-medium">Demo Presentation section coming soon</p>
            </div>
          )}
          {activeTab === "feedback-evaluations" && (
            <div className="p-4 bg-white rounded-md shadow">
              <p className="text-lg font-medium">Feedback & Evaluations section coming soon</p>
            </div>
          )}
          {activeTab === "team-communication" && (
            <div className="p-4 bg-white rounded-md shadow">
              <p className="text-lg font-medium">Team Communication section coming soon</p>
            </div>
          )}
        </main>
      </div>
      {logOutModalOpen && <LogOutModal />}
    </div>
  );
}
