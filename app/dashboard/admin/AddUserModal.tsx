"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  User,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationName: string;
}

const AddUserModal = ({
  isOpen,
  onClose,
  organizationName,
}: AddUserModalProps) => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  // Add success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdUsername, setCreatedUsername] = useState("");

  // Debounced username availability check
  useEffect(() => {
    if (!isOpen) return;

    const checkUsernameAvailability = async () => {
      if (!userData.username || userData.username.length < 3) {
        setUsernameSuggestions([]);
        return;
      }

      setCheckingUsername(true);
      try {
        const response = await fetch("/api/check-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field: "username", value: userData.username }),
        });

        const data = await response.json();

        if (!data.available) {
          setUsernameError(data.message || "Username is already taken");
          // Store username suggestions if they exist
          if (data.suggestions && Array.isArray(data.suggestions)) {
            setUsernameSuggestions(data.suggestions);
          } else {
            setUsernameSuggestions([]);
          }
        } else {
          setUsernameError("");
          setUsernameSuggestions([]);
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameSuggestions([]);
      } finally {
        setCheckingUsername(false);
      }
    };

    const timer = setTimeout(checkUsernameAvailability, 500);
    return () => clearTimeout(timer);
  }, [userData.username, isOpen]);

  // Debounced email availability check
  useEffect(() => {
    if (!isOpen) return;

    const validateEmailFormat = () => {
      if (!userData.email) return false;

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(userData.email);

      if (!isValid) {
        setEmailError("Please enter a valid email address");
        return false;
      }
      return true;
    };

    const checkEmailAvailability = async () => {
      if (!userData.email || !validateEmailFormat()) return;

      setCheckingEmail(true);
      try {
        const response = await fetch("/api/check-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field: "email", value: userData.email }),
        });

        const data = await response.json();

        if (!data.available) {
          setEmailError(data.message || "Email is already in use");
        } else {
          setEmailError("");
        }
      } catch (error) {
        console.error("Error checking email:", error);
      } finally {
        setCheckingEmail(false);
      }
    };

    const timer = setTimeout(checkEmailAvailability, 500);
    return () => clearTimeout(timer);
  }, [userData.email, isOpen]);

  // Function to select a suggested username
  const selectUsername = (suggestion: string) => {
    setUserData((prev) => ({
      ...prev,
      username: suggestion,
    }));
    setUsernameError(""); // Clear any username error
    setUsernameSuggestions([]); // Clear the suggestions
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user types
    if (name === "username") setUsernameError("");
    if (name === "email") setEmailError("");
    if (name === "password") setPasswordError("");
  };

  // Validate form fields
  const validateForm = () => {
    let isValid = true;

    // Validate username
    if (!userData.username) {
      setUsernameError("Username is required");
      isValid = false;
    } else if (userData.username.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      isValid = false;
    }

    // Validate email
    if (!userData.email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    // Validate password
    if (!userData.password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (userData.password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      isValid = false;
    } else if (!/[A-Z]/.test(userData.password)) {
      setPasswordError("Password must include an uppercase letter");
      isValid = false;
    } else if (!/[0-9]/.test(userData.password)) {
      setPasswordError("Password must include a number");
      isValid = false;
    } else if (
      !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(userData.password)
    ) {
      setPasswordError("Password must include a special character");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (usernameError || emailError || passwordError) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    try {
      setIsSubmitting(true);

      // Only send required user data, let the API handle organization details
      const userPayload = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        organizationName: organizationName, // Pass the admin's organization name
      };

      const response = await fetch("/api/admin/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to add user");
      }

      // Store created username and set success state
      setCreatedUsername(userData.username);
      setIsSuccess(true);

      toast.success("User added successfully", {
        description: `${userData.username} has been added as an employee`,
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });

      // Delay closing modal to show success message
      setTimeout(() => {
        setUserData({ username: "", email: "", password: "" });
        setIsSuccess(false);
        onClose();
      }, 3000);
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user", {
        description: error.message || "An error occurred",
        icon: <XCircle className="h-5 w-5 text-red-500" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not open, don't render anything
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-md w-full relative transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,0,0,0.2)] z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glass highlight effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-white to-white rounded-xl opacity-50 group-hover:opacity-100 blur-sm transition-all duration-500 pointer-events-none"></div>

        <div
          className="p-5 border-b !border-black flex justify-between items-center relative z-30 bg-white"
          style={{ borderColor: "black" }}
        >
          <div className="flex flex-col">
            <div className="flex items-center mb-1">
              <div className="w-8 h-1 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] rounded-full"></div>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-transparent bg-clip-text">
              Add New User
            </h3>
            <p className="text-xs text-gray-600 font-medium">
              Add a new user to {organizationName}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-red-500 hover:text-red-700" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 bg-white relative z-30">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">
                User Added Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                <span className="font-semibold text-cyan-600">
                  {createdUsername}
                </span>{" "}
                has been added to the system as an employee.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                <div className="bg-gradient-to-r from-[#06B6D4] to-[#0891B2] h-1.5 rounded-full animate-progress"></div>
              </div>
              <p className="text-xs text-gray-500">Closing in 3 seconds...</p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="py-6 px-5 bg-white relative z-30"
          >
            <div className="space-y-4">
              {/* Username Field */}
              <div className="space-y-1 relative">
                <label
                  htmlFor="username"
                  className="text-xs font-bold !text-black flex justify-between items-center"
                  style={{ color: "black" }}
                >
                  <span>
                    Username<span className="text-red-500">*</span>
                  </span>
                  {checkingUsername && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <Loader2 className="h-2 w-2 animate-spin mr-1" />
                      Checking...
                    </span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    autoComplete="username"
                    value={userData.username}
                    onChange={handleChange}
                    placeholder="johndoe"
                    required
                    className={`block w-full pl-10 pr-3 py-2.5 border-2 rounded-md focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 bg-white text-gray-900 placeholder:text-gray-500 text-sm ${
                      usernameError ? "border-red-500" : "border-black"
                    }`}
                  />
                </div>

                {usernameError && (
                  <p className="text-xs text-red-500 mt-0.5">{usernameError}</p>
                )}

                {/* Username Suggestions */}
                {usernameSuggestions.length > 0 && (
                  <div className="mt-1">
                    <p className="text-xs text-gray-600">Suggestions:</p>
                    <div className="flex items-center justify-start space-x-4 mt-1">
                      {usernameSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectUsername(suggestion)}
                          className="text-xs py-0.5 px-2 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full hover:bg-cyan-100 hover:border-cyan-300 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1 relative">
                <label
                  htmlFor="email"
                  className="text-xs font-bold !text-black flex justify-between items-center"
                  style={{ color: "black" }}
                >
                  <span>
                    Email address<span className="text-red-500">*</span>
                  </span>
                  {checkingEmail && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <Loader2 className="h-2 w-2 animate-spin mr-1" />
                      Checking...
                    </span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    value={userData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    className={`block w-full pl-10 pr-3 py-2.5 border-2 rounded-md focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 bg-white text-gray-900 placeholder:text-gray-500 text-sm ${
                      emailError ? "border-red-500" : "border-black"
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-xs text-red-500 mt-0.5">{emailError}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1 relative">
                <label
                  htmlFor="password"
                  className="text-xs font-bold !text-black"
                  style={{ color: "black" }}
                >
                  Password<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-gray-400"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    value={userData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className={`block w-full pl-10 pr-10 py-2.5 border-2 rounded-md focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 bg-white text-gray-900 placeholder:text-gray-500 text-sm ${
                      passwordError ? "border-red-500" : "border-black"
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-cyan-600 transition-colors focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {passwordError ? (
                  <p className="text-xs text-red-500 mt-0.5">{passwordError}</p>
                ) : (
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    8+ chars with: 1-A, 1-a, 1-number, 1-@/#/$
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-white font-medium rounded-md shadow-sm hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-70 relative"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Adding User...
                  </>
                ) : (
                  "Add User"
                )}

                {/* Animated button background for loading state */}
                {isSubmitting && (
                  <div className="absolute inset-0 w-full h-full overflow-hidden rounded">
                    <div className="absolute left-0 top-0 h-full bg-white/20 animate-progress"></div>
                  </div>
                )}
              </button>
            </div>
          </form>
        )}

        <div
          className="py-3 px-5 border-t !border-black flex justify-center items-center bg-white relative z-30 text-xs text-gray-600"
          style={{ borderColor: "black" }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-5 h-0.5 bg-gradient-to-r from-[#06B6D4]/30 to-[#0891B2]/30 rounded-full"></div>
            <span>Enter all required information</span>
            <div className="w-5 h-0.5 bg-gradient-to-r from-[#0891B2]/30 to-[#06B6D4]/30 rounded-full"></div>
          </div>
        </div>

        {/* Styles similar to the signup page */}
        <style jsx global>{`
          @keyframes progress {
            0% {
              width: 0%;
            }
            100% {
              width: 100%;
            }
          }

          .animate-progress {
            animation: progress 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AddUserModal;
