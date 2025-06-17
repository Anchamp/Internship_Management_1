"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  FileText,
  Upload,
  Calendar,
  Building,
  MapPin,
  DollarSign,
  Users,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
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
  eligibility: string;
  category: string;
  organizationId: string;
}

interface InternshipApplicationProps {
  selectedInternship: InternshipPost | null;
  onBack: () => void;
  onApplicationSubmitted: () => void;
}

export default function InternshipApplication({ 
  selectedInternship, 
  onBack, 
  onApplicationSubmitted 
}: InternshipApplicationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    whyInterestedReason: "",
    relevantExperience: "",
    expectedOutcome: "",
    availableStartDate: "",
    additionalComments: "",
  });
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        setProfileError("User not authenticated");
        return;
      }

      const user = JSON.parse(userData);
      const response = await fetch(`/api/users/${user.username}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      if (data.user) {
        setUserProfile(data.user);
        
        // Check if profile is complete
        const requiredFields = ['fullName', 'email', 'phone', 'university', 'degree', 'major', 'graduationYear', 'resumeFile'];
        const missingFields = requiredFields.filter(field => !data.user[field]);
        
        if (missingFields.length > 0) {
          setProfileError(`Please complete your profile first. Missing: ${missingFields.join(', ')}`);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfileError("Failed to load user profile");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInternship || !userProfile) {
      return;
    }

    if (profileError) {
      alert("Please complete your profile before applying");
      return;
    }

    try {
      setIsSubmitting(true);

      const applicationPayload = {
        internshipId: selectedInternship._id,
        internshipTitle: selectedInternship.title,
        organizationName: selectedInternship.organizationName,
        organizationId: selectedInternship.organizationId,
        applicantUsername: userProfile.username,
        applicantEmail: userProfile.email,
        applicantName: userProfile.fullName,
        applicationData: {
          ...applicationData,
          appliedDate: new Date().toISOString(),
          status: "pending"
        },
        userProfile: {
          fullName: userProfile.fullName,
          email: userProfile.email,
          phone: userProfile.phone,
          university: userProfile.university,
          degree: userProfile.degree,
          major: userProfile.major,
          graduationYear: userProfile.graduationYear,
          skills: userProfile.skills,
          resumeFile: userProfile.resumeFile,
          gpa: userProfile.gpa,
          portfolioLinks: userProfile.portfolioLinks,
          internshipGoals: userProfile.internshipGoals,
          previousExperience: userProfile.previousExperience
        }
      };

      const response = await fetch("/api/internships/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      setApplicationSubmitted(true);
      
      // Call the callback to refresh the parent component
      setTimeout(() => {
        onApplicationSubmitted();
      }, 2000);

    } catch (error: any) {
      console.error("Error submitting application:", error);
      alert(`Failed to submit application: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedInternship) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No Internship Selected
        </h3>
        <p className="text-gray-500 mb-4">
          Please select an internship to apply for.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
        >
          Back to Browse
        </button>
      </div>
    );
  }

  if (applicationSubmitted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Application Submitted Successfully!
        </h2>
        <p className="text-gray-600 mb-4">
          Your application for <strong>{selectedInternship.title}</strong> at{" "}
          <strong>{selectedInternship.organizationName}</strong> has been submitted.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          You will receive an email confirmation shortly. The organization will review your application and contact you if selected.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
        >
          Browse More Internships
        </button>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-700 mb-2">
            Profile Incomplete
          </h3>
          <p className="text-red-600">{profileError}</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onBack}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Back to Browse
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/intern?tab=profile-settings'}
            className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
          >
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-md hover:bg-gray-100 mr-3"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Apply for Internship
          </h1>
        </div>

        {/* Internship Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden">
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
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedInternship.title}
              </h3>
              <p className="text-gray-600 mb-2">
                {selectedInternship.organizationName} • {selectedInternship.department}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(selectedInternship.startDate)} - {formatDate(selectedInternship.endDate)}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {selectedInternship.mode === "remote" 
                    ? "Remote" 
                    : selectedInternship.location.city 
                      ? `${selectedInternship.location.city}, ${selectedInternship.location.country}`
                      : "Location TBD"}
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {selectedInternship.isPaid 
                    ? selectedInternship.stipend || "Paid" 
                    : "Unpaid"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <form onSubmit={handleSubmitApplication} className="space-y-6">
        {/* Personal Information Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Personal Information
          </h2>
          {userProfile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600 mr-2">Name:</span>
                <span className="font-medium">{userProfile.fullName}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600 mr-2">Email:</span>
                <span className="font-medium">{userProfile.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600 mr-2">Phone:</span>
                <span className="font-medium">{userProfile.phone}</span>
              </div>
              <div className="flex items-center">
                <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600 mr-2">University:</span>
                <span className="font-medium">{userProfile.university}</span>
              </div>
            </div>
          )}
        </div>

        {/* Cover Letter */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cover Letter
          </h2>
          <textarea
            name="coverLetter"
            value={applicationData.coverLetter}
            onChange={handleInputChange}
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
            placeholder="Write a compelling cover letter explaining why you're the perfect fit for this internship..."
          />
        </div>

        {/* Application Questions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Application Questions
          </h2>
          
          <div className="space-y-6">
            {/* Why Interested */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why are you interested in this internship? <span className="text-red-500">*</span>
              </label>
              <textarea
                name="whyInterestedReason"
                value={applicationData.whyInterestedReason}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
                placeholder="Explain what interests you about this position and organization..."
              />
            </div>

            {/* Relevant Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relevant Experience
              </label>
              <textarea
                name="relevantExperience"
                value={applicationData.relevantExperience}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
                placeholder="Describe any relevant experience, projects, or coursework..."
              />
            </div>

            {/* Expected Outcome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What do you hope to achieve through this internship? <span className="text-red-500">*</span>
              </label>
              <textarea
                name="expectedOutcome"
                value={applicationData.expectedOutcome}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
                placeholder="Describe your learning goals and what you hope to gain..."
              />
            </div>

            {/* Available Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="availableStartDate"
                value={applicationData.availableStartDate}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
                max={selectedInternship.startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be on or before the internship start date ({formatDate(selectedInternship.startDate)})
              </p>
            </div>

            {/* Additional Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments
              </label>
              <textarea
                name="additionalComments"
                value={applicationData.additionalComments}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
                placeholder="Any additional information you'd like to share..."
              />
            </div>
          </div>
        </div>

        {/* Confirmation and Submit */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Review and Submit
          </h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Please review your application carefully.</p>
                <p>Once submitted, you cannot edit your application. Make sure all information is accurate and complete.</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
            >
              Back to Browse
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting Application...
                </div>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}