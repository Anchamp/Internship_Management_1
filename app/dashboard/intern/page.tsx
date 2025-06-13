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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
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
      icon: ClipboardList, 
      description: "Track Application Status" 
    },
    { 
      id: "project-details", 
      label: "Project Details", 
      icon: BookOpen, 
      description: "Current Project Info" 
    },
    { 
      id: "weekly-reports", 
      label: "Weekly Reports", 
      icon: FileText, 
      description: "Submit Progress Reports" 
    },
    { 
      id: "demo-presentation", 
      label: "Demo Presentation", 
      icon: Presentation, 
      description: "Demo Schedule & Materials" 
    },
    { 
      id: "feedback", 
      label: "Feedback & Reviews", 
      icon: Star, 
      description: "View Evaluations" 
    },
    { 
      id: "team-chat", 
      label: "Team Communication", 
      icon: MessageSquare, 
      description: "Chat with Team" 
    },
    { 
      id: "profile-settings", 
      label: "Profile & Settings", 
      icon: User, 
      description: "Manage Account" 
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarCollapsed ? "w-16" : "w-64"
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo and toggle */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-bold text-gray-800">InternHub</h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full text-left p-3 rounded-md transition-all duration-200 group relative ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  <IconComponent
                    className={`h-5 w-5 ${
                      isSidebarCollapsed ? "mx-auto" : "mr-3"
                    } ${isActive ? "text-white" : "text-gray-500"}`}
                  />
                  {!isSidebarCollapsed && (
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className={`text-xs mt-0.5 ${
                        isActive ? "text-cyan-100" : "text-gray-500"
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  )}
                  {/* Show notification badge for certain items */}
                  {item.id === "feedback" && unreadNotifications > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </div>
                
                {/* Tooltip for collapsed sidebar */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full text-left p-3 rounded-md text-red-600 hover:bg-red-50 transition-colors flex items-center"
          >
            <LogOut
              className={`h-5 w-5 ${
                isSidebarCollapsed ? "mx-auto" : "mr-3"
              }`}
            />
            {!isSidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                {activeTab === "dashboard"
                  ? "Intern Dashboard"
                  : activeTab === "my-teams"
                  ? "My Teams"
                  : activeTab === "find-internships"
                  ? "Find Internships"
                  : activeTab === "internship-request"
                  ? "Apply for Internship"
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
                  : activeTab === "team-chat"
                  ? "Team Communication"
                  : activeTab === "profile-settings"
                  ? "Profile & Settings"
                  : "Dashboard"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {activeTab === "dashboard"
                  ? "Learning Portal & Progress Overview"
                  : activeTab === "my-teams"
                  ? "Team Projects & Collaboration"
                  : activeTab === "find-internships"
                  ? "Browse Available Opportunities"
                  : activeTab === "internship-request"
                  ? "Submit Your Application"
                  : activeTab === "my-applications"
                  ? "Track Application Status"
                  : activeTab === "project-details"
                  ? "Current Project Information"
                  : activeTab === "weekly-reports"
                  ? "Submit Progress Reports"
                  : activeTab === "demo-presentation"
                  ? "Demo Schedule & Materials"
                  : activeTab === "feedback"
                  ? "Reviews & Evaluations"
                  : activeTab === "team-chat"
                  ? "Chat with Team Members"
                  : activeTab === "profile-settings"
                  ? "Manage Account & Preferences"
                  : "Learning Portal"}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notification indicator */}
              {unreadNotifications > 0 && (
                <div className="relative">
                  <Bell className="h-6 w-6 text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                </div>
              )}
              
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 rounded-md shadow-md">
                <p className="text-sm sm:text-base font-semibold text-white tracking-wide whitespace-nowrap">
                  Welcome back, {username}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {activeTab === "dashboard" && (
            <InternDashboardScreen 
              profileComplete={profileComplete}
              username={username}
              onNavigate={handleNavigation}
            />
          )}
          {activeTab === "my-teams" && <MyTeamsScreen />}
          {activeTab === "find-internships" && <FindInternshipsScreen />}
          {activeTab === "internship-request" && <InternshipRequestScreen />}
          {activeTab === "my-applications" && <MyApplicationsScreen />}
          {activeTab === "project-details" && <ProjectDetailsScreen />}
          {activeTab === "weekly-reports" && <WeeklyReportsScreen />}
          {activeTab === "demo-presentation" && <DemoPresentationScreen />}
          {activeTab === "feedback" && <FeedbackEvaluationsScreen />}
          {activeTab === "team-chat" && <TeamCommunicationScreen />}
          {activeTab === "profile-settings" && <InternProfileSettings inDashboard={true} />}
        </main>
      </div>
    </div>
  );
}