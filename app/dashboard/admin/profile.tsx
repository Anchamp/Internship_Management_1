"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import {
  ArrowLeft,
  Save,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Upload,
  FileText,
  Trash2,
} from "lucide-react";

interface AdminProfileProps {
  inDashboard?: boolean;
}

// Image compression function
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

export default function AdminProfile({
  inDashboard = false,
}: AdminProfileProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [userData, setUserData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    countryCode: "+91", // Added country code with default value
    organizationName: "",
    address: "",
    website: "",
    bio: "",
    profileImage: "",
    dob: "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState(""); // State for phone validation error
  // Add validation errors state
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({
    fullName: "",
    email: "",
    dob: "",
    phone: "",
    address: "",
  });

  // Add the missing function that checks if all required fields are filled
  const areRequiredFieldsFilled = () => {
    return (
      userData.fullName.trim() !== "" &&
      userData.email.trim() !== "" &&
      userData.dob !== "" &&
      userData.phone.length === 10 && // Phone must be exactly 10 digits
      userData.address.trim() !== "" &&
      !phoneError // Also ensure there's no phone validation error
    );
  };

  // Load user data directly from MongoDB
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);

        // Get username from localStorage (temporary until full auth implementation)
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          router.push("/sign-in");
          return;
        }

        // Get username for API call
        const { username, role } = JSON.parse(storedUser);
        if (role !== "admin") {
          router.push(`/dashboard/${role}`);
          return;
        }

        // Fetch user data directly from the database - matching the mentor profile implementation
        const response = await fetch(`/api/users/${username}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();

        if (data.user) {
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

          setUserData({
            username: data.user.username || "",
            fullName: data.user.fullName || "",
            email: data.user.email || "",
            phone: phoneNumber,
            countryCode: countryCode,
            organizationName: data.user.organizationName || "",
            address: data.user.address || "",
            website: data.user.website || "",
            bio: data.user.bio || "",
            profileImage: data.user.profileImage || "",
            dob: data.user.dob || "",
          });

          // Set profile image if available
          if (data.user.profileImage) {
            setPreviewImage(data.user.profileImage);
          }
        } else {
          throw new Error("User data not found");
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

  // Add handler for image removal
  const handleRemoveImage = () => {
    setPreviewImage(null);
    setUserData((prev) => ({ ...prev, profileImage: "" }));
  };

  // Add validation function
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Required fields
    if (!userData.fullName.trim()) errors.fullName = "Full name is required";
    if (!userData.email.trim()) errors.email = "Email is required";
    if (!userData.dob) errors.dob = "Date of birth is required";
    if (!userData.phone) errors.phone = "Phone number is required";
    if (!userData.address.trim()) errors.address = "Address is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number before submission
    if (userData.phone && userData.phone.length !== 10) {
      setPhoneError("Phone number must be 10 digits");
      return;
    }

    // Validate form fields
    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSaving(true);

    try {
      // Get username from localStorage
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
        profileSubmissionCount: 1, // Increment profile submission count
      };

      // Use encodeURIComponent to properly handle usernames with spaces
      const encodedUsername = encodeURIComponent(username);

      // Call API to update profile in MongoDB
      const response = await fetch(
        `/api/users/${encodedUsername}/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (response.ok) {
        alert("Profile updated successfully in the database.");

        // Refresh the page to update the profile submission count
        window.location.href = "/dashboard/admin";
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
              phoneError || validationErrors.phone ? "border-red-500" : ""
            }`}
            placeholder="10-digit number"
            maxLength={10}
          />
        </div>
      </div>
      {phoneError && <p className="text-sm text-red-500 mt-1">{phoneError}</p>}
      {validationErrors.phone && !phoneError && (
        <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>
      )}
    </div>
  );

  // Update the form fields to show required indicators and validation errors

  // Update the Personal Information section to include required field markers
  const renderRequiredLabel = (text: string) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {text} <span className="text-red-500">*</span>
    </label>
  );

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
              {renderRequiredLabel("Full Name")}
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
                    validationErrors.fullName ? "border-red-500" : ""
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {validationErrors.fullName && (
                <p className="text-sm text-red-500 mt-1">
                  {validationErrors.fullName}
                </p>
              )}
            </div>

            <div>
              {renderRequiredLabel("Email Address")}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  readOnly
                  className={`pl-10 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed text-gray-500 ${
                    validationErrors.email ? "border-red-500" : ""
                  }`}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
              {validationErrors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              {renderRequiredLabel("Date of Birth")}
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
                    validationErrors.dob ? "border-red-500" : ""
                  }`}
                />
              </div>
              {validationErrors.dob && (
                <p className="text-sm text-red-500 mt-1">
                  {validationErrors.dob}
                </p>
              )}
            </div>

            {/* Replace PhoneNumberField with updated version */}
            <div>
              {renderRequiredLabel("Phone Number")}
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
                      phoneError || validationErrors.phone
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="10-digit number"
                    maxLength={10}
                  />
                </div>
              </div>
              {phoneError && (
                <p className="text-sm text-red-500 mt-1">{phoneError}</p>
              )}
              {validationErrors.phone && !phoneError && (
                <p className="text-sm text-red-500 mt-1">
                  {validationErrors.phone}
                </p>
              )}
            </div>

            <div>
              {renderRequiredLabel("Address")}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={userData.address}
                  onChange={handleChange}
                  className={`pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black ${
                    validationErrors.address ? "border-red-500" : ""
                  }`}
                  placeholder="Enter your address"
                />
              </div>
              {validationErrors.address && (
                <p className="text-sm text-red-500 mt-1">
                  {validationErrors.address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Organization Information - website remains optional */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Organization Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="organizationName"
                  value={userData.organizationName}
                  readOnly
                  className="pl-10 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
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

        {/* Bio - remains optional */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio/Description
          </label>
          <div className="relative">
            <div className="absolute top-2 left-3 pointer-events-none">
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            <textarea
              name="bio"
              value={userData.bio}
              onChange={handleChange}
              rows={4}
              className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
              placeholder="Write a brief description about yourself and your organization..."
            ></textarea>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving || !areRequiredFieldsFilled()}
            className={`inline-flex items-center px-4 py-2 ${
              !areRequiredFieldsFilled()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            } text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500`}
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
            onClick={() => router.push("/dashboard/admin")}
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
