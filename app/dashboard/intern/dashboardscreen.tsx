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
} from "lucide-react";



// CHANGE TO:
interface DashboardScreenProps {
  profileComplete: boolean;
  username: string;
  onNavigate: (tab: string) => void;
}

export default function InternDashboardScreen({
  profileComplete,
  username,
  onNavigate,
}: DashboardScreenProps) {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  }, [username]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Profile Completion Alert */}
      {!profileComplete && (
        <div className="mb-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Complete Your Profile
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  Please complete your profile to start your internship journey.
                  You need to:
                </p>
                <ul className="list-disc list-inside mt-2">
                  <li>Fill in all personal and academic information</li>
                  <li>Upload your resume/CV</li>
                  <li>Upload your ID document</li>
                  <li>Add your skills and internship goals</li>
                </ul>
                <button
                    onClick={() => onNavigate("profile")}
                    className="mt-3 text-amber-800 font-medium underline hover:text-amber-900"
                >
                  Complete Profile Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        <div className="bg-white rounded-md shadow p-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs">Profile Status</p>
              <h3 className="text-lg font-bold">
                {profileComplete ? "Complete" : "Incomplete"}
              </h3>
            </div>
            <span
              className={`p-1.5 rounded-md ${
                profileComplete ? "bg-green-100" : "bg-amber-100"
              }`}
            >
              {profileComplete ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              )}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-md shadow p-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs">Application Status</p>
              <h3 className="text-lg font-bold">Pending</h3>
            </div>
            <span className="bg-amber-100 p-1.5 rounded-md">
              <Clock className="h-4 w-4 text-amber-600" />
            </span>
          </div>
        </div>

        <div className="bg-white rounded-md shadow p-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs">Project Status</p>
              <h3 className="text-lg font-bold">Not Started</h3>
            </div>
            <span className="bg-gray-100 p-1.5 rounded-md">
              <Briefcase className="h-4 w-4 text-gray-600" />
            </span>
          </div>
        </div>

        <div className="bg-white rounded-md shadow p-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs">Reports Submitted</p>
              <h3 className="text-lg font-bold">0</h3>
            </div>
            <span className="bg-cyan-100 p-1.5 rounded-md">
              <FileText className="h-4 w-4 text-cyan-600" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Profile Summary */}
        <div className="bg-white rounded-md shadow p-4">
          <h2 className="text-base font-semibold mb-3 flex items-center">
            <User className="h-4 w-4 mr-2 text-cyan-600" />
            Profile Summary
          </h2>
          {userData ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium text-sm">
                  {userData.fullName || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">University</p>
                <p className="font-medium text-sm">
                  {userData.university || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Degree</p>
                <p className="font-medium text-sm">
                  {userData.degree} in {userData.major || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expected Graduation</p>
                <p className="font-medium text-sm">
                  {userData.graduationYear || "Not provided"}
                </p>
              </div>
              {userData.gpa && (
                <div>
                  <p className="text-xs text-gray-500">CGPA</p>
                  <p className="font-medium text-sm">{userData.gpa}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Complete your profile to see information here
            </p>
          )}
        </div>

        {/* Skills & Technologies */}
        <div className="bg-white rounded-md shadow p-4">
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
            <p className="text-sm text-gray-500">No skills added yet</p>
          )}
        </div>

        {/* Internship Goals */}
        <div className="bg-white rounded-md shadow p-4">
          <h2 className="text-base font-semibold mb-3 flex items-center">
            <Target className="h-4 w-4 mr-2 text-cyan-600" />
            Internship Goals
          </h2>
          {userData?.internshipGoals ? (
            <p className="text-sm text-gray-700 line-clamp-4">
              {userData.internshipGoals}
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Add your internship goals in your profile
            </p>
          )}
        </div>
      </div>

      {/* Activities and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-4">
        {/* Recent Activities */}
        <div className="bg-white rounded-md shadow p-4">
          <h2 className="text-base font-semibold mb-3 flex items-center">
            <Activity className="h-4 w-4 mr-2 text-cyan-600" />
            Recent Activities
          </h2>
          <div className="space-y-3">
            {profileComplete ? (
              <>
                <div className="border-l-4 border-cyan-500 pl-3 py-0.5">
                  <p className="font-medium text-sm">Profile Completed</p>
                  <p className="text-xs text-gray-500">Ready for review</p>
                </div>
                <div className="border-l-4 border-gray-300 pl-3 py-0.5">
                  <p className="font-medium text-sm">Account Created</p>
                  <p className="text-xs text-gray-500">Welcome to InternshipHub!</p>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Complete your profile to start your journey
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Documents Status */}
        <div className="bg-white rounded-md shadow p-4">
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

      {/* Getting Started Guide */}
      {!profileComplete && (
        <div className="mt-4 bg-cyan-50 rounded-md shadow p-6 border border-cyan-200">
          <h2 className="text-lg font-semibold mb-4 text-cyan-900">
            Getting Started with Your Internship
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-white rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-2 shadow-md">
                <span className="text-cyan-600 font-bold">1</span>
              </div>
              <h3 className="font-medium text-sm mb-1">Complete Profile</h3>
              <p className="text-xs text-gray-600">
                Add all required information
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-2 shadow-md">
                <span className="text-gray-400 font-bold">2</span>
              </div>
              <h3 className="font-medium text-sm mb-1 text-gray-400">
                Submit Request
              </h3>
              <p className="text-xs text-gray-400">
                Apply for internship position
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-2 shadow-md">
                <span className="text-gray-400 font-bold">3</span>
              </div>
              <h3 className="font-medium text-sm mb-1 text-gray-400">
                Get Matched
              </h3>
              <p className="text-xs text-gray-400">
                Be assigned to a project
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-2 shadow-md">
                <span className="text-gray-400 font-bold">4</span>
              </div>
              <h3 className="font-medium text-sm mb-1 text-gray-400">
                Start Learning
              </h3>
              <p className="text-xs text-gray-400"></p>
                 <p className="text-xs text-gray-400">
                Begin your internship journey
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}