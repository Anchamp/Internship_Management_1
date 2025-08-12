"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Plus,
  Calendar,
  Clock,
  FileText,
  Send,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Eye,
  MessageSquare,
  User,
  BarChart3,
  TrendingUp,
  Loader2,
  X,
} from "lucide-react";

interface WeeklyReport {
  _id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  hoursWorked: number;
  tasksCompleted: string;
  challengesFaced: string;
  nextWeekGoals: string;
  mentorFeedback?: string;
  submittedDate: string;
  status: "draft" | "submitted" | "reviewed" | "approved";
  teamId: string;
  teamName: string;
  projectTitle?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  rating?: number;
}

interface ReportStats {
  totalReports: number;
  submittedReports: number;
  reviewedReports: number;
  averageHours: number;
  averageRating: number;
}

export default function WeeklyReports() {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState<ReportStats>({
    totalReports: 0,
    submittedReports: 0,
    reviewedReports: 0,
    averageHours: 0,
    averageRating: 0,
  });

  const [newReport, setNewReport] = useState<Partial<WeeklyReport>>({
    weekNumber: getCurrentWeekNumber(),
    startDate: "",
    endDate: "",
    hoursWorked: 0,
    tasksCompleted: "",
    challengesFaced: "",
    nextWeekGoals: "",
    status: "draft",
  });

  function getCurrentWeekNumber() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  }

  function getWeekDates(weekNumber: number) {
    const now = new Date();
    const currentWeek = getCurrentWeekNumber();
    const daysDiff = (weekNumber - currentWeek) * 7;
    
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + daysDiff - now.getDay() + 1);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  }

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (newReport.weekNumber) {
      const weekDates = getWeekDates(newReport.weekNumber);
      setNewReport(prev => ({
        ...prev,
        startDate: weekDates.start,
        endDate: weekDates.end
      }));
    }
  }, [newReport.weekNumber]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const userStr = localStorage.getItem("user");
      
      if (!userStr) {
        setError("User not found");
        return;
      }

      const user = JSON.parse(userStr);
      
      // Replace with actual API call when available
      // const response = await fetch(`/api/weekly-reports/intern/${user.username}`);
      // if (!response.ok) {
      //   throw new Error("Failed to fetch reports");
      // }
      // const data = await response.json();
      // setReports(data.reports || []);
      
      // For now, initialize with empty array since API doesn't exist yet
      setReports([]);
      calculateStats([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (reportsList: WeeklyReport[]) => {
    const totalReports = reportsList.length;
    const submittedReports = reportsList.filter(r => r.status !== "draft").length;
    const reviewedReports = reportsList.filter(r => r.status === "reviewed" || r.status === "approved").length;
    const averageHours = totalReports > 0 ? reportsList.reduce((sum, r) => sum + r.hoursWorked, 0) / totalReports : 0;
    const ratedReports = reportsList.filter(r => r.rating);
    const averageRating = ratedReports.length > 0 ? ratedReports.reduce((sum, r) => sum + (r.rating || 0), 0) / ratedReports.length : 0;

    setStats({
      totalReports,
      submittedReports,
      reviewedReports,
      averageHours: Math.round(averageHours * 10) / 10,
      averageRating: Math.round(averageRating * 10) / 10,
    });
  };

  const handleSubmitReport = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);
      
      const reportData = {
        ...newReport,
        _id: `report_${Date.now()}`,
        submittedDate: new Date().toISOString(),
        status: "submitted" as const,
        teamId: "team1",
        teamName: "Frontend Development Team",
        projectTitle: "E-commerce Platform"
      };

      const newReportComplete = reportData as WeeklyReport;
      setReports([newReportComplete, ...reports]);
      setShowReportForm(false);
      
      // Reset form with next week number
      setNewReport({
        weekNumber: getCurrentWeekNumber() + 1,
        startDate: "",
        endDate: "",
        hoursWorked: 0,
        tasksCompleted: "",
        challengesFaced: "",
        nextWeekGoals: "",
        status: "draft",
      });
      
      calculateStats([newReportComplete, ...reports]);
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "reviewed":
        return "bg-purple-100 text-purple-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.tasksCompleted.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mb-4" />
        <p className="text-gray-500">Loading weekly reports...</p>
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
              <ClipboardList className="mr-3 h-7 w-7 text-cyan-600" />
              Weekly Progress Reports
            </h2>
            <p className="text-gray-600 mt-1">
              Track your weekly progress and submit reports to your mentors
            </p>
          </div>
          
          <button
            onClick={() => setShowReportForm(true)}
            className="flex items-center space-x-2 bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalReports}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Submitted</p>
              <p className="text-xl font-bold text-gray-900">{stats.submittedReports}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Reviewed</p>
              <p className="text-xl font-bold text-gray-900">{stats.reviewedReports}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg. Hours</p>
              <p className="text-xl font-bold text-gray-900">{stats.averageHours}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
              <p className="text-xl font-bold text-gray-900">{stats.averageRating || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search reports by team, tasks, or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Report History</h3>
          <p className="text-sm text-gray-500">{filteredReports.length} report(s) found</p>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <div key={report._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <ClipboardList className="h-4 w-4 text-cyan-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Week {report.weekNumber}</h4>
                      <p className="text-sm text-gray-500">{report.teamName} • {report.projectTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {report.rating && (
                      <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded">
                        <BarChart3 className="h-3 w-3 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-700">{report.rating}/5</span>
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowReportDetails(true);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Period:</span>
                    <p className="text-gray-600">
                      {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Hours Worked:</span>
                    <p className="text-gray-600">{report.hoursWorked} hours</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Submitted:</span>
                    <p className="text-gray-600">{new Date(report.submittedDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="font-medium text-gray-700">Tasks Completed:</span>
                  <p className="text-gray-600 mt-1 line-clamp-2">{report.tasksCompleted}</p>
                </div>

                {report.mentorFeedback && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Mentor Feedback</span>
                    </div>
                    <p className="text-blue-800 text-sm">{report.mentorFeedback}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No reports found</p>
              <p className="text-sm text-gray-400">Submit your first weekly report to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* New Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Submit Weekly Report</h3>
                <button
                  onClick={() => setShowReportForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSubmitReport(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Week Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={newReport.weekNumber || ''}
                      onChange={(e) => setNewReport({...newReport, weekNumber: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                      min="1"
                      max="52"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hours Worked <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={newReport.hoursWorked || ''}
                      onChange={(e) => setNewReport({...newReport, hoursWorked: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                      min="0"
                      max="60"
                      step="0.5"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newReport.startDate || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={newReport.endDate || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tasks Completed <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newReport.tasksCompleted || ''}
                    onChange={(e) => setNewReport({...newReport, tasksCompleted: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                    rows={4}
                    required
                    placeholder="Describe what you accomplished this week, including specific tasks, milestones reached, and deliverables completed..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Challenges Faced
                  </label>
                  <textarea
                    value={newReport.challengesFaced || ''}
                    onChange={(e) => setNewReport({...newReport, challengesFaced: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                    rows={3}
                    placeholder="Describe any obstacles, technical issues, or learning challenges you encountered..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Week Goals <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newReport.nextWeekGoals || ''}
                    onChange={(e) => setNewReport({...newReport, nextWeekGoals: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                    rows={3}
                    required
                    placeholder="Outline your objectives and planned activities for the upcoming week..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Report</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {showReportDetails && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Week {selectedReport.weekNumber} Report</h3>
                  <p className="text-gray-600">{selectedReport.teamName} • {selectedReport.projectTitle}</p>
                </div>
                <button
                  onClick={() => setShowReportDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Report Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Report Period</span>
                    <p className="text-gray-900">
                      {new Date(selectedReport.startDate).toLocaleDateString()} - {new Date(selectedReport.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Hours Worked</span>
                    <p className="text-gray-900">{selectedReport.hoursWorked} hours</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                        {selectedReport.status}
                      </span>
                      {selectedReport.rating && (
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{selectedReport.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tasks Completed */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Tasks Completed</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{selectedReport.tasksCompleted}</p>
                  </div>
                </div>

                {/* Challenges Faced */}
                {selectedReport.challengesFaced && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Challenges Faced</h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">{selectedReport.challengesFaced}</p>
                    </div>
                  </div>
                )}

                {/* Next Week Goals */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Next Week Goals</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{selectedReport.nextWeekGoals}</p>
                  </div>
                </div>

                {/* Mentor Feedback */}
                {selectedReport.mentorFeedback && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Mentor Feedback</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Mentor Comments</span>
                      </div>
                      <p className="text-blue-800 leading-relaxed">{selectedReport.mentorFeedback}</p>
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {selectedReport.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="h-5 w-5 text-gray-500" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{attachment.name}</p>
                            <p className="text-sm text-gray-500">{attachment.type}</p>
                          </div>
                          <Download className="h-4 w-4 text-gray-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowReportDetails(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}