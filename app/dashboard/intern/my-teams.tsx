"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  Clock,
  MessageCircle,
  FileText,
  GraduationCap,
  Shield,
  Mail,
  Phone,
  Building,
  User,
  Activity,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

interface Team {
  _id: string;
  teamName: string;
  description: string;
  mentors: string[];
  interns: string[];
  panelists: string[];
  status: string;
  organizationName: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function MyTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<"overview" | "members" | "communication">("overview");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setError(null);
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('User not authenticated');
        return;
      }

      const user = JSON.parse(userData);
      const response = await fetch(`/api/fetch-intern-teams?username=${user.username}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch teams');
      }

      const data = await response.json();
      setTeams(data.teams || []);
      setOrganizationName(data.organizationName || '');
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTeams();
    setIsRefreshing(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTotalMembers = (team: Team) => {
    return (team.mentors?.length || 0) + (team.panelists?.length || 0) + (team.interns?.length || 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading your teams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 mx-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (selectedTeam) {
    return (
      <div className="space-y-6">
        {/* Team Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Teams</span>
                </button>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedTeam.teamName}</h2>
              <p className="text-gray-600">{selectedTeam.description}</p>
              <p className="text-sm text-gray-500 mt-1">{organizationName}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTeam.status)}`}>
                {selectedTeam.status}
              </span>
              <p className="text-sm text-gray-500 mt-1">{getTotalMembers(selectedTeam)} members</p>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="flex space-x-4 border-b border-gray-200">
            {[
              { key: "overview", label: "Overview", icon: Activity },
              { key: "members", label: "Team Members", icon: Users },
              { key: "communication", label: "Communication", icon: MessageCircle }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key as any)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                  activeSection === key
                    ? "border-cyan-600 text-cyan-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section Content */}
        {activeSection === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Team Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Team Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                    <p className="text-gray-900 font-medium">{selectedTeam.teamName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-900">{selectedTeam.description || "No description available"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                    <p className="text-gray-900">{organizationName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTeam.status)}`}>
                      {selectedTeam.status}
                    </span>
                  </div>
                  {selectedTeam.createdAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{formatDate(selectedTeam.createdAt)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Activities */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Team Created</p>
                      <p className="text-xs text-gray-500">
                        {selectedTeam.createdAt ? formatDate(selectedTeam.createdAt) : 'Recently'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Members Assigned</p>
                      <p className="text-xs text-gray-500">{getTotalMembers(selectedTeam)} team members</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Team Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Mentors</span>
                    </div>
                    <span className="font-medium text-gray-900">{selectedTeam.mentors?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-600">Panelists</span>
                    </div>
                    <span className="font-medium text-gray-900">{selectedTeam.panelists?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Interns</span>
                    </div>
                    <span className="font-medium text-gray-900">{selectedTeam.interns?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-md hover:bg-cyan-100 transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span>Team Chat</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                    <FileText className="h-4 w-4" />
                    <span>Shared Files</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                    <Calendar className="h-4 w-4" />
                    <span>Schedule Meeting</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "members" && (
          <div className="space-y-6">
            {/* Mentors Section */}
            {selectedTeam.mentors && selectedTeam.mentors.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Mentors ({selectedTeam.mentors.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTeam.mentors.map((mentorUsername, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-medium text-lg">
                            {mentorUsername?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900">{mentorUsername}</h4>
                          <p className="text-sm text-gray-600">Mentor</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                              <Mail className="h-3 w-3" />
                              <span className="text-xs">Contact</span>
                            </button>
                            <button className="flex items-center space-x-1 text-green-600 hover:text-green-700">
                              <MessageCircle className="h-3 w-3" />
                              <span className="text-xs">Message</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Panelists Section */}
            {selectedTeam.panelists && selectedTeam.panelists.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Panelists ({selectedTeam.panelists.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTeam.panelists.map((panelistUsername, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 font-medium text-lg">
                            {panelistUsername?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900">{panelistUsername}</h4>
                          <p className="text-sm text-gray-600">Panelist</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                              <Mail className="h-3 w-3" />
                              <span className="text-xs">Contact</span>
                            </button>
                            <button className="flex items-center space-x-1 text-green-600 hover:text-green-700">
                              <MessageCircle className="h-3 w-3" />
                              <span className="text-xs">Message</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fellow Interns Section */}
            {selectedTeam.interns && selectedTeam.interns.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Fellow Interns ({selectedTeam.interns.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTeam.interns.map((internUsername, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 font-medium text-lg">
                            {internUsername?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900">{internUsername}</h4>
                          <p className="text-sm text-gray-600">Fellow Intern</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                              <Mail className="h-3 w-3" />
                              <span className="text-xs">Contact</span>
                            </button>
                            <button className="flex items-center space-x-1 text-green-600 hover:text-green-700">
                              <MessageCircle className="h-3 w-3" />
                              <span className="text-xs">Message</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Members Message */}
            {(!selectedTeam.mentors || selectedTeam.mentors.length === 0) &&
             (!selectedTeam.panelists || selectedTeam.panelists.length === 0) &&
             (!selectedTeam.interns || selectedTeam.interns.length === 0) && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Team Members Yet</h3>
                <p className="text-gray-500">Team members will appear here once they are assigned.</p>
              </div>
            )}
          </div>
        )}

        {activeSection === "communication" && (
          <div className="space-y-6">
            {/* Communication Options */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Communication Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Email Team</p>
                    <p className="text-sm text-gray-600">Send email to all team members</p>
                  </div>
                </button>
                
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Start Group Chat</p>
                    <p className="text-sm text-gray-600">Create a team discussion</p>
                  </div>
                </button>
                
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Schedule Meeting</p>
                    <p className="text-sm text-gray-600">Set up team meeting</p>
                  </div>
                </button>
                
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FileText className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Shared Documents</p>
                    <p className="text-sm text-gray-600">Access team files</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Communication Guidelines */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Communication Guidelines</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Use professional language in all team communications</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Respond to messages within 24 hours during working days</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Use @mentions to get attention for urgent matters</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Share updates proactively in team channels</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Respect time zones when scheduling meetings</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Team Contacts</h3>
              <div className="space-y-4">
                {selectedTeam.mentors && selectedTeam.mentors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Mentors</h4>
                    <div className="space-y-2">
                      {selectedTeam.mentors.map((mentor, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm text-gray-700">{mentor}</span>
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-700">
                              <Mail className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-700">
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTeam.panelists && selectedTeam.panelists.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Panelists</h4>
                    <div className="space-y-2">
                      {selectedTeam.panelists.map((panelist, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                          <span className="text-sm text-gray-700">{panelist}</span>
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-700">
                              <Mail className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-700">
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Teams</h2>
            <p className="text-gray-600">
              View your team assignments and collaborate with teammates
            </p>
            {organizationName && (
              <p className="text-sm text-gray-500 mt-1">{organizationName}</p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.length > 0 ? (
          teams.map((team) => (
            <div
              key={team._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedTeam(team)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{team.teamName}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                  {team.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {team.description || "No description available"}
              </p>

              {/* Team Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <GraduationCap className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-gray-500">Mentors</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{team.mentors?.length || 0}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Shield className="h-3 w-3 text-purple-500" />
                    <span className="text-xs text-gray-500">Panelists</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{team.panelists?.length || 0}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Users className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-gray-500">Interns</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{team.interns?.length || 0}</p>
                </div>
              </div>

              {/* Creation Date */}
              {team.createdAt && (
                <div className="mb-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {formatDate(team.createdAt)}</span>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium text-cyan-600 bg-cyan-50 rounded-md hover:bg-cyan-100 transition-colors">
                    <Users className="h-3 w-3" />
                    <span>View Team</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                    <MessageCircle className="h-3 w-3" />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Teams Yet</h3>
              <p className="text-gray-500 mb-4">
                You haven't been assigned to any teams yet. Teams will appear here once you're accepted into an internship program.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 max-w-md mx-auto">
                <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Apply for internship positions</li>
                  <li>• Complete your profile information</li>
                  <li>• Wait for team assignment confirmation</li>
                  <li>• Connect with your teammates and mentors</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}