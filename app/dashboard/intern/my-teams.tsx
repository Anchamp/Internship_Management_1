import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  Shield, 
  Calendar, 
  MessageCircle, 
  FileText, 
  RefreshCw,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

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

const MyTeams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-cyan-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your teams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Teams</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTeams}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm border">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Teams Yet</h3>
          <p className="text-gray-500 mb-4">
            You haven't been assigned to any teams yet. Your mentor will assign you to a team when available.
          </p>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 inline mr-2" />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Teams</h2>
          <p className="text-gray-600 mt-1">
            You are part of {teams.length} team{teams.length !== 1 ? 's' : ''} 
            {organizationName && ` in ${organizationName}`}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div
            key={team._id}
            className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedTeam(team)}
          >
            <div className="p-6">
              {/* Team Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {team.teamName}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    team.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {team.status === 'active' ? 'Active' : team.status}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>

              {/* Team Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {team.description || 'No description available'}
              </p>

              {/* Team Members Summary */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    {team.mentors?.length || 0} Mentor{(team.mentors?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">
                    {team.interns?.length || 0} Intern{(team.interns?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600">
                    {team.panelists?.length || 0} Panelist{(team.panelists?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                    <MessageCircle className="h-3 w-3" />
                    <span>Chat</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                    <FileText className="h-3 w-3" />
                    <span>Files</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Detail Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedTeam.teamName}
                  </h3>
                  <p className="text-gray-600 mt-1">Team Details & Members</p>
                </div>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Team Description */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">
                  {selectedTeam.description || 'No description available'}
                </p>
              </div>

              {/* Team Members */}
              <div className="space-y-6">
                {/* Mentors */}
                <div>
                  <h4 className="flex items-center space-x-2 font-semibold text-gray-900 mb-3">
                    <GraduationCap className="h-5 w-5 text-blue-500" />
                    <span>Mentors ({selectedTeam.mentors?.length || 0})</span>
                  </h4>
                  <div className="grid gap-2">
                    {selectedTeam.mentors?.length > 0 ? (
                      selectedTeam.mentors.map((mentor, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-md">
                          <UserCheck className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">{mentor}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No mentors assigned</p>
                    )}
                  </div>
                </div>

                {/* Interns */}
                <div>
                  <h4 className="flex items-center space-x-2 font-semibold text-gray-900 mb-3">
                    <Users className="h-5 w-5 text-green-500" />
                    <span>Interns ({selectedTeam.interns?.length || 0})</span>
                  </h4>
                  <div className="grid gap-2">
                    {selectedTeam.interns?.length > 0 ? (
                      selectedTeam.interns.map((intern, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-md">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-900">{intern}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No interns assigned</p>
                    )}
                  </div>
                </div>

                {/* Panelists */}
                <div>
                  <h4 className="flex items-center space-x-2 font-semibold text-gray-900 mb-3">
                    <Shield className="h-5 w-5 text-purple-500" />
                    <span>Panelists ({selectedTeam.panelists?.length || 0})</span>
                  </h4>
                  <div className="grid gap-2">
                    {selectedTeam.panelists?.length > 0 ? (
                      selectedTeam.panelists.map((panelist, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-md">
                          <Shield className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-gray-900">{panelist}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No panelists assigned</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-100">
                <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span>Join Team Chat</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                  <FileText className="h-4 w-4" />
                  <span>View Files</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTeams;