"use client";

import {
  BarChart,
  Calendar,
  User,
  Users,
  Shield,
  AlertCircle,
} from "lucide-react";

interface AdminDashboardScreenProps {
  profileSubmissionCount: number;
  onNavigateToProfile?: () => void; // Add this callback prop
}

export default function AdminDashboardScreen({
  profileSubmissionCount = 0,
  onNavigateToProfile,
}: AdminDashboardScreenProps) {
  return (
    <>
      {/* Profile Completion Warning */}
      {profileSubmissionCount === 0 && (
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md shadow-sm">
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
                    // Use the callback if provided
                    if (onNavigateToProfile) {
                      onNavigateToProfile();
                    }
                  }}
                  className="flex items-center text-sm font-medium bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-md transition-colors"
                >
                  Complete your profile now
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
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
              <p className="font-medium text-sm">Program schedule updated</p>
              <p className="text-xs text-gray-500">Summer 2023 Internship</p>
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
    </>
  );
}
