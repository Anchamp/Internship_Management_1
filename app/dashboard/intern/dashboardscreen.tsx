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

  // Calculate progress metrics
  const getApplicationProgress = () => {
    if (!userData) return 0;
    if (userData.applicationStatus === "completed") return 100;
    if (userData.applicationStatus === "active") return 75;
    if (userData.applicationStatus === "approved") return 50;
    if (userData.applicationStatus === "pending") return 25;
    return profileComplete ? 15 : 0;
  };

  const getTotalTeams = () => userData?.assignedTeams?.length || 0;
  const getPendingReports = () => {
    return userData?.weeklyReports?.filter(report => report.status === "pending").length || 0;
  };
  const getApplicationsSubmitted = () => userData?.appliedInternships?.length || 0;

  const getNextMilestone = () => {
    if (!profileComplete) return "Complete your profile";
    if (userData?.applicationStatus === "none") return "Apply for internship";
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
              Welcome back, {userData?.fullName || username}! 👋
            </h1>
            <p className="text-cyan-100 mb-4">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">Status: {userData?.verificationStatus || 'Pending'}</span>
              </div>
              <div className="flex items-center">
                <BarChart className="h-4 w-4 mr-2" />
                <span className="text-sm">Progress: {getApplicationProgress()}%</span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
              <h3 className="font-semibold mb-1">Next Step</h3>
              <p className="text-sm text-cyan-100">{getNextMilestone()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {!profileComplete && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-amber-800">
                Complete Your Profile to Get Started
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  Please complete your profile to unlock all features and start your internship journey.
                  Missing information may delay your application process.
                </p>
                <button
                  onClick={() => onNavigate("profile-settings")}
                  className="mt-2 inline-flex items-center px-3 py-1 bg-amber-200 text-amber-800 rounded-md text-sm font-medium hover:bg-amber-300 transition-colors"
                >
                  Complete Profile
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Applications Submitted</p>
              <h3 className="text-2xl font-bold text-gray-900">{getApplicationsSubmitted()}</h3>
            </div>
            <div className="bg-cyan-100 p-2 rounded-full">
              <FileText className="h-6 w-6 text-cyan-600" />
            </div>
          </div>
          <div className="mt-2">
            <button
              onClick={() => onNavigate("my-applications")}
              className="text-xs text-cyan-600 hover:text-cyan-800 font-medium"
            >
              View Applications →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Teams Joined</p>
              <h3 className="text-2xl font-bold text-gray-900">{getTotalTeams()}</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <button
              onClick={() => onNavigate("my-teams")}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              View Teams →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reports Due</p>
              <h3 className="text-2xl font-bold text-gray-900">{getPendingReports()}</h3>
            </div>
            <div className="bg-amber-100 p-2 rounded-full">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-2">
            <button
              onClick={() => onNavigate("weekly-reports")}
              className="text-xs text-amber-600 hover:text-amber-800 font-medium"
            >
              Submit Reports →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <h3 className="text-2xl font-bold text-gray-900">{getApplicationProgress()}%</h3>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${getApplicationProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
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
              completed: userData?.applicationStatus !== "none",
              current: profileComplete && userData?.applicationStatus === "none"
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
                stage.current ? "text-cyan-600" : stage.completed ? "text-green-600" : "text-gray-400"
              }`}>
                {stage.title}
              </h3>
              <p className="text-xs text-gray-500">{stage.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Profile & Academic Info */}
        <div className="space-y-6">
            {/* Academic Information */}
<div className="bg-white rounded-lg shadow p-4">
  <h2 className="text-base font-semibold mb-3 flex items-center">
    <GraduationCap className="h-4 w-4 mr-2 text-cyan-600" />
    Academic Information
  </h2>
  {userData && profileComplete ? (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-gray-700 font-medium">Name</p>
        <p className="font-medium text-sm text-gray-900">{userData.fullName || "Not provided"}</p>
      </div>
      <div>
        <p className="text-xs text-gray-700 font-medium">University</p>
        <p className="font-medium text-sm text-gray-900">{userData.university || "Not provided"}</p>
      </div>
      <div>
        <p className="text-xs text-gray-700 font-medium">Degree</p>
        <p className="font-medium text-sm text-gray-900">
          {userData.degree} in {userData.major || "Not specified"}
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-700 font-medium">Expected Graduation</p>
        <p className="font-medium text-sm text-gray-900">{userData.graduationYear || "Not provided"}</p>
      </div>
      {userData.gpa && (
        <div>
          <p className="text-xs text-gray-700 font-medium">CGPA</p>
          <p className="font-medium text-sm text-gray-900">{userData.gpa}</p>
        </div>
      )}
    </div>
  ) : (
    <div className="text-center py-4">
      <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-gray-600">Complete your profile to see information here</p>
      <button
        onClick={() => onNavigate("profile-settings")}
        className="mt-2 text-cyan-600 hover:text-cyan-800 text-sm font-medium"
      >
        Complete Profile →
      </button>
    </div>
  )}
</div>

          {/* Skills & Technologies */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-base font-semibold mb-3 flex items-center">
              <Award className="h-4 w-4 mr-2 text-cyan-600" />
              Skills & Technologies
            </h2>
            {userData?.skills ? (
              <div className="flex flex-wrap gap-2">
                {userData.skills
                  .split(",")
                  .map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="bg-cyan-50 text-cyan-700 px-2 py-1 rounded-md text-xs font-medium"
                    >
                      {skill.trim()}
                    </span>
                  ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Award className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No skills added yet</p>
                <button
                  onClick={() => onNavigate("profile-settings")}
                  className="mt-2 text-cyan-600 hover:text-cyan-800 text-sm font-medium"
                >
                  Add Skills →
                </button>
              </div>
            )}
          </div>

          {/* Document Status */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-base font-semibold mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-cyan-600" />
              Document Status
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm">Resume/CV</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    userData?.resumeFile
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {userData?.resumeFile ? "Uploaded" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm">ID Document</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    userData?.idDocumentFile
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {userData?.idDocumentFile ? "Uploaded" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Transcript</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    userData?.transcriptFile
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {userData?.transcriptFile ? "Uploaded" : "Optional"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Goals & Activities */}
        <div className="space-y-6">
          {/* Internship Goals */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-base font-semibold mb-3 flex items-center">
              <Target className="h-4 w-4 mr-2 text-cyan-600" />
              Internship Goals
            </h2>
            {userData?.internshipGoals ? (
              <p className="text-sm text-gray-700 line-clamp-4">{userData.internshipGoals}</p>
            ) : (
              <div className="text-center py-4">
                <Target className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Add your internship goals in your profile</p>
                <button
                  onClick={() => onNavigate("profile-settings")}
                  className="mt-2 text-cyan-600 hover:text-cyan-800 text-sm font-medium"
                >
                  Add Goals →
                </button>
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-base font-semibold mb-3 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-cyan-600" />
              Recent Activities
            </h2>
            <div className="space-y-3">
              {profileComplete ? (
                <>
                  <div className="border-l-4 border-cyan-500 pl-3 py-2">
                    <p className="font-medium text-sm">Profile Completed</p>
                    <p className="text-xs text-gray-500">Ready for review</p>
                  </div>
                  {userData?.applicationStatus !== "none" && (
                    <div className="border-l-4 border-blue-500 pl-3 py-2">
                      <p className="font-medium text-sm">Application Submitted</p>
                      <p className="text-xs text-gray-500">Under review</p>
                    </div>
                  )}
                  <div className="border-l-4 border-gray-300 pl-3 py-2">
                    <p className="font-medium text-sm">Account Created</p>
                    <p className="text-xs text-gray-500">Welcome to InternHub!</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Complete your profile to start your journey</p>
                  <button
                    onClick={() => onNavigate("profile-settings")}
                    className="mt-2 text-cyan-600 hover:text-cyan-800 text-sm font-medium"
                  >
                    Get Started →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-base font-semibold mb-3 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2 text-cyan-600" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate("find-internships")}
                className="p-3 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors text-center"
              >
                <Search className="h-5 w-5 mx-auto mb-1 text-cyan-600" />
                <span className="text-xs font-medium">Find Internships</span>
              </button>
              <button
                onClick={() => onNavigate("internship-request")}
                className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
              >
                <Plus className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <span className="text-xs font-medium">Apply Now</span>
              </button>
              <button
                onClick={() => onNavigate("my-teams")}
                className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center"
              >
                <Users className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <span className="text-xs font-medium">My Teams</span>
              </button>
              <button
                onClick={() => onNavigate("weekly-reports")}
                className="p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors text-center"
              >
                <FileText className="h-5 w-5 mx-auto mb-1 text-amber-600" />
                <span className="text-xs font-medium">Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Notifications & Calendar */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-base font-semibold mb-3 flex items-center">
              <Bell className="h-4 w-4 mr-2 text-cyan-600" />
              Notifications
            </h2>
            <div className="space-y-3">
              {userData?.notifications && userData.notifications.length > 0 ? (
                userData.notifications.slice(0, 3).map((notification: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No new notifications</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-base font-semibold mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-cyan-600" />
              Upcoming Tasks
            </h2>
            <div className="space-y-3">
              {!profileComplete && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-800">Complete Profile</p>
                      <p className="text-xs text-amber-600">High Priority</p>
                    </div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  </div>
                </div>
              )}
              {getPendingReports() > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-800">Weekly Report Due</p>
                      <p className="text-xs text-red-600">{getPendingReports()} pending</p>
                    </div>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                </div>
              )}
              {userData?.applicationStatus === "none" && profileComplete && (
                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cyan-800">Apply for Internship</p>
                      <p className="text-xs text-cyan-600">Start your journey</p>
                    </div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  </div>
                </div>
              )}
              {userData?.applicationStatus === "none" && profileComplete && getApplicationsSubmitted() === 0 && (
                <div className="text-center py-4">
                  <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No upcoming tasks</p>
                </div>
              )}
            </div>
          </div>

          {/* Learning Resources */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-base font-semibold mb-3 flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-cyan-600" />
              Learning Resources
            </h2>
            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Play className="h-4 w-4 text-cyan-600 mr-2" />
                <span className="text-sm">Getting Started Guide</span>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
              </a>
              <a
                href="#"
                className="flex items-center p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm">Internship Best Practices</span>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
              </a>
              <a
                href="#"
                className="flex items-center p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Presentation className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm">Demo Preparation Tips</span>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Guide - Only show if profile is incomplete */}
      {!profileComplete && (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg shadow p-6 border border-cyan-200">
          <h2 className="text-lg font-semibold mb-4 text-cyan-900">
            🚀 Getting Started with Your Internship Journey
          </h2>
          <p className="text-sm text-cyan-800 mb-6">
            Follow these steps to complete your setup and start your internship application process.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-3 shadow-lg ${
                profileComplete ? "bg-green-500 text-white" : "bg-white text-cyan-600 border-2 border-cyan-300"
              }`}>
                {profileComplete ? (
                  <CheckCircle className="h-8 w-8" />
                ) : (
                  <span className="text-xl font-bold">1</span>
                )}
              </div>
              <h3 className="font-semibold text-sm mb-2 text-gray-800">Complete Profile</h3>
              <p className="text-xs text-gray-600 mb-3">
                Add all required information including documents
              </p>
              {!profileComplete && (
                <button
                  onClick={() => onNavigate("profile-settings")}
                  className="text-xs bg-cyan-500 text-white px-3 py-1 rounded-full hover:bg-cyan-600 transition-colors"
                >
                  Start Now
                </button>
              )}
            </div>

            <div className="text-center">
              <div className={`rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-3 shadow-lg ${
                userData?.applicationStatus !== "none" ? "bg-green-500 text-white" : 
                profileComplete ? "bg-white text-blue-600 border-2 border-blue-300" : "bg-gray-200 text-gray-400"
              }`}>
                {userData?.applicationStatus !== "none" ? (
                  <CheckCircle className="h-8 w-8" />
                ) : (
                  <span className="text-xl font-bold">2</span>
                )}
              </div>
              <h3 className={`font-semibold text-sm mb-2 ${
                profileComplete && userData?.applicationStatus === "none" ? "text-gray-800" : "text-gray-400"
              }`}>
                Submit Application
              </h3>
              <p className={`text-xs mb-3 ${
                profileComplete && userData?.applicationStatus === "none" ? "text-gray-600" : "text-gray-400"
              }`}>
                Apply for internship positions
              </p>
              {profileComplete && userData?.applicationStatus === "none" && (
                <button
                  onClick={() => onNavigate("internship-request")}
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors"
                >
                  Apply Now
                </button>
              )}
            </div>

            <div className="text-center">
              <div className={`rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-3 shadow-lg ${
                userData?.applicationStatus === "approved" || userData?.applicationStatus === "active" ? "bg-green-500 text-white" :
                userData?.applicationStatus === "pending" ? "bg-amber-400 text-white animate-pulse" : "bg-gray-200 text-gray-400"
              }`}>
                {userData?.applicationStatus === "approved" || userData?.applicationStatus === "active" ? (
                  <CheckCircle className="h-8 w-8" />
                ) : userData?.applicationStatus === "pending" ? (
                  <Clock className="h-8 w-8" />
                ) : (
                  <span className="text-xl font-bold">3</span>
                )}
              </div>
              <h3 className={`font-semibold text-sm mb-2 ${
                userData?.applicationStatus === "pending" ? "text-gray-800" : "text-gray-400"
              }`}>
                Get Approved
              </h3>
              <p className={`text-xs mb-3 ${
                userData?.applicationStatus === "pending" ? "text-gray-600" : "text-gray-400"
              }`}>
                Wait for admin approval
              </p>
              {userData?.applicationStatus === "pending" && (
                <div className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                  In Review
                </div>
              )}
            </div>

            <div className="text-center">
              <div className={`rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-3 shadow-lg ${
                userData?.applicationStatus === "active" ? "bg-green-500 text-white" :
                getTotalTeams() > 0 ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-400"
              }`}>
                {userData?.applicationStatus === "active" ? (
                  <CheckCircle className="h-8 w-8" />
                ) : (
                  <span className="text-xl font-bold">4</span>
                )}
              </div>
              <h3 className={`font-semibold text-sm mb-2 ${
                userData?.applicationStatus === "active" ? "text-gray-800" : "text-gray-400"
              }`}>
                Start Internship
              </h3>
              <p className={`text-xs mb-3 ${
                userData?.applicationStatus === "active" ? "text-gray-600" : "text-gray-400"
              }`}>
                Begin your learning journey
              </p>
              {userData?.applicationStatus === "active" && (
                <div className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  Active
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Progress</span>
              <span>{getApplicationProgress()}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${getApplicationProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message for Active Interns */}
      {userData?.applicationStatus === "active" && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow p-6 border border-green-200">
          <div className="flex items-center mb-4">
            <div className="bg-green-500 rounded-full p-2 mr-4">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-900">
                🎉 Congratulations! Your Internship is Active
              </h2>
              <p className="text-sm text-green-700">
                You've successfully completed the application process and are now part of a project team.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-sm mb-2 text-gray-800">Your Next Steps</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Check your team assignments</li>
                <li>• Submit weekly progress reports</li>
                <li>• Participate in team meetings</li>
                <li>• Prepare for demo presentations</li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-sm mb-2 text-gray-800">Quick Access</h3>
              <div className="space-y-2">
                <button
                  onClick={() => onNavigate("my-teams")}
                  className="w-full text-left text-xs bg-green-50 hover:bg-green-100 p-2 rounded transition-colors"
                >
                  View My Teams →
                </button>
                <button
                  onClick={() => onNavigate("weekly-reports")}
                  className="w-full text-left text-xs bg-green-50 hover:bg-green-100 p-2 rounded transition-colors"
                >
                  Submit Report →
                </button>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-sm mb-2 text-gray-800">Support</h3>
              <p className="text-xs text-gray-600 mb-2">
                Need help? Contact your mentor or use our resources.
              </p>
              <button
                onClick={() => onNavigate("team-chat")}
                className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
              >
                Contact Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips and Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          💡 Tips for Success
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-sm mb-2 text-blue-900">Stay Organized</h3>
            <p className="text-xs text-blue-700">
              Keep track of deadlines, submit reports on time, and maintain clear communication with your team.
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-sm mb-2 text-purple-900">Learn Actively</h3>
            <p className="text-xs text-purple-700">
              Ask questions, seek feedback, and take initiative in your learning process.
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-sm mb-2 text-green-900">Network & Collaborate</h3>
            <p className="text-xs text-green-700">
              Build relationships with your team members, mentors, and other interns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}