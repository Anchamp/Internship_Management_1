"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Briefcase,
  Building,
  Search,
  X,
  Loader2,
  AlertCircle,
  Code,
  FileText,
  Clock,
} from "lucide-react";
import Image from "next/image";

interface InternshipPost {
  _id: string;
  title: string;
  organizationName: string;
  organizationLogo?: string;
  department: string;
  mode: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  startDate: string;
  endDate: string;
  openings: number;
  isPaid: boolean;
  stipend?: string;
  skills: string[];
  responsibilities: string[];
  postingDate: string;
  applicationDeadline: string;
  status: string;
  postedBy: string;
  eligibility: string;
  applications: any[];
}

export default function PostHistoryScreen() {
  const [posts, setPosts] = useState<InternshipPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<InternshipPost | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");

  useEffect(() => {
    fetchInternshipPosts();
  }, [filterStatus, sortOrder]);

  const fetchInternshipPosts = async (searchTerm: string = "") => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the admin info from localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("User not authenticated");
      }

      let { username, organizationId, organizationName } =
        JSON.parse(storedUser);

      // If organization info is missing in localStorage, fetch it from the database
      if (!organizationId && !organizationName) {
        console.log(
          "Organization info missing in localStorage, fetching from API..."
        );

        try {
          // Fetch the user data from the database
          const userResponse = await fetch(`/api/users/${username}`);
          if (!userResponse.ok) {
            throw new Error("Failed to fetch user data");
          }

          const userData = await userResponse.json();

          if (!userData.user) {
            throw new Error("User data not found");
          }

          // Use the organization information from the database
          organizationId = userData.user.organizationId;
          organizationName = userData.user.organizationName;

          console.log("Retrieved organization info from database:", {
            organizationName,
            organizationId,
          });

          // Update localStorage with the new information
          const updatedUser = JSON.parse(storedUser);
          updatedUser.organizationId = organizationId;
          updatedUser.organizationName = organizationName;
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (userError) {
          console.error("Error fetching user data:", userError);
          throw new Error(
            "Failed to fetch organization information from database"
          );
        }
      }

      // Check if we now have organization information
      if (!organizationId && !organizationName) {
        throw new Error(
          "Missing organization information. Please contact support."
        );
      }

      // Construct API URL with query parameters
      let url = new URL(
        `${window.location.origin}/api/internships/by-organization`
      );

      // Always include organization information - prioritize ID if available
      if (organizationId) {
        url.searchParams.append("organizationId", organizationId);
      } else if (organizationName) {
        url.searchParams.append("organizationName", organizationName);
      }

      if (filterStatus !== "all") {
        url.searchParams.append("status", filterStatus);
      }

      if (searchTerm) {
        url.searchParams.append("search", searchTerm);
      }

      url.searchParams.append("sort", sortOrder);

      console.log("Fetching internships with URL:", url.toString());

      // Fetch internship posts from the API
      const response = await fetch(url.toString());
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            errorData.details ||
            "Failed to fetch internship posts"
        );
      }

      const data = await response.json();
      setPosts(data.internships || []);
    } catch (err: any) {
      console.error("Error fetching internship posts:", err);
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInternshipPosts(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle opening the modal with the selected post
  const handleOpenModal = (post: InternshipPost) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mb-4" />
        <p className="text-gray-500">Loading internship posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Combined Header and Search/Filter Component */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <h2 className="text-xl font-bold flex items-center text-black">
              <FileText className="mr-3 h-6 w-6 text-cyan-600" />
              Internship Posting History
            </h2>

            <div className="flex gap-2 mt-2 sm:mt-0 ml-9 sm:ml-0">
              <select
                className="px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>

              <select
                className="px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Field (Full Width) */}
        <div className="px-6 py-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
              placeholder="Search by title or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Internship Posts List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No internship posts found
            </h3>
            <p className="text-gray-500">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start creating internship postings to see them here"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div
                key={post._id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onClick={() => handleOpenModal(post)}
              >
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                      {post.organizationLogo ? (
                        <Image
                          src={post.organizationLogo}
                          alt={post.organizationName}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <Building className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {post.title}
                      </h3>
                      <div className="flex flex-wrap text-sm text-gray-500 space-x-4 mt-1">
                        <span className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {post.department}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {post.location.city || "Remote"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0 flex flex-col sm:items-end">
                    <div className="flex space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.status === "published"
                            ? "bg-green-100 text-green-800"
                            : post.status === "closed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {post.status.charAt(0).toUpperCase() +
                          post.status.slice(1)}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {post.applications.length} Applications
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Posted: {formatDate(post.postingDate)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Deadline: {formatDate(post.applicationDeadline)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Details Modal - adjusted size and removed buttons */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">
                Internship Details
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-full hover:bg-red-100"
              >
                <X className="h-5 w-5 text-red-600" />
              </button>
            </div>

            {/* Modal Content - adjusted to use flex-grow to ensure proper spacing */}
            <div className="p-6 overflow-y-auto flex-grow">
              {/* Basic Info */}
              <div className="flex flex-col md:flex-row justify-between mb-8 pb-6 border-b border-gray-200">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedPost.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-gray-600">
                    <span className="flex items-center">
                      <Building className="h-4 w-4 mr-1.5 text-gray-500" />
                      {selectedPost.organizationName}
                    </span>
                    <span className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1.5 text-gray-500" />
                      {selectedPost.department}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1.5 text-gray-500" />
                      {selectedPost.mode === "remote"
                        ? "Remote"
                        : selectedPost.location.city &&
                          selectedPost.location.country
                        ? `${selectedPost.location.city}, ${selectedPost.location.country}`
                        : selectedPost.location.city ||
                          "Location not specified"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end space-y-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedPost.status === "published"
                        ? "bg-green-100 text-green-800"
                        : selectedPost.status === "closed"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedPost.status.charAt(0).toUpperCase() +
                      selectedPost.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-600">
                    Posted on: {formatDate(selectedPost.postingDate)}
                  </span>
                  <span className="text-sm text-gray-600">
                    Apply by: {formatDate(selectedPost.applicationDeadline)}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  {/* Position Details */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 pb-1 border-b">
                      Position Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-cyan-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Duration
                          </p>
                          <p className="text-gray-900">
                            {formatDate(selectedPost.startDate)} -{" "}
                            {formatDate(selectedPost.endDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-cyan-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Openings
                          </p>
                          <p className="text-gray-900">
                            {selectedPost.openings} positions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-cyan-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Compensation
                          </p>
                          <p className="text-gray-900">
                            {selectedPost.isPaid
                              ? selectedPost.stipend ||
                                "Paid (amount not specified)"
                              : "Unpaid"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 pb-1 border-b">
                      Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.skills && selectedPost.skills.length > 0 ? (
                        selectedPost.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">
                          No specific skills listed
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Eligibility */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 pb-1 border-b">
                      Eligibility Criteria
                    </h4>
                    <p className="text-gray-900">{selectedPost.eligibility}</p>
                  </div>
                </div>

                <div>
                  {/* Responsibilities */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 pb-1 border-b">
                      Roles & Responsibilities
                    </h4>
                    {selectedPost.responsibilities &&
                    selectedPost.responsibilities.length > 0 ? (
                      <ul className="space-y-2 list-disc pl-5">
                        {selectedPost.responsibilities.map(
                          (responsibility, index) => (
                            <li key={index} className="text-gray-900">
                              {responsibility}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">
                        No specific responsibilities listed
                      </p>
                    )}
                  </div>

                  {/* Applications */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 pb-1 border-b">
                      Application Status
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-medium">
                          Total Applications:
                        </span>
                        <span className="font-bold text-gray-900">
                          {selectedPost.applications
                            ? selectedPost.applications.length
                            : 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-cyan-600 h-2.5 rounded-full"
                          style={{
                            width: `${
                              selectedPost.applications && selectedPost.openings
                                ? Math.min(
                                    (selectedPost.applications.length /
                                      selectedPost.openings) *
                                      100,
                                    100
                                  )
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedPost.applications && selectedPost.openings
                          ? `${selectedPost.applications.length}/${selectedPost.openings} positions filled`
                          : "No applications yet"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - simplified with just the Edit button */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Implement edit posting functionality here
                  alert("Edit posting functionality to be implemented");
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                Edit Posting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
