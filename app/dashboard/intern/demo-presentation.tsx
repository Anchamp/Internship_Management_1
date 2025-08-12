"use client";

import React, { useState, useEffect } from "react";
import {
  Presentation,
  Calendar,
  Clock,
  Users,
  FileText,
  Upload,
  Download,
  Play,
  Edit,
  Trash2,
  Plus,
  Save,
  Send,
  CheckCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Star,
  Video,
  Mic,
  Monitor,
  Loader2,
  ExternalLink,
  X,
} from "lucide-react";

interface DemoPresentation {
  _id: string;
  title: string;
  description: string;
  duration: number;
  scheduledDate?: string;
  scheduledTime?: string;
  presentationFile?: string;
  status: "draft" | "scheduled" | "in-progress" | "completed" | "cancelled";
  teamId: string;
  teamName: string;
  projectTitle?: string;
  attendees: Array<{
    _id: string;
    name: string;
    role: "mentor" | "panelist" | "intern" | "admin";
    email: string;
  }>;
  feedback?: Array<{
    fromUserId: string;
    fromUserName: string;
    rating: number;
    comments: string;
    dateGiven: string;
  }>;
  resources: Array<{
    name: string;
    type: "slides" | "demo-link" | "code-repo" | "document";
    url: string;
    uploadedDate: string;
  }>;
  requirements: Array<{
    item: string;
    completed: boolean;
    notes?: string;
  }>;
}

interface DemoSchedule {
  date: string;
  timeSlots: Array<{
    time: string;
    available: boolean;
    bookedBy?: string;
  }>;
}

export default function DemoPresentation() {
  const [presentations, setPresentations] = useState<DemoPresentation[]>([]);
  const [selectedDemo, setSelectedDemo] = useState<DemoPresentation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "resources" | "feedback">("overview");

  const [newDemo, setNewDemo] = useState<Partial<DemoPresentation>>({
    title: "",
    description: "",
    duration: 15,
    status: "draft",
    attendees: [],
    resources: [],
    requirements: [
      { item: "Presentation slides prepared", completed: false },
      { item: "Demo environment set up", completed: false },
      { item: "Project code ready", completed: false },
      { item: "Documentation complete", completed: false },
    ]
  });

  const [availableSlots, setAvailableSlots] = useState<DemoSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    fetchDemoPresentations();
    generateAvailableSlots();
  }, []);

  const fetchDemoPresentations = async () => {
    try {
      setIsLoading(true);
      
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setError("User not found");
        return;
      }

      const user = JSON.parse(userStr);
      
      // Replace with actual API call when available
      // const response = await fetch(`/api/demo-presentations/intern/${user.username}`);
      // if (!response.ok) {
      //   throw new Error("Failed to fetch demo presentations");
      // }
      // const data = await response.json();
      // setPresentations(data.presentations || []);
      
      // For now, initialize with empty array since API doesn't exist yet
      setPresentations([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAvailableSlots = () => {
    const slots: DemoSchedule[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const timeSlots = [
        { time: "09:00", available: true },
        { time: "10:00", available: true },
        { time: "11:00", available: true },
        { time: "14:00", available: true },
        { time: "15:00", available: true },
        { time: "16:00", available: true },
      ];
      
      slots.push({
        date: date.toISOString().split('T')[0],
        timeSlots
      });
    }
    
    setAvailableSlots(slots);
  };

  const handleCreateDemo = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);
      
      const newDemoData: DemoPresentation = {
        _id: `demo_${Date.now()}`,
        title: newDemo.title || "",
        description: newDemo.description || "",
        duration: newDemo.duration || 15,
        status: "draft",
        teamId: "team1",
        teamName: "Frontend Development Team",
        projectTitle: "E-commerce Platform",
        attendees: [],
        resources: [],
        requirements: newDemo.requirements || [
          { item: "Presentation slides prepared", completed: false },
          { item: "Demo environment set up", completed: false },
          { item: "Project code ready", completed: false },
          { item: "Documentation complete", completed: false },
        ]
      };

      setPresentations([newDemoData, ...presentations]);
      setSelectedDemo(newDemoData);
      setShowDemoForm(false);
      
      setNewDemo({
        title: "",
        description: "",
        duration: 15,
        status: "draft",
        attendees: [],
        resources: [],
        requirements: [
          { item: "Presentation slides prepared", completed: false },
          { item: "Demo environment set up", completed: false },
          { item: "Project code ready", completed: false },
          { item: "Documentation complete", completed: false },
        ]
      });
    } catch (error) {
      console.error('Error creating demo:', error);
      setError('Failed to create demo presentation');
    }
  };

  const handleScheduleDemo = async () => {
    if (!selectedDemo || !selectedDate || !selectedTime) return;

    try {
      const updatedDemo = {
        ...selectedDemo,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        status: "scheduled" as const
      };

      setSelectedDemo(updatedDemo);
      
      // Update presentations list
      setPresentations(presentations.map(p => 
        p._id === updatedDemo._id ? updatedDemo : p
      ));
      
      setShowScheduleModal(false);
      setSelectedDate("");
      setSelectedTime("");
    } catch (error) {
      console.error('Error scheduling demo:', error);
      setError('Failed to schedule demo');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCompletionPercentage = (requirements: Array<{item: string; completed: boolean}>) => {
    if (!requirements || requirements.length === 0) return 0;
    const completed = requirements.filter(req => req.completed).length;
    return Math.round((completed / requirements.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mb-4" />
        <p className="text-gray-500">Loading demo presentations...</p>
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
              <Presentation className="mr-3 h-7 w-7 text-cyan-600" />
              Demo Presentations
            </h2>
            <p className="text-gray-600 mt-1">
              Prepare, schedule, and manage your project demonstration presentations
            </p>
          </div>
          
          <button
            onClick={() => setShowDemoForm(true)}
            className="flex items-center space-x-2 bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Demo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demos List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Your Presentations</h3>
              <p className="text-sm text-gray-500">{presentations.length} presentation(s)</p>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {presentations.length > 0 ? (
                presentations.map((demo) => (
                  <div
                    key={demo._id}
                    onClick={() => setSelectedDemo(demo)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedDemo?._id === demo._id ? "bg-cyan-50 border-r-2 border-cyan-500" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{demo.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(demo.status)}`}>
                        {demo.status}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{demo.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {demo.duration} min
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {demo.teamName}
                        </span>
                      </div>
                      
                      {demo.scheduledDate && (
                        <div className="flex items-center text-xs text-blue-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(demo.scheduledDate).toLocaleDateString()}
                          {demo.scheduledTime && ` at ${demo.scheduledTime}`}
                        </div>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Preparation</span>
                          <span>{getCompletionPercentage(demo.requirements)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-cyan-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${getCompletionPercentage(demo.requirements)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Presentation className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No presentations yet</p>
                  <p className="text-sm text-gray-400">Create your first demo presentation</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Demo Details Panel */}
        <div className="lg:col-span-2">
          {selectedDemo ? (
            <div className="space-y-6">
              {/* Demo Header */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedDemo.title}</h3>
                    <p className="text-gray-600 mt-1">{selectedDemo.teamName} • {selectedDemo.projectTitle}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedDemo.status)}`}>
                      {selectedDemo.status}
                    </span>
                    {selectedDemo.status === "draft" && (
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        <Calendar className="h-3 w-3" />
                        <span>Schedule</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">{selectedDemo.description}</p>

                {/* Tab Navigation */}
                <div className="flex space-x-4 border-b border-gray-200">
                  {[
                    { key: "overview", label: "Overview", icon: Presentation },
                    { key: "schedule", label: "Schedule", icon: Calendar },
                    { key: "resources", label: "Resources", icon: FileText },
                    { key: "feedback", label: "Feedback", icon: MessageSquare }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key as any)}
                      className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                        activeTab === key
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

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Demo Info */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-lg font-semibold mb-4">Presentation Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Duration</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{selectedDemo.duration} minutes</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Attendees</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{selectedDemo.attendees?.length || 0}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Preparation</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{getCompletionPercentage(selectedDemo.requirements)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Preparation Checklist */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-lg font-semibold mb-4">Preparation Checklist</h4>
                    <div className="space-y-3">
                      {selectedDemo.requirements?.map((req, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            req.completed ? "bg-green-100" : "bg-gray-100"
                          }`}>
                            {req.completed && <CheckCircle className="h-3 w-3 text-green-600" />}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${req.completed ? "text-green-900" : "text-gray-900"}`}>
                              {req.item}
                            </p>
                            {req.notes && (
                              <p className="text-sm text-gray-600 mt-1">{req.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attendees */}
                  {selectedDemo.attendees && selectedDemo.attendees.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h4 className="text-lg font-semibold mb-4">Expected Attendees</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedDemo.attendees.map((attendee) => (
                          <div key={attendee._id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              attendee.role === "mentor" ? "bg-blue-100" :
                              attendee.role === "panelist" ? "bg-purple-100" :
                              attendee.role === "admin" ? "bg-red-100" : "bg-green-100"
                            }`}>
                              <span className={`text-sm font-medium ${
                                attendee.role === "mentor" ? "text-blue-600" :
                                attendee.role === "panelist" ? "text-purple-600" :
                                attendee.role === "admin" ? "text-red-600" : "text-green-600"
                              }`}>
                                {attendee.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{attendee.name}</p>
                              <p className="text-sm text-gray-500 capitalize">{attendee.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "schedule" && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h4 className="text-lg font-semibold mb-4">Schedule Information</h4>
                  
                  {selectedDemo.scheduledDate ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-900">Scheduled Demo</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-blue-700">Date:</span>
                            <p className="text-blue-900">{new Date(selectedDemo.scheduledDate).toLocaleDateString()}</p>
                          </div>
                          {selectedDemo.scheduledTime && (
                            <div>
                              <span className="text-sm font-medium text-blue-700">Time:</span>
                              <p className="text-blue-900">{selectedDemo.scheduledTime}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Meeting Details</h5>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Monitor className="h-4 w-4" />
                            <span>Platform: Google Meet / Zoom</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mic className="h-4 w-4" />
                            <span>Audio/Video required</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Video className="h-4 w-4" />
                            <span>Screen sharing enabled</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2">Demo not scheduled yet</p>
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="flex items-center space-x-2 mx-auto px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Schedule Demo</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "resources" && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Resources & Materials</h4>
                    <button className="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                      <Upload className="h-4 w-4" />
                      <span>Upload</span>
                    </button>
                  </div>
                  
                  {selectedDemo.resources && selectedDemo.resources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedDemo.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className={`p-2 rounded-lg ${
                            resource.type === "slides" ? "bg-blue-100" :
                            resource.type === "demo-link" ? "bg-green-100" :
                            resource.type === "code-repo" ? "bg-purple-100" : "bg-yellow-100"
                          }`}>
                            {resource.type === "slides" ? (
                              <Presentation className="h-5 w-5 text-blue-600" />
                            ) : resource.type === "demo-link" ? (
                              <ExternalLink className="h-5 w-5 text-green-600" />
                            ) : resource.type === "code-repo" ? (
                              <FileText className="h-5 w-5 text-purple-600" />
                            ) : (
                              <FileText className="h-5 w-5 text-yellow-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{resource.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{resource.type.replace('-', ' ')}</p>
                            <p className="text-xs text-gray-400">
                              Uploaded: {new Date(resource.uploadedDate).toLocaleDateString()}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2">No resources uploaded yet</p>
                      <p className="text-sm text-gray-400">Upload your presentation slides, demo links, and other materials</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "feedback" && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h4 className="text-lg font-semibold mb-4">Feedback & Evaluation</h4>
                  
                  {selectedDemo.feedback && selectedDemo.feedback.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDemo.feedback.map((feedback, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {feedback.fromUserName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{feedback.fromUserName}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(feedback.dateGiven).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= feedback.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="text-sm font-medium text-gray-600 ml-1">
                                {feedback.rating}/5
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700">{feedback.comments}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2">No feedback yet</p>
                      <p className="text-sm text-gray-400">
                        {selectedDemo.status === "completed" 
                          ? "Feedback will appear here after your presentation"
                          : "Complete your demo presentation to receive feedback"
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Presentation className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Presentation</h3>
              <p className="text-gray-500">Choose a demo from the list to view details and manage resources</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Demo Modal */}
      {showDemoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Create Demo Presentation</h3>
                <button
                  onClick={() => setShowDemoForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCreateDemo(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Presentation Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newDemo.title || ''}
                    onChange={(e) => setNewDemo({...newDemo, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                    required
                    placeholder="e.g., Final Project Demo - E-Commerce Platform"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newDemo.description || ''}
                    onChange={(e) => setNewDemo({...newDemo, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                    rows={4}
                    required
                    placeholder="Describe what you'll be demonstrating and the key features you'll showcase..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <select
                    value={newDemo.duration || 15}
                    onChange={(e) => setNewDemo({...newDemo, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={20}>20 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDemoForm(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
                  >
                    <Save className="h-4 w-4" />
                    <span>Create Demo</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Schedule Demo</h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.date}
                        onClick={() => setSelectedDate(slot.date)}
                        className={`p-2 text-sm rounded-md border ${
                          selectedDate === slot.date
                            ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {new Date(slot.date).toLocaleDateString()}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots
                        .find(slot => slot.date === selectedDate)
                        ?.timeSlots.map((timeSlot) => (
                          <button
                            key={timeSlot.time}
                            onClick={() => setSelectedTime(timeSlot.time)}
                            disabled={!timeSlot.available}
                            className={`p-2 text-sm rounded-md border ${
                              !timeSlot.available
                                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                : selectedTime === timeSlot.time
                                ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {timeSlot.time}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleDemo}
                  disabled={!selectedDate || !selectedTime}
                  className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Demo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}