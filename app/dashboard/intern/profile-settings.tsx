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
  Plus,
  Camera,
  Menu,
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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

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
              emailNotifications:
                data.user.preferences.emailNotifications !== false,
              weeklyReportReminders:
                data.user.preferences.weeklyReportReminders !== false,
              teamChatNotifications:
                data.user.preferences.teamChatNotifications !== false,
              feedbackNotifications:
                data.user.preferences.feedbackNotifications !== false,
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleRemoveImage = () => {
    setPreviewImage("");
    setUserData((prev) => ({ ...prev, profileImage: "" }));
  };

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    documentType: "resumeFile" | "idDocumentFile" | "transcriptFile"
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
      newErrors.internshipGoals =
        "Internship goals and objectives are required";
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

  // PROFILE SUBMIT HANDLER
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

      const response = await fetch(
        `/api/users/${username}/update-intern-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert("Profile updated successfully!");
        setShowValidation(false);

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
      alert(
        "Failed to change password. Please check your current password and try again."
      );
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
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                  Profile & Settings
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Manage your account and preferences
                </p>
              </div>
            </div>
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
          fixed lg:relative lg:translate-x-0 z-50 lg:z-auto
          w-64 lg:w-64 bg-white shadow-lg lg:shadow-sm 
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          h-full lg:h-auto min-h-screen lg:min-h-0
        `}
        >
          <div className="p-4 border-b lg:border-b-0">
            <div className="flex items-center justify-between lg:justify-start">
              <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-md hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <nav className="p-4 space-y-1 overflow-y-auto">
            {sectionItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false); // Close mobile sidebar on selection
                  }}
                  className={`w-full text-left p-3 rounded-md transition-colors flex items-center text-sm ${
                    isActive
                      ? "bg-cyan-50 text-cyan-700 border-r-2 border-cyan-500"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span className="font-medium truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6 xl:p-8 overflow-hidden">
          <div className="max-w-4xl mx-auto">
            {/* Profile Information Section */}
            {activeSection === "profile" && (
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex items-center mb-6">
                  <User className="h-5 w-5 lg:h-6 lg:w-6 mr-3 text-cyan-600" />
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
                    Profile Information
                  </h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Profile Image */}
                  <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6">
                    <div className="relative">
                      {previewImage ? (
                        <Image
                          src={previewImage}
                          alt="Profile preview"
                          width={96}
                          height={96}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : userData.profileImage ? (
                        <Image
                          src={userData.profileImage}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                          {userData.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("profileImageInput")?.click()
                        }
                        className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-cyan-600 rounded-full text-white hover:bg-cyan-700 transition-colors shadow-lg"
                      >
                        <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
                        Profile Photo
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mb-4">
                        Upload a professional photo for your profile
                      </p>
                      <input
                        id="profileImageInput"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("profileImageInput")
                              ?.click()
                          }
                          className="px-3 py-2 text-xs sm:text-sm font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-md hover:bg-cyan-100 transition-colors"
                        >
                          Upload Photo
                        </button>
                        {(userData.profileImage || previewImage) && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-3 py-2 text-xs sm:text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Personal Information - Responsive Grid - ICONS REMOVED */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={userData.fullName}
                        onChange={handleChange}
                        className={`w-full p-2.5 sm:p-3 text-sm border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 ${
                          errors.fullName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter your full name"
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                        className={`w-full p-2.5 sm:p-3 text-sm border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter your email"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={userData.phone}
                        onChange={handleChange}
                        className={`w-full p-2.5 sm:p-3 text-sm border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter your phone number"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={userData.dob}
                        onChange={handleChange}
                        className={`w-full p-2.5 sm:p-3 text-sm border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 ${
                          errors.dob ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.dob && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.dob}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address - Full Width - ICON REMOVED */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={userData.address}
                      onChange={handleChange}
                      rows={2}
                      className="w-full p-2.5 sm:p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                      placeholder="Enter your address"
                    />
                  </div>

                  {/* Bio and Website - Responsive Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio/About
                      </label>
                      <textarea
                        name="bio"
                        value={userData.bio}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2.5 sm:p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website/Portfolio
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={userData.website}
                        onChange={handleChange}
                        className="w-full p-2.5 sm:p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  {/* Save Button - Responsive */}
                  <div className="flex flex-col sm:flex-row sm:justify-end pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Academic Details Section */}
            {activeSection === "academic" && (
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex items-center mb-6">
                  <GraduationCap className="h-5 w-5 lg:h-6 lg:w-6 mr-3 text-cyan-600" />
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
                    Academic Details
                  </h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        University/College{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="university"
                        value={userData.university}
                        onChange={handleChange}
                        className={`w-full p-2.5 sm:p-3 text-sm border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 ${
                          errors.university
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your university"
                      />
                      {errors.university && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.university}
                        </p>
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
                        className={`w-full p-2.5 sm:p-3 text-sm border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 ${
                          errors.degree ? "border-red-500" : "border-gray-300"
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
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.degree}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Major/Field of Study{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="major"
                        value={userData.major}
                        onChange={handleChange}
                        className={`w-full p-2.5 sm:p-3 text-sm border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 ${
                          errors.major ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., Computer Science"
                      />
                      {errors.major && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.major}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Graduation Year{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="graduationYear"
                        value={userData.graduationYear}
                        onChange={handleChange}
                        min="2020"
                        max="2030"
                        className={`w-full p-2.5 sm:p-3 text-sm border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 ${
                          errors.graduationYear
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="2025"
                      />
                      {errors.graduationYear && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.graduationYear}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
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
                        className="w-full p-2.5 sm:p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                        placeholder="e.g., 8.5"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-end pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Professional Information Section */}
            {activeSection === "professional" && (
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex items-center mb-6">
                  <Briefcase className="h-5 w-5 lg:h-6 lg:w-6 mr-3 text-cyan-600" />
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
                    Professional Information
                  </h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Skills - ICON REMOVED */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skills & Technologies{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="skills"
                      value={userData.skills}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full p-2.5 sm:p-3 text-sm border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 ${
                        errors.skills ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., Programming, Communication, Leadership, Design, Problem-solving"
                    />
                    {errors.skills && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.skills}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Separate multiple skills with commas
                    </p>
                  </div>

                  {/* Internship Goals - ICON REMOVED */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Internship Goals & Objectives{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="internshipGoals"
                      value={userData.internshipGoals}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full p-2.5 sm:p-3 text-sm border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 ${
                        errors.internshipGoals
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="What do you hope to achieve during your internship?"
                    />
                    {errors.internshipGoals && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.internshipGoals}
                      </p>
                    )}
                  </div>

                  {/* Previous Experience - ICON REMOVED */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Previous Experience (Optional)
                    </label>
                    <textarea
                      name="previousExperience"
                      value={userData.previousExperience}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-2.5 sm:p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                      placeholder="Describe any relevant work experience, projects, or volunteer work..."
                    />
                  </div>

                  {/* Portfolio Links */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Portfolio Links
                    </label>
                    <div className="space-y-2">
                      {userData.portfolioLinks.map((link, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2"
                        >
                          <input
                            type="url"
                            value={link}
                            readOnly
                            className="flex-1 p-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                          />
                          <button
                            type="button"
                            onClick={() => removePortfolioLink(index)}
                            className="w-full sm:w-auto p-2.5 text-red-600 hover:bg-red-50 rounded-md border border-red-200 transition-colors text-sm"
                          >
                            <X className="h-4 w-4 mx-auto sm:mx-0" />
                          </button>
                        </div>
                      ))}
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <input
                          type="url"
                          value={newPortfolioLink}
                          onChange={(e) => setNewPortfolioLink(e.target.value)}
                          className="flex-1 p-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
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
                          className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-cyan-500 text-white text-sm rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-end pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Documents Section */}
            {activeSection === "documents" && (
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex items-center mb-6">
                  <FileText className="h-5 w-5 lg:h-6 lg:w-6 mr-3 text-cyan-600" />
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
                    Documents
                  </h2>
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
                        onChange={(e) => handleDocumentUpload(e, "resumeFile")}
                        className="block w-full text-xs sm:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 transition-colors"
                      />
                      {userData.resumeFile && (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                          <span className="text-xs sm:text-sm text-green-700 font-medium">
                            Resume uploaded
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              downloadDocument(
                                userData.resumeFile,
                                "resume.pdf"
                              )
                            }
                            className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      {errors.resumeFile && (
                        <p className="text-xs sm:text-sm text-red-600">
                          {errors.resumeFile}
                        </p>
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
                        onChange={(e) =>
                          handleDocumentUpload(e, "idDocumentFile")
                        }
                        className="block w-full text-xs sm:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 transition-colors"
                      />
                      {userData.idDocumentFile && (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                          <span className="text-xs sm:text-sm text-green-700 font-medium">
                            ID document uploaded
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              downloadDocument(
                                userData.idDocumentFile,
                                "id-document.pdf"
                              )
                            }
                            className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      {errors.idDocumentFile && (
                        <p className="text-xs sm:text-sm text-red-600">
                          {errors.idDocumentFile}
                        </p>
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
                        onChange={(e) =>
                          handleDocumentUpload(e, "transcriptFile")
                        }
                        className="block w-full text-xs sm:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 transition-colors"
                      />
                      {userData.transcriptFile && (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                          <span className="text-xs sm:text-sm text-green-700 font-medium">
                            Transcript uploaded
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              downloadDocument(
                                userData.transcriptFile,
                                "transcript.pdf"
                              )
                            }
                            className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">
                          Profile Status
                        </h4>
                        <p className="text-xs sm:text-sm text-blue-600 mt-1">
                          Status:{" "}
                          <span className="capitalize font-medium">
                            {userData.verificationStatus}
                          </span>
                          {userData.profileSubmissionCount > 0 && (
                            <span className="block sm:inline sm:ml-2">
                              (Submitted {userData.profileSubmissionCount}{" "}
                              times)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-end pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === "settings" && (
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex items-center mb-6">
                  <Settings className="h-5 w-5 lg:h-6 lg:w-6 mr-3 text-cyan-600" />
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
                    Preferences
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Theme Settings */}
                  <div>
                    <h3 className="text-base lg:text-lg font-medium text-gray-800 mb-3">
                      Theme
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                      {[
                        { value: "light", label: "Light", icon: Sun },
                        { value: "dark", label: "Dark", icon: Moon },
                        { value: "system", label: "System", icon: Monitor },
                      ].map((theme) => {
                        const IconComponent = theme.icon;
                        return (
                          <button
                            key={theme.value}
                            onClick={() =>
                              handlePreferenceChange("theme", theme.value)
                            }
                            className={`p-3 lg:p-4 border rounded-md flex flex-col items-center space-y-2 transition-colors text-sm ${
                              preferences.theme === theme.value
                                ? "border-cyan-500 bg-cyan-50"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <IconComponent className="h-5 w-5 lg:h-6 lg:w-6" />
                            <span className="font-medium">{theme.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <h3 className="text-base lg:text-lg font-medium text-gray-800 mb-3">
                      Notifications
                    </h3>
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
                        <div
                          key={setting.key}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 p-3 sm:p-0"
                        >
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-800">
                              {setting.label}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {setting.description}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                preferences[
                                  setting.key as keyof typeof preferences
                                ] as boolean
                              }
                              onChange={(e) =>
                                handlePreferenceChange(
                                  setting.key,
                                  e.target.checked
                                )
                              }
                              className="sr-only"
                            />
                            <div
                              className={`w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-cyan-600 transition-colors ${
                                preferences[
                                  setting.key as keyof typeof preferences
                                ]
                                  ? "bg-cyan-600"
                                  : "bg-gray-200"
                              }`}
                            >
                              <div
                                className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                                  preferences[
                                    setting.key as keyof typeof preferences
                                  ]
                                    ? "translate-x-full"
                                    : "translate-x-0"
                                }`}
                              ></div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-end pt-6 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleProfileSubmit(e);
                      }}
                      disabled={isSaving}
                      className="w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Preferences
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === "security" && (
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex items-center mb-6">
                  <Shield className="h-5 w-5 lg:h-6 lg:w-6 mr-3 text-cyan-600" />
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
                    Security
                  </h2>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-base lg:text-lg font-medium text-gray-800 mb-3">
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full pr-10 p-2.5 sm:p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
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
                          className="w-full p-2.5 sm:p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
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
                          className="w-full p-2.5 sm:p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-end pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Changing...
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Account Management Section */}
            {activeSection === "account" && (
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex items-center mb-6">
                  <Database className="h-5 w-5 lg:h-6 lg:w-6 mr-3 text-cyan-600" />
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
                    Account Management
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Account Information */}
                  <div>
                    <h3 className="text-base lg:text-lg font-medium text-gray-800 mb-3">
                      Account Information
                    </h3>
                    <div className="bg-gray-50 rounded-md p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                        <span className="text-sm text-gray-600 font-medium">
                          Username:
                        </span>
                        <span className="text-sm font-medium text-gray-900 break-all">
                          {userData.username}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                        <span className="text-sm text-gray-600 font-medium">
                          Email:
                        </span>
                        <span className="text-sm font-medium text-gray-900 break-all">
                          {userData.email}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                        <span className="text-sm text-gray-600 font-medium">
                          Role:
                        </span>
                        <span className="text-sm font-medium capitalize text-gray-900">
                          Intern
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                        <span className="text-sm text-gray-600 font-medium">
                          Verification Status:
                        </span>
                        <span
                          className={`text-sm font-medium capitalize ${
                            userData.verificationStatus === "verified"
                              ? "text-green-600"
                              : userData.verificationStatus === "pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {userData.verificationStatus}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                        <span className="text-sm text-gray-600 font-medium">
                          Application Status:
                        </span>
                        <span
                          className={`text-sm font-medium capitalize ${
                            userData.applicationStatus === "active"
                              ? "text-green-600"
                              : userData.applicationStatus === "approved"
                              ? "text-blue-600"
                              : userData.applicationStatus === "pending"
                              ? "text-yellow-600"
                              : "text-gray-600"
                          }`}
                        >
                          {userData.applicationStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Data Export */}
                  <div>
                    <h3 className="text-base lg:text-lg font-medium text-gray-800 mb-3">
                      Data Export
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4">
                      Download all your personal data stored in our system.
                    </p>
                    <button className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                      <Download className="h-4 w-4 mr-2" />
                      Export My Data
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t pt-6">
                    <h3 className="text-base lg:text-lg font-medium text-red-800 mb-3">
                      Danger Zone
                    </h3>
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <h4 className="text-sm font-medium text-red-800 mb-2">
                        Delete Account
                      </h4>
                      <p className="text-xs sm:text-sm text-red-600 mb-4">
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </p>
                      <button className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors">
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
