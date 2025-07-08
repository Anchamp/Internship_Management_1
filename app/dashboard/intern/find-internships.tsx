"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Building,
  Clock,
  Briefcase,
  X,
  Loader2,
  AlertCircle,
  ExternalLink,
  BookmarkPlus,
  Bookmark,
  FileText,
  Code,
} from "lucide-react";

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
    address: string;
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
  category: string;
  organizationId: string;
}

interface FindInternshipsProps {
  onApplyClick: (internship: InternshipPost) => void;
}

export default function FindInternships({
  onApplyClick,
}: FindInternshipsProps) {
  const [internships, setInternships] = useState<InternshipPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [selectedInternship, setSelectedInternship] =
    useState<InternshipPost | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [savedInternships, setSavedInternships] = useState<string[]>([]);
  const [appliedInternships, setAppliedInternships] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    fetchCategories();
    fetchInternships();
    loadUserApplications();
  }, [currentPage, sortOrder, selectedCategory, selectedMode]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchInternships();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/internships/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const loadUserApplications = async () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch(`/api/users/${user.username}`);
      if (response.ok) {
        const data = await response.json();
        if (data.user?.appliedInternships) {
          const appliedIds = data.user.appliedInternships.map(
            (app: any) => app.internshipId
          );
          setAppliedInternships(appliedIds);
        }
      }
    } catch (error) {
      console.error("Error loading user applications:", error);
    }
  };

  const fetchInternships = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let url = new URL(`${window.location.origin}/api/internships/public`);

      if (searchQuery) {
        url.searchParams.append("search", searchQuery);
      }
      if (selectedCategory !== "all") {
        url.searchParams.append("category", selectedCategory);
      }
      if (selectedMode !== "all") {
        url.searchParams.append("mode", selectedMode);
      }

      url.searchParams.append("sort", sortOrder);
      url.searchParams.append("page", currentPage.toString());
      url.searchParams.append("limit", "12");
      url.searchParams.append("status", "published");
      // This API already filters out expired internships by default

      console.log("Fetching internships from URL:", url.toString());

      const response = await fetch(url.toString());
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch internships");
      }

      const data = await response.json();
      console.log(`Received ${data.internships?.length || 0} internships`);
      setInternships(data.internships || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err: any) {
      console.error("Error fetching internships:", err);
      setError(err.message || "An error occurred while fetching internships");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleOpenModal = (internship: InternshipPost) => {
    setSelectedInternship(internship);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInternship(null);
  };

  const handleApply = (internship: InternshipPost) => {
    onApplyClick(internship);
    handleCloseModal();
  };

  const toggleSaveInternship = (internshipId: string) => {
    setSavedInternships((prev) =>
      prev.includes(internshipId)
        ? prev.filter((id) => id !== internshipId)
        : [...prev, internshipId]
    );
  };

  const isInternshipExpired = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const hasApplied = (internshipId: string) => {
    return appliedInternships.includes(internshipId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mb-4" />
        <p className="text-gray-500">Loading internship opportunities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchInternships}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
              placeholder="Search internships by title, company, or department..."
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

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
            >
              <option value="all">All Modes</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
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

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {internships.length} Internship{internships.length !== 1 ? "s" : ""}{" "}
          Available
        </h2>
        {totalPages > 1 && (
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Internship Cards Grid */}
      {internships.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No internships found
          </h3>
          <p className="text-gray-500">
            {searchQuery || selectedCategory !== "all" || selectedMode !== "all"
              ? "Try adjusting your search criteria"
              : "Check back later for new opportunities"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {internships.map((internship) => {
            const daysLeft = getDaysUntilDeadline(
              internship.applicationDeadline
            );
            const isExpired = isInternshipExpired(
              internship.applicationDeadline
            );
            const hasAppliedToThis = hasApplied(internship._id);

            return (
              <div
                key={internship._id}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden ${
                  isExpired ? "opacity-75" : ""
                }`}
              >
                {/* Card Header */}
                <div className="p-4 pb-2">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {internship.organizationLogo ? (
                          <Image
                            src={internship.organizationLogo}
                            alt={internship.organizationName}
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        ) : (
                          <Building className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {internship.title}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {internship.organizationName}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSaveInternship(internship._id)}
                      className="text-gray-400 hover:text-cyan-600 transition-colors"
                    >
                      {savedInternships.includes(internship._id) ? (
                        <Bookmark className="h-5 w-5 fill-current" />
                      ) : (
                        <BookmarkPlus className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Category Badge */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-medium">
                      {internship.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {internship.mode}
                    </span>
                  </div>

                  {/* Key Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">
                        {internship.mode === "remote"
                          ? "Remote"
                          : internship.location.city
                          ? `${internship.location.city}, ${internship.location.country}`
                          : "Location TBD"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {formatDate(internship.startDate)} -{" "}
                        {formatDate(internship.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>
                        {internship.isPaid
                          ? internship.stipend || "Paid"
                          : "Unpaid"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {internship.openings} opening
                        {internship.openings !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deadline Warning */}
                {!isExpired && daysLeft <= 7 && (
                  <div className="px-4 py-2 bg-amber-50 border-l-4 border-amber-400">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-amber-600 mr-2" />
                      <span className="text-sm text-amber-800">
                        {daysLeft > 0
                          ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`
                          : "Last day to apply!"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="p-4 pt-3 bg-gray-50">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenModal(internship)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                    {hasAppliedToThis ? (
                      <button
                        disabled
                        className="flex-1 px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium cursor-not-allowed"
                      >
                        Applied ✓
                      </button>
                    ) : isExpired ? (
                      <button
                        disabled
                        className="flex-1 px-3 py-2 bg-gray-300 text-gray-500 rounded-md text-sm font-medium cursor-not-allowed"
                      >
                        Expired
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApply(internship)}
                        className="flex-1 px-3 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 text-sm font-medium transition-colors"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 border rounded-md text-sm font-medium ${
                  currentPage === page
                    ? "bg-cyan-600 text-white border-cyan-600"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Internship Details Modal */}
      {showModal && selectedInternship && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
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

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-grow">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row justify-between mb-6 pb-6 border-b border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {selectedInternship.organizationLogo ? (
                        <Image
                          src={selectedInternship.organizationLogo}
                          alt={selectedInternship.organizationName}
                          width={64}
                          height={64}
                          className="object-contain"
                        />
                      ) : (
                        <Building className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {selectedInternship.title}
                      </h2>
                      <p className="text-lg text-gray-600">
                        {selectedInternship.organizationName}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium">
                      {selectedInternship.category}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {selectedInternship.department}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {selectedInternship.mode}
                    </span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end space-y-2">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Application Deadline
                    </p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(selectedInternship.applicationDeadline)}
                    </p>
                    {!isInternshipExpired(
                      selectedInternship.applicationDeadline
                    ) && (
                      <p className="text-sm text-amber-600">
                        {getDaysUntilDeadline(
                          selectedInternship.applicationDeadline
                        )}{" "}
                        days left
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
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
                            {formatDate(selectedInternship.startDate)} -{" "}
                            {formatDate(selectedInternship.endDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-cyan-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Location
                          </p>
                          <p className="text-gray-900">
                            {selectedInternship.mode === "remote"
                              ? "Remote"
                              : selectedInternship.location.city &&
                                selectedInternship.location.country
                              ? `${selectedInternship.location.city}, ${selectedInternship.location.country}`
                              : "Location TBD"}
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
                            {selectedInternship.openings} positions
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
                            {selectedInternship.isPaid
                              ? selectedInternship.stipend ||
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
                      {selectedInternship.skills &&
                      selectedInternship.skills.length > 0 ? (
                        selectedInternship.skills.map((skill, index) => (
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
                </div>

                {/* Right Column */}
                <div>
                  {/* Eligibility */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 pb-1 border-b">
                      Eligibility Criteria
                    </h4>
                    <p className="text-gray-900">
                      {selectedInternship.eligibility}
                    </p>
                  </div>

                  {/* Responsibilities */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 pb-1 border-b">
                      Roles & Responsibilities
                    </h4>
                    {selectedInternship.responsibilities &&
                    selectedInternship.responsibilities.length > 0 ? (
                      <ul className="space-y-2 list-disc pl-5">
                        {selectedInternship.responsibilities.map(
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

                  {/* Application Stats */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 pb-1 border-b">
                      Application Status
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-medium">
                          Applications:
                        </span>
                        <span className="font-bold text-gray-900">
                          {selectedInternship.applications?.length || 0} /{" "}
                          {selectedInternship.openings}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-cyan-600 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((selectedInternship.applications?.length || 0) /
                                selectedInternship.openings) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Posted on {formatDate(selectedInternship.postingDate)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
                >
                  Close
                </button>
                {hasApplied(selectedInternship._id) ? (
                  <button
                    disabled
                    className="flex-1 px-4 py-2 bg-green-100 text-green-800 rounded-md font-medium cursor-not-allowed"
                  >
                    Already Applied ✓
                  </button>
                ) : isInternshipExpired(
                    selectedInternship.applicationDeadline
                  ) ? (
                  <button
                    disabled
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-500 rounded-md font-medium cursor-not-allowed"
                  >
                    Application Deadline Passed
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(selectedInternship)}
                    className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 font-medium transition-colors"
                  >
                    Apply for this Internship
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
