"use client";

import {
  Calendar,
  User,
  Users,
  Shield,
  AlertCircle,
  Loader2,
  Award,
  BarChart,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface AdminDashboardScreenProps {
  profileSubmissionCount: number;
  onNavigateToProfile?: () => void;
}

interface DashboardData {
  totalUsers: number;
  internsCount: number;
  employeeCount: number; // Add this property
  adminCount: number; // Add this property
  teamsCount: number;
  pendingApprovals: number;
  chartData: {
    labels: string[];
    datasets: {
      name: string;
      values: number[];
    }[];
  };
  topPerformers: {
    _id: string;
    userId: {
      _id: string;
      name: string;
      role: string;
    };
    rating: number;
    description: string;
  }[];
}

export default function AdminDashboardScreen({
  profileSubmissionCount = 0,
  onNavigateToProfile,
}: AdminDashboardScreenProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminUsername, setAdminUsername] = useState<string | null>(null);

  // Get admin username from localStorage on component mount
  useEffect(() => {
    const getUserFromLocalStorage = () => {
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            setAdminUsername(userData.username);
          } catch (e) {
            console.error("Error parsing user data from localStorage:", e);
          }
        }
      }
    };

    getUserFromLocalStorage();
  }, []);

  useEffect(() => {
    async function fetchDashboardStats() {
      if (!adminUsername) {
        return; // Don't fetch if we don't have the username yet
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/admin/dashboard-stats?username=${encodeURIComponent(
            adminUsername
          )}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err);
        setError(
          err.message ||
            "Failed to load dashboard data. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (adminUsername) {
      fetchDashboardStats();
    }
  }, [adminUsername]);

  // Enhanced bar chart with animations and better styling
  const renderEnhancedBarChart = () => {
    if (!dashboardData) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }

    const totalUsers = Math.max(1, Number(dashboardData.totalUsers) || 0);
    const internsCount = Math.max(0, Number(dashboardData.internsCount) || 0);
    const employeeCount = Math.max(0, Number(dashboardData.employeeCount) || 0);

    const maxValue = Math.max(totalUsers, internsCount, employeeCount);

    const chartData = [
      {
        label: "Interns",
        value: internsCount,
        color: "#0ea5e9",
        percentage: (internsCount / maxValue) * 100,
      },
      {
        label: "Employees",
        value: employeeCount,
        color: "#6366f1",
        percentage: (employeeCount / maxValue) * 100,
      },
      {
        label: "Total Users",
        value: totalUsers,
        color: "#2563eb",
        percentage: (totalUsers / maxValue) * 100,
      },
    ];

    return (
      <div className="h-full flex items-end justify-around px-2">
        {chartData.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center h-full justify-end pt-2 w-1/4"
          >
            <div className="flex flex-col items-center w-full h-[80%] justify-end">
              {/* Fixed bar styling with explicit height */}
              <div
                className="w-14 sm:w-16 rounded-t-lg shadow-sm relative group"
                style={{
                  height: `${Math.max(10, item.percentage)}%`,
                  backgroundColor: item.color,
                  minHeight: "20px", // Ensure bars are always visible
                }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                  {item.value}
                </div>
              </div>
              <span className="text-sm font-medium text-gray-800 mt-2">
                {item.value}
              </span>
              <span className="text-xs text-gray-500 mt-1">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Get color based on rating
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-500";
    if (rating >= 3.5) return "text-cyan-500";
    return "text-amber-500";
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "intern":
        return "bg-cyan-100 text-cyan-800";
      case "employee":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-slate-50 min-h-full">
      {/* Profile Completion Warning with improved styling */}
      {profileSubmissionCount === 0 && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Profile Incomplete
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  Please complete your profile before accessing all dashboard
                  features. Many functions are locked until your profile is set
                  up.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateToProfile) {
                      onNavigateToProfile();
                    }
                  }}
                  className="flex items-center text-sm font-medium bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-md transition-colors"
                >
                  Complete your profile now
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State with improved animation */}
      {isLoading && (
        <div className="flex justify-center items-center h-64 bg-white/50 backdrop-blur-sm rounded-lg mx-4 sm:mx-6 lg:mx-8">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            <span className="mt-3 text-gray-600 animate-pulse">
              Loading dashboard data...
            </span>
          </div>
        </div>
      )}

      {/* Error State with improved styling */}
      {!isLoading && error && (
        <div className="mx-4 sm:mx-6 lg:mx-8 bg-red-50 border-l-4 border-red-500 p-5 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content with enhanced styling */}
      {!isLoading && dashboardData && (
        <div className="px-4 sm:px-6 lg:px-8 pb-4 space-y-4">
          {/* Stat Cards with hover effects and better styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Total Users
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {dashboardData.totalUsers}
                  </h3>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Interns</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {dashboardData.internsCount}
                  </h3>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <User className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Teams</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {dashboardData.teamsCount}
                  </h3>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Pending Approvals
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {dashboardData.pendingApprovals}
                  </h3>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Performance section with improved layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 col-span-2 overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  User Distribution
                </h2>
                <div className="flex space-x-2 flex-wrap justify-end">
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 mb-1">
                    <span className="w-2 h-2 mr-1.5 bg-blue-600 rounded-full"></span>
                    Interns
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 mb-1">
                    <span className="w-2 h-2 mr-1.5 bg-indigo-600 rounded-full"></span>
                    Employees
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-sky-50 text-sky-700 mb-1">
                    <span className="w-2 h-2 mr-1.5 bg-sky-600 rounded-full"></span>
                    Total Users
                  </span>
                </div>
              </div>

              {/* Reduced height container */}
              <div className="h-52">{renderEnhancedBarChart()}</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-amber-500" />
                  Top Performers
                </h2>
                <a
                  href="#"
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View all
                </a>
              </div>

              {dashboardData.topPerformers.length > 0 ? (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {dashboardData.topPerformers.map((performer) => (
                    <div
                      key={performer._id}
                      className="bg-white rounded-lg p-3 border border-gray-100 hover:shadow-sm transition-all"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-sm text-gray-900">
                          {performer.userId.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(
                            performer.userId.role
                          )}`}
                        >
                          {performer.userId.role.charAt(0).toUpperCase() +
                            performer.userId.role.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-sm ${
                                star <= performer.rating
                                  ? getRatingColor(performer.rating)
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span
                          className={`ml-2 text-xs font-semibold ${getRatingColor(
                            performer.rating
                          )}`}
                        >
                          {performer.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-1 mt-0.5 italic">
                        "{performer.description.substring(0, 50)}..."
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg">
                  <BarChart
                    className="h-8 w-8 text-gray-400 mb-2"
                    strokeWidth={1.5}
                  />
                  <p className="text-gray-500 font-medium text-sm">
                    No performance data available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remove the animation that wasn't working */}
      <style jsx global>{`
        /* No animation needed as we're using fixed heights */
      `}</style>
    </div>
  );
} 
