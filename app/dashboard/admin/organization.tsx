"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Building, AlertCircle } from "lucide-react";

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

const DeleteTeamModal = ({
  closeModal,
  teamName,
  deleteTeam,
}: {
  closeModal: () => void;
  teamName: string;
  deleteTeam: (teamName: string) => Promise<void>;
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Team</h3>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete the team "
          <span className="font-bold text-black">{teamName}</span>"? This action
          cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={closeModal}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await deleteTeam(teamName);
              closeModal();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateTeamModal = ({
  closeModal,
  resetFormValues,
  newTeamName,
  setNewTeamName,
  newMentors,
  setNewMentors,
  newInterns,
  setNewInterns,
  newPanelists,
  setNewPanelists,
  newDescription,
  setNewDescription,
  handleSubmit,
}: any) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden min-w-[310px]">
        <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-900">Create New Team</h3>
          <button
            onClick={closeModal}
            className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-red-500 hover:text-red-700" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 text-black">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Name
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter Team Name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mentors
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter mentor usernames (Separated by Commas)"
                value={newMentors}
                onChange={(e) => setNewMentors(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                Interns
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter Intern Usernames (Separated by Commas)"
                value={newInterns}
                onChange={(e) => setNewInterns(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                Panelists
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter Panelist Usernames (Separated by Commas)"
                value={newPanelists}
                onChange={(e) => setNewPanelists(e.target.value)}
              />
            </div>
            <div className="mt-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full h-[200px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                style={{ resize: "none" }}
                placeholder="Enter Team Description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center">
              <button
                className="border p-2 rounded-sm border-red-500 bg-red-500 text-white cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  resetFormValues();
                  closeModal();
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-md hover:bg-gradient-to-l transition-colors"
              >
                Create Team
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const Organization = () => {
  const [organizationName, setOrganizationName] = useState("Microsoft");
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTeamModalOpen, setDeleteTeamModalOpen] = useState(false);
  const [deleteTeamName, setDeleteTeamName] = useState("");

  // Form values
  const [newTeamName, setNewTeamName] = useState("");
  const [newMentors, setNewMentors] = useState("");
  const [newInterns, setNewInterns] = useState("");
  const [newPanelists, setNewPanelists] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      setError("");

      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("User not found in local storage");
      }

      const { username, userRole } = JSON.parse(storedUser);
      setRole(userRole);

      const response = await fetch(`/api/fetch-teams?username=${username}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch teams");
      }

      const data = await response.json();
      setOrganizationName(data.organizationName);
      setTeams(data.teams);
    } catch (error: any) {
      console.error("Error fetching teams:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTeam = async (teamName: String) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("User not found in local storage");
      }

      const { username } = JSON.parse(storedUser);
      const response = await fetch("/api/delete-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, teamName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete team");
      }

      await fetchTeams(); // Refresh teams after deletion
    } catch (error: any) {
      console.error("Error deleting team:", error);
      setError(error.message || "An unexpected error occurred");
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const resetFormValues = () => {
    setNewTeamName("");
    setNewMentors("");
    setNewInterns("");
    setNewPanelists("");
    setNewDescription("");
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openDeleteTeamModal = () => setDeleteTeamModalOpen(true);
  const closeDeleteTeamModal = () => {
    setDeleteTeamModalOpen(false);
    setDeleteTeamName("");
  };

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
  };

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    closeModal();

    const storedUser = localStorage.getItem("user");
    const { username, organizationId } = JSON.parse(storedUser || "{}");

    const teamData = {
      username,
      teamName: newTeamName,
      mentors: newMentors.split(",").map((m) => m.trim()),
      interns: newInterns.split(",").map((i) => i.trim()),
      panelists: newPanelists.split(",").map((p) => p.trim()),
      description: newDescription,
      organizationName,
      organizationId,
    };

    try {
      const response = await fetch("/api/create-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create team");
      }

      await fetchTeams();
      resetFormValues();
    } catch (error: any) {
      console.error("Error creating team:", error);
      setError(error.message || "An unexpected error occurred");
    }
  };

  const TeamCard = ({ team }: { team: TeamData }) => (
    <div className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="flex justify-between items-center">
        <div className="text-black">
          <h4>{team.teamName}</h4>
          <h6 className="text-gray-400">{team.organizationName}</h6>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-[10px] h-[10px] rounded-full"
            style={{ backgroundColor: getStatusColor(team.status) }}
          />
          <span>
            <h4 className="text-black">{getStatusText(team.status)}</h4>
          </span>
        </div>
      </div>
      <div className="mt-4 flex w-full items-start justify-center text-black flex-col md:flex-row">
        <div className="flex items-center justify-between w-full md:w-[50%] gap-[10px]">
          <div className="flex items-center justify-between">
            <p className="mr-[4px]">Mentors:</p>
            <p>{team.mentors.length}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="mr-[4px]">Interns:</p>
            <p>{team.interns.length}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="mr-[4px]">Panelists:</p>
            <p>{team.panelists.length}</p>
          </div>
        </div>
        <div className="flex justify-center md:justify-end items-center w-full gap-[25px]">
          <button
            className="my-2 text-white bg-red-500 cursor-pointer rounded-sm max-w-[300px] p-2"
            onClick={() => {
              setDeleteTeamName(team.teamName);
              openDeleteTeamModal();
            }}
          >
            Delete Team
          </button>
          <button className="cursor-pointer rounded-sm bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-2">
            Edit Team
          </button>
        </div>
      </div>
    </div>
  );

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
            {role !== "admin" && (
              <button
                onClick={openModal}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 rounded-lg font-bold text-white"
              >
                Create a Team
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 my-2">
        <div className="max-h-[600px] overflow-y-auto">
          {teams.length > 0 ? (
            teams.map((team: TeamData) => (
              <TeamCard key={team._id} team={team} />
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              <h3 className="text-lg font-semibold mb-2">No Teams Found</h3>
              <p className="text-sm">
                It seems there are no teams available in this organization.
              </p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <CreateTeamModal
          closeModal={closeModal}
          resetFormValues={resetFormValues}
          newTeamName={newTeamName}
          setNewTeamName={setNewTeamName}
          newMentors={newMentors}
          setNewMentors={setNewMentors}
          newInterns={newInterns}
          setNewInterns={setNewInterns}
          newPanelists={newPanelists}
          setNewPanelists={setNewPanelists}
          newDescription={newDescription}
          setNewDescription={setNewDescription}
          handleSubmit={handleSubmit}
        />
      )}
      {deleteTeamModalOpen && (
        <DeleteTeamModal
          closeModal={closeDeleteTeamModal}
          teamName={deleteTeamName}
          deleteTeam={deleteTeam}
        />
      )}
    </>
  );
};

export default Organization;
