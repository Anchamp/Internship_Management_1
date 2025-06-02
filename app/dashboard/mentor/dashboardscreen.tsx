"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, Clock, Calendar, Users } from "lucide-react";

interface DashboardScreenProps {
  organization: string;
}

export default function DashboardScreen({
  organization,
}: DashboardScreenProps) {
  const router = useRouter();

  return (
    <>
      {/* Organization verification message */}
      {organization === "none" && (
        <div className="mb-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Profile Verification Required
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  Please submit your profile details by visiting the{" "}
                  <button
                    onClick={() => router.push("/dashboard/mentor/profile")}
                    className="font-medium underline"
                  >
                    My Profile
                  </button>{" "}
                  section. After verification from the admin, you will be able
                  to onboard to an organization and access all mentorship
                  features. Your profile information will help us match you with
                  appropriate internship opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content - with reduced sizes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
        <div className="bg-white rounded-md shadow p-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs">Active Interns</p>
              <h3 className="text-lg font-bold">8</h3>
            </div>
            <span className="bg-cyan-100 p-1.5 rounded-md">
              <Users className="h-4 w-4 text-cyan-600" />
            </span>
          </div>
        </div>

        <div className="bg-white rounded-md shadow p-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs">Pending Reviews</p>
              <h3 className="text-lg font-bold">3</h3>
            </div>
            <span className="bg-amber-100 p-1.5 rounded-md">
              <Clock className="h-4 w-4 text-amber-600" />
            </span>
          </div>
        </div>

        <div className="bg-white rounded-md shadow p-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs">Upcoming Meetings</p>
              <h3 className="text-lg font-bold">4</h3>
            </div>
            <span className="bg-indigo-100 p-1.5 rounded-md">
              <Calendar className="h-4 w-4 text-indigo-600" />
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-md shadow p-4">
          <h2 className="text-base font-semibold mb-3">Intern Progress</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">Alex Johnson</p>
                <p className="text-xs text-gray-500">Web Development</p>
              </div>
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-cyan-600 h-2 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
              <span className="text-xs font-medium">75%</span>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">Sarah Miller</p>
                <p className="text-xs text-gray-500">UX Design</p>
              </div>
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-cyan-600 h-2 rounded-full"
                  style={{ width: "90%" }}
                ></div>
              </div>
              <span className="text-xs font-medium">90%</span>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">Carlos Rodriguez</p>
                <p className="text-xs text-gray-500">Mobile Development</p>
              </div>
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-cyan-600 h-2 rounded-full"
                  style={{ width: "60%" }}
                ></div>
              </div>
              <span className="text-xs font-medium">60%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md shadow p-4">
          <h2 className="text-base font-semibold mb-3">Recent Activities</h2>
          <div className="space-y-3">
            <div className="border-l-4 border-cyan-500 pl-3 py-0.5">
              <p className="font-medium text-sm">
                Reviewed project submissions
              </p>
              <p className="text-xs text-gray-500">Today, 10:30 AM</p>
            </div>
            <div className="border-l-4 border-gray-300 pl-3 py-0.5">
              <p className="font-medium text-sm">Scheduled team meeting</p>
              <p className="text-xs text-gray-500">Yesterday, 03:15 PM</p>
            </div>
            <div className="border-l-4 border-gray-300 pl-3 py-0.5">
              <p className="font-medium text-sm">Updated intern evaluation</p>
              <p className="text-xs text-gray-500">Aug 16, 2023</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
