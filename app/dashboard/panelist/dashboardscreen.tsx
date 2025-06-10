"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Clock,
  Calendar,
  Users,
  BarChart,
  Star,
} from "lucide-react";

interface DashboardScreenProps {
  organization?: string;
}

export default function DashboardScreen({
  organization = "none",
}: DashboardScreenProps) {
  const router = useRouter();
  const [profileSubmissionCount, setProfileSubmissionCount] =
    useState<number>(0);
  const [verificationStatus, setVerificationStatus] =
    useState<string>("pending");

  // Fetch profile submission count from the database
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Get username from localStorage
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        const { username } = JSON.parse(storedUser);

        // Fetch user data to get profile submission count
        const response = await fetch(`/api/users/${username}`);
        const data = await response.json();

        if (response.ok && data.user) {
          setProfileSubmissionCount(data.user.profileSubmissionCount || 0);
          setVerificationStatus(data.user.verificationStatus || "pending");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <>
      {/* Organization verification message - different based on submission count */}
      {organization === "none" && (
        <div className="mb-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                {profileSubmissionCount === 0
                  ? "Profile Verification Required"
                  : "Profile Verification In Progress"}
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  {profileSubmissionCount === 0 ? (
                    <>
                      Please submit your profile details by visiting the{" "}
                      <button
                        onClick={() =>
                          router.push("/dashboard/panelist/profile")
                        }
                        className="font-medium underline"
                      >
                        My Profile
                      </button>{" "}
                      section. After verification from the admin, you will be
                      able to onboard to an organization and access all panelist
                      features. Your profile information will help us match you
                      with appropriate candidates for evaluation.
                    </>
                  ) : (
                    <>
                      Your profile has been submitted for verification. Please
                      wait while an administrator reviews your information. Once
                      approved, you will gain access to all panelist features.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <Users className="h-4 w-4 text-green-600" />
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
          <h2 className="text-base font-semibold mb-3">Upcoming Interviews</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <p className="font-medium text-sm">Michael Chang</p>
                <p className="text-xs text-gray-500">Full Stack Developer</p>
                <div className="flex items-center mt-1">
                  <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">Today, 11:00 AM</span>
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
                  <span className="text-xs text-gray-500">Today, 2:15 PM</span>
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
          <h2 className="text-base font-semibold mb-3">Recent Evaluations</h2>
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
    </>
  );
}
