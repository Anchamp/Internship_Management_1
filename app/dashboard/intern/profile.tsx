"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  User,
  Building,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Clock,
  Globe,
  FileText,
  Calendar,
  GraduationCap,
  Upload,
  X,
  Download,
} from "lucide-react";
import Image from "next/image";

interface InternProfileProps {
  inDashboard?: boolean;
}

const compressImage = async (
  base64Image: string,
  maxSize: number = 400
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      // Set canvas size and draw resized image
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      // Get compressed base64 string (0.7 quality JPEG)
      const compressed = canvas.toDataURL("image/jpeg", 0.7);
      resolve(compressed);
    };
  });
};

export default function InternProfile({
  inDashboard = false,
}: InternProfileProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [userData, setUserData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    address: "",
    bio: "",
    website: "",
    profileImage: "",
    dob: "",
    // Intern-specific fields
    university: "",
    degree: "",
    graduationYear: "",
    major: "",
    gpa: "",
    skills: "",
    internshipGoals: "",
    previousExperience: "",
    portfolioLinks: [] as string[],
    // Document fields
    resumeFile: "",
    idDocumentFile: "",
    transcriptFile: "",
  });

  const [newPortfolioLink, setNewPortfolioLink] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState<boolean>(false);

  // Load user data from MongoDB
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);

        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          router.push("/sign-in");
          return;
        }

        const { username, role } = JSON.parse(storedUser);
        if (role !== "intern") {
          router.push(`/dashboard/${role}`);
          return;
        }

        // Fetch user data from the database
        const response = await fetch(`/api/users/${username}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();

        if (data.user) {
          setUserData({
            username: data.user.username || "",
            fullName: data.user.fullName || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            organization:
              data.user.organizationName || data.user.organization || "",
            address: data.user.address || "",
            bio: data.user.bio || "",
            website: data.user.website || "",
            profileImage: data.user.profileImage || "",
            dob: data.user.dob || "",
            university: data.user.university || "",
            degree: data.user.degree || "",
            graduationYear: data.user.graduationYear || "",
            major: data.user.major || "",
            gpa: data.user.gpa || "",
            skills: data.user.skills || "",
            internshipGoals: data.user.internshipGoals || "",
            previousExperience: data.user.previousExperience || "",
            portfolioLinks: data.user.portfolioLinks || [],
            resumeFile: data.user.resumeFile || "",
            idDocumentFile: data.user.idDocumentFile || "",
            transcriptFile: data.user.transcriptFile || "",
          });

          if (data.user.profileImage) {
            setPreviewImage(data.user.profileImage);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          const compressedImage = await compressImage(base64String);
          setPreviewImage(compressedImage);
          setUserData((prev) => ({ ...prev, profileImage: compressedImage }));
        } catch (error) {
          console.error("Error processing image:", error);
          alert("Failed to process the image. Please try a smaller image.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    documentType: 'resumeFile' | 'idDocumentFile' | 'transcriptFile'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUserData((prev) => ({
          ...prev,
          [documentType]: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addPortfolioLink = () => {
    if (newPortfolioLink.trim() && !userData.portfolioLinks.includes(newPortfolioLink.trim())) {
      setUserData((prev) => ({
        ...prev,
        portfolioLinks: [...prev.portfolioLinks, newPortfolioLink.trim()],
      }));
      setNewPortfolioLink("");
    }
  };

  const removePortfolioLink = (linkToRemove: string) => {
    setUserData((prev) => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.filter((link) => link !== linkToRemove),
    }));
  };

  const downloadDocument = (base64Data: string, filename: string) => {
    if (!base64Data) return;
    
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Validation function for mandatory fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Personal Information - Mandatory
    if (!userData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!userData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!userData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!userData.dob.trim()) {
      newErrors.dob = "Date of birth is required";
    }

    // Academic Information - Mandatory
    if (!userData.university.trim()) {
      newErrors.university = "University/College name is required";
    }
    if (!userData.degree.trim()) {
      newErrors.degree = "Degree type is required";
    }
    if (!userData.major.trim()) {
      newErrors.major = "Major/Field of study is required";
    }
    if (!userData.graduationYear.trim()) {
      newErrors.graduationYear = "Expected graduation year is required";
    } else {
      const year = parseInt(userData.graduationYear);
      const currentYear = new Date().getFullYear();
      if (year < currentYear || year > currentYear + 10) {
        newErrors.graduationYear = "Please enter a valid graduation year";
      }
    }

    // Skills - Mandatory
    if (!userData.skills.trim()) {
      newErrors.skills = "Skills and technologies are required";
    }

    // Goals - Mandatory
    if (!userData.internshipGoals.trim()) {
      newErrors.internshipGoals = "Internship goals and objectives are required";
    }

    // Documents - Mandatory
    if (!userData.resumeFile) {
      newErrors.resumeFile = "Resume/CV upload is required";
    }
    if (!userData.idDocumentFile) {
      newErrors.idDocumentFile = "ID document upload is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);

    // Validate form before submission
    if (!validateForm()) {
      alert("Please fill in all required fields before submitting.");
      return;
    }

    setIsSaving(true);

    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        alert("User session not found. Please log in again.");
        router.push("/sign-in");
        return;
      }

      const { username } = JSON.parse(storedUser);

      const response = await fetch(`/api/users/${username}/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        setShowValidation(false); // Hide validation errors on successful submit
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const profileContent = (
    <>
      {/* Validation Summary */}
      {showValidation && Object.keys(errors).length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Please correct the following errors:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Profile Image Section */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-cyan-500 bg-gray-200 flex items-center justify-center">
              {previewImage ? (
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={previewImage}
                    alt="Profile Preview"
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-full"
                  />
                </div>
              ) : (
                <User className="h-16 w-16 text-gray-400" />
              )}
            </div>
            <label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 bg-cyan-500 p-2 rounded-full cursor-pointer hover:bg-cyan-600 text-white"
            >
              <Upload className="h-4 w-4" />
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              {userData.username}
            </h3>
            <p className="text-sm text-gray-500">
              Click the icon to upload your profile picture
            </p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Personal Information <span className="text-red-500">*</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={userData.fullName}
                  onChange={handleChange}
                  className={`pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  className={`pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="dob"
                  value={userData.dob}
                  onChange={handleChange}
                  className={`pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black ${
                    errors.dob ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.dob && (
                <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  className={`pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={userData.address}
                  onChange={handleChange}
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                  placeholder="Enter your address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Academic Information <span className="text-red-500">*</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                University/College <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GraduationCap className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="university"
                  value={userData.university}
                  onChange={handleChange}
                  className={`pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black ${
                    errors.university ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your university"
                />
              </div>
              {errors.university && (
                <p className="mt-1 text-sm text-red-600">{errors.university}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  name="degree"
                  value={userData.degree}
                  onChange={handleChange}
                  className={`pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black ${
                    errors.degree ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select degree</option>
                  <option value="Bachelor's">Bachelor's</option>
                  <option value="Master's">Master's</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>
              {errors.degree && (
                <p className="mt-1 text-sm text-red-600">{errors.degree}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Major/Field of Study <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="major"
                value={userData.major}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black ${
                  errors.major ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Computer Science"
              />
              {errors.major && (
                <p className="mt-1 text-sm text-red-600">{errors.major}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Graduation Year <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="graduationYear"
                  value={userData.graduationYear}
                  onChange={handleChange}
                  min="2020"
                  max="2030"
                  className={`pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black ${
                    errors.graduationYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 2025"
                />
              </div>
              {errors.graduationYear && (
                <p className="mt-1 text-sm text-red-600">{errors.graduationYear}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPA (Optional)
              </label>
              <input
                type="text"
                name="gpa"
                value={userData.gpa}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                placeholder="e.g., 3.8/4.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website/Portfolio
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="url"
                  name="website"
                  value={userData.website}
                  onChange={handleChange}
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills & Portfolio Links */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Skills & Portfolio
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills & Technologies <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute top-2 left-3 pointer-events-none">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <textarea
                name="skills"
                value={userData.skills}
                onChange={handleChange}
                rows={3}
                className={`pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black ${
                  errors.skills ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., JavaScript, React, Python, SQL (comma separated)"
              />
            </div>
            {errors.skills && (
              <p className="mt-1 text-sm text-red-600">{errors.skills}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Portfolio Links
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {userData.portfolioLinks.map((link, index) => (
                <div
                  key={index}
                  className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full flex items-center"
                >
                  <span className="text-sm">{link}</span>
                  <button
                    type="button"
                    onClick={() => removePortfolioLink(link)}
                    className="ml-2 text-cyan-600 hover:text-cyan-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={newPortfolioLink}
                onChange={(e) => setNewPortfolioLink(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                placeholder="Add portfolio link (GitHub, LinkedIn, etc.)"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPortfolioLink();
                  }
                }}
              />
              <button
                type="button"
                onClick={addPortfolioLink}
                className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Experience & Goals */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Experience & Goals
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previous Experience (Optional)
              </label>
              <textarea
                name="previousExperience"
                value={userData.previousExperience}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                placeholder="Describe any relevant work experience, projects, or volunteer work..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Internship Goals & Objectives <span className="text-red-500">*</span>
              </label>
              <textarea
                name="internshipGoals"
                value={userData.internshipGoals}
                onChange={handleChange}
                rows={3}
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black ${
                  errors.internshipGoals ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="What do you hope to achieve during your internship?"
              />
              {errors.internshipGoals && (
                <p className="mt-1 text-sm text-red-600">{errors.internshipGoals}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio/Personal Statement
              </label>
              <textarea
                name="bio"
                value={userData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                placeholder="Write a brief description about yourself..."
              />
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Required Documents <span className="text-red-500">*</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Resume Upload */}
            <div className={`border-2 border-dashed rounded-lg p-4 hover:border-cyan-400 transition-colors ${
              errors.resumeFile ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}>
              <div className="text-center">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume/CV <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleDocumentUpload(e, 'resumeFile')}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer bg-cyan-50 hover:bg-cyan-100 text-cyan-600 px-3 py-2 rounded-md text-sm transition-colors"
                >
                  {userData.resumeFile ? 'Change Resume' : 'Upload Resume'}
                </label>
                {userData.resumeFile && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => downloadDocument(userData.resumeFile, 'resume.pdf')}
                      className="text-xs text-blue-600 hover:underline flex items-center justify-center"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </button>
                  </div>
                )}
                {errors.resumeFile && (
                  <p className="mt-2 text-xs text-red-600">{errors.resumeFile}</p>
                )}
              </div>
            </div>

            {/* ID Document Upload */}
            <div className={`border-2 border-dashed rounded-lg p-4 hover:border-cyan-400 transition-colors ${
              errors.idDocumentFile ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}>
              <div className="text-center">
                <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Document <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload(e, 'idDocumentFile')}
                  className="hidden"
                  id="id-upload"
                />
                <label
                  htmlFor="id-upload"
                  className="cursor-pointer bg-cyan-50 hover:bg-cyan-100 text-cyan-600 px-3 py-2 rounded-md text-sm transition-colors"
                >
                  {userData.idDocumentFile ? 'Change ID' : 'Upload ID'}
                </label>
                {userData.idDocumentFile && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => downloadDocument(userData.idDocumentFile, 'id_document.pdf')}
                      className="text-xs text-blue-600 hover:underline flex items-center justify-center"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </button>
                  </div>
                )}
                {errors.idDocumentFile && (
                  <p className="mt-2 text-xs text-red-600">{errors.idDocumentFile}</p>
                )}
              </div>
            </div>

            {/* Transcript Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-cyan-400 transition-colors">
              <div className="text-center">
                <GraduationCap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transcript (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload(e, 'transcriptFile')}
                  className="hidden"
                  id="transcript-upload"
                />
                <label
                  htmlFor="transcript-upload"
                  className="cursor-pointer bg-cyan-50 hover:bg-cyan-100 text-cyan-600 px-3 py-2 rounded-md text-sm transition-colors"
                >
                  {userData.transcriptFile ? 'Change Transcript' : 'Upload Transcript'}
                </label>
                {userData.transcriptFile && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => downloadDocument(userData.transcriptFile, 'transcript.pdf')}
                      className="text-xs text-blue-600 hover:underline flex items-center justify-center"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Maximum file size: 5MB. Supported formats: PDF, DOC, DOCX, JPG, PNG
          </p>
          <p className="text-xs text-red-600 mt-1">
            <span className="text-red-500">*</span> Required fields must be completed before submitting
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-md shadow-sm hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>

      {/* Information Notice */}
      <div className="mt-4 bg-blue-50 p-4 rounded-md border border-blue-200">
        <p className="text-blue-800 text-sm">
          <span className="font-medium">Note:</span> Please ensure all required documents are uploaded and your profile information is complete. This will help mentors and administrators better understand your background and match you with suitable internship opportunities.
        </p>
      </div>
    </>
  );

  // If being rendered inside dashboard, return just the content
  if (inDashboard) {
    return <div className="max-w-4xl mx-auto">{profileContent}</div>;
  }

  // Otherwise render with the back button and full page layout
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push("/dashboard/intern")}
            className="mr-3 p-2 rounded-full hover:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>

        {profileContent}
      </div>
    </div>
  );
}