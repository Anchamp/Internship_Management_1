"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  FileText,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  MapPin,
  Target,
  Activity,
  Loader2,
  Filter,
  Search,
} from "lucide-react";

interface Project {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "on-hold" | "cancelled";
  priority: "low" | "medium" | "high";
  progress: number;
  teamId: string;
  teamName: string;
  technologies: string[];
  objectives: string[];
  deliverables: string[];
  resources: Array<{
    name: string;
    type: "document" | "link" | "tool";
    url: string;
  }>;
  milestones: Array<{
    title: string;
    description: string;
    dueDate: string;
    status: "pending" | "in-progress" | "completed";
  }>;
}

interface Team {
  _id: string;
  teamName: string;
  mentors: Array<{
    _id: string;
    fullName: string;
    email: string;
    department: string;
  }>;
  panelists: Array<{
    _id: string;
    fullName: string;
    email: string;
    department: string;
  }>;
}

export default function ProjectDetails() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showProjectModal, setShowProjectModal] = useState(false);

  useEffect(() => {
    fetchProjectsAndTeams();
  }, []);

  const fetchProjectsAndTeams = async () => {
    try {
      setIsLoading(true);
      const userStr = localStorage.getItem("user");
      
      if (!userStr) {
        setError("User not found");
        return;
      }

      const user = JSON.parse(userStr);

      // Fetch teams first
      const teamsResponse = await fetch(`/api/teams/intern/${user.username}`);
      if (!teamsResponse.ok) {
        throw new Error("Failed to fetch teams");
      }
      const teamsData = await teamsResponse.json();
      setTeams(teamsData.teams || []);

      // Fetch projects based on team assignments
      const projectsResponse = await fetch(`/api/projects/intern/${user.username}`);
      if (!projectsResponse.ok) {
        throw new Error("Failed to fetch projects");
      }
      const projectsData = await projectsResponse.json();
      setProjects(projectsData.projects || []);

      // Auto-select first project if available
      if (projectsData.projects && projectsData.projects.length > 0) {
        setSelectedProject(projectsData.projects[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mb-4" />
        <p className="text-gray-500">Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="mr-3 h-7 w-7 text-cyan-600" />
              Project Details
            </h2>
            <p className="text-gray-600 mt-1">
              View and manage your assigned projects and track progress
            </p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Your Projects</h3>
              <p className="text-sm text-gray-500">{filteredProjects.length} project(s) found</p>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <div
                    key={project._id}
                    onClick={() => setSelectedProject(project)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedProject?._id === project._id ? "bg-cyan-50 border-r-2 border-cyan-500" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{project.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {project.teamName}
                      </span>
                      <span className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-cyan-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No projects found</p>
                  <p className="text-sm text-gray-400">Projects will appear here once assigned</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Details Panel */}
        <div className="lg:col-span-2">
          {selectedProject ? (
            <div className="space-y-6">
              {/* Project Overview */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedProject.title}</h3>
                    <p className="text-gray-600 mt-1">{selectedProject.teamName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}>
                      {selectedProject.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedProject.priority)}`}>
                      {selectedProject.priority} priority
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-6">{selectedProject.description}</p>

                {/* Project Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Timeline</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedProject.startDate).toLocaleDateString()} - {new Date(selectedProject.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-cyan-600 h-2 rounded-full"
                          style={{ width: `${selectedProject.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{selectedProject.progress}%</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Milestones</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedProject.milestones?.filter(m => m.status === "completed").length || 0} / {selectedProject.milestones?.length || 0} completed
                    </p>
                  </div>
                </div>

                {/* Technologies */}
                {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Project Objectives */}
              {selectedProject.objectives && selectedProject.objectives.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Objectives</h4>
                  <div className="space-y-2">
                    {selectedProject.objectives.map((objective, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Target className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{objective}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones */}
              {selectedProject.milestones && selectedProject.milestones.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Milestones</h4>
                  <div className="space-y-4">
                    {selectedProject.milestones.map((milestone, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{milestone.title}</h5>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              milestone.status === "completed" 
                                ? "bg-green-100 text-green-800"
                                : milestone.status === "in-progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {milestone.status}
                            </span>
                            {milestone.status === "completed" && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deliverables */}
              {selectedProject.deliverables && selectedProject.deliverables.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Expected Deliverables</h4>
                  <div className="space-y-2">
                    {selectedProject.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{deliverable}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {selectedProject.resources && selectedProject.resources.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Resources</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProject.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${
                          resource.type === "document" 
                            ? "bg-blue-100"
                            : resource.type === "link"
                            ? "bg-green-100"
                            : "bg-purple-100"
                        }`}>
                          {resource.type === "document" ? (
                            <FileText className="h-4 w-4 text-blue-600" />
                          ) : resource.type === "link" ? (
                            <ExternalLink className="h-4 w-4 text-green-600" />
                          ) : (
                            <Download className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{resource.name}</p>
                          <p className="text-sm text-gray-500 capitalize">{resource.type}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Project</h3>
              <p className="text-gray-500">Choose a project from the list to view detailed information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}