"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  User,
  Building,
  Calendar,
  MapPin,
  FileText,
  Briefcase,
  Globe,
  Clock,
  Users,
  AlertCircle,
  Loader2,
  Filter,
  X,
  RefreshCw,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Type definitions for users
interface UserData {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  organizationName: string;
  organizationId: string;
  position: string;
  address: string;
  experience: string;
  skills: string;
  bio: string;
  website: string;
  profileImage: string;
  dob: string;
  teams: string[];
  role: string;
  verificationStatus: string;
  profileSubmissionCount: number;
  createdAt?: string;
}

export default function UsersScreen() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isRetrying, setIsRetrying] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveOrganizationModalOpen, setLeaveOrganizationModalOpen] =
    useState(false);
  const [noOrganization, setNoOrganization] = useState(false);

  // State for fetching real data
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationId, setOrganizationId] = useState("");

  // Extract fetching logic into a reusable function
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError("");
      setNoOrganization(false);

      // Get employee username from localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setError("User session not found");
        return;
      }

      const userData = JSON.parse(storedUser);
      const { username } = userData;

      // First, get the latest user data from the database
      const userResponse = await fetch(`/api/users/${username}`);

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.error || "Failed to fetch user data");
      }

      const userData2 = await userResponse.json();
      const user = userData2.user;

      // Update local storage with fresh data from database
      if (user) {
        const updatedUserData = {
          ...userData,
          organizationName: user.organizationName,
          organizationId: user.organizationId,
        };
        localStorage.setItem("user", JSON.stringify(updatedUserData));

        // Set organization data from fresh database data
        setOrganizationName(user.organizationName || "none");
        if (user.organizationId) {
          setOrganizationId(user.organizationId);
        }

        // Check if user has no organization assigned based on DATABASE data
        if (
          (user.organizationName === "none" || !user.organizationName) &&
          (user.organizationId === "none" || !user.organizationId)
        ) {
          setNoOrganization(true);
          setIsLoading(false);
          return;
        }
      } else {
        throw new Error("User not found in database");
      }

      // Now fetch the organization users based on organization name
      const apiUrl = `/api/employee/organization-users?username=${username}&organizationName=${encodeURIComponent(
        user.organizationName || ""
      )}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok) {
        // Special handling for "not assigned to any organization" error
        if (data.error?.includes("not assigned to any organization")) {
          setNoOrganization(true);
          return;
        }
        throw new Error(data.error || "Failed to fetch organization users");
      }

      // Set the users from the response
      setUsers(data.users || []);

      // Update organization name if available
      if (data.organizationName) {
        setOrganizationName(data.organizationName);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.message || "An error occurred while fetching users data");
      toast.error("Failed to load users", {
        description: "Please try refreshing the page",
      });
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users whenever selected role changes
  useEffect(() => {
    if (selectedRole === "all") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter((user) => user.role === selectedRole));
    }
  }, [selectedRole, users]);

  const openModal = (user: UserData) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  // Generate profile letter avatar
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  // Get role background color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "employee":
        return "bg-cyan-100 text-cyan-700";
      case "intern":
        return "bg-emerald-100 text-emerald-700";
      case "admin":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Format date string
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Generate role counts
  const getRoleCounts = () => {
    const counts = {
      all: users.length,
      employee: users.filter((user) => user.role === "employee").length,
      intern: users.filter((user) => user.role === "intern").length,
      admin: users.filter((user) => user.role === "admin").length,
    };
    return counts;
  };

  const roleCounts = getRoleCounts();

  // Retry loading the users data
  const handleRetry = async () => {
    setIsRetrying(true);
    await fetchUsers();
  };

  // Function to handle leaving organization
  const handleLeaveOrganization = async () => {
    try {
      setIsLeaving(true);

      // Get employee username from localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("User session not found");
      }

      const userData = JSON.parse(storedUser);
      const { _id, id, username, fullName } = userData;
      const userId = _id || id; // Try both common ID field names
      const employeeFullName = fullName || username; // Use fullName if available, otherwise username

      // Store current organization details before leaving
      const currentOrgId = organizationId;
      const currentOrgName = organizationName;

      // Call our dedicated API for employees leaving organizations
      const response = await fetch("/api/employee/leave-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId, // Send ID if available
          username, // Always send username as fallback
          organizationName: currentOrgName, // Add organization name for verification
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to leave organization");
      }

      // After successfully leaving, create notification for the admin
      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "departure_notification",
            role: "employee",
            requestorId: userId,
            requestorName: employeeFullName,
            organizationId: currentOrgId,
            organizationName: currentOrgName,
            message: `${employeeFullName} has left the organization ${currentOrgName}`,
            read: false,
            forOrganizationAdmins: true, // Send to all admins of the organization
          }),
        });
      } catch (notifError) {
        // Only log notification error but don't stop the process
        console.error("Failed to send notification:", notifError);
      }

      toast.success("You have left the organization", {
        description: "You can now apply to join a different organization",
      });

      // Update local storage to reflect changes
      const user = JSON.parse(storedUser);
      user.organizationName = "none";
      user.organizationId = "none";
      localStorage.setItem("user", JSON.stringify(user));

      // Use window.location for a full page refresh instead of router.push
      setTimeout(() => {
        window.location.href = "/dashboard/employee";
      }, 1000); // Short delay to ensure toast notification is visible
    } catch (error: any) {
      console.error("Error leaving organization:", error);
      toast.error("Failed to leave organization", {
        description: error.message || "An error occurred",
      });
    } finally {
      setIsLeaving(false);
      closeLeaveOrganizationModal();
    }
  };

  const openLeaveOrganizationModal = () => {
    setLeaveOrganizationModalOpen(true);
  };

  const closeLeaveOrganizationModal = () => {
    setLeaveOrganizationModalOpen(false);
  };

  // Leave Organization Confirmation Modal
  const LeaveOrganizationModal = () => {
    if (!leaveOrganizationModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Leave Organization
          </h3>
          <p className="text-gray-700 mb-6">
            Are you sure you want to leave{" "}
            <span className="font-bold text-black">{organizationName}</span>?
            This action will remove you from all teams and projects. You will
            need to apply to a new organization afterwards.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={closeLeaveOrganizationModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleLeaveOrganization}
              disabled={isLeaving}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2 disabled:bg-red-400"
            >
              {isLeaving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>Leave Organization</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // User Card Component with updated styling
  const UserCard = ({ user }: { user: UserData }) => (
    <div
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => openModal(user)}
    >
      <div className="flex items-center mb-2 sm:mb-0 w-full sm:w-auto">
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-white font-semibold shadow-lg mr-4 flex-shrink-0">
          {user.profileImage ? (
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src={user.profileImage}
                alt={user.fullName || user.username}
                width={48}
                height={48}
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : (
            getInitial(user.fullName || user.username)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 truncate flex items-center">
            {user.fullName || user.username}
            <span
              className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getRoleColor(
                user.role
              )}`}
            >
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center text-xs text-gray-600 mt-1 space-y-1 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <Mail className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span>Joined: {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 sm:mt-0 flex items-center">
        {user.position && (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md mr-2">
            {user.position}
          </span>
        )}
      </div>
    </div>
  );

  // User Modal Component with improved styling
  const UserModal = () => {
    if (!selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <h3 className="text-xl font-bold text-gray-900">
              User Profile Details
            </h3>
            <button
              onClick={closeModal}
              className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-red-500 hover:text-red-700" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center mb-8 sm:space-x-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4 sm:mb-0 shadow-xl">
                {selectedUser.profileImage ? (
                  <Image
                    src={selectedUser.profileImage}
                    alt={selectedUser.fullName || selectedUser.username}
                    width={96}
                    height={96}
                    className="rounded-full object-cover"
                  />
                ) : (
                  getInitial(selectedUser.fullName || selectedUser.username)
                )}
              </div>

              <div className="text-center sm:text-left">
                <div className="flex items-center">
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedUser.fullName || "No name provided"}
                  </h4>
                  <span
                    className={`ml-3 text-xs px-2.5 py-1 rounded-full ${getRoleColor(
                      selectedUser.role
                    )}`}
                  >
                    {selectedUser.role.charAt(0).toUpperCase() +
                      selectedUser.role.slice(1)}
                  </span>
                </div>
                <p className="text-indigo-600">@{selectedUser.username}</p>
                <p className="text-gray-700 mt-2">
                  {selectedUser.position || "Position not specified"}
                </p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="mb-8">
              <h5 className="text-base font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                Personal Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                </div>

                {selectedUser.phone && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-gray-900">{selectedUser.phone}</p>
                    </div>
                  </div>
                )}

                {selectedUser.dob && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Date of Birth
                      </p>
                      <p className="text-gray-900">{selectedUser.dob}</p>
                    </div>
                  </div>
                )}

                {selectedUser.address && (
                  <div className="flex items-start col-span-1 md:col-span-2">
                    <MapPin className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Address
                      </p>
                      <p className="text-gray-900">{selectedUser.address}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Member Since
                    </p>
                    <p className="text-gray-900">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="mb-8">
              <h5 className="text-base font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                Professional Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex items-start">
                  <Building className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Organization
                    </p>
                    <p className="text-gray-900">
                      {selectedUser.organizationName === "none"
                        ? "Pending Assignment"
                        : selectedUser.organizationName}
                    </p>
                  </div>
                </div>

                {selectedUser.position && (
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Position
                      </p>
                      <p className="text-gray-900">{selectedUser.position}</p>
                    </div>
                  </div>
                )}

                {selectedUser.experience && (
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Experience
                      </p>
                      <p className="text-gray-900">{selectedUser.experience}</p>
                    </div>
                  </div>
                )}

                {selectedUser.website && (
                  <div className="flex items-start">
                    <Globe className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Website
                      </p>
                      <p className="text-gray-900">
                        <a
                          href={selectedUser.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          {selectedUser.website}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Skills & Teams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {selectedUser.skills && (
                <div>
                  <h5 className="text-base font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                    Skills & Expertise
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.skills
                      .split(",")
                      .map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-full font-medium"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {selectedUser.teams && selectedUser.teams.length > 0 && (
                <div>
                  <h5 className="text-base font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                    Teams
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.teams.map((team: string, index: number) => (
                      <span
                        key={index}
                        className="bg-indigo-50 text-indigo-700 px-3 py-1.5 text-sm rounded-full font-medium"
                      >
                        {team}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bio */}
            {selectedUser.bio && (
              <div className="mb-6">
                <h5 className="text-base font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                  Bio / Professional Summary
                </h5>
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {selectedUser.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render "Join Organization" UI
  const renderJoinOrganizationUI = () => {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="bg-cyan-50 rounded-full p-4 mb-4">
          <Building className="h-12 w-12 text-cyan-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          You're not part of any organization yet
        </h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Join an organization to collaborate with other employees and interns.
          You'll need to apply to an available organization.
        </p>
        <button
          onClick={() => router.push("/dashboard/employee")}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-md shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Building className="h-5 w-5" />
          <span>Apply to Organization</span>
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        <span className="ml-2 text-lg font-medium text-gray-700">
          Loading users...
        </span>
      </div>
    );
  }

  // Show "Join Organization" UI if not part of any organization
  if (noOrganization) {
    return renderJoinOrganizationUI();
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">
          Error Loading Users
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto disabled:bg-red-400"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Retrying...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        {/* Organization info box with integrated role filter */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-100 p-6 rounded-lg border border-cyan-200 shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Building className="h-6 w-6 text-cyan-700 mr-3" />
                {organizationName} Team Members
              </h3>
              <p className="text-gray-600 mt-1">
                View details of all members in your organization
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
              {/* Enhanced dropdown with arrow indicator */}
              <div className="relative inline-block w-full md:w-auto">
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg shadow-sm border border-black hover:border-gray-600 transition-all duration-200">
                  <Filter className="h-4 w-4 text-black" />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="bg-transparent border-none text-black text-sm font-medium focus:outline-none appearance-none pr-8 cursor-pointer w-full"
                    aria-label="Filter by role"
                  >
                    <option value="all">All Members ({roleCounts.all})</option>
                    <option value="admin">Admins ({roleCounts.admin})</option>
                    <option value="employee">
                      Employees ({roleCounts.employee})
                    </option>
                    <option value="intern">
                      Interns ({roleCounts.intern})
                    </option>
                  </select>
                  {/* Custom arrow indicator */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-black">
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Leave Organization button */}
              <button
                onClick={openLeaveOrganizationModal}
                className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Leave Organization</span>
              </button>
            </div>
          </div>
        </div>

        {/* Users List Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
          <div className="max-h-[600px] overflow-y-auto">
            {filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4">
                <div className="bg-gray-50 p-3 rounded-full mb-2">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <p>No users found matching the selected filter</p>
              </div>
            )}

            {filteredUsers.length > 0 &&
              filteredUsers.map((user) => (
                <UserCard key={user._id} user={user} />
              ))}
          </div>
        </div>
      </div>

      {/* User detail modal */}
      {modalOpen && <UserModal />}

      {/* Leave Organization Modal */}
      <LeaveOrganizationModal />

      {/* Add custom styles for enhanced dropdown */}
      <style jsx global>{`
        /* Custom dropdown styling */
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }

        /* Ensure dropdown options are properly sized */
        select option {
          padding: 8px 12px;
          font-size: 14px;
        }

        /* Fix dropdown width in browsers */
        @supports (-moz-appearance: none) {
          /* Firefox-specific rules */
          select {
            text-overflow: ellipsis;
            width: 100%;
          }
        }

        @media screen and (-webkit-min-device-pixel-ratio: 0) {
          /* Chrome/Safari/Edge specific rules */
          select {
            width: 100%;
          }

          /* Adjust the dropdown list to match trigger width */
          select:focus {
            width: 100%;
          }
        }

        /* Highlight effect on focus */
        .relative:has(select):focus-within {
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
        }
      `}</style>
    </>
  );
}
