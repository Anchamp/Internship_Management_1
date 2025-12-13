"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  Clock,
  Users,
  MapPin,
  FileText,
  Star,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  X,
  Save,
  UserPlus,
  Award,
  BarChart3,
  Download,
  Send,
  Filter,
  Search,
  Presentation,
  ExternalLink,
} from "lucide-react";

interface DemoPresentation {
  _id: string;
  title: string;
  description: string;
  teamName: string;
  createdBy: string;
  scheduledDate: string;
  duration: number;
  location: string;
  meetingLink: string;
  requirements: string[];
  evaluationCriteria: Array<{
    criterion: string;
    maxPoints: number;
    description: string;
  }>;
  assignedInterns: Array<{
    internUsername: string;
    assignedAt: string;
    status: string;
    presentationOrder: number;
  }>;
  submissions: Array<{
    internUsername: string;
    submittedAt: string;
    presentationTitle: string;
    materials: Array<{
      fileName: string;
      fileUrl: string;
      fileType: string;
    }>;
    notes: string;
  }>;
  evaluations: Array<{
    internUsername: string;
    evaluatedBy: string;
    evaluatedAt: string;
    scores: Array<{
      criterion: string;
      points: number;
      maxPoints: number;
    }>;
    totalScore: number;
    maxTotalScore: number;
    comments: string;
    strengths: string[];
    improvements: string[];
    overallRating: number;
  }>;
  status: string;
  tags: string[];
  assignedInternsCount: number;
  submissionsCount: number;
  evaluationsCount: number;
  isPast: boolean;
  isUpcoming: boolean;
  isToday: boolean;
}

interface Team {
  teamName: string;
  interns: string[];
  mentors: string[];
}

export default function MentorDemoPresentations() {
  const [presentations, setPresentations] = useState<DemoPresentation[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [availableInterns, setAvailableInterns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<DemoPresentation | null>(null);
  const [selectedInternForEval, setSelectedInternForEval] = useState<string>("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    teamName: "",
    scheduledDate: "",
    duration: 30,
    location: "Virtual",
    meetingLink: "",
    requirements: [""],
    evaluationCriteria: [{ criterion: "", maxPoints: 10, description: "" }],
    assignedInterns: [] as string[],
    tags: [] as string[],
  });

  const [evaluationData, setEvaluationData] = useState({
    scores: [] as Array<{ criterion: string; points: number; maxPoints: number }>,
    comments: "",
    strengths: [""],
    improvements: [""],
    overallRating: 5,
  });

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setError("User not authenticated");
        return;
      }

      const user = JSON.parse(userStr);
      setCurrentUser(user);

      await Promise.all([
        fetchPresentations(user.username),
        fetchTeams(user.username),
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPresentations = async (username: string) => {
    try {
      const response = await fetch(`/api/demo-presentations?username=${username}&role=employee`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch presentations");
      }

      const data = await response.json();
      setPresentations(data.demoPresentations || []);
    } catch (err: any) {
      throw new Error(`Failed to fetch presentations: ${err.message}`);
    }
  };

  const fetchTeams = async (username: string) => {
    try {
      const response = await fetch(`/api/fetch-team?username=${username}`);
      if (!response.ok) {
        console.warn("Failed to fetch teams");
        return;
      }

      const data = await response.json();
      if (data.success && data.team) {
        setTeams([data.team]);
        setAvailableInterns(data.team.interns || []);
      }
    } catch (err: any) {
      console.warn("Failed to fetch teams:", err.message);
    }
  };

  const handleCreatePresentation = async () => {
    try {
      if (!currentUser) throw new Error("User not authenticated");

      // Validation
      if (!formData.title.trim() || !formData.description.trim() || !formData.teamName || !formData.scheduledDate) {
        setError("Please fill in all required fields");
        return;
      }

      if (formData.evaluationCriteria.every(criteria => !criteria.criterion.trim())) {
        setError("Please add at least one evaluation criterion");
        return;
      }

      const createData = {
        ...formData,
        organizationName: currentUser.organizationName,
        organizationId: currentUser.organizationId,
        createdBy: currentUser.username,
        requirements: formData.requirements.filter(req => req.trim() !== ""),
        evaluationCriteria: formData.evaluationCriteria.filter(criteria => criteria.criterion.trim() !== ""),
      };

      const response = await fetch("/api/demo-presentations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create presentation");
      }

      await fetchPresentations(currentUser.username);
      setShowCreateModal(false);
      resetForm();
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdatePresentation = async () => {
    try {
      if (!currentUser || !selectedPresentation) return;

      const updateData = {
        presentationId: selectedPresentation._id,
        username: currentUser.username,
        updates: {
          ...formData,
          requirements: formData.requirements.filter(req => req.trim() !== ""),
          evaluationCriteria: formData.evaluationCriteria.filter(criteria => criteria.criterion.trim() !== ""),
        },
      };

      const response = await fetch("/api/demo-presentations/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update presentation");
      }

      await fetchPresentations(currentUser.username);
      setShowEditModal(false);
      setSelectedPresentation(null);
      resetForm();
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEvaluatePresentation = async () => {
    try {
      if (!currentUser || !selectedPresentation || !selectedInternForEval) return;

      // Validation
      if (evaluationData.comments.trim() === "") {
        setError("Please provide evaluation comments");
        return;
      }

      const evalData = {
        presentationId: selectedPresentation._id,
        internUsername: selectedInternForEval,
        evaluatedBy: currentUser.username,
        scores: evaluationData.scores,
        comments: evaluationData.comments,
        strengths: evaluationData.strengths.filter(s => s.trim() !== ""),
        improvements: evaluationData.improvements.filter(i => i.trim() !== ""),
        overallRating: evaluationData.overallRating,
      };

      const response = await fetch("/api/demo-presentations/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit evaluation");
      }

      await fetchPresentations(currentUser.username);
      setShowEvaluateModal(false);
      setSelectedPresentation(null);
      setSelectedInternForEval("");
      resetEvaluationForm();
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      teamName: "",
      scheduledDate: "",
      duration: 30,
      location: "Virtual",
      meetingLink: "",
      requirements: [""],
      evaluationCriteria: [{ criterion: "", maxPoints: 10, description: "" }],
      assignedInterns: [],
      tags: [],
    });
  };

  const resetEvaluationForm = () => {
    setEvaluationData({
      scores: [],
      comments: "",
      strengths: [""],
      improvements: [""],
      overallRating: 5,
    });
  };

  const openEditModal = (presentation: DemoPresentation) => {
    setSelectedPresentation(presentation);
    setFormData({
      title: presentation.title,
      description: presentation.description,
      teamName: presentation.teamName,
      scheduledDate: presentation.scheduledDate.split('T')[0],
      duration: presentation.duration,
      location: presentation.location,
      meetingLink: presentation.meetingLink,
      requirements: presentation.requirements.length > 0 ? presentation.requirements : [""],
      evaluationCriteria: presentation.evaluationCriteria.length > 0 ? presentation.evaluationCriteria : [{ criterion: "", maxPoints: 10, description: "" }],
      assignedInterns: presentation.assignedInterns.map(a => a.internUsername),
      tags: presentation.tags,
    });
    setShowEditModal(true);
  };

  const openEvaluateModal = (presentation: DemoPresentation, internUsername: string) => {
    setSelectedPresentation(presentation);
    setSelectedInternForEval(internUsername);
    
    // Initialize scores based on evaluation criteria
    const initialScores = presentation.evaluationCriteria.map(criteria => ({
      criterion: criteria.criterion,
      points: 0,
      maxPoints: criteria.maxPoints,
    }));
    
    setEvaluationData({
      scores: initialScores,
      comments: "",
      strengths: [""],
      improvements: [""],
      overallRating: 5,
    });
    setShowEvaluateModal(true);
  };

  const openViewModal = (presentation: DemoPresentation) => {
    setSelectedPresentation(presentation);
    setShowViewModal(true);
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, ""]
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const addEvaluationCriteria = () => {
    setFormData(prev => ({
      ...prev,
      evaluationCriteria: [...prev.evaluationCriteria, { criterion: "", maxPoints: 10, description: "" }]
    }));
  };

  const removeEvaluationCriteria = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evaluationCriteria: prev.evaluationCriteria.filter((_, i) => i !== index)
    }));
  };

  const updateEvaluationCriteria = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      evaluationCriteria: prev.evaluationCriteria.map((criteria, i) => 
        i === index ? { ...criteria, [field]: value } : criteria
      )
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-3 w-3" />;
      case 'scheduled': return <Calendar className="h-3 w-3" />;
      case 'in_progress': return <PlayCircle className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'cancelled': return <X className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const filteredPresentations = presentations.filter(presentation => {
    const matchesFilter = filter === "all" || presentation.status === filter;
    const matchesSearch = presentation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         presentation.teamName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Presentation className="mr-3 h-7 w-7 text-cyan-600" />
              Demo Presentations
            </h2>
            <p className="text-gray-600 mt-1">
              Create, schedule, and evaluate intern demo presentations
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Demo</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 flex-1">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search presentations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Presentations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPresentations.map((presentation) => (
          <div key={presentation._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{presentation.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{presentation.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(presentation.status)}`}>
                      {getStatusIcon(presentation.status)}
                      <span className="ml-1">{presentation.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => openViewModal(presentation)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(presentation)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{new Date(presentation.scheduledDate).toLocaleDateString()}</span>
                  <Clock className="h-4 w-4 ml-4 mr-2 flex-shrink-0" />
                  <span>{presentation.duration} min</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{presentation.location}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{presentation.assignedInternsCount} interns assigned</span>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-gray-100">
                  <div className="bg-blue-50 rounded-md p-2">
                    <div className="text-lg font-semibold text-blue-600">{presentation.submissionsCount}</div>
                    <div className="text-xs text-blue-600">Submissions</div>
                  </div>
                  <div className="bg-green-50 rounded-md p-2">
                    <div className="text-lg font-semibold text-green-600">{presentation.evaluationsCount}</div>
                    <div className="text-xs text-green-600">Evaluated</div>
                  </div>
                  <div className="bg-purple-50 rounded-md p-2">
                    <div className="text-lg font-semibold text-purple-600">{presentation.assignedInternsCount - presentation.evaluationsCount}</div>
                    <div className="text-xs text-purple-600">Pending</div>
                  </div>
                </div>

                {/* Assigned Interns */}
                {presentation.assignedInterns.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Interns</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {presentation.assignedInterns.slice(0, 3).map((assignment) => {
                        const hasEvaluation = presentation.evaluations.some(
                          evaluation => evaluation.internUsername === assignment.internUsername
                        );
                        
                        return (
                          <div key={assignment.internUsername} className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm">
                            <span className="text-gray-700 truncate">{assignment.internUsername}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                hasEvaluation 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {hasEvaluation ? 'Evaluated' : 'Pending'}
                              </span>
                              {!hasEvaluation && presentation.status === 'completed' && (
                                <button
                                  onClick={() => openEvaluateModal(presentation, assignment.internUsername)}
                                  className="p-1 text-cyan-600 hover:bg-cyan-100 rounded"
                                  title="Evaluate"
                                >
                                  <Star className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {presentation.assignedInterns.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{presentation.assignedInterns.length - 3} more interns
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPresentations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Presentation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No presentations found</h3>
          <p className="text-gray-600 mb-4">
            {filter === "all" ? "Create your first demo presentation to get started." : `No presentations with status "${filter}".`}
          </p>
          {filter === "all" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Demo Presentation</span>
            </button>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreatePresentationModal
          formData={formData}
          setFormData={setFormData}
          teams={teams}
          availableInterns={availableInterns}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
            setError("");
          }}
          onSubmit={handleCreatePresentation}
          addRequirement={addRequirement}
          removeRequirement={removeRequirement}
          updateRequirement={updateRequirement}
          addEvaluationCriteria={addEvaluationCriteria}
          removeEvaluationCriteria={removeEvaluationCriteria}
          updateEvaluationCriteria={updateEvaluationCriteria}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPresentation && (
        <EditPresentationModal
          formData={formData}
          setFormData={setFormData}
          selectedPresentation={selectedPresentation}
          teams={teams}
          availableInterns={availableInterns}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPresentation(null);
            resetForm();
            setError("");
          }}
          onSubmit={handleUpdatePresentation}
          addRequirement={addRequirement}
          removeRequirement={removeRequirement}
          updateRequirement={updateRequirement}
          addEvaluationCriteria={addEvaluationCriteria}
          removeEvaluationCriteria={removeEvaluationCriteria}
          updateEvaluationCriteria={updateEvaluationCriteria}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedPresentation && (
        <ViewPresentationModal
          presentation={selectedPresentation}
          onClose={() => {
            setShowViewModal(false);
            setSelectedPresentation(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            openEditModal(selectedPresentation);
          }}
        />
      )}

      {/* Evaluation Modal */}
      {showEvaluateModal && selectedPresentation && selectedInternForEval && (
        <EvaluationModal
          presentation={selectedPresentation}
          internUsername={selectedInternForEval}
          evaluationData={evaluationData}
          setEvaluationData={setEvaluationData}
          onClose={() => {
            setShowEvaluateModal(false);
            setSelectedPresentation(null);
            setSelectedInternForEval("");
            resetEvaluationForm();
            setError("");
          }}
          onSubmit={handleEvaluatePresentation}
        />
      )}
    </div>
  );
}

// Modal Components
// Modal Components
const CreatePresentationModal = ({ formData, setFormData, teams, availableInterns, onClose, onSubmit, addRequirement, removeRequirement, updateRequirement, addEvaluationCriteria, removeEvaluationCriteria, updateEvaluationCriteria }: any) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Create Demo Presentation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Enter presentation title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.teamName}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, teamName: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Select a team</option>
              {teams.map((team: Team) => (
                <option key={team.teamName} value={team.teamName}>
                  {team.teamName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, scheduledDate: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, location: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Link
          </label>
          <input
            type="url"
            value={formData.meetingLink}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, meetingLink: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requirements
          </label>
          {formData.requirements.map((req: string, index: number) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={req}
                onChange={(e) => updateRequirement(index, e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter requirement..."
              />
              {formData.requirements.length > 1 && (
                <button
                  onClick={() => removeRequirement(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addRequirement}
            className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
          >
            + Add Requirement
          </button>
        </div>

        {/* Evaluation Criteria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Evaluation Criteria <span className="text-red-500">*</span>
          </label>
          {formData.evaluationCriteria.map((criteria: any, index: number) => (
            <div key={index} className="space-y-2 mb-3 p-3 border border-gray-200 rounded-md">
              <input
                type="text"
                value={criteria.criterion}
                onChange={(e) => updateEvaluationCriteria(index, 'criterion', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Criterion name..."
              />
              <input
                type="number"
                value={criteria.maxPoints}
                onChange={(e) => updateEvaluationCriteria(index, 'maxPoints', parseInt(e.target.value) || 10)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Max points"
                min="1"
                max="100"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={criteria.description}
                  onChange={(e) => updateEvaluationCriteria(index, 'description', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Description (optional)"
                />
                {formData.evaluationCriteria.length > 1 && (
                  <button
                    onClick={() => removeEvaluationCriteria(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={addEvaluationCriteria}
            className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
          >
            + Add Criteria
          </button>
        </div>

        {/* Assigned Interns */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Interns
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
            {availableInterns.map((intern: string) => (
              <label key={intern} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.assignedInterns.includes(intern)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData((prev: any) => ({
                        ...prev,
                        assignedInterns: [...prev.assignedInterns, intern]
                      }));
                    } else {
                      setFormData((prev: any) => ({
                        ...prev,
                        assignedInterns: prev.assignedInterns.filter((i: string) => i !== intern)
                      }));
                    }
                  }}
                  className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-sm text-gray-700">{intern}</span>
              </label>
            ))}
          </div>
          {availableInterns.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">No interns available in your teams.</p>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={!formData.title || !formData.description || !formData.teamName || !formData.scheduledDate}
          className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Create Presentation
        </button>
      </div>
    </div>
  </div>
);

const EditPresentationModal = ({ formData, setFormData, selectedPresentation, teams, availableInterns, onClose, onSubmit, addRequirement, removeRequirement, updateRequirement, addEvaluationCriteria, removeEvaluationCriteria, updateEvaluationCriteria }: any) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Edit Demo Presentation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Same form fields as create modal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team
            </label>
            <select
              value={formData.teamName}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, teamName: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              disabled
            >
              <option value={formData.teamName}>{formData.teamName}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, scheduledDate: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, location: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Link
          </label>
          <input
            type="url"
            value={formData.meetingLink}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, meetingLink: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
        >
          Update Presentation
        </button>
      </div>
    </div>
  </div>
);

const ViewPresentationModal = ({ presentation, onClose, onEdit }: any) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{presentation.title}</h2>
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="px-3 py-1 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 text-sm"
            >
              Edit
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Description:</span>
                <p className="text-gray-900">{presentation.description}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Team:</span>
                <p className="text-gray-900">{presentation.teamName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Date & Time:</span>
                <p className="text-gray-900">{new Date(presentation.scheduledDate).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Duration:</span>
                <p className="text-gray-900">{presentation.duration} minutes</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Location:</span>
                <p className="text-gray-900">{presentation.location}</p>
              </div>
              {presentation.meetingLink && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Meeting Link:</span>
                  <a
                    href={presentation.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 hover:text-cyan-700 flex items-center"
                  >
                    Join Meeting <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Requirements</h3>
            {presentation.requirements.length > 0 ? (
              <ul className="space-y-2">
                {presentation.requirements.map((req: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span className="text-gray-900">{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No requirements specified</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Evaluation Criteria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presentation.evaluationCriteria.map((criteria: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{criteria.criterion}</h4>
                  <span className="text-sm font-medium text-cyan-600">{criteria.maxPoints} pts</span>
                </div>
                {criteria.description && (
                  <p className="text-sm text-gray-600">{criteria.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Assigned Interns ({presentation.assignedInterns.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presentation.assignedInterns.map((assignment: any) => {
              const hasEvaluation = presentation.evaluations.some(
                (evaluation: any) => evaluation.internUsername === assignment.internUsername
              );
              
              return (
                <div key={assignment.internUsername} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{assignment.internUsername}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      hasEvaluation 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {hasEvaluation ? 'Evaluated' : 'Pending'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const EvaluationModal = ({ presentation, internUsername, evaluationData, setEvaluationData, onClose, onSubmit }: any) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Evaluate Presentation</h2>
            <p className="text-sm text-gray-600 mt-1">
              {internUsername} - {presentation.title}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Scoring */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Evaluation Scores
          </label>
          <div className="space-y-4">
            {evaluationData.scores.map((score: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{score.criterion}</h4>
                  <p className="text-sm text-gray-600">Max: {score.maxPoints} points</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={score.points}
                    onChange={(e) => {
                      const newPoints = Math.min(Math.max(0, parseInt(e.target.value) || 0), score.maxPoints);
                      setEvaluationData((prev: any) => ({
                        ...prev,
                        scores: prev.scores.map((s: any, i: number) => 
                          i === index ? { ...s, points: newPoints } : s
                        )
                      }));
                    }}
                    className="w-20 p-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    min="0"
                    max={score.maxPoints}
                  />
                  <span className="text-gray-500">/ {score.maxPoints}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating (1-5 stars)
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setEvaluationData((prev: any) => ({ ...prev, overallRating: rating }))}
                className={`p-1 ${
                  rating <= evaluationData.overallRating
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
              >
                <Star className="h-6 w-6 fill-current" />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {evaluationData.overallRating} star{evaluationData.overallRating !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments <span className="text-red-500">*</span>
          </label>
          <textarea
            value={evaluationData.comments}
            onChange={(e) => setEvaluationData((prev: any) => ({ ...prev, comments: e.target.value }))}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Provide detailed feedback about the presentation..."
          />
        </div>

        {/* Strengths */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Strengths
          </label>
          {evaluationData.strengths.map((strength: string, index: number) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={strength}
                onChange={(e) => {
                  setEvaluationData((prev: any) => ({
                    ...prev,
                    strengths: prev.strengths.map((s: string, i: number) => i === index ? e.target.value : s)
                  }));
                }}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter a strength..."
              />
              {evaluationData.strengths.length > 1 && (
                <button
                  onClick={() => {
                    setEvaluationData((prev: any) => ({
                      ...prev,
                      strengths: prev.strengths.filter((_: string, i: number) => i !== index)
                    }));
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => {
              setEvaluationData((prev: any) => ({
                ...prev,
                strengths: [...prev.strengths, ""]
              }));
            }}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            + Add Strength
          </button>
        </div>

        {/* Areas for Improvement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Areas for Improvement
          </label>
          {evaluationData.improvements.map((improvement: string, index: number) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={improvement}
                onChange={(e) => {
                  setEvaluationData((prev: any) => ({
                    ...prev,
                    improvements: prev.improvements.map((imp: string, i: number) => i === index ? e.target.value : imp)
                  }));
                }}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter area for improvement..."
              />
              {evaluationData.improvements.length > 1 && (
                <button
                  onClick={() => {
                    setEvaluationData((prev: any) => ({
                      ...prev,
                      improvements: prev.improvements.filter((_: string, i: number) => i !== index)
                    }));
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => {
              setEvaluationData((prev: any) => ({
                ...prev,
                improvements: [...prev.improvements, ""]
              }));
            }}
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            + Add Improvement Area
          </button>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={!evaluationData.comments.trim()}
          className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Submit Evaluation
        </button>
      </div>
    </div>
  </div>
);full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Enter presentation title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.teamName}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, teamName: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
