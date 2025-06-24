"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Loader2,
  RefreshCw,
  Filter,
  Search,
  MapPin,
  DollarSign,
  X,
  ThumbsUp,
  ThumbsDown,
  Users,
} from "lucide-react";

interface Application {
  _id: string;
  internshipId: string;
  companyName: string;
  position: string;
  appliedDate: string;
  status: string;
  applicationData: {
    coverLetter: string;
    whyInterestedReason: string;
    relevantExperience: string;
    expectedOutcome: string;
    availableStartDate: string;
    additionalComments: string;
  };
  userProfileSnapshot: any;
  interviewDate?: string;
  notes?: string;
  respondedDate?: string; // When intern responded to selection
}

interface InternshipDetails {
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
  isPaid: boolean;
  stipend?: string;
  applicationDeadline: string;
}

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [internshipDetails, setInternshipDetails] = useState<{[key: string]: InternshipDetails}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userData = localStorage.getItem("user");
      if (!userData) {
        throw new Error("User not authenticated");
      }

      const user = JSON.parse(userData);
      const response = await fetch(`/api/users/${user.username}`);
      console.log(response)
      
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      if (data.user?.appliedInternships) {
        setApplications(data.user.appliedInternships);
        
        // Fetch internship details for each application
        const internshipIds = data.user.appliedInternships.map((app: Application) => app.internshipId);
        await fetchInternshipDetails(internshipIds);
      }
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInternshipDetails = async (internshipIds: string[]) => {
    try {
      const detailsMap: {[key: string]: InternshipDetails} = {};
      
      // Fetch details for each internship
      await Promise.all(
        internshipIds.map(async (id) => {
          try {
            const response = await fetch(`/api/internships/${id}`);
            if (response.ok) {
              const internship = await response.json();
              detailsMap[id] = internship;
            }
          } catch (error) {
            console.error(`Error fetching internship ${id}:`, error);
          }
        })
      );
      
      setInternshipDetails(detailsMap);
    } catch (error) {
      console.error("Error fetching internship details:", error);
    }
  };

  const refreshApplications = async () => {
    setIsRefreshing(true);
    await fetchApplications();
    setIsRefreshing(false);
  };

  // Handle intern's response to selection using simplified API endpoint
  const handleOfferResponse = async (applicationId: string, response: "accepted" | "declined") => {
    try {
      setIsResponding(true);
      console.log('=== STARTING OFFER RESPONSE ===');
      console.log('Application ID:', applicationId);
      console.log('Response:', response);

      const userData = localStorage.getItem("user");
      if (!userData) {
        throw new Error("User not authenticated");
      }

      const user = JSON.parse(userData);
      console.log('Username:', user.username);

      // Using simplified API endpoint to avoid routing issues
      const url = `/api/intern-response`;
      console.log('API URL:', url);

      const requestBody = { 
        applicationId: applicationId,
        response: response,
        username: user.username 
      };
      console.log('Request payload:', requestBody);

      const apiResponse = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', apiResponse.status);
      console.log('Response headers:', Object.fromEntries(apiResponse.headers.entries()));

      // Always get text first to handle any response type
      const responseText = await apiResponse.text();
      console.log('Raw response text:', responseText);

      // Try to parse as JSON
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        
        // If it's HTML (like an error page), show a helpful message
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
          throw new Error('Server returned an error page. The API endpoint may not exist. Please check the server setup.');
        }
        
        throw new Error(`Invalid server response: ${responseText.substring(0, 100)}...`);
      }

      console.log('Parsed response data:', responseData);

      if (!apiResponse.ok) {
        const errorMessage = responseData.error || responseData.message || `HTTP ${apiResponse.status}`;
        throw new Error(errorMessage);
      }

      console.log('✅ Response successful!');

      // Update the application status locally
      setApplications(prev => 
        prev.map(app => 
          app._id === applicationId 
            ? { ...app, status: response, respondedDate: new Date().toISOString() }
            : app
        )
      );

      // Update selected application if modal is open
      if (selectedApplication && selectedApplication._id === applicationId) {
        setSelectedApplication(prev => 
          prev ? { ...prev, status: response, respondedDate: new Date().toISOString() } : null
        );
      }

      // Show success message
      const message = response === "accepted" 
        ? "🎉 Congratulations! You've accepted the internship offer!"
        : "✅ You've declined the internship offer.";
      
      alert(message);

      // Refresh applications to get latest data from server
      console.log('Refreshing applications...');
      await fetchApplications();

    } catch (error: any) {
      console.error("❌ Error in handleOfferResponse:", error);
      console.error("Error stack:", error.stack);
      
      // Provide helpful error messages
      let userMessage = "Failed to respond to offer. ";
      
      if (error.message.includes('endpoint may not exist')) {
        userMessage += "Please ensure the API endpoint is properly set up.";
      } else if (error.message.includes('fetch')) {
        userMessage += "Network error. Please check your connection.";
      } else {
        userMessage += error.message;
      }
      
      alert(userMessage);
    } finally {
      setIsResponding(false);
      console.log('=== OFFER RESPONSE COMPLETE ===');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "shortlisted":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case "interview_scheduled":
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case "selected":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "accepted":
        return <ThumbsUp className="h-5 w-5 text-green-600" />;
      case "declined":
        return <ThumbsDown className="h-5 w-5 text-gray-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "shortlisted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "interview_scheduled":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "selected":
        return "bg-green-100 text-green-800 border-green-200";
      case "accepted":
        return "bg-green-200 text-green-900 border-green-300";
      case "declined":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "pending":
        return "Your application is under review by the organization.";
      case "shortlisted":
        return "🎉 Congratulations! You've been shortlisted for this position.";
      case "interview_scheduled":
        return "📅 An interview has been scheduled. Check your email for details.";
      case "selected":
        return "🎯 Amazing! You've been selected for this internship. Please respond below.";
      case "accepted":
        return "✅ You've accepted this internship offer. Next steps will be communicated soon.";
      case "declined":
        return "You've declined this internship offer.";
      case "rejected":
        return "Unfortunately, your application was not successful this time.";
      default:
        return "Status unknown";
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = selectedStatus === "all" || app.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mb-4" />
        <p className="text-gray-500">Loading your applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Applications</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchApplications}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FileText className="mr-3 h-6 w-6 text-cyan-600" />
              My Applications
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Track the status of your internship applications and respond to offers
            </p>
          </div>
          <button
            onClick={refreshApplications}
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black bg-white"
              placeholder="Search by position or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black bg-white"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="selected">Selected (Action Required)</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {applications.length === 0 ? "No Applications Yet" : "No Matching Applications"}
          </h3>
          <p className="text-gray-500">
            {applications.length === 0 
              ? "Start by browsing and applying for internships that match your interests."
              : "Try adjusting your filters to see more applications."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const internship = internshipDetails[application.internshipId];
            
            return (
              <div
                key={application._id}
                className={`bg-white rounded-lg shadow-md border-l-4 hover:shadow-lg transition-all duration-200 ${
                  application.status === 'selected' ? 'border-l-green-500 bg-green-50' :
                  application.status === 'accepted' ? 'border-l-green-600 bg-green-50' :
                  application.status === 'rejected' ? 'border-l-red-500' :
                  'border-l-gray-300'
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {internship?.organizationLogo ? (
                          <img
                            src={internship.organizationLogo}
                            alt={`${application.companyName} logo`}
                            className="w-12 h-12 rounded-lg object-cover border shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
                            <Building className="h-6 w-6 text-cyan-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {application.position}
                          </h3>
                          <p className="text-cyan-600 font-medium mb-2">
                            {application.companyName}
                          </p>
                          
                          {internship && (
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {internship.location.city}, {internship.location.state}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {internship.mode}
                              </div>
                              {internship.isPaid && (
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  {internship.stipend || 'Paid'}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Applied: {formatDate(application.appliedDate)}</span>
                            {application.respondedDate && (
                              <span className="text-green-600 font-medium">
                                Responded: {formatDate(application.respondedDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col lg:items-end space-y-3 mt-4 lg:mt-0">
                      {/* Status Badge */}
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleViewDetails(application)}
                          className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium flex items-center justify-center transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>

                        {/* Accept/Reject buttons for selected applications */}
                        {application.status === "selected" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleOfferResponse(application._id, "accepted")}
                              disabled={isResponding}
                              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isResponding ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <ThumbsUp className="h-4 w-4 mr-1" />
                              )}
                              {isResponding ? 'Processing...' : 'Accept'}
                            </button>
                            <button
                              onClick={() => handleOfferResponse(application._id, "declined")}
                              disabled={isResponding}
                              className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isResponding ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <ThumbsDown className="h-4 w-4 mr-1" />
                              )}
                              {isResponding ? 'Processing...' : 'Decline'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Description */}
                  <div className={`mt-4 p-3 rounded-md ${
                    application.status === 'selected' ? 'bg-green-100 border border-green-200' :
                    application.status === 'accepted' ? 'bg-green-100 border border-green-200' :
                    'bg-gray-50'
                  }`}>
                    <p className="text-sm text-gray-700">
                      {getStatusDescription(application.status)}
                    </p>
                    {application.status === "selected" && (
                      <p className="text-sm text-green-700 font-medium mt-1">
                        ⏰ Action Required: Please respond to this offer by accepting or declining above.
                      </p>
                    )}
                    {application.status === "accepted" && (
                      <p className="text-sm text-green-700 font-medium mt-1">
                        🎯 Next steps and onboarding information will be shared by the organization soon.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Details Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Application Details
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedApplication.position} at {selectedApplication.companyName}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Application Info */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Application Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Position:</span>
                      <p className="text-gray-900 mt-1">{selectedApplication.position}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Company:</span>
                      <p className="text-gray-900 mt-1">{selectedApplication.companyName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Applied Date:</span>
                      <p className="text-gray-900 mt-1">{formatDate(selectedApplication.appliedDate)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Current Status:</span>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedApplication.status)}`}>
                        {getStatusIcon(selectedApplication.status)}
                        <span className="ml-1 capitalize">{selectedApplication.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    {selectedApplication.respondedDate && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Response Date:</span>
                        <p className="text-green-600 font-medium mt-1">{formatDate(selectedApplication.respondedDate)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Application Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Application Details</h4>
                  
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Cover Letter</p>
                    <div className="text-gray-900 bg-gray-50 p-4 rounded-md border">
                      {selectedApplication.applicationData.coverLetter || 'No cover letter provided'}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700 mb-2">Why are you interested in this internship?</p>
                    <div className="text-gray-900 bg-gray-50 p-4 rounded-md border">
                      {selectedApplication.applicationData.whyInterestedReason || 'No response provided'}
                    </div>
                  </div>

                  {selectedApplication.applicationData.relevantExperience && (
                    <div>
                      <p className="font-medium text-gray-700 mb-2">Relevant Experience</p>
                      <div className="text-gray-900 bg-gray-50 p-4 rounded-md border">
                        {selectedApplication.applicationData.relevantExperience}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="font-medium text-gray-700 mb-2">Expected Outcome</p>
                    <div className="text-gray-900 bg-gray-50 p-4 rounded-md border">
                      {selectedApplication.applicationData.expectedOutcome || 'No expected outcome provided'}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700 mb-2">Available Start Date</p>
                    <div className="text-gray-900 bg-gray-50 p-4 rounded-md border">
                      {formatDate(selectedApplication.applicationData.availableStartDate)}
                    </div>
                  </div>

                  {selectedApplication.applicationData.additionalComments && (
                    <div>
                      <p className="font-medium text-gray-700 mb-2">Additional Comments</p>
                      <div className="text-gray-900 bg-gray-50 p-4 rounded-md border">
                        {selectedApplication.applicationData.additionalComments}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Current Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(selectedApplication.status)}`}>
                    {getStatusIcon(selectedApplication.status)}
                    <span className="ml-1 capitalize">{selectedApplication.status.replace('_', ' ')}</span>
                  </span>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
                  >
                    Close
                  </button>
                  
                  {/* Accept/Reject buttons in modal for selected applications */}
                  {selectedApplication.status === "selected" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOfferResponse(selectedApplication._id, "accepted")}
                        disabled={isResponding}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                      >
                        {isResponding ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ThumbsUp className="h-4 w-4 mr-2" />
                        )}
                        {isResponding ? "Processing..." : "Accept Offer"}
                      </button>
                      <button
                        onClick={() => handleOfferResponse(selectedApplication._id, "declined")}
                        disabled={isResponding}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                      >
                        {isResponding ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ThumbsDown className="h-4 w-4 mr-2" />
                        )}
                        {isResponding ? "Processing..." : "Decline Offer"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
