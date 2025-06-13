"use client";

import { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  Building,
} from "lucide-react";

interface TeamData {
  _id: string;
  teamName: string;
  mentors: string[];
  interns: string[];
  panelists: string[];
  description: string;
  organizationName: string;
  organizationId: string;
  status: string;
  createdAt?: string;
}

const organization = () => {
  const [organizationName, setOrganizationName] = useState('');
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [role, setRole] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        setError("");

        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          throw new Error("User not found in local storage");
          return;
        }

        const { username, userRole } = JSON.parse(storedUser);
        setRole(userRole);

        const response = await fetch(`/api/fetch-teams?username=${username}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch teams');
        }

        const data = await response.json();

        const { organizationName, teams } = data;
        setOrganizationName(organizationName);
        setTeams(teams);
      } catch (error: any) {
        console.error("Error fetching teams:", error);
        setError(error.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [])

  const TeamCard = ({ team }: {team: TeamData }) => (
    <div className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="flex justify-between items-center">
        <div className="text-black">
          <h4>{team.teamName}</h4>
          <h6 className="text-gray-400">{team.organizationName}</h6>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div 
            className="w-[10px] h-[10px] rounded-full"
            style={{
              backgroundColor: getStatusColor(team.status)
            }}
          />
          <span>
            <h4 className="text-black">{
              getStatusText(team.status)
            }</h4>
          </span>
        </div>
      </div>
      <div className="mt-4 flex w-full lg:w-[50%] items-center justify-between text-black">
        <div className="flex items-center justify-between">
          <p className="mr-[4px]">Mentors: </p>
          <p>{team.mentors.length}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="mr-[4px]">Interns: </p>
          <p>{team.interns.length}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="mr-[4px]">Panelists: </p>
          <p>{team.panelists.length}</p>
        </div>
      </div>
    </div>
  )


  const CreateTeamModal = () => {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-2xl max-w-3xl wofull max-h-[90vh] overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <h3 className="text-xl font-bold text-gray-900">
              Create New Team
            </h3>
            <button
              onClick={closeModal}
              className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
            >
            <X className="h-5 w-5 text-red-500 hover:text-red-700" />
            </button>
          </div>
        </div>
      </div>
    )
  }
  
 const openModal = () => {
   setModalOpen(true);
 } 

 const closeModal = () => {
   setModalOpen(false);
 }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#006730";
      case "underReview":
        return "#3628AB";
      case "completed":
        return "#1E2938";
      default:
        return "#9E0913";
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "underReview":
        return "Under Review";
      case "completed":
        return "Completed";
      default:
        return "Unknown Status";
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        <span className="ml-2 text-lg font-medium text-gray-700">
          Loading Teams...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">
          Error Loading Teams 
        </h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }



  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-gradient-to-r from-cyan-50 to-blue-100 p-6 rounded-lg border border-cyan-200 shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Building className="h-6 w-6 text-cyan-700 mr-3" />
                {organizationName} Teams
              </h3>
            </div>

            <div className="relative inline-block w-full md:w-auto">
              <div className="flex items-center gap-2 bg-white/80 rounded-lg shadow-sm transition-all duration-200">
                {role !== "admin" && (
                  <button
                    onClick={(e) => {
                      openModal();
                    }}
                    className="w-full h-full bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 rounded-lg cursor-pointer font-bold text-white"
                  >
                      Create a Team
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 my-2">
        <div className="max-h-[600px] overflow-y-auto">
          {
            teams.length > 0 ? (
              teams.map((team: TeamData) => (
                <TeamCard key={team._id} team={team} />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                <h3 className="text-lg font-semibold mb-2">No Teams Found</h3>
                <p className="text-sm">It seems there are no teams available in this organization.</p>
              </div>
            )
          }
        </div>
      </div>


      {modalOpen && <CreateTeamModal />}
    </>
  )
}

export default organization;

