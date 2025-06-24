"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";
import "../auth.css";

type Organization = {
  id: string;
  name: string;
};

const useSuppressionKey = () => {
  useEffect(() => {
    return () => {};
  }, []);
};

export default function SignUp() {
  useSuppressionKey();
  // Add mounted state
  const [isMounted, setIsMounted] = useState(false);
  const [role, setRole] = useState("intern");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [orgNameError, setOrgNameError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingOrgName, setCheckingOrgName] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", ""]);
  const otpInputRefs = Array(4)
    .fill(0)
    .map(() => React.createRef<HTMLInputElement>());

  // New state variables for OTP verification
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);

  // New state for organization search
  const [orgSearchQuery, setOrgSearchQuery] = useState("");

  // Add clearOrgSearch function
  const clearOrgSearch = () => {
    setOrgSearchQuery("");
  };

  // Add filtered organizations logic with useMemo
  const filteredOrganizations = useMemo(() => {
    if (!orgSearchQuery.trim()) return organizations;
    return organizations.filter((org) =>
      org.name.toLowerCase().includes(orgSearchQuery.toLowerCase())
    );
  }, [organizations, orgSearchQuery]);

  const router = useRouter();

  // Fetch organizations created by admins
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (role === "employee") {
        setIsLoadingOrgs(true);
        try {
          const response = await fetch("/api/organizations");
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch organizations");
          }

          // Log the fetched organizations to verify the data structure
          console.log("Fetched organizations:", data.organizations);

          setOrganizations(data.organizations || []);
        } catch (err) {
          console.error("Error fetching organizations:", err);
          toast.error("Failed to load organizations", {
            description: "Please try refreshing the page.",
          });
          setOrganizations([]);
        } finally {
          setIsLoadingOrgs(false);
        }
      }
    };

    fetchOrganizations();
  }, [role]);

  // Reset selected organization when role changes
  useEffect(() => {
    setSelectedOrganization("");
  }, [role]);

  // Reset field errors when changing fields
  useEffect(() => {
    setUsernameError("");
  }, [username]);

  useEffect(() => {
    setEmailError("");
  }, [email]);

  useEffect(() => {
    setPasswordError("");
  }, [password]);

  useEffect(() => {
    setOrgNameError("");
  }, [organizationName]);

  // Function to select a suggested username
  const selectUsername = (suggestion: string) => {
    setUsername(suggestion);
    setUsernameError(""); // Clear any username error
    setUsernameSuggestions([]); // Clear the suggestions
  };

  // Debounced username availability check
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!username || username.length < 3) {
        setUsernameSuggestions([]);
        return;
      }

      setCheckingUsername(true);
      try {
        const response = await fetch("/api/check-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field: "username", value: username }),
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
  }, [username]);

  // Debounced email availability check and format validation
  useEffect(() => {
    const validateEmailFormat = () => {
      if (!email) {
        setIsValidEmail(false);
        return true;
      }

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(email);
      setIsValidEmail(isValid);

      if (!isValid) {
        setEmailError("Please enter a valid email address");
        return false;
      }
      return true;
    };

    const checkEmailAvailability = async () => {
      if (!email || !validateEmailFormat()) return;

      setCheckingEmail(true);
      try {
        const response = await fetch("/api/check-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field: "email", value: email }),
        });

        const data = await response.json();

        if (!data.available) {
          setEmailError(data.message || "Email is already in use");
        }
      } catch (error) {
        console.error("Error checking email:", error);
      } finally {
        setCheckingEmail(false);
      }
    };

    const timer = setTimeout(checkEmailAvailability, 500);
    return () => clearTimeout(timer);
  }, [email]);

  // Add organization name availability check
  useEffect(() => {
    const checkOrgNameAvailability = async () => {
      if (!organizationName || organizationName.length < 2 || role !== "admin")
        return;

      setCheckingOrgName(true);
      try {
        const response = await fetch("/api/check-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            field: "organization",
            value: organizationName,
          }),
        });

        const data = await response.json();

        if (!data.available) {
          setOrgNameError(data.message || "Organization name already exists");
        }
      } catch (error) {
        console.error("Error checking organization name:", error);
      } finally {
        setCheckingOrgName(false);
      }
    };

    const timer = setTimeout(checkOrgNameAvailability, 500);
    return () => clearTimeout(timer);
  }, [organizationName, role]);

  // Password complexity validation
  const validatePassword = () => {
    if (!password) return false;

    let errorMessage = "";

    // At least 8 characters
    if (password.length < 8) {
      errorMessage = "Password must be at least 8 characters long";
    }
    // Contains uppercase
    else if (!/[A-Z]/.test(password)) {
      errorMessage = "Password must include an uppercase letter";
    }
    // Contains number
    else if (!/[0-9]/.test(password)) {
      errorMessage = "Password must include a number";
    }
    // Contains special character
    else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errorMessage = "Password must include a special character";
    }

    setPasswordError(errorMessage);
    return errorMessage === "";
  };

  // Check form validity whenever form fields change
  useEffect(() => {
    const isValid = () => {
      // Basic required fields for all roles
      if (!username || !email || !password) return false;
      if (usernameError || emailError || passwordError || orgNameError)
        return false;

      // Role-specific required fields
      if (role === "admin" && !organizationName) return false;
      if (role === "employee" && !selectedOrganization) return false;
      return true;
    };

    setFormValid(isValid());
  }, [
    username,
    email,
    password,
    role,
    organizationName,
    selectedOrganization,
    usernameError,
    emailError,
    passwordError,
    orgNameError,
  ]);

  // Function to send OTP email
  const sendOtpEmail = async () => {
    if (!isValidEmail || emailError) return;

    setSendingOtp(true);
    setOtpError("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to send verification code"
        );
      }

      setOtpSent(true);
      setShowOtpInput(true);
      toast.success("Verification code sent!", {
        description: "Please check your email inbox",
        duration: 4000,
      });

      // Auto-focus the first OTP input field
      setTimeout(() => {
        otpInputRefs[0].current?.focus();
      }, 300);
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send verification code", {
        description: error.message || "Please try again later",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;

    // Create new array with the updated value
    const newOtpValues = [...otpValues];
    // Only take the last character if multiple are pasted
    newOtpValues[index] = value.slice(-1);
    setOtpValues(newOtpValues);
    setOtpError("");

    // Auto-advance to next field if value is entered and not on last field
    if (value && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }

    // Auto-verify if all fields are filled
    if (value && index === 3) {
      const allFilled = newOtpValues.every((val) => val !== "");
      if (allFilled) {
        setTimeout(() => verifyOtp(), 300);
      }
    }
  };

  // Handle backspace in OTP input
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // If backspace is pressed and current field is empty, focus previous field
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  // Function to verify OTP
  const verifyOtp = async () => {
    const enteredOtp = otpValues.join("");
    if (enteredOtp.length !== 4) return;

    setVerifyingOtp(true);
    setOtpError("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: enteredOtp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid verification code");
      }

      // Email successfully verified
      setIsEmailVerified(true);
      setShowOtpInput(false);
      toast.success("Email verified successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      setOtpError(error.message || "Invalid verification code");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation - add orgNameError check
    if (!formValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError("");
    setIsSuccess(false);

    // Show a loading toast that will be updated based on the result
    const loadingToast = toast.loading("Creating your account...", {
      duration: 10000, // Long duration which will be dismissed on success/error
    });

    const userData = {
      role,
      username,
      email,
      password,
      ...(role === "admin" ? { organizationName } : {}),
      ...(role === "employee"
        ? { organizationId: selectedOrganization } // This should be the formatted ID now
        : {}),
    };

    // Debug log to see what's being sent
    console.log("Submitting user data:", userData);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || data.message || "Failed to sign up");
      if (data.error) {
        toast.dismiss(loadingToast);
        toast.error(data.error, {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          className: "font-medium",
          description: "Please try again with different credentials.",
        });
        setError(data.error);
        return;
      }

      // Dismiss the loading toast
      toast.dismiss(loadingToast);

      // Set success state to show in-page message
      setIsSuccess(true);

      // Show success toast
      toast.success("Account created successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        className: "font-medium",
        description: "You can now sign in with your new account.",
        duration: 5000,
      });

      // Wait longer before redirecting to let user see the success message
      setTimeout(() => {
        router.push("/sign-in");
      }, 4000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);

      // Dismiss the loading toast
      toast.dismiss(loadingToast);

      // Show error toast
      toast.error("Sign up failed", {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        className: "font-medium",
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Run once when component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If not mounted yet (during server rendering or hydration),
  // return a simplified version of the component
  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col relative bg-white auth-section">
        <div className="flex flex-col items-center justify-center flex-grow p-4 relative z-10">
          <Card className="auth-card w-full max-w-md shadow-lg bg-white text-black relative">
            <CardHeader className="space-y-1 text-center pb-6 bg-white relative z-30">
              <CardTitle className="auth-title text-4xl font-bold bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-transparent bg-clip-text">
                Create Account
              </CardTitle>
              <CardDescription className="text-sm">
                Enter your information to create an account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Simplified loading state */}
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main component rendering when mounted
  return (
    <div className="min-h-screen flex flex-col relative bg-white auth-section">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          href="/"
          className="flex items-center text-black hover:text-[#0891B2] transition-colors font-bold no-underline group"
        >
          <ArrowLeft className="h-5 w-5 mr-1 transition-colors" />
          <span className="text-black group-hover:text-[#0891B2] transition-colors">
            Back
          </span>
        </Link>
      </div>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/3 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-20 left-1/4 w-64 h-64 bg-cyan-300/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="flex flex-col items-center justify-center flex-grow p-4 relative z-10">
        <Card className="auth-card w-full max-w-sm shadow-lg bg-white text-black relative transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,0,0,0.2)] z-20">
          {/* Glass highlight effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-white to-white rounded-xl opacity-50 group-hover:opacity-100 blur-sm transition-all duration-500 pointer-events-none"></div>

          <CardHeader className="space-y-1 text-center pb-3 bg-white relative z-30">
            <div className="flex items-center justify-center mb-1">
              <div className="w-10 h-1 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] rounded-full card-decoration"></div>
            </div>
            <CardTitle className="auth-title text-2xl font-bold bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-transparent bg-clip-text">
              Create Account
            </CardTitle>
            <CardDescription
              className="text-xs !text-black font-medium"
              style={{ color: "black" }}
            >
              Enter your information to create an account
            </CardDescription>
          </CardHeader>

          <CardContent className="bg-white relative z-30 py-3 px-4">
            {error && (
              <div className="bg-[#FFF5F5] border border-red-500/30 text-red-700 text-sm p-4 rounded-lg mb-4 flex items-start">
                <XCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {isSuccess && (
              <div className="bg-[#F0FFF4] border border-green-500/30 text-green-700 text-sm p-4 rounded-lg mb-4 flex items-start">
                <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Account created successfully!</p>
                  <p className="mt-1">
                    You will be redirected to sign in shortly...
                  </p>
                </div>
              </div>
            )}

            {!isSuccess && (
              <form onSubmit={handleSubmit} className="space-y-3 relative z-40">
                {/* Role Selection */}
                <div className="flex items-center justify-around gap-2">
                  <Button
                    type="button"
                    onClick={() => setRole("intern")}
                    className={`flex-1 py-1 px-2 text-xs transition-all duration-300 ${
                      role === "intern"
                        ? "!bg-[#06B6D4] !text-black font-bold"
                        : "bg-white !border-2 !border-[#06B6D4] !text-[#06B6D4] hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:!border-[#0891B2]"
                    }`}
                    style={{
                      backgroundColor: role === "intern" ? "#06B6D4" : "white",
                      color: role === "intern" ? "black" : "#06B6D4",
                    }}
                  >
                    Intern
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setRole("employee")}
                    className={`flex-1 py-1 px-2 text-xs transition-all duration-300 ${
                      role === "employee"
                        ? "!bg-[#06B6D4] !text-black font-bold"
                        : "bg-white !border-2 !border-[#06B6D4] !text-[#06B6D4] hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:!border-[#0891B2]"
                    }`}
                    style={{
                      backgroundColor:
                        role === "employee" ? "#06B6D4" : "white",
                      color: role === "employee" ? "black" : "#06B6D4",
                    }}
                  >
                    Employee
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex-1 py-1 px-2 text-xs transition-all duration-300 ${
                      role === "admin"
                        ? "!bg-[#06B6D4] !text-black font-bold"
                        : "bg-white !border-2 !border-[#06B6D4] !text-[#06B6D4] hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:!border-[#0891B2]"
                    }`}
                    style={{
                      backgroundColor: role === "admin" ? "#06B6D4" : "white",
                      color: role === "admin" ? "black" : "#06B6D4",
                    }}
                  >
                    Admin
                  </Button>
                </div>

                {/* Common Fields */}
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
                  <Input
                    id="username"
                    type="text"
                    placeholder="rutvik"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className={`input-glow bg-white !border-2 focus:!ring-black/20 !text-black placeholder:text-gray-500 relative z-40 h-8 text-xs ${
                      usernameError ? "!border-red-500" : "!border-black"
                    }`}
                    style={{
                      color: "black",
                      backgroundColor: "white",
                      borderColor: usernameError ? "#ef4444" : "black",
                      borderWidth: "2px",
                      position: "relative",
                      zIndex: 40,
                    }}
                  />
                  {usernameError && (
                    <p className="text-xs text-red-500 mt-0.5">
                      {usernameError}
                    </p>
                  )}

                  {/* Username Suggestions */}
                  {usernameSuggestions.length > 0 && (
                    <div className="mt-1">
                      <div className="flex items-center justify-start space-x-4">
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
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-grow">
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading || showOtpInput || isEmailVerified}
                        className={`input-glow bg-white !border-2 focus:!ring-black/20 !text-black placeholder:text-gray-500 relative z-40 h-8 text-xs ${
                          emailError
                            ? "!border-red-500"
                            : isEmailVerified
                            ? "!border-green-500 pr-8"
                            : "!border-black"
                        }`}
                        style={{
                          color: "black",
                          backgroundColor: "white",
                          borderColor: emailError
                            ? "#ef4444"
                            : isEmailVerified
                            ? "#10b981"
                            : "black",
                          borderWidth: "2px",
                          position: "relative",
                          zIndex: 40,
                        }}
                      />
                      {isEmailVerified && (
                        <div className="absolute inset-y-0 right-2 flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    {isValidEmail && !emailError && !isEmailVerified && (
                      <button
                        type="button"
                        onClick={sendOtpEmail}
                        disabled={sendingOtp || showOtpInput}
                        className="px-3 py-1.5 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-medium rounded-md shadow-sm hover:opacity-90 transition-colors disabled:opacity-50"
                      >
                        {sendingOtp ? (
                          <div className="flex items-center">
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span>Sending...</span>
                          </div>
                        ) : showOtpInput ? (
                          "Resend"
                        ) : (
                          "Verify"
                        )}
                      </button>
                    )}
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-500 mt-0.5">{emailError}</p>
                  )}
                </div>

                {/* OTP Input UI */}
                {showOtpInput && (
                  <div className="mt-2 animate-fadeIn bg-gray-50 p-3 rounded-md border border-gray-200">
                    <div className="space-y-1">
                      <label
                        className="text-xs font-bold !text-black"
                        style={{ color: "black" }}
                      >
                        Enter verification code
                      </label>
                      <p className="text-xs text-gray-500">
                        We've sent a 4-digit code to {email}
                      </p>

                      <div className="flex justify-center mt-3 gap-1.5">
                        {[0, 1, 2, 3].map((index) => (
                          <input
                            key={index}
                            ref={otpInputRefs[index]}
                            type="text"
                            maxLength={1}
                            value={otpValues[index]}
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className={`w-10 h-10 text-center border-2 ${
                              otpError ? "border-red-500" : "border-black"
                            } rounded-md text-base font-bold focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 text-black shadow-sm`}
                            style={{
                              backgroundColor: "white",
                              color: "black",
                            }}
                            autoComplete="one-time-code"
                          />
                        ))}
                      </div>

                      {otpError && (
                        <p className="text-xs text-red-500 text-center mt-2">
                          {otpError}
                        </p>
                      )}

                      <div className="flex justify-between mt-3">
                        <button
                          type="button"
                          onClick={() => setShowOtpInput(false)}
                          className="px-3 py-1 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={verifyOtp}
                          disabled={
                            otpValues.some((val) => !val) || verifyingOtp
                          }
                          className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-medium rounded-md shadow-sm hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {verifyingOtp ? (
                            <div className="flex items-center">
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              <span>Verifying...</span>
                            </div>
                          ) : (
                            "Verify Email"
                          )}
                        </button>
                      </div>

                      <div className="text-center mt-2">
                        <button
                          type="button"
                          onClick={sendOtpEmail}
                          disabled={sendingOtp}
                          className="text-xs text-cyan-600 hover:text-cyan-700 hover:underline"
                        >
                          {sendingOtp ? "Sending..." : "Resend code"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1 relative">
                  <label
                    htmlFor="password"
                    className="text-xs font-bold !text-black"
                    style={{ color: "black" }}
                  >
                    Password<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => validatePassword()}
                      disabled={isLoading}
                      className={`input-glow bg-white !border-2 focus:!ring-black/20 !text-black placeholder:text-gray-500 relative z-40 !pr-8 h-8 text-xs ${
                        passwordError ? "!border-red-500" : "!border-black"
                      }`}
                      style={{
                        color: "black",
                        backgroundColor: "white",
                        borderColor: passwordError ? "#ef4444" : "black",
                        borderWidth: "2px",
                        position: "relative",
                        zIndex: 40,
                      }}
                    />
                    <div
                      className="absolute inset-y-0 right-0 flex items-center pr-2"
                      style={{ zIndex: 60 }}
                    >
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 hover:text-[#0891B2] transition-colors focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {passwordError ? (
                    <p className="text-xs text-red-500 mt-0.5">
                      {passwordError}
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      8+ chars with: 1-A, 1-a, 1-number, 1-@/#/$
                    </p>
                  )}
                </div>

                {/* Role-specific Fields */}
                {role === "admin" && (
                  <div className="space-y-1 relative">
                    <label
                      htmlFor="organizationName"
                      className="text-xs font-bold !text-black flex justify-between items-center"
                      style={{ color: "black" }}
                    >
                      <span>
                        Organization Name<span className="text-red-500">*</span>
                      </span>
                      {checkingOrgName && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <Loader2 className="h-2 w-2 animate-spin mr-1" />
                          Checking...
                        </span>
                      )}
                    </label>
                    <Input
                      id="organizationName"
                      type="text"
                      placeholder="Your Organization"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      disabled={isLoading}
                      className={`input-glow bg-white !border-2 focus:!ring-black/20 !text-black placeholder:text-gray-500 relative z-40 h-8 text-xs ${
                        orgNameError ? "!border-red-500" : "!border-black"
                      }`}
                      style={{
                        color: "black",
                        backgroundColor: "white",
                        borderColor: orgNameError ? "#ef4444" : "black",
                        borderWidth: "2px",
                        position: "relative",
                        zIndex: 40,
                      }}
                    />
                    {orgNameError && (
                      <p className="text-xs text-red-500 mt-0.5">
                        {orgNameError}
                      </p>
                    )}
                  </div>
                )}

                {role === "employee" && (
                  <div className="space-y-1 relative">
                    <label
                      htmlFor="organization"
                      className="text-xs font-bold !text-black"
                      style={{ color: "black" }}
                    >
                      Select Organization<span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectedOrganization}
                      onValueChange={setSelectedOrganization}
                      required
                      disabled={isLoading || isLoadingOrgs}
                      onOpenChange={(open) => {
                        if (!open) {
                          clearOrgSearch();
                        }
                      }}
                    >
                      <SelectTrigger
                        className="input-glow bg-white !border-2 !border-black focus:!border-black focus:ring-black/20 !text-black placeholder:text-gray-500 relative z-40 h-8 text-xs"
                        style={{
                          color: "black",
                          backgroundColor: "white",
                          borderColor: "black",
                          borderWidth: "2px",
                        }}
                      >
                        {isLoadingOrgs ? (
                          <div className="flex items-center">
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                            <span>Loading...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder="Select an organization" />
                        )}
                      </SelectTrigger>
                      <SelectContent
                        className="!bg-white !text-black border-2 border-black shadow-xl overflow-hidden z-50 p-0"
                        style={{
                          backgroundColor: "white",
                          color: "black",
                          zIndex: 9999,
                          borderColor: "black",
                          borderWidth: "2px",
                        }}
                      >
                        {/* Improved Search Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-2.5 shadow-sm">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                              <Search className="h-3.5 w-3.5 text-cyan-600" />
                            </div>
                            <Input
                              placeholder="Search organizations..."
                              value={orgSearchQuery}
                              onChange={(e) =>
                                setOrgSearchQuery(e.target.value)
                              }
                              className="h-7 pl-8 pr-8 text-xs !bg-white !border !border-gray-300 !text-black placeholder:text-gray-500 focus:!border-cyan-500 focus:!ring-1 focus:!ring-cyan-500/30 rounded-md transition-all duration-200"
                              style={{
                                color: "black",
                                backgroundColor: "white",
                              }}
                              autoComplete="off"
                            />
                            {orgSearchQuery && (
                              <button
                                onClick={clearOrgSearch}
                                className="absolute inset-y-0 right-0 pr-2.5 flex items-center transition-opacity duration-200 opacity-70 hover:opacity-100"
                              >
                                <XCircle className="h-3.5 w-3.5 text-gray-500 hover:text-red-500" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Results Area with Enhanced Styling */}
                        <div className="max-h-[180px] overflow-y-auto py-1.5 px-1">
                          {isLoadingOrgs ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="h-5 w-5 animate-spin text-cyan-500 mr-2" />
                              <span className="text-sm text-gray-600">
                                Loading organizations...
                              </span>
                            </div>
                          ) : filteredOrganizations.length > 0 ? (
                            <div className="space-y-0.5">
                              {filteredOrganizations.map((org) => (
                                <SelectItem
                                  key={org.id}
                                  value={org.id}
                                  className="!text-black hover:!bg-cyan-50 cursor-pointer text-xs py-2 px-3 rounded-md transition-colors duration-150"
                                  style={{ color: "black" }}
                                >
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 w-4 h-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mr-2 opacity-80"></div>
                                    <span>{org.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 px-3">
                              <div className="bg-gray-50 rounded-lg p-3 inline-flex items-center justify-center mb-2">
                                <Search className="h-4 w-4 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-500 font-medium">
                                {organizations.length > 0
                                  ? "No matching organizations found"
                                  : "No organizations available"}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {organizations.length > 0
                                  ? "Try a different search term"
                                  : "Please contact an administrator"}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Footer with Organization Count */}
                        {organizations.length > 0 && !isLoadingOrgs && (
                          <div className="border-t border-gray-200 py-1.5 px-3 text-[10px] text-gray-500 bg-gray-50">
                            {filteredOrganizations.length} of{" "}
                            {organizations.length} organizations
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {organizations.length === 0 && !isLoadingOrgs && (
                      <p className="text-[10px] text-amber-600 mt-0.5">
                        No organizations found. Contact an admin.
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className={`gradient-button w-full bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:opacity-90 text-white font-bold py-1 text-sm mt-2 shadow-md hover:shadow-lg transition-all duration-300 relative ${
                    !formValid && !isLoading
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={isLoading || !formValid}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      Creating account...
                    </span>
                  ) : (
                    "Sign up"
                  )}

                  {/* Animated button background for loading state */}
                  {isLoading && (
                    <div className="absolute inset-0 w-full h-full overflow-hidden rounded">
                      <div className="absolute left-0 top-0 h-full bg-white/20 animate-progress"></div>
                    </div>
                  )}
                </Button>
              </form>
            )}

            {isSuccess && (
              <div className="text-center mt-6">
                <div className="inline-block mx-auto mb-4 bg-green-100 p-3 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">
                  Account Created Successfully!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your account has been created and is ready to use.
                </p>
                <Button
                  type="button"
                  onClick={() => router.push("/sign-in")}
                  className="gradient-button w-full bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:opacity-90 text-white font-bold py-2 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Continue to Sign In
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter
            className="flex justify-center border-t !border-black p-3 bg-white relative z-30"
            style={{ borderColor: "black" }}
          >
            <Link
              href="/sign-in"
              className="text-xs text-[#0891B2] hover:text-[#06B6D4] hover:underline font-bold transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-8 h-1 bg-gradient-to-r from-[#06B6D4]/30 to-[#0891B2]/30 rounded-full card-decoration"></div>
            <div className="w-2 h-2 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] rounded-full card-decoration"></div>
            <div className="w-8 h-1 bg-gradient-to-r from-[#0891B2]/30 to-[#06B6D4]/30 rounded-full card-decoration"></div>
          </div>
          <p className="text-sm text-black font-bold">
            Streamline your internship program management
          </p>
        </div>
      </div>

      {/* Styles to ensure proper interaction */}
      <style jsx global>{`
        .auth-card::before,
        .auth-card::after {
          pointer-events: none;
        }

        .input-glow {
          position: relative;
          z-index: 40;
        }

        /* Ensure all inputs are clickable */
        input,
        button,
        a {
          position: relative;
          z-index: 50;
        }

        /* Fix dropdown styling */
        [data-radix-popper-content-wrapper] {
          z-index: 9999 !important;
        }

        [data-radix-select-content] {
          background-color: white !important;
          color: black !important;
          border: 2px solid black !important;
          overflow-y: auto !important;
          max-height: 200px !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
            0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
        }

        [data-radix-select-item] {
          color: black !important;
          cursor: pointer !important;
        }

        [data-radix-select-item]:hover {
          background-color: #f3f4f6 !important;
        }

        [data-radix-select-item][data-highlighted] {
          background-color: #e5e7eb !important;
          color: black !important;
        }

        /* Animation for loading button */
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

        /* Toast customization */
        :root {
          --toast-bg: white;
          --toast-border: #e2e8f0;
          --toast-text: black;
        }

        [data-sonner-toast] {
          border: 1px solid var(--toast-border) !important;
          background: var(--toast-bg) !important;
          color: var(--toast-text) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          padding: 16px !important;
          border-radius: 8px !important;
        }

        [data-sonner-toast][data-type="success"] {
          border-left: 4px solid #10b981 !important;
        }

        [data-sonner-toast][data-type="error"] {
          border-left: 4px solid #ef4444 !important;
        }

        [data-sonner-toast][data-type="loading"] {
          border-left: 4px solid #3b82f6 !important;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
