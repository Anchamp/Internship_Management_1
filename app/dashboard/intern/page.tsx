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
import WeeklyReports from "./weekly-reports";
import DemoPresentation from "./demo-presentation";
import InternAssignments from "./assignments";

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

  // Helper function to calculate if profile is complete
  const calculateProfileCompletion = (user: any): boolean => {
    if (!user) return false;
    
    // Define required fields for profile completion
    const requiredFields = [
      'fullName',
      'email', 
      'phone',
      'dob',
      'university',
      'degree',
      'major',
      'graduationYear',
      'skills',
      'internshipGoals',
      'resumeFile',
      'idDocumentFile'
    ];
    
    // Check if all required fields are filled
    const isComplete = requiredFields.every(field => {
      const value = user[field];
      return value && 
             typeof value === 'string' && 
             value.trim() !== '' && 
             value !== 'none';
    });
    
    return isComplete;
  };

  // Fetch user data from API and calculate profile completion
  const fetchUserData = async (usernameParam: string) => {
    try {
      const response = await fetch(`/api/users/${usernameParam}`);
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        setUserData(user);
        
        // Calculate profile completion based on actual data
        const isProfileComplete = calculateProfileCompletion(user);
        setProfileComplete(isProfileComplete);
        
        console.log('Profile completion status:', isProfileComplete);
        console.log('User data for completion check:', {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          university: user.university,
          resumeFile: user.resumeFile,
          // ... other fields
        });
        
        return user;
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

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
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
      // Check authentication
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

      const currentUsername = user.username || "";
      setUsername(currentUsername);

      // Fetch fresh user data from API instead of relying on localStorage
      const freshUserData = await fetchUserData(currentUsername);
      
      setIsLoading(false);
    };

    initializeUser();
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

  // Updated handler that refetches user data after profile update
  const handleProfileUpdate = async () => {
    console.log('Profile updated, refetching user data...');
    // Refetch user data to get updated profile completion status
    const freshUserData = await fetchUserData(username);
    if (freshUserData) {
      const isComplete = calculateProfileCompletion(freshUserData);
      setProfileComplete(isComplete);
      console.log('Updated profile completion status:', isComplete);
    }
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
      case "weekly-reports":
        return "Submit and manage your weekly reports";
      case "demo-presentation":
        return "Prepare for your demo presentation";
      case "profile-settings":
        return "Manage your account settings";
      case "internships":
        return "Discover internship opportunities";
      case "my-applications":
        return "Track your application status";
      case "feedback":
        return "View feedback from mentors";
      case "team-communication":
        return "Connect with your team";
      default:
        return "Welcome to your dashboard";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarCollapsed ? "w-16" : "w-64"
        } bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col fixed md:relative z-30 h-full`}
      >
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="bg-cyan-500 rounded-lg p-2">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900">
                  InternshipHub
                </h1>
                <p className="text-xs text-gray-500">Intern Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => handleNavigation("dashboard")}
            className={getMenuItemClass("dashboard")}
          >
            <Home className="h-4 w-4" />
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => handleNavigation("assignments")}
            className={getMenuItemClass("assignments")}
          >
            <ClipboardList className="h-4 w-4" />
            {!isSidebarCollapsed && <span>My Assignments</span>}
          </button>

          <button
            onClick={() => handleNavigation("my-teams")}
            className={getMenuItemClass("my-teams")}
          >
            <Users className="h-4 w-4" />
            {!isSidebarCollapsed && <span>My Teams</span>}
          </button>



          <button
            onClick={() => handleNavigation("weekly-reports")}
            className={getMenuItemClass("weekly-reports")}
          >
            <FileText className="h-4 w-4" />
            {!isSidebarCollapsed && <span>Weekly Reports</span>}
          </button>

          <button
            onClick={() => handleNavigation("demo-presentation")}
            className={getMenuItemClass("demo-presentation")}
          >
            <Presentation className="h-4 w-4" />
            {!isSidebarCollapsed && <span>Demo</span>}
          </button>

          <button
            onClick={() => handleNavigation("internships")}
            className={getMenuItemClass("internships")}
          >
            <BookOpen className="h-4 w-4" />
            {!isSidebarCollapsed && <span>Find Internships</span>}
          </button>

          <button
            onClick={() => handleNavigation("my-applications")}
            className={getMenuItemClass("my-applications")}
          >
            <Calendar className="h-4 w-4" />
            {!isSidebarCollapsed && <span>My Applications</span>}
          </button>

          <button
            onClick={() => handleNavigation("feedback")}
            className={getMenuItemClass("feedback")}
          >
            <Star className="h-4 w-4" />
            {!isSidebarCollapsed && <span>Feedback</span>}
          </button>

          <button
            onClick={() => handleNavigation("team-communication")}
            className={getMenuItemClass("team-communication")}
          >
            <MessageSquare className="h-4 w-4" />
            {!isSidebarCollapsed && <span>Team Chat</span>}
          </button>

          <button
            onClick={() => handleNavigation("profile-settings")}
            className={getMenuItemClass("profile-settings")}
          >
            <Settings className="h-4 w-4" />
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t">
          <div
            className={`flex items-center ${
              isSidebarCollapsed ? "justify-center" : "space-x-3"
            } mb-3`}
          >
            <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {userData?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userData?.fullName || userData?.username || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">Intern</p>
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
        <main className="p-4 sm:p-6">{renderContent()}</main>
      </div>

      {/* Logout Modal */}
      {logOutModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Logout
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={closeLogOutModal}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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