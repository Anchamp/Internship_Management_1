"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Briefcase,
  Building,
  Calendar,
  Clock,
  Code,
  DollarSign,
  FileText,
  Globe,
  GraduationCap,
  MapPin,
  Plus,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";

export default function CreatePostScreen() {
  const [formData, setFormData] = useState({
    title: "",
    category: "", // Add category field to the state
    startDate: "",
    endDate: "",
    mode: "onsite", // Default: onsite
    location: {
      city: "",
      state: "",
      country: "",
      address: "",
    },
    department: "",
    openings: "",
    eligibility: "",
    skills: [] as string[],
    responsibilities: [] as string[],
    stipend: "",
    isPaid: true, // Default: paid
    applicationDeadline: "",
    postingDate: new Date().toISOString().split("T")[0], // Today's date as default
  });

  const [newSkill, setNewSkill] = useState("");
  const [newResponsibility, setNewResponsibility] = useState("");
  const [organizationLogo, setOrganizationLogo] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false); // Loading state

  // Add useEffect to populate organization data when component loads
  useEffect(() => {
    // Get user data from localStorage to pre-fill organization name
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setFormData((prev) => ({
        ...prev,
        // organizationName: userData.organizationName || "",
      }));
    }
  }, []);

  // Helper function to handle image upload and compression
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setOrganizationLogo(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoRemove = () => {
    setOrganizationLogo(null);
  };

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Handle nested location object
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else if (name === "isPaid") {
      setFormData((prev) => ({
        ...prev,
        isPaid: value === "paid",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Add a new skill to the array
  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  // Remove a skill from the array
  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  // Add a new responsibility
  const addResponsibility = () => {
    if (
      newResponsibility.trim() &&
      !formData.responsibilities.includes(newResponsibility.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        responsibilities: [...prev.responsibilities, newResponsibility.trim()],
      }));
      setNewResponsibility("");
    }
  };

  // Remove a responsibility
  const removeResponsibility = (responsibilityToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter(
        (resp) => resp !== responsibilityToRemove
      ),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Show loading state
      setIsSaving(true);

      // Get username from localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        alert("User session not found. Please log in again.");
        return;
      }

      const { username } = JSON.parse(storedUser);

      // Fetch admin data directly from MongoDB to ensure we have current organization info
      const userResponse = await fetch(`/api/users/${username}`);
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await userResponse.json();

      if (
        !userData.user ||
        !userData.user.organizationName ||
        !userData.user.organizationId
      ) {
        throw new Error("Missing organization information in user profile");
      }

      console.log("Retrieved organization info from database:", {
        organizationName: userData.user.organizationName,
        organizationId: userData.user.organizationId,
      });

      // Format dates to ISO string
      const formattedData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        applicationDeadline: new Date(
          formData.applicationDeadline
        ).toISOString(),
        postingDate: new Date(formData.postingDate).toISOString(),
        organizationLogo: organizationLogo,
        // Include admin data from database query results
        userData: {
          username: userData.user.username,
          organizationName: userData.user.organizationName,
          organizationId: userData.user.organizationId,
          role: userData.user.role,
        },
      };

      console.log("Submitting internship with admin data:", {
        username: userData.user.username,
        orgName: userData.user.organizationName,
        orgId: userData.user.organizationId,
      });

      // Send data to API
      const response = await fetch("/api/internships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            errorData.details ||
            "Failed to create internship posting"
        );
      }

      // Show success message
      alert("Internship posted successfully");
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Failed to create internship posting: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Briefcase className="mr-3 h-6 w-6 text-cyan-600" />
          Create New Internship Posting
        </h2>
        <p className="text-gray-600 text-sm mt-1 pl-9">
          Fill out the form below to create a new internship posting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        <div className="space-y-10">
          {/* Basic Information Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-200 flex items-center">
              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center mr-3">
                <FileText className="h-4 w-4 text-cyan-600" />
              </div>
              Basic Information
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Internship Title */}
              <div className="col-span-full">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Internship Title<span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-black"
                    placeholder="e.g., Software Development Intern – Summer 2025"
                  />
                </div>
              </div>

              {/* Internship Category - New Field */}
              <div className="col-span-full">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Internship Category<span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="category"
                    id="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-black"
                    placeholder="e.g., Engineering, Medical, Finance, Marketing"
                  />
                </div>
              </div>

              {/* Organization Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Logo
                </label>
                <div className="flex items-center">
                  {organizationLogo ? (
                    <div className="relative mr-4">
                      <div className="h-16 w-16 rounded-md overflow-hidden border border-gray-300">
                        <Image
                          src={organizationLogo}
                          alt="Organization Logo"
                          width={64}
                          height={64}
                          className="object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleLogoRemove}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-0.5 hover:bg-red-200"
                        title="Remove logo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded-md border border-dashed border-gray-300 flex items-center justify-center mr-4">
                      <Building className="h-8 w-8 text-gray-300" />
                    </div>
                  )}

                  <label
                    htmlFor="logo-upload"
                    className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                  >
                    <span>Upload logo</span>
                    <input
                      id="logo-upload"
                      name="logo-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Recommended: Square image, 500x500px or larger
                </p>
              </div>
            </div>
          </div>

          {/* Duration and Location Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-200 flex items-center">
              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center mr-3">
                <Calendar className="h-4 w-4 text-cyan-600" />
              </div>
              Duration and Location
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Start Date */}
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Start Date<span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-black"
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  End Date<span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-black"
                  />
                </div>
              </div>

              {/* Mode of Internship */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode of Internship<span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="onsite"
                      checked={formData.mode === "onsite"}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="ml-2 text-sm text-black">On-site</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="remote"
                      checked={formData.mode === "remote"}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="ml-2 text-sm text-black">Remote</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="hybrid"
                      checked={formData.mode === "hybrid"}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="ml-2 text-sm text-black">Hybrid</span>
                  </label>
                </div>
              </div>

              {/* Department/Domain */}
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Department/Domain<span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="department"
                    id="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-black"
                    placeholder="e.g., Web Development, Data Science, HR"
                  />
                </div>
              </div>

              {/* Location Fields - Only show if mode is onsite or hybrid */}
              {(formData.mode === "onsite" || formData.mode === "hybrid") && (
                <div className="col-span-full mt-2 p-3 bg-gray-50 rounded-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Details
                    {formData.mode === "onsite" && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="location.city"
                          id="city"
                          required={formData.mode === "onsite"}
                          value={formData.location.city}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-black"
                          placeholder="City"
                        />
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        name="location.state"
                        id="state"
                        value={formData.location.state}
                        onChange={handleChange}
                        className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-black"
                        placeholder="State/Province"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="location.country"
                        id="country"
                        required={formData.mode === "onsite"}
                        value={formData.location.country}
                        onChange={handleChange}
                        className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-black"
                        placeholder="Country"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="location.address"
                        id="address"
                        value={formData.location.address}
                        onChange={handleChange}
                        className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-black"
                        placeholder="Office Address (optional)"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details and Requirements Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-200 flex items-center">
              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-cyan-600" />
              </div>
              Details and Requirements
            </h3>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {/* Left column */}
              <div>
                {/* Number of Openings */}
                <div className="mb-6">
                  <label
                    htmlFor="openings"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Number of Openings<span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="openings"
                      id="openings"
                      required
                      min="1"
                      value={formData.openings}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-black"
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>

                {/* Eligibility Criteria */}
                <div className="mb-6">
                  <label
                    htmlFor="eligibility"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Eligibility Criteria<span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GraduationCap className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="eligibility"
                      id="eligibility"
                      required
                      value={formData.eligibility}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-black"
                      placeholder="e.g., B.Tech/BS in CS or related field, 2nd year or above"
                    />
                  </div>
                </div>

                {/* Application Deadline & Posting Date */}
                <div className="mb-6">
                  <label
                    htmlFor="applicationDeadline"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Application Deadline<span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="applicationDeadline"
                      id="applicationDeadline"
                      required
                      value={formData.applicationDeadline}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-black"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="postingDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Posting Date<span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="postingDate"
                      id="postingDate"
                      required
                      value={formData.postingDate}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-black"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Defaults to today but can be changed if needed
                  </p>
                </div>
              </div>

              {/* Right column */}
              <div>
                {/* Stipend / Compensation */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compensation<span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="isPaid"
                          value="paid"
                          checked={formData.isPaid}
                          onChange={handleChange}
                          className="form-radio h-4 w-4 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="ml-2 text-sm text-black">Paid</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="isPaid"
                          value="unpaid"
                          checked={!formData.isPaid}
                          onChange={handleChange}
                          className="form-radio h-4 w-4 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="ml-2 text-sm text-black">Unpaid</span>
                      </label>
                    </div>

                    {formData.isPaid && (
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {/* Replace DollarSign icon with Rupee text */}
                          <span className="text-gray-400 font-medium">₹</span>
                        </div>
                        <input
                          type="text"
                          name="stipend"
                          id="stipend"
                          required={formData.isPaid}
                          value={formData.stipend}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-black"
                          placeholder="e.g., Rs.1000/month"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills and Responsibilities Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-200 flex items-center">
              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center mr-3">
                <Code className="h-4 w-4 text-cyan-600" />
              </div>
              Skills and Responsibilities
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Preferred Skills */}
              <div>
                <label
                  htmlFor="skills"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Preferred Skills
                </label>

                {/* Skills Input */}
                <div className="flex gap-2 mb-3">
                  <div className="relative rounded-md shadow-sm flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Code className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="skillInput"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-black"
                      placeholder="e.g., React, Python, Communication"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-3 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 mt-2 min-h-[80px] bg-gray-50 p-3 rounded-md">
                  {formData.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="bg-cyan-50 text-cyan-800 px-3 py-1 rounded-full flex items-center text-sm shadow-sm"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-cyan-600 hover:text-cyan-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {formData.skills.length === 0 && (
                    <span className="text-gray-500 text-sm italic">
                      No skills added yet
                    </span>
                  )}
                </div>
              </div>

              {/* Roles & Responsibilities */}
              <div>
                <label
                  htmlFor="responsibilities"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Roles & Responsibilities
                  <span className="text-red-500">*</span>
                </label>

                {/* Responsibilities Input */}
                <div className="flex gap-2 mb-3">
                  <div className="relative rounded-md shadow-sm flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="responsibilityInput"
                      value={newResponsibility}
                      onChange={(e) => setNewResponsibility(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addResponsibility();
                        }
                      }}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-black"
                      placeholder="Add a responsibility"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addResponsibility}
                    className="px-3 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                {/* Responsibilities List */}
                <ul className="mt-2 space-y-2 bg-gray-50 p-3 rounded-md min-h-[80px]">
                  {formData.responsibilities.map((responsibility, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-2 bg-white p-2 rounded-md shadow-sm"
                    >
                      <span className="text-cyan-600 mt-0.5 font-bold">•</span>
                      <span className="flex-grow text-sm text-black">
                        {responsibility}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeResponsibility(responsibility)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                  {formData.responsibilities.length === 0 && (
                    <li className="text-gray-500 text-sm italic py-2">
                      No responsibilities added yet
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 mt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300"
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Publishing...
                </div>
              ) : (
                "Publish Posting"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
