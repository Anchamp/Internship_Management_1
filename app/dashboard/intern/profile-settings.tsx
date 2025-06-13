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
  Globe,
  FileText,
  Calendar,
  GraduationCap,
  X,
  Upload,
  Download,
  Eye,
  EyeOff,
  Settings,
  Bell,
  Moon,
  Sun,
  Monitor,
  Shield,
  Database,
  Trash2,
  Key,
  UserCheck,
  Award,
  Target,
  History,
  Plus
} from "lucide-react";
import Image from "next/image";

interface InternProfileSettingsProps {
  inDashboard?: boolean;
  onProfileUpdate?: () => void;
}

const compressImage = async (
  base64Image: string,
  maxSize: number = 400
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = base64Image;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

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

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL("image/jpeg", 0.7);
      resolve(compressed);
    };
  });
};

export default function InternProfileSettings({
  inDashboard = false,
  onProfileUpdate,
}: InternProfileSettingsProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>("profile");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showValidation, setShowValidation] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Profile Data
  const [userData, setUserData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    website: "",
    profileImage: "",
    dob: "",
    
    // Academic Information
    university: "",
    degree: "",
    graduationYear: "",
    major: "",
    gpa: "",
    
    // Professional Information
    skills: "",
    internshipGoals: "",
    previousExperience: "",
    portfolioLinks: [] as string[],
    
    // Documents
    resumeFile: "",
    idDocumentFile: "",
    transcriptFile: "",
    
    // Status Information
    applicationStatus: "none",
    verificationStatus: "pending",
    profileSubmissionCount: 0,
  });

  // Settings Data
  const [preferences, setPreferences] = useState({
    theme: "light",
    emailNotifications: true,
    weeklyReportReminders: true,
    teamChatNotifications: true,
    feedbackNotifications: true,
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [newPortfolioLink, setNewPortfolioLink] = useState<string>("");

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          router.push("/sign-in");
          return;
        }

        const { username } = JSON.parse(storedUser);
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
            applicationStatus: data.user.applicationStatus || "none",
            verificationStatus: data.user.verificationStatus || "pending",
            profileSubmissionCount: data.user.profileSubmissionCount || 0,
          });

          // Load preferences
          if (data.user.preferences) {
            setPreferences({
              theme: data.user.preferences.theme || "light",
              emailNotifications: data.user.preferences.emailNotifications !== false,
              weeklyReportReminders: data.user.preferences.weeklyReportReminders !== false,
              teamChatNotifications: data.user.preferences.teamChatNotifications !== false,
              feedbackNotifications: data.user.preferences.feedbackNotifications !== false,
            });
          }

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
    
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    if (newPortfolioLink.trim() !== "") {
      setUserData((prev) => ({
        ...prev,
        portfolioLinks: [...prev.portfolioLinks, newPortfolioLink.trim()],
      }));
      setNewPortfolioLink("");
    }
  };

  const removePortfolioLink = (index: number) => {
    setUserData((prev) => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Basic Information
    if (!userData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!userData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!userData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!userData.dob.trim()) {
      newErrors.dob = "Date of birth is required";
    }

    // Academic Information
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

    // Skills and Goals
    if (!userData.skills.trim()) {
      newErrors.skills = "Skills and technologies are required";
    }
    if (!userData.internshipGoals.trim()) {
      newErrors.internshipGoals = "Internship goals and objectives are required";
    }

    // Documents
    if (!userData.resumeFile) {
      newErrors.resumeFile = "Resume/CV upload is required";
    }
    if (!userData.idDocumentFile) {
      newErrors.idDocumentFile = "ID document upload is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SINGLE PROFILE SUBMIT HANDLER
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);

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

      const updateData = {
        ...userData,
        preferences,
      };

      // Use the new intern-specific API endpoint
      const response = await fetch(`/api/users/${username}/update-intern-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Profile updated successfully!");
        setShowValidation(false);
        
        // Update the local state with the returned data
        if (result.user) {
          setUserData({
            username: result.user.username || "",
            fullName: result.user.fullName || "",
            email: result.user.email || "",
            phone: result.user.phone || "",
            address: result.user.address || "",
            bio: result.user.bio || "",
            website: result.user.website || "",
            profileImage: result.user.profileImage || "",
            dob: result.user.dob || "",
            university: result.user.university || "",
            degree: result.user.degree || "",
            graduationYear: result.user.graduationYear || "",
            major: result.user.major || "",
            gpa: result.user.gpa || "",
            skills: result.user.skills || "",
            internshipGoals: result.user.internshipGoals || "",
            previousExperience: result.user.previousExperience || "",
            portfolioLinks: result.user.portfolioLinks || [],
            resumeFile: result.user.resumeFile || "",
            idDocumentFile: result.user.idDocumentFile || "",
            transcriptFile: result.user.transcriptFile || "",
            applicationStatus: result.user.applicationStatus || "none",
            verificationStatus: result.user.verificationStatus || "pending",
            profileSubmissionCount: result.user.profileSubmissionCount || 0,
          });
        }
        
        // Call the callback to refresh dashboard
        if (onProfileUpdate) {
          onProfileUpdate();
        }
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

  // PASSWORD SUBMIT HANDLER
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("New password must be at least 6 characters long!");
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

      const response = await fetch(`/api/users/${username}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        alert("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password. Please check your current password and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadDocument = (documentData: string, filename: string) => {
    if (documentData) {
      const link = document.createElement("a");
      link.href = documentData;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const sectionItems = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "academic", label: "Academic Details", icon: GraduationCap },
    { id: "professional", label: "Professional Info", icon: Briefcase },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "settings", label: "Preferences", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "account", label: "Account Management", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {!inDashboard && (
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Profile & Settings</h1>
              <p className="text-sm text-gray-500">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Settings Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Settings</h2>
            <nav className="space-y-1">
              {sectionItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left p-3 rounded-md transition-colors flex items-center ${
                      isActive
                        ? "bg-cyan-50 text-cyan-700 border-r-2 border-cyan-500"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            
            {/* Profile Information Section */}
            {activeSection === "profile" && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <User className="h-6 w-6 mr-3 text-cyan-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Profile Image */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      {previewImage ? (
                        <Image
                          src={previewImage}
                          alt="Profile"
                          width={100}
                          height={100}
                          className="rounded-full object-cover border-4 border-gray-200"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block">
                        <span className="sr-only">Choose profile photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload a profile picture (recommended: 400x400px)
                      </p>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <div className="relative">
                      <div className="absolute top-2 left-3 pointer-events-none">
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <textarea
                        name="address"
                        value={userData.address}
                        onChange={handleChange}
                        rows={2}
                        className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                        placeholder="Enter your address"
                      />
                    </div>
                  </div>

                  {/* Bio and Website */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio/About
                      </label>
                      <textarea
                        name="bio"
                        value={userData.bio}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                        placeholder="Tell us about yourself..."
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
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Academic Details Section */}
            {activeSection === "academic" && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <GraduationCap className="h-6 w-6 mr-3 text-cyan-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Academic Details</h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        University/College <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building className="h-4 w-4 text-gray-400" />
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
                      <select
                        name="degree"
                        value={userData.degree}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black ${
                          errors.degree ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select degree</option>
                        <option value="Bachelor's">Bachelor's</option>
                        <option value="Master's">Master's</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Associate">Associate</option>
                        <option value="PhD">PhD</option>
                      </select>
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
                      <input
                        type="number"
                        name="graduationYear"
                        value={userData.graduationYear}
                        onChange={handleChange}
                        min="2020"
                        max="2030"
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black ${
                          errors.graduationYear ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="2025"
                      />
                      {errors.graduationYear && (
                        <p className="mt-1 text-sm text-red-600">{errors.graduationYear}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CGPA/GPA (Optional)
                      </label>
                      <input
                        type="number"
                        name="gpa"
                        value={userData.gpa}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        max="10"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                        placeholder="e.g., 8.5"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Professional Information Section */}
            {activeSection === "professional" && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <Briefcase className="h-6 w-6 mr-3 text-cyan-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Professional Information</h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skills & Technologies <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-2 left-3 pointer-events-none">
                        <Award className="h-4 w-4 text-gray-400" />
                      </div>
                      <textarea
                        name="skills"
                        value={userData.skills}
                        onChange={handleChange}
                        rows={3}
                        className={`pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black ${
                          errors.skills ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., JavaScript, React, Python, Node.js, SQL"
                      />
                    </div>
                    {errors.skills && (
                      <p className="mt-1 text-sm text-red-600">{errors.skills}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Separate multiple skills with commas
                    </p>
                  </div>

                  {/* Internship Goals */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Internship Goals & Objectives <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-2 left-3 pointer-events-none">
                        <Target className="h-4 w-4 text-gray-400" />
                      </div>
                      <textarea
                        name="internshipGoals"
                        value={userData.internshipGoals}
                        onChange={handleChange}
                        rows={4}
                        className={`pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black ${
                          errors.internshipGoals ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="What do you hope to achieve during your internship?"
                      />
                    </div>
                    {errors.internshipGoals && (
                      <p className="mt-1 text-sm text-red-600">{errors.internshipGoals}</p>
                    )}
                  </div>

                  {/* Previous Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Previous Experience (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute top-2 left-3 pointer-events-none">
                        <History className="h-4 w-4 text-gray-400" />
                      </div>
                      <textarea
                        name="previousExperience"
                        value={userData.previousExperience}
                        onChange={handleChange}
                        rows={3}
                        className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                        placeholder="Describe any relevant work experience, projects, or volunteer work..."
                      />
                    </div>
                  </div>

                  {/* Portfolio Links */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Portfolio Links
                    </label>
                    <div className="space-y-2">
                      {userData.portfolioLinks.map((link, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="url"
                            value={link}
                            readOnly
                            className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-black"
                          />
                          <button
                            type="button"
                            onClick={() => removePortfolioLink(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2">
                        <input
                          type="url"
                          value={newPortfolioLink}
                          onChange={(e) => setNewPortfolioLink(e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                          placeholder="https://github.com/username or https://portfolio.com"
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
                          className="flex items-center px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Documents Section */}
            {activeSection === "documents" && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <FileText className="h-6 w-6 mr-3 text-cyan-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Resume */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resume/CV <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleDocumentUpload(e, 'resumeFile')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                      />
                      {userData.resumeFile && (
                        <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
                          <span className="text-sm text-green-700">Resume uploaded</span>
                          <button
                            type="button"
                            onClick={() => downloadDocument(userData.resumeFile, "resume.pdf")}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      {errors.resumeFile && (
                        <p className="text-sm text-red-600">{errors.resumeFile}</p>
                      )}
                    </div>
                  </div>

                  {/* ID Document */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Document <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload(e, 'idDocumentFile')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                      />
                      {userData.idDocumentFile && (
                        <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
                          <span className="text-sm text-green-700">ID document uploaded</span>
                          <button
                            type="button"
                            onClick={() => downloadDocument(userData.idDocumentFile, "id-document.pdf")}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      {errors.idDocumentFile && (
                        <p className="text-sm text-red-600">{errors.idDocumentFile}</p>
                      )}
                    </div>
                  </div>

                  {/* Transcript */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Transcript (Optional)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleDocumentUpload(e, 'transcriptFile')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                      />
                      {userData.transcriptFile && (
                        <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
                          <span className="text-sm text-green-700">Transcript uploaded</span>
                          <button
                            type="button"
                            onClick={() => downloadDocument(userData.transcriptFile, "transcript.pdf")}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">Profile Status</h4>
                        <p className="text-sm text-blue-600">
                          Status: <span className="capitalize">{userData.verificationStatus}</span>
                          {userData.profileSubmissionCount > 0 && (
                            <span className="ml-2">
                              (Submitted {userData.profileSubmissionCount} times)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === "settings" && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <Settings className="h-6 w-6 mr-3 text-cyan-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Preferences</h2>
                </div>

                <div className="space-y-6">
                  {/* Theme Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Theme</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: "light", label: "Light", icon: Sun },
                        { value: "dark", label: "Dark", icon: Moon },
                        { value: "system", label: "System", icon: Monitor },
                      ].map((theme) => {
                        const IconComponent = theme.icon;
                        return (
                          <button
                            key={theme.value}
                            onClick={() => handlePreferenceChange("theme", theme.value)}
                            className={`p-4 border rounded-md flex flex-col items-center space-y-2 transition-colors ${
                              preferences.theme === theme.value
                                ? "border-cyan-500 bg-cyan-50"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <IconComponent className="h-6 w-6" />
                            <span className="text-sm font-medium">{theme.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Notifications</h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: "emailNotifications",
                          label: "Email Notifications",
                          description: "Receive updates via email",
                        },
                        {
                          key: "weeklyReportReminders",
                          label: "Weekly Report Reminders",
                          description: "Get reminded to submit weekly reports",
                        },
                        {
                          key: "teamChatNotifications",
                          label: "Team Chat Notifications",
                          description: "Notifications for team messages",
                        },
                        {
                          key: "feedbackNotifications",
                          label: "Feedback Notifications",
                          description: "Get notified when you receive feedback",
                        },
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-800">{setting.label}</h4>
                            <p className="text-sm text-gray-500">{setting.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences[setting.key as keyof typeof preferences] as boolean}
                              onChange={(e) => handlePreferenceChange(setting.key, e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-cyan-600 transition-colors ${
                              preferences[setting.key as keyof typeof preferences] ? "bg-cyan-600" : "bg-gray-200"
                            }`}>
                              <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                                preferences[setting.key as keyof typeof preferences] ? "translate-x-full" : "translate-x-0"
                              }`}></div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleProfileSubmit}
                      disabled={isSaving}
                      className="flex items-center px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? "Saving..." : "Save Preferences"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === "security" && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <Shield className="h-6 w-6 mr-3 text-cyan-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Security</h2>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="pl-10 pr-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Key className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Account Management Section */}
            {activeSection === "account" && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <Database className="h-6 w-6 mr-3 text-cyan-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Account Management</h2>
                </div>

                <div className="space-y-6">
                  {/* Account Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Account Information</h3>
                    <div className="bg-gray-50 rounded-md p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Username:</span>
                        <span className="text-sm font-medium">{userData.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium">{userData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Role:</span>
                        <span className="text-sm font-medium capitalize">Intern</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Verification Status:</span>
                        <span className={`text-sm font-medium capitalize ${
                          userData.verificationStatus === "verified" ? "text-green-600" :
                          userData.verificationStatus === "pending" ? "text-yellow-600" :
                          "text-red-600"
                        }`}>
                          {userData.verificationStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Application Status:</span>
                        <span className={`text-sm font-medium capitalize ${
                          userData.applicationStatus === "active" ? "text-green-600" :
                          userData.applicationStatus === "approved" ? "text-blue-600" :
                          userData.applicationStatus === "pending" ? "text-yellow-600" :
                          "text-gray-600"
                        }`}>
                          {userData.applicationStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Data Export */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Data Export</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Download all your personal data stored in our system.
                    </p>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <Download className="h-4 w-4 mr-2" />
                      Export My Data
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-red-800 mb-3">Danger Zone</h3>
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <h4 className="text-sm font-medium text-red-800 mb-2">Delete Account</h4>
                      <p className="text-sm text-red-600 mb-3">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}