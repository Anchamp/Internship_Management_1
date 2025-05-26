"use client";

import { useState, useEffect } from "react";
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
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Fetch organizations created by admins
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (role === "mentor" || role === "panelist") {
        setIsLoadingOrgs(true);
        try {
          const response = await fetch("/api/organizations");
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch organizations");
          }

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

  // Debounced username availability check
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!username || username.length < 3) return;

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
        }
      } catch (error) {
        console.error("Error checking username:", error);
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
      if (!email) return true;

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (usernameError || emailError || !validatePassword()) {
      toast.error("Please fix the errors in the form");
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
      ...(["mentor", "panelist"].includes(role)
        ? { organizationId: selectedOrganization }
        : {}),
    };

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
        <Card className="auth-card w-full max-w-md shadow-lg bg-white text-black relative transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,0,0,0.2)] z-20">
          {/* Glass highlight effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-white to-white rounded-xl opacity-50 group-hover:opacity-100 blur-sm transition-all duration-500 pointer-events-none"></div>

          <CardHeader className="space-y-1 text-center pb-6 bg-white relative z-30">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-1 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] rounded-full card-decoration"></div>
            </div>
            <CardTitle className="auth-title text-4xl font-bold bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-transparent bg-clip-text">
              Create Account
            </CardTitle>
            <CardDescription
              className="text-sm !text-black font-medium"
              style={{ color: "black" }}
            >
              Enter your information to create an account
            </CardDescription>
          </CardHeader>

          <CardContent className="bg-white relative z-30">
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
              <form onSubmit={handleSubmit} className="space-y-5 relative z-40">
                {/* Role Selection */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <Button
                    type="button"
                    onClick={() => setRole("intern")}
                    className={`py-2 px-4 transition-all duration-300 ${
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
                    onClick={() => setRole("mentor")}
                    className={`py-2 px-4 transition-all duration-300 ${
                      role === "mentor"
                        ? "!bg-[#06B6D4] !text-black font-bold"
                        : "bg-white !border-2 !border-[#06B6D4] !text-[#06B6D4] hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:!border-[#0891B2]"
                    }`}
                    style={{
                      backgroundColor: role === "mentor" ? "#06B6D4" : "white",
                      color: role === "mentor" ? "black" : "#06B6D4",
                    }}
                  >
                    Mentor
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setRole("panelist")}
                    className={`py-2 px-4 transition-all duration-300 ${
                      role === "panelist"
                        ? "!bg-[#06B6D4] !text-black font-bold"
                        : "bg-white !border-2 !border-[#06B6D4] !text-[#06B6D4] hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:!border-[#0891B2]"
                    }`}
                    style={{
                      backgroundColor:
                        role === "panelist" ? "#06B6D4" : "white",
                      color: role === "panelist" ? "black" : "#06B6D4",
                    }}
                  >
                    Panelist
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`py-2 px-4 transition-all duration-300 ${
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
                <div className="space-y-2 relative">
                  <label
                    htmlFor="username"
                    className="text-sm font-bold !text-black flex justify-between items-center"
                    style={{ color: "black" }}
                  >
                    <span>Username</span>
                    {checkingUsername && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
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
                    className={`input-glow bg-white !border-2 focus:!ring-black/20 !text-black placeholder:text-gray-500 relative z-40 ${
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
                    <p className="text-xs text-red-500 mt-1">{usernameError}</p>
                  )}
                </div>

                <div className="space-y-2 relative">
                  <label
                    htmlFor="email"
                    className="text-sm font-bold !text-black flex justify-between items-center"
                    style={{ color: "black" }}
                  >
                    <span>Email address</span>
                    {checkingEmail && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Checking...
                      </span>
                    )}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className={`input-glow bg-white !border-2 focus:!ring-black/20 !text-black placeholder:text-gray-500 relative z-40 ${
                      emailError ? "!border-red-500" : "!border-black"
                    }`}
                    style={{
                      color: "black",
                      backgroundColor: "white",
                      borderColor: emailError ? "#ef4444" : "black",
                      borderWidth: "2px",
                      position: "relative",
                      zIndex: 40,
                    }}
                  />
                  {emailError && (
                    <p className="text-xs text-red-500 mt-1">{emailError}</p>
                  )}
                </div>

                <div className="space-y-2 relative">
                  <label
                    htmlFor="password"
                    className="text-sm font-bold !text-black"
                    style={{ color: "black" }}
                  >
                    Password
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
                      className={`input-glow bg-white !border-2 focus:!ring-black/20 !text-black placeholder:text-gray-500 relative z-40 !pr-12 ${
                        passwordError ? "!border-red-500" : "!border-black"
                      }`}
                      style={{
                        color: "black",
                        backgroundColor: "white",
                        borderColor: passwordError ? "#ef4444" : "black",
                        borderWidth: "2px",
                        position: "relative",
                        zIndex: 40,
                        paddingRight: "3rem", // Ensure consistent right padding
                      }}
                    />
                    <div
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      style={{ zIndex: 60 }}
                    >
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 hover:text-[#0891B2] transition-colors focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {passwordError ? (
                    <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Password must have at least 8 characters, one uppercase
                      letter, one number, and one special character.
                    </p>
                  )}
                </div>

                {/* Role-specific Fields */}
                {role === "admin" && (
                  <div className="space-y-2 relative">
                    <label
                      htmlFor="organizationName"
                      className="text-sm font-bold !text-black"
                      style={{ color: "black" }}
                    >
                      Organization Name
                    </label>
                    <Input
                      id="organizationName"
                      type="text"
                      placeholder="Your Organization"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      disabled={isLoading}
                      className="input-glow bg-white !border-2 !border-black focus:!border-black focus:ring-black/20 !text-black placeholder:text-gray-500 relative z-40"
                      style={{
                        color: "black",
                        backgroundColor: "white",
                        borderColor: "black",
                        borderWidth: "2px",
                        position: "relative",
                        zIndex: 40,
                      }}
                    />
                  </div>
                )}

                {(role === "mentor" || role === "panelist") && (
                  <div className="space-y-2 relative">
                    <label
                      htmlFor="organization"
                      className="text-sm font-bold !text-black"
                      style={{ color: "black" }}
                    >
                      Select Organization
                    </label>
                    <Select
                      value={selectedOrganization}
                      onValueChange={setSelectedOrganization}
                      required
                      disabled={isLoading || isLoadingOrgs}
                    >
                      <SelectTrigger
                        className="input-glow bg-white !border-2 !border-black focus:!border-black focus:ring-black/20 !text-black placeholder:text-gray-500 relative z-40"
                        style={{
                          color: "black",
                          backgroundColor: "white",
                          borderColor: "black",
                          borderWidth: "2px",
                          position: "relative",
                          zIndex: 40,
                        }}
                      >
                        {isLoadingOrgs ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Loading...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder="Select an organization" />
                        )}
                      </SelectTrigger>
                      <SelectContent
                        className="!bg-white !text-black border-2 border-black shadow-lg max-h-60 overflow-y-auto z-50"
                        style={{
                          backgroundColor: "white",
                          color: "black",
                          zIndex: 9999,
                          borderColor: "black",
                          borderWidth: "2px",
                        }}
                      >
                        {organizations.length > 0 ? (
                          organizations.map((org) => (
                            <SelectItem
                              key={org.id}
                              value={org.id}
                              className="!text-black hover:!bg-gray-100 cursor-pointer"
                              style={{ color: "black" }}
                            >
                              {org.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-gray-500">
                            No organizations available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {organizations.length === 0 && !isLoadingOrgs && (
                      <p className="text-xs text-amber-600 mt-1">
                        No organizations found. Please contact an admin to
                        create one.
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="gradient-button w-full bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:opacity-90 text-white font-bold py-2 shadow-md hover:shadow-lg transition-all duration-300 relative"
                  disabled={
                    isLoading ||
                    !!usernameError ||
                    !!emailError ||
                    !!passwordError
                  }
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
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
            className="flex justify-center border-t !border-black p-6 bg-white relative z-30"
            style={{ borderColor: "black" }}
          >
            <Link
              href="/sign-in"
              className="text-sm text-[#0891B2] hover:text-[#06B6D4] hover:underline font-bold transition-colors"
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
      `}</style>
    </div>
  );
}
