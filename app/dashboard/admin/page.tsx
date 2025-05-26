"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Building,
  Calendar,
  Home,
  LogOut,
  PieChart,
  Settings,
  Shield,
  User,
  UserPlus,
  Users,
  Menu,
  ClipboardList,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [organizationName, setOrganizationName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

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
        // Get user data from localStorage
        const userData = localStorage.getItem("user");

        if (!userData) {
          // No user data found, redirect to login
          router.push("/sign-in");
          return;
        }

        const user = JSON.parse(userData);

        // Check if user is an admin
        if (user.role !== "admin") {
          // User is not an admin, redirect to appropriate dashboard
          router.push(`/dashboard/${user.role}`);
          return;
        }

        setUsername(user.username || "Admin");

        // Fetch organization details
        try {
          // Get token from localStorage
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("No authentication token found");
          }

          const res = await fetch("/api/organization", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const orgData = await res.json();
            setOrganizationName(orgData.name || "Your Organization");
          } else {
            // If API call fails, use organization name from user data if available
            setOrganizationName(user.organizationName || "Your Organization");
          }
        } catch (err) {
          console.error("Error fetching organization:", err);
          // Fallback to organization name from user data if available
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

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
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md bg-cyan-50 text-cyan-600 font-medium text-sm`}
            >
              <Home className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </a>
            <a
              href="#"
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium text-sm`}
            >
              <Users className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Users</span>}
            </a>
            <a
              href="#"
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium text-sm`}
            >
              <UserPlus className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Onboarding</span>}
            </a>
            <a
              href="#"
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium text-sm`}
            >
              <Building className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Organization</span>}
            </a>
            <a
              href="#"
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium text-sm`}
            >
              <Calendar className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Programs</span>}
            </a>
            <a
              href="#"
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium text-sm`}
            >
              <Shield className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Permissions</span>}
            </a>
            <a
              href="#"
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium text-sm`}
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
              onClick={handleLogout}
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
                  Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {organizationName}
                </p>
              </div>
            </div>

            {/* Responsive welcome message */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md shadow-md ml-auto">
              <p className="text-sm sm:text-base font-semibold text-white tracking-wide whitespace-nowrap">
                Welcome back, {username}
              </p>
            </div>
          </div>
        </header>

        <main className="p-3 sm:p-4">
          {/* Dashboard Content - with reduced sizes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <div className="bg-white rounded-md shadow p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs">Total Users</p>
                  <h3 className="text-lg font-bold">34</h3>
                </div>
                <span className="bg-cyan-100 p-1.5 rounded-md">
                  <Users className="h-4 w-4 text-cyan-600" />
                </span>
              </div>
            </div>

            <div className="bg-white rounded-md shadow p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs">Active Interns</p>
                  <h3 className="text-lg font-bold">18</h3>
                </div>
                <span className="bg-green-100 p-1.5 rounded-md">
                  <User className="h-4 w-4 text-green-600" />
                </span>
              </div>
            </div>

            <div className="bg-white rounded-md shadow p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs">Programs</p>
                  <h3 className="text-lg font-bold">5</h3>
                </div>
                <span className="bg-amber-100 p-1.5 rounded-md">
                  <Calendar className="h-4 w-4 text-amber-600" />
                </span>
              </div>
            </div>

            <div className="bg-white rounded-md shadow p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs">Pending Approvals</p>
                  <h3 className="text-lg font-bold">7</h3>
                </div>
                <span className="bg-indigo-100 p-1.5 rounded-md">
                  <Shield className="h-4 w-4 text-indigo-600" />
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white rounded-md shadow p-4 col-span-2">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold">User Distribution</h2>
                <div className="flex space-x-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-800">
                    <span className="w-1.5 h-1.5 mr-1 bg-cyan-500 rounded-full"></span>
                    Interns
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-800">
                    <span className="w-1.5 h-1.5 mr-1 bg-indigo-500 rounded-full"></span>
                    Mentors
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-800">
                    <span className="w-1.5 h-1.5 mr-1 bg-amber-500 rounded-full"></span>
                    Panelists
                  </span>
                </div>
              </div>

              <div className="h-48 flex items-center justify-center">
                <BarChart className="h-32 w-32 text-gray-300" />
                <span className="text-gray-400 text-xs">
                  Chart visualization goes here
                </span>
              </div>
            </div>

            <div className="bg-white rounded-md shadow p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold">Recent Activities</h2>
                <a href="#" className="text-xs text-cyan-600">
                  View all
                </a>
              </div>

              <div className="space-y-3">
                <div className="border-l-4 border-cyan-500 pl-3 py-0.5">
                  <p className="font-medium text-sm">New user registered</p>
                  <p className="text-xs text-gray-500">John Doe (Intern)</p>
                  <p className="text-xs text-gray-500">Today, 09:15 AM</p>
                </div>

                <div className="border-l-4 border-indigo-500 pl-3 py-0.5">
                  <p className="font-medium text-sm">
                    Program schedule updated
                  </p>
                  <p className="text-xs text-gray-500">
                    Summer 2023 Internship
                  </p>
                  <p className="text-xs text-gray-500">Yesterday, 03:30 PM</p>
                </div>

                <div className="border-l-4 border-amber-500 pl-3 py-0.5">
                  <p className="font-medium text-sm">New mentor assigned</p>
                  <p className="text-xs text-gray-500">
                    Sarah Wilson to Mobile Dev Team
                  </p>
                  <p className="text-xs text-gray-500">Aug 16, 2023</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
