"use client";

import { useState, useEffect } from "react";
import { FileText, Calendar, Building, MapPin, Clock, Save, Send } from "lucide-react";

export default function InternshipRequestScreen() {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    companyName: "",
    companyAddress: "",
    supervisorName: "",
    supervisorEmail: "",
    supervisorPhone: "",
    internshipType: "full-time",
    workMode: "on-site",
    department: "",
    role: "",
    objectives: "",
    offerLetterFile: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  useEffect(() => {
    // Load saved data if exists
    const savedData = localStorage.getItem("internshipRequest");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }

    // Check application status
    const status = localStorage.getItem("internshipRequestStatus");
    if (status) {
      setApplicationStatus(status);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Fixed: Added missing closing bracket
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          offerLetterFile: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem("internshipRequest", JSON.stringify(formData));
    alert("Draft saved successfully!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.startDate || !formData.endDate || !formData.companyName || !formData.offerLetterFile) {
      alert("Please fill all required fields and upload offer letter");
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Save status
      localStorage.setItem("internshipRequestStatus", "pending");
      setApplicationStatus("pending");
      
      // Clear draft
      localStorage.removeItem("internshipRequest");
      
      alert("Internship request submitted successfully!");
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (applicationStatus === "pending") {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="bg-amber-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Application Under Review</h2>
          <p className="text-gray-600">
            Your internship request has been submitted and is currently under review by the admin.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            You will be notified once your application is approved.
          </p>
        </div>
      </div>
    );
  }

  if (applicationStatus === "approved") {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Application Approved!</h2>
          <p className="text-gray-600">
            Your internship request has been approved. You can now proceed with project proposal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-6 border-b pb-2">
        Internship Request Form
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Duration */}
        <div>
          <h3 className="text-base font-medium mb-3">Internship Duration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div>
          <h3 className="text-base font-medium mb-3">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="Enter company name"
                  className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., Engineering, Marketing"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  placeholder="Enter company address"
                  className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Supervisor Details */}
        <div>
          <h3 className="text-base font-medium mb-3">Supervisor Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supervisor Name
              </label>
              <input
                type="text"
                name="supervisorName"
                value={formData.supervisorName}
                onChange={handleChange}
                placeholder="Enter supervisor name"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supervisor Email
              </label>
              <input
                type="email"
                name="supervisorEmail"
                value={formData.supervisorEmail}
                onChange={handleChange}
                placeholder="supervisor@company.com"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supervisor Phone
              </label>
              <input
                type="tel"
                name="supervisorPhone"
                value={formData.supervisorPhone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Internship Details */}
        <div>
          <h3 className="text-base font-medium mb-3">Internship Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Internship Type
              </label>
              <select
                name="internshipType"
                value={formData.internshipType}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Mode
              </label>
              <select
                name="workMode"
                value={formData.workMode}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="on-site">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role/Position
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g., Software Developer Intern"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internship Objectives
            </label>
            <textarea
              name="objectives"
              value={formData.objectives}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the main objectives and learning goals for this internship..."
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Offer Letter Upload */}
        <div>
          <h3 className="text-base font-medium mb-3">
            Offer Letter <span className="text-red-500">*</span>
          </h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="offer-letter-upload"
            />
            <label
              htmlFor="offer-letter-upload"
              className="cursor-pointer bg-cyan-50 hover:bg-cyan-100 text-cyan-600 px-4 py-2 rounded-md text-sm transition-colors inline-block"
            >
              {formData.offerLetterFile ? "Change Offer Letter" : "Upload Offer Letter"}
            </label>
            {formData.offerLetterFile && (
              <p className="text-sm text-green-600 mt-2">✓ Offer letter uploaded</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-md hover:from-cyan-600 hover:to-blue-700 flex items-center disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}