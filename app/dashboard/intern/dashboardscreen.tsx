// FILE: app/dashboard/intern/dashboardscreen.tsx
// REPLACE THE ENTIRE FILE WITH THIS CODE

"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  BarChart,
  Calendar,
  User,
  Briefcase,
  Award,
  Target,
  TrendingUp,
  MessageSquare,
  Upload,
  GraduationCap,
  Activity,
  Users,
  BookOpen,
  Star,
  ArrowRight,
  Bell,
  Play,
  Pause,
  ChevronRight,
  Plus,
  Search,
  Lightbulb,
  Presentation,
} from "lucide-react";

interface DashboardScreenProps {
  profileComplete: boolean;
  username: string;
  onNavigate: (tab: string) => void;
}

interface UserData {
  fullName?: string;
  university?: string;
  degree?: string;
  major?: string;
  graduationYear?: string;
  gpa?: string;
  skills?: string;
  internshipGoals?: string;
  resumeFile?: string;
  idDocumentFile?: string;
  transcriptFile?: string;
  applicationStatus?: string;
  verificationStatus?: string;
  assignedTeams?: any[];
  weeklyReports?: any[];
  appliedInternships?: any[];
  notifications?: any[];
}

export default function InternDashboardScreen({
  profileComplete,
  username,
  onNavigate,
}: DashboardScreenProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${username}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [username]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Helper functions
  const getTotalTeams = () => userData?.assignedTeams?.length || 0;
  const getPendingReports = () => {
    return userData?.weeklyReports?.filter(report => report.status === "pending").length || 0;
  };
  const getApplicationsSubmitted = () => userData?.appliedInternships?.length || 0;

  // CRITICAL FIX: Check if user has applied to any internships (replaces "none" checks)
  const hasAppliedToInternships = () => {
    return userData?.appliedInternships && userData.appliedInternships.length > 0;
  };

  // Calculate progress metrics - FIXED: No more "none" references
  const getApplicationProgress = () => {
    if (!userData) return 0;
    if (userData.applicationStatus === "completed") return 100;
    if (userData.applicationStatus === "active") return 75;
    if (userData.applicationStatus === "approved") return 50;
    if (userData.applicationStatus === "pending") return 25;
    // Use profileComplete status instead of checking for "none"
    return profileComplete ? 15 : 0;
  };

  // FIXED: No more "none" references
  const getNextMilestone = () => {
    if (!profileComplete) return "Complete your profile";
    if (!hasAppliedToInternships()) return "Apply for internship";
    if (userData?.applicationStatus === "pending") return "Wait for approval";
    if (userData?.applicationStatus === "approved") return "Get team assignment";
    if (userData?.applicationStatus === "active") return "Submit weekly reports";
    return "Continue your journey";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {userData?.fullName || username}!
            </h1>
            <p className="text-cyan-100 mb-4">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                <span className="text-sm">Next: {getNextMilestone()}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <div className="text-sm opacity-90 mb-1">Progress</div>
              <div className="text-2xl font-bold">{getApplicationProgress()}%</div>
              <div className="w-32 bg-white/30 rounded-full h-2 mt-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${getApplicationProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <FileText className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-gray-900">{getApplicationsSubmitted()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Teams</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalTeams()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Reports</p>
              <p className="text-2xl font-bold text-gray-900">{getPendingReports()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-sm font-bold text-gray-900 capitalize">
                {userData?.applicationStatus || "Not Applied"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Tracker - FIXED: No more "none" references */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BarChart className="h-5 w-5 mr-2 text-cyan-600" />
          Internship Progress Tracker
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { 
              step: 1, 
              title: "Profile Setup", 
              description: "Complete your profile",
              completed: profileComplete,
              current: !profileComplete
            },
            { 
              step: 2, 
              title: "Application", 
              description: "Submit internship request",
              // FIXED: Check if user has applied to internships instead of checking for "none"
              completed: hasAppliedToInternships(),
              current: profileComplete && !hasAppliedToInternships()
            },
            { 
              step: 3, 
              title: "Review", 
              description: "Admin approval process",
              completed: userData?.applicationStatus === "approved" || userData?.applicationStatus === "active",
              current: userData?.applicationStatus === "pending"
            },
            { 
              step: 4, 
              title: "Team Assignment", 
              description: "Get matched with project",
              completed: getTotalTeams() > 0,
              current: userData?.applicationStatus === "approved" && getTotalTeams() === 0
            },
            { 
              step: 5, 
              title: "Active Internship", 
              description: "Start your journey",
              completed: userData?.applicationStatus === "active",
              current: userData?.applicationStatus === "active"
            }
          ].map((stage, index) => (
            <div key={index} className="text-center">
              <div className={`relative mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                stage.completed 
                  ? "bg-green-500 text-white" 
                  : stage.current 
                    ? "bg-cyan-500 text-white animate-pulse" 
                    : "bg-gray-200 text-gray-400"
              }`}>
                {stage.completed ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <span className="font-bold">{stage.step}</span>
                )}
                {index < 4 && (
                  <div className={`absolute top-6 left-12 w-full h-0.5 ${
                    stage.completed ? "bg-green-500" : "bg-gray-200"
                  }`} />
                )}
              </div>
              <h3 className={`font-medium text-sm mb-1 ${
                stage.current ? "text-cyan-600" : stage.completed ? "text-green-600" : "text-gray-500"
              }`}>
                {stage.title}
              </h3>
              <p className="text-xs text-gray-500">{stage.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Cards - FIXED: Updated logic */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Completion Card */}
        {!profileComplete && (
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <User className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Complete Your Profile</h3>
                <p className="text-sm text-gray-600">Required to apply for internships</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("profile-settings")}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Complete Profile
            </button>
          </div>
        )}

        {/* Browse Internships Card - FIXED: Use hasAppliedToInternships() */}
        {profileComplete && !hasAppliedToInternships() && (
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Search className="h-8 w-8 text-cyan-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Browse Internships</h3>
                <p className="text-sm text-gray-600">Find your perfect internship match</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("browse-internships")}
              className="w-full bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700 transition-colors flex items-center justify-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Browse Opportunities
            </button>
          </div>
        )}

        {/* My Applications Card - FIXED: Use hasAppliedToInternships() */}
        {hasAppliedToInternships() && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">My Applications</h3>
                <p className="text-sm text-gray-600">{getApplicationsSubmitted()} applications submitted</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("my-applications")}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Applications
            </button>
          </div>
        )}

        {/* Weekly Reports Card */}
        {userData?.applicationStatus === "active" && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <BookOpen className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Weekly Reports</h3>
                <p className="text-sm text-gray-600">
                  {getPendingReports() > 0 ? `${getPendingReports()} pending` : "All up to date"}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("weekly-reports")}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Manage Reports
            </button>
          </div>
        )}

        {/* Team Assignment Card */}
        {getTotalTeams() > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Team Assignment</h3>
                <p className="text-sm text-gray-600">Assigned to {getTotalTeams()} team(s)</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("team-management")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Users className="h-4 w-4 mr-2" />
              View Teams
            </button>
          </div>
        )}

        {/* Demo Preparation Card */}
        {userData?.applicationStatus === "active" && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Presentation className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Demo Preparation</h3>
                <p className="text-sm text-gray-600">Prepare your final presentation</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("demo-preparation")}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors flex items-center justify-center"
            >
              <Presentation className="h-4 w-4 mr-2" />
              Prepare Demo
            </button>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Activity className="h-5 w-5 mr-2 text-cyan-600" />
            Recent Activity
          </h2>
          <button className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {userData?.notifications && userData.notifications.length > 0 ? (
            userData.notifications.slice(0, 3).map((notification, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-cyan-100 rounded-lg mr-3">
                  <Bell className="h-4 w-4 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-xs text-gray-500">{notification.message}</p>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No recent activity</p>
              <p className="text-sm">Complete your profile and apply for internships to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips and Resources */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-cyan-600" />
          Tips & Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-cyan-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">📝 Profile Tips</h3>
            <p className="text-sm text-gray-600">
              Complete all sections of your profile to increase your chances of getting selected.
              Upload a professional resume and highlight your relevant skills.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">🎯 Application Strategy</h3>
            <p className="text-sm text-gray-600">
              Apply to internships that match your skills and career goals. Customize your
              application for each opportunity.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">📚 Learning Resources</h3>
            <p className="text-sm text-gray-600">
              Take advantage of online courses and tutorials to improve your skills during
              the internship application process.
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">🤝 Networking</h3>
            <p className="text-sm text-gray-600">
              Connect with mentors and fellow interns. Building professional relationships
              is key to career success.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}