"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image"; // Import with a different name
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
  Users,
  X,
  Upload,
  Trash2,
  AlertCircle,
  Check,
} from "lucide-react";

interface EmployeeProfileProps {
  inDashboard?: boolean;
}

const compressImage = async (
  base64Image: string,
  maxSize: number = 400
): Promise<string> => {
  return new Promise((resolve) => {
    // Use the global browser Image constructor, not Next.js Image component
    const img = new window.Image();
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

export default function EmployeeProfile({
  inDashboard = false,
}: EmployeeProfileProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [profileSubmissionCount, setProfileSubmissionCount] =
    useState<number>(0);
  const [verificationStatus, setVerificationStatus] =
    useState<string>("pending");
  const [loadError, setLoadError] = useState<string>("");
  const [phoneError, setPhoneError] = useState(""); // Added for phone validation

  const [userData, setUserData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    countryCode: "+91", // Added country code with default value
    organization: "",
    position: "",
    address: "",
    experience: "",
    skills: "",
    bio: "",
    website: "",
    profileImage: "",
    dob: "",
    teams: [] as string[],
  });

  const [newTeam, setNewTeam] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Load user data directly from MongoDB
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        // Get username from session or localStorage (temporary until full auth implementation)
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          router.push("/sign-in");
          return;
        }

        // Get username for API call
        const { username, role } = JSON.parse(storedUser);

        // Fetch user data directly from the database
        const response = await fetch(`/api/users/${username}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch user data");
        }

        const data = await response.json();

        if (data.user) {
          console.log("Fetched user data:", data.user); // Debug log

          // Extract country code and phone number from stored phone
          let countryCode = "+91";
          let phoneNumber = data.user.phone || "";

          // If phone number includes a '+', extract the country code
          if (phoneNumber && phoneNumber.includes("+")) {
            const parts = phoneNumber.split(" ");
            if (parts.length > 1) {
              countryCode = parts[0];
              phoneNumber = parts.slice(1).join("");
            }
          }

          // Set state with user data from MongoDB
          setUserData({
            username: data.user.username || "",
            fullName: data.user.fullName || "",
            email: data.user.email || "",
            phone: phoneNumber,
            countryCode: countryCode,
            organization:
              data.user.organizationName || data.user.organization || "",
            position: data.user.position || "",
            address: data.user.address || "",
            experience: data.user.experience || "",
            skills: data.user.skills || "",
            bio: data.user.bio || "",
            website: data.user.website || "",
            profileImage: data.user.profileImage || "",
            dob: data.user.dob || "",
            teams: data.user.teams || [],
          });

          // Set profile image if available
          if (data.user.profileImage) {
            setPreviewImage(data.user.profileImage);
          }

          // Set profile submission count and verification status
          setProfileSubmissionCount(data.user.profileSubmissionCount || 0);
          setVerificationStatus(data.user.verificationStatus || "pending");
        } else {
          setLoadError("User data not found");
        }
      } catch (error: any) {
        console.error("Error loading user data:", error);
        setLoadError(error.message || "Failed to load profile data");
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

    // Special handling for phone number validation
    if (name === "phone") {
      // Only allow digits
      const phoneValue = value.replace(/\D/g, "");

      // Validate phone number length
      if (phoneValue.length > 0 && phoneValue.length !== 10) {
        setPhoneError("Phone number must be 10 digits");
      } else {
        setPhoneError("");
      }

      setUserData((prev) => ({
        ...prev,
        phone: phoneValue,
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Create the phone number field component with country code
  const PhoneNumberField = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Phone Number
      </label>
      <div className="flex">
        <select
          name="countryCode"
          value={userData.countryCode}
          onChange={handleChange}
          className="p-2 border rounded-l-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
        >
          <option value="+1">+1 (USA)</option>
          <option value="+44">+44 (UK)</option>
          <option value="+91">+91 (India)</option>
          <option value="+61">+61 (Australia)</option>
          <option value="+86">+86 (China)</option>
          <option value="+49">+49 (Germany)</option>
          <option value="+33">+33 (France)</option>
          <option value="+81">+81 (Japan)</option>
          <option value="+7">+7 (Russia)</option>
          <option value="+55">+55 (Brazil)</option>
        </select>
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            name="phone"
            value={userData.phone}
            onChange={handleChange}
            className={`pl-10 w-full p-2 border rounded-r-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black ${
              phoneError ? "border-red-500" : ""
            }`}
            placeholder="10-digit number"
            maxLength={10}
          />
        </div>
      </div>
      {phoneError && <p className="text-sm text-red-500 mt-1">{phoneError}</p>}
    </div>
  );

  // Modified handleImageUpload function with compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          // Compress image before saving to state
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

  const addTeam = () => {
    if (newTeam.trim() && !userData.teams.includes(newTeam.trim())) {
      setUserData((prev) => ({
        ...prev,
        teams: [...prev.teams, newTeam.trim()],
      }));
      setNewTeam("");
    }
  };

  const removeTeam = (teamToRemove: string) => {
    setUserData((prev) => ({
      ...prev,
      teams: prev.teams.filter((team) => team !== teamToRemove),
    }));
  };

  // Modified handleSubmit function to update MongoDB only
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number before submission
    if (userData.phone && userData.phone.length !== 10) {
      setPhoneError("Phone number must be 10 digits");
      return;
    }

    setIsSaving(true);

    try {
      // Get username from localStorage (temporary until full auth implementation)
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        alert("User session not found. Please log in again.");
        router.push("/sign-in");
        return;
      }

      const { username } = JSON.parse(storedUser);

      // Format the data with country code for storage
      const formattedData = {
        ...userData,
        phone: userData.phone
          ? `${userData.countryCode} ${userData.phone}`
          : "",
      };

      // Call API to update profile in MongoDB
      const response = await fetch(`/api/users/${username}/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the submission count locally
        setProfileSubmissionCount((prev) => prev + 1);

        // Show different alerts based on submission count
        if (data.isFirstSubmission) {
          alert(
            "Your profile has been sent to the admin successfully for verification"
          );
        } else {
          alert("Profile updated successfully in the database.");
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

  // Add handleRemoveImage function
  const handleRemoveImage = () => {
    setPreviewImage(null);
    setUserData((prev) => ({ ...prev, profileImage: "" }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 max-w-lg w-full text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Error Loading Profile
          </h3>
          <p className="text-red-600 mb-4">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const profileContent = (
    <>
      {/* Profile form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6"
      >
        {/* Profile Image Section */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4 group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-cyan-500 bg-gray-200 flex items-center justify-center">
              {previewImage ? (
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <NextImage
                    src={previewImage}
                    alt="Profile Preview"
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-full"
                  />
                  {/* Add the remove button that appears on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-white p-1 rounded-full hover:bg-red-500"
                      title="Remove profile picture"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
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
          {/* Username display */}
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
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
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
                  className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  readOnly
                  className="pl-10 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed text-gray-500"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
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
                  className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                />
              </div>
            </div>

            {/* Replace phone input with PhoneNumberField */}
            <PhoneNumberField />

            <div>
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
                  className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                  placeholder="Enter your address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Professional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="organization"
                  value={userData.organization}
                  readOnly
                  className="pl-10 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position/Title
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="position"
                  value={userData.position}
                  onChange={handleChange}
                  className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                  placeholder="Enter your position"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="experience"
                  value={userData.experience}
                  onChange={handleChange}
                  className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                  placeholder="Enter years of experience"
                />
              </div>
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
                  className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Teams */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teams
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {userData.teams.map((team, index) => (
              <div
                key={index}
                className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full flex items-center"
              >
                <span>{team}</span>
                <button
                  type="button"
                  onClick={() => removeTeam(team)}
                  className="ml-2 text-cyan-600 hover:text-cyan-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
                placeholder="Add a team"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTeam();
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={addTeam}
              className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              Add
            </button>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Skills & Expertise
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              name="skills"
              value={userData.skills}
              onChange={handleChange}
              className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
              placeholder="E.g., JavaScript, React, UX Design (comma separated)"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio/Professional Summary
          </label>
          <textarea
            name="bio"
            value={userData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
            placeholder="Write a brief professional summary about yourself..."
          ></textarea>
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

      {/* Conditional verification message - only show if profile never submitted */}
      {profileSubmissionCount === 0 && userData.organization === "none" && (
        <div className="mt-4 bg-amber-50 p-4 rounded-md border border-amber-200">
          <p className="text-amber-800 text-sm">
            <span className="font-medium">Note:</span> After submitting your
            profile, an administrator will review your information for
            verification. Once approved, you will be onboarded to the
            organization and gain access to all mentorship features.
          </p>
        </div>
      )}
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
            onClick={() => router.push("/dashboard/mentor")}
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
