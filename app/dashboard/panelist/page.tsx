"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Calendar,
  Check,
  Clock,
  Home,
  LogOut,
  Settings,
  Star,
  User,
  Users,
  Menu,
  ClipboardList,
} from "lucide-react";

export default function PanelistDashboard() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
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

        // Check if user is a panelist
        if (user.role !== "panelist") {
          // User is not a panelist, redirect to appropriate dashboard
          router.push(`/dashboard/${user.role}`);
          return;
        }

        setUsername(user.username || "Panelist");
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
              {!isSidebarCollapsed && <span>Candidates</span>}
            </a>
            <a
              href="#"
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium text-sm`}
            >
              <Calendar className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Interviews</span>}
            </a>
            <a
              href="#"
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium text-sm`}
            >
              <Star className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Evaluations</span>}
            </a>
            <a
              href="#"
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } p-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium text-sm`}
            >
              <User className="h-4 w-4" />
              {!isSidebarCollapsed && <span>My Profile</span>}
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
                  <p className="text-xs text-gray-500">Panelist</p>
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
                  Panelist Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Evaluation Portal
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
                  <p className="text-gray-500 text-xs">Today's Interviews</p>
                  <h3 className="text-lg font-bold">3</h3>
                </div>
                <span className="bg-cyan-100 p-1.5 rounded-md">
                  <Calendar className="h-4 w-4 text-cyan-600" />
                </span>
              </div>
            </div>

            <div className="bg-white rounded-md shadow p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs">Pending Evaluations</p>
                  <h3 className="text-lg font-bold">5</h3>
                </div>
                <span className="bg-amber-100 p-1.5 rounded-md">
                  <Clock className="h-4 w-4 text-amber-600" />
                </span>
              </div>
            </div>

            <div className="bg-white rounded-md shadow p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs">Completed Interviews</p>
                  <h3 className="text-lg font-bold">12</h3>
                </div>
                <span className="bg-green-100 p-1.5 rounded-md">
                  <Check className="h-4 w-4 text-green-600" />
                </span>
              </div>
            </div>

            <div className="bg-white rounded-md shadow p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs">Average Rating</p>
                  <h3 className="text-lg font-bold">4.2/5</h3>
                </div>
                <span className="bg-indigo-100 p-1.5 rounded-md">
                  <BarChart className="h-4 w-4 text-indigo-600" />
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white rounded-md shadow p-4">
              <h2 className="text-base font-semibold mb-3">
                Upcoming Interviews
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <div>
                    <p className="font-medium text-sm">Michael Chang</p>
                    <p className="text-xs text-gray-500">
                      Full Stack Developer
                    </p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        Today, 11:00 AM
                      </span>
                    </div>
                  </div>
                  <button className="px-2 py-1 bg-cyan-50 text-cyan-600 rounded-md text-xs font-medium">
                    View Details
                  </button>
                </div>

                <div className="flex justify-between items-center pb-2 border-b">
                  <div>
                    <p className="font-medium text-sm">Emily Wilson</p>
                    <p className="text-xs text-gray-500">UX/UI Designer</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        Today, 2:15 PM
                      </span>
                    </div>
                  </div>
                  <button className="px-2 py-1 bg-cyan-50 text-cyan-600 rounded-md text-xs font-medium">
                    View Details
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">James Patel</p>
                    <p className="text-xs text-gray-500">Mobile Developer</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        Tomorrow, 10:30 AM
                      </span>
                    </div>
                  </div>
                  <button className="px-2 py-1 bg-cyan-50 text-cyan-600 rounded-md text-xs font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-md shadow p-4">
              <h2 className="text-base font-semibold mb-3">
                Recent Evaluations
              </h2>
              <div className="space-y-3">
                <div className="border-l-4 border-green-500 pl-3 py-0.5">
                  <div className="flex justify-between">
                    <p className="font-medium text-sm">Sophia Martinez</p>
                    <div className="flex">
                      {[1, 2, 3, 4].map((star) => (
                        <Star
                          key={star}
                          className="h-3 w-3 fill-amber-400 text-amber-400"
                        />
                      ))}
                      <Star className="h-3 w-3 text-amber-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Data Scientist • Evaluated Yesterday
                  </p>
                </div>

                <div className="border-l-4 border-amber-500 pl-3 py-0.5">
                  <div className="flex justify-between">
                    <p className="font-medium text-sm">Daniel Brown</p>
                    <div className="flex">
                      {[1, 2, 3].map((star) => (
                        <Star
                          key={star}
                          className="h-3 w-3 fill-amber-400 text-amber-400"
                        />
                      ))}
                      {[4, 5].map((star) => (
                        <Star key={star} className="h-3 w-3 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Frontend Developer • Evaluated Aug 17
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-3 py-0.5">
                  <div className="flex justify-between">
                    <p className="font-medium text-sm">Aisha Johnson</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-3 w-3 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Product Manager • Evaluated Aug 15
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
