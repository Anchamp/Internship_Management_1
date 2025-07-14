"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Users,
  ClipboardList,
  ChevronRight,
  Star,
  Menu,
  X,
  Calendar,
  MessageSquare,
  LineChart,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Testimonial {
  _id: string;
  name: string;
  designation: string;
  rating: number;
  description: string;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // New state variables for feedback functionality
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Form state
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackDesignation, setFeedbackDesignation] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackDescription, setFeedbackDescription] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Tilt effect state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Add carousel state
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const testimonialRef = useRef<HTMLDivElement>(null);

  // Function to get initials from name
  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  // Fetch testimonials
  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/feedback");
      if (!res.ok) throw new Error("Failed to fetch testimonials");
      const data = await res.json();
      setTestimonials(data);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      // Set some default testimonials as fallback
      setTestimonials([
        {
          _id: "1",
          name: "Robert Smith",
          designation: "Internship Coordinator",
          rating: 5,
          description:
            "We used to manage our internship program with spreadsheets and emails. InternshipHub has reduced our administrative work by 70% and improved communication across the board.",
        },
        {
          _id: "2",
          name: "Jennifer Patel",
          designation: "HR Director",
          rating: 5,
          description:
            "The demo management features alone have saved us countless hours. Our guides and panelists love the streamlined scheduling and feedback process.",
        },
        {
          _id: "3",
          name: "Thomas Miller",
          designation: "Engineering Manager",
          rating: 5,
          description:
            "As a project guide, I can now easily track all my interns' progress in one place. The weekly updates feature ensures everyone stays accountable and on track.",
        },
      ]);
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setFormErrors({});

    // Client-side validation
    const errors: { [key: string]: string } = {};
    if (feedbackDescription.trim().length < 10) {
      errors.description = "Feedback should be at least 10 characters long";
    }

    // If there are errors, show them and don't submit
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmittingFeedback(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: feedbackName,
          designation: feedbackDesignation,
          rating: feedbackRating,
          description: feedbackDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle server validation errors
        if (data.errors) {
          const serverErrors: { [key: string]: string } = {};
          Object.keys(data.errors).forEach((key) => {
            serverErrors[key] = data.errors[key].message;
          });
          setFormErrors(serverErrors);
          throw new Error("Validation failed");
        }
        throw new Error(data.message || "Failed to submit feedback");
      }

      // Reset form and show success message
      setFeedbackName("");
      setFeedbackDesignation("");
      setFeedbackRating(5);
      setFeedbackDescription("");
      setFeedbackSuccess(true);

      // Refresh testimonials
      fetchTestimonials();

      // Close modal after short delay
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      // Error already handled with setFormErrors above
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Check if user has stored credentials and sign in automatically
  const checkStoredCredentials = async () => {
    try {
      // Check for stored token and user data
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        // User data exists, attempt to auto-login
        setIsSigningIn(true);
        console.log("Found stored credentials, attempting auto-login");

        // Parse user data
        const userData = JSON.parse(userStr);

        // Display success message
        toast("Welcome back!", {
          description: `Signing in as ${userData.username}...`,
          duration: 2000,
        });

        // Short timeout to show the message before redirecting
        setTimeout(() => {
          // Redirect based on role
          switch (userData.role) {
            case "intern":
              window.location.href = "/dashboard/intern";
              break;
            case "employee":
              window.location.href = "/dashboard/employee";
              break;
            case "mentor":
              window.location.href = "/dashboard/mentor";
              break;
            case "panelist":
              window.location.href = "/dashboard/panelist";
              break;
            case "admin":
              window.location.href = "/dashboard/admin";
              break;
            default:
              window.location.href = "/home"; // Fallback route
          }
        }, 1000);

        return true; // Successfully auto-logged in
      }
      return false; // No stored credentials
    } catch (err) {
      console.error("Error checking stored credentials:", err);
      // Clear potentially corrupt data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }
  };

  // Show sign-in popup after 5 seconds on every visit
  useEffect(() => {
    setMounted(true);

    // Set timeout to show the popup after 5 seconds
    const timer = setTimeout(async () => {
      // Check if we have stored credentials before showing popup
      const isAutoSignedIn = await checkStoredCredentials();

      // Only show popup if auto sign-in failed
      if (!isAutoSignedIn) {
        setShowSignInPopup(true);
      }
    }, 5000);

    // Fetch testimonials on page load
    fetchTestimonials();

    // Clear timeout on unmount
    return () => clearTimeout(timer);
  }, []);

  // Close popup function
  const closePopup = () => {
    setShowSignInPopup(false);
  };

  // Close feedback modal
  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackSuccess(false);
  };

  // Handle sign in submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setAuthError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to sign in");
      }

      // Store token in both localStorage and cookies
      localStorage.setItem("token", data.token);
      document.cookie = `token=${data.token}; path=/; max-age=86400`; // 1 day

      // Store user info in localStorage
      const userData = {
        email: data.email,
        userId: data.userId,
        role: data.role,
        username: data.username,
        organizationName: data.organizationName,
        organizationId: data.organizationId,
      };
      localStorage.setItem("user", JSON.stringify(userData));

      // Redirect based on role
      switch (data.role) {
        case "intern":
          window.location.href = "/dashboard/intern";
          break;
        case "mentor":
          window.location.href = "/dashboard/mentor";
          break;
        case "panelist":
          window.location.href = "/dashboard/panelist";
          break;
        case "admin":
          window.location.href = "/dashboard/admin";
          break;
        default:
          window.location.href = "/home"; // Fallback route
      }
    } catch (err: any) {
      setAuthError(err.message || "An error occurred during sign in");
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle mouse movement for tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    // Calculate mouse position relative to card center
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Set tilt values (scaled down to create a subtle effect)
    setTilt({
      x: y / 20, // Inverted for natural tilt feel
      y: -x / 20, // Inverted for natural tilt feel
    });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Reset tilt when mouse leaves
    setTilt({ x: 0, y: 0 });
  };

  // Handle testimonial navigation
  const nextTestimonial = () => {
    if (testimonials.length <= 3) return;
    setCurrentTestimonialIndex((prev) =>
      prev === testimonials.length - 3 ? 0 : prev + 1
    );
  };

  const prevTestimonial = () => {
    if (testimonials.length <= 3) return;
    setCurrentTestimonialIndex((prev) =>
      prev === 0 ? testimonials.length - 3 : prev - 1
    );
  };

  // Auto-scroll testimonials every 2 seconds
  useEffect(() => {
    if (testimonials.length <= 3) return;

    const interval = setInterval(() => {
      nextTestimonial();
    }, 2000);

    return () => clearInterval(interval);
  }, [testimonials.length, currentTestimonialIndex]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 overflow-x-hidden font-sans">
      {/* Sign-In Popup - Enhanced with full sign-in form */}
      {showSignInPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full m-4 transform transition-all animate-fadeIn overflow-hidden">
            <div className="p-6 border-b border-cyan-100">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-cyan-500/20">
                    <ClipboardList className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-cyan-700">
                    InternshipHub
                  </span>
                </div>
                <button
                  onClick={closePopup}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
                  {authError}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 block"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSigningIn}
                      className="w-full p-2 pl-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700 block"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSigningIn}
                      className="w-full p-2 pl-3 pr-10 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <label htmlFor="remember" className="text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className={`w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-all ${
                    isSigningIn ? "opacity-80 cursor-not-allowed" : ""
                  }`}
                >
                  {isSigningIn ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="text-cyan-600 hover:text-cyan-700 font-medium hover:underline"
                    onClick={closePopup}
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our{" "}
                <Link href="#" className="text-cyan-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-cyan-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Form Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full m-4 transform transition-all animate-fadeIn overflow-hidden">
            <div className="p-6 border-b border-cyan-100">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-cyan-500/20">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-cyan-700">
                    Feedback Form
                  </span>
                </div>
                <button
                  onClick={closeFeedbackModal}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {feedbackSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-lg mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Thank you for your feedback! It has been submitted
                  successfully.
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700 block"
                    >
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={feedbackName}
                      onChange={(e) => setFeedbackName(e.target.value)}
                      disabled={isSubmittingFeedback}
                      className="w-full p-2 pl-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="designation"
                      className="text-sm font-medium text-gray-700 block"
                    >
                      Designation
                    </label>
                    <input
                      id="designation"
                      type="text"
                      placeholder="Engineering Manager"
                      required
                      value={feedbackDesignation}
                      onChange={(e) => setFeedbackDesignation(e.target.value)}
                      disabled={isSubmittingFeedback}
                      className="w-full p-2 pl-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="rating"
                      className="text-sm font-medium text-gray-700 block"
                    >
                      Rating (1-5)
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className={`text-2xl focus:outline-none ${
                            star <= feedbackRating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className="text-sm font-medium text-gray-700 block"
                    >
                      Your Feedback <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      placeholder="Tell us about your experience... (minimum 10 characters)"
                      required
                      value={feedbackDescription}
                      onChange={(e) => setFeedbackDescription(e.target.value)}
                      disabled={isSubmittingFeedback}
                      rows={4}
                      className={`w-full p-2 pl-3 border-2 ${
                        formErrors.description
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-cyan-500 focus:border-cyan-500"
                      } rounded-md focus:ring-2`}
                    />
                    {formErrors.description && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.description}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingFeedback}
                    className={`w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-all ${
                      isSubmittingFeedback
                        ? "opacity-80 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isSubmittingFeedback ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </span>
                    ) : (
                      "Submit Feedback"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <header className="border-b border-cyan-200 bg-white/80 sticky top-0 z-50 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ClipboardList className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-cyan-700">
              InternshipHub
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-12">
            <Link
              href="#features"
              className="text-gray-600 hover:text-gray-900 transition-colors relative group"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-600 hover:text-gray-900 transition-colors relative group"
            >
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="#testimonials"
              className="text-gray-600 hover:text-gray-900 transition-colors relative group"
            >
              Testimonials
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-900"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex space-x-5 items-center">
            <Link
              href="/sign-in"
              className="text-gray-900 font-medium hover:text-cyan-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 border border-cyan-200"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-50 border-t border-cyan-200 backdrop-blur-lg py-4">
            <div className="container mx-auto px-6 flex flex-col space-y-4">
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-900 py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="#testimonials"
                className="text-gray-600 hover:text-gray-900 py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </Link>
              <div className="pt-3 border-t border-cyan-200 flex flex-col space-y-3">
                <Link
                  href="/sign-in"
                  className="text-gray-900 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-3 rounded-lg font-medium text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 flex items-center justify-center min-h-[90vh] relative overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-1/4 -left-40 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/3 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-20 left-1/4 w-64 h-64 bg-cyan-300/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-center relative z-10">
          <div className="md:w-1/2 mb-16 md:mb-0 md:pr-8 pl-4 md:pl-8 lg:pl-16">
            <div className="flex items-center mb-6">
              <div className="h-6 w-1 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-2"></div>
              <p className="text-gray-600 uppercase tracking-wider text-sm font-medium">
                InternshipHub
              </p>
              <div className="ml-3 inline-flex items-center px-3 py-1 rounded-full bg-cyan-100 border border-cyan-200">
                <Star className="h-3 w-3 text-cyan-600 mr-1" />
                <span className="text-xs text-cyan-700">
                  All-in-One Solution
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight ml-0 md:ml-4 text-gray-900">
              Streamline Your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-700 relative">
                Internship Program
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="6"
                  viewBox="0 0 200 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 3C50 -1 150 -1 200 3"
                    stroke="url(#paint0_linear)"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear"
                      x1="0"
                      y1="3"
                      x2="200"
                      y2="3"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#06b6d4" stopOpacity="0" />
                      <stop offset="0.5" stopColor="#0ea5e9" />
                      <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>{" "}
              Seamlessly
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-lg md:ml-4">
              Manage every step of your internship workflow from requests to
              final reports. Say goodbye to spreadsheets and scattered
              communication.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 md:ml-4">
              <Link
                href="/sign-in"
                className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-lg font-medium flex items-center justify-center transition-all text-lg group overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-600 to-blue-700 transition-all group-hover:scale-[1.05] opacity-0 group-hover:opacity-100 duration-300"></span>
                <span className="relative flex items-center">
                  Get Started
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Link>

              <Link
                href="#how-it-works"
                className="bg-white text-gray-900 px-8 py-4 rounded-lg font-medium hover:shadow-md transition-all text-lg text-center border border-cyan-200 hover:border-cyan-300 hover:bg-gray-50"
              >
                Learn How
              </Link>
            </div>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <div
              className="relative w-full max-w-md transform-gpu"
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{
                perspective: "1000px",
              }}
            >
              {/* Decorative elements */}
              <div
                className={`absolute -inset-1 bg-gradient-to-br from-cyan-400/40 to-blue-400/40 rounded-xl blur-xl opacity-70 transition-all duration-300 ${
                  isHovering ? "opacity-90" : "opacity-70"
                }`}
                style={{
                  transform: isHovering
                    ? `translateZ(10px)`
                    : "translateZ(0px)",
                }}
              ></div>
              <div
                className="absolute -inset-2 bg-gradient-to-r from-transparent via-cyan-200/20 to-transparent rounded-lg"
                style={{
                  transform: isHovering
                    ? `translateZ(20px)`
                    : "translateZ(0px)",
                  transition: "transform 0.3s ease",
                }}
              ></div>

              {/* Card */}
              <div
                className="relative bg-white shadow-xl rounded-xl p-8 border border-cyan-200 transition-all duration-300"
                style={{
                  backdropFilter: "blur(20px)",
                  transform: isHovering
                    ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(10px)`
                    : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                  transition: isHovering
                    ? "transform 0.1s ease-out"
                    : "transform 0.5s ease-out",
                }}
              >
                <div className="flex items-center mb-10">
                  <div
                    className="h-12 w-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center mr-4 shadow-inner transition-transform"
                    style={{
                      transform: isHovering
                        ? `translateZ(25px)`
                        : "translateZ(0px)",
                    }}
                  >
                    <ClipboardList className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div
                    style={{
                      transform: isHovering
                        ? `translateZ(20px)`
                        : "translateZ(0px)",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-cyan-700">
                      InternshipHub
                    </h3>
                    <p className="text-sm text-gray-600">
                      Complete workflow management
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div
                    className="flex items-start group"
                    style={{
                      transform: isHovering
                        ? `translateZ(15px)`
                        : "translateZ(0px)",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <div className="mt-1 mr-4 transition-all">
                      <div className="h-6 w-6 rounded-full bg-cyan-100 flex items-center justify-center group-hover:bg-cyan-200 transition-all">
                        <CheckCircle className="h-4 w-4 text-cyan-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-cyan-700 transition-colors">
                        End-to-End Management
                      </p>
                      <p className="text-sm text-gray-600">
                        From requests to final reports
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-start group"
                    style={{
                      transform: isHovering
                        ? `translateZ(20px)`
                        : "translateZ(0px)",
                      transition: "transform 0.4s ease",
                      transitionDelay: "0.05s",
                    }}
                  >
                    <div className="mt-1 mr-4 transition-all">
                      <div className="h-6 w-6 rounded-full bg-cyan-100 flex items-center justify-center group-hover:bg-cyan-200 transition-all">
                        <CheckCircle className="h-4 w-4 text-cyan-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-cyan-700 transition-colors">
                        Smart Matching
                      </p>
                      <p className="text-sm text-gray-600">
                        Intern-Project-Guide mapping
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-start group"
                    style={{
                      transform: isHovering
                        ? `translateZ(25px)`
                        : "translateZ(0px)",
                      transition: "transform 0.5s ease",
                      transitionDelay: "0.1s",
                    }}
                  >
                    <div className="mt-1 mr-4 transition-all">
                      <div className="h-6 w-6 rounded-full bg-cyan-100 flex items-center justify-center group-hover:bg-cyan-200 transition-all">
                        <CheckCircle className="h-4 w-4 text-cyan-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-cyan-700 transition-colors">
                        Comprehensive Reporting
                      </p>
                      <p className="text-sm text-gray-600">
                        Track progress and outcomes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom glow effect */}
                <div
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-[1px] w-4/5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent blur-sm"
                  style={{
                    opacity: isHovering ? 1 : 0.5,
                    width: isHovering ? "90%" : "80%",
                    transition: "all 0.3s ease",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-28 relative bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 relative">
            <div className="flex justify-center">
              <p className="inline-block px-4 py-1 bg-cyan-100 text-cyan-700 font-medium mb-4 tracking-wider rounded-full border border-cyan-200">
                POWERFUL FEATURES
              </p>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 relative inline-block text-gray-900">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-700">
                Comprehensive Internship Management
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-6">
              Our platform offers all the tools necessary to manage every aspect
              of your internship program
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl relative group hover:translate-y-[-5px] transition-all duration-300 border border-gray-200 hover:border-cyan-300 shadow-lg hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent rounded-xl z-0"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-cyan-200 transition-all">
                  <Users className="h-6 w-6 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  Smart Mapping
                </h3>
                <p className="text-gray-600">
                  Easily match interns to projects and guides based on skills
                  and interests. Automatically communicate mappings to all
                  parties.
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl relative group hover:translate-y-[-5px] transition-all duration-300 border border-gray-200 hover:border-cyan-300 shadow-lg hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent rounded-xl z-0"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-cyan-200 transition-all">
                  <Calendar className="h-6 w-6 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  Demo Management
                </h3>
                <p className="text-gray-600">
                  Schedule demos, manage panel nominations, and capture feedback
                  all in one place. No more juggling multiple tools.
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl relative group hover:translate-y-[-5px] transition-all duration-300 border border-gray-200 hover:border-cyan-300 shadow-lg hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent rounded-xl z-0"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-cyan-200 transition-all">
                  <LineChart className="h-6 w-6 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  Progress Tracking
                </h3>
                <p className="text-gray-600">
                  Monitor weekly updates, collect feedback, and generate
                  comprehensive reports to evaluate the internship program's
                  success.
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-28 bg-gradient-to-b from-white via-cyan-50 to-white relative"
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-0 w-1/3 h-1/3 bg-cyan-200/30 blur-[150px] rounded-full"></div>
          <div className="absolute bottom-1/4 left-0 w-1/3 h-1/3 bg-blue-200/30 blur-[150px] rounded-full"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="flex justify-center">
              <p className="inline-block px-4 py-1 bg-cyan-100 text-cyan-700 font-medium mb-4 tracking-wider rounded-full border border-cyan-200">
                STREAMLINED PROCESS
              </p>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 relative inline-block text-gray-900">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-700">
                How It Works
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-6">
              Our platform simplifies the entire internship management workflow
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row mb-16 group">
                <div className="md:w-1/3 flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 rounded-full flex items-center justify-center z-10 text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                </div>
                <div className="md:w-2/3 mt-8 md:mt-0 bg-gradient-to-br from-white to-cyan-50 p-6 rounded-xl border border-cyan-200 group-hover:border-cyan-300 transition-all shadow-lg">
                  <h3 className="text-2xl font-bold mb-3 flex items-center text-gray-900">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-700 mr-2">
                      01.
                    </span>{" "}
                    Internship Setup
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Process internship requests, finalize guides, and collect
                    project proposals in one centralized platform. Set up the
                    program structure.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row mb-16 group">
                <div className="md:w-1/3 flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 rounded-full flex items-center justify-center z-10 text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                </div>
                <div className="md:w-2/3 mt-8 md:mt-0 bg-gradient-to-br from-white to-cyan-50 p-6 rounded-xl border border-cyan-200 group-hover:border-cyan-300 transition-all shadow-lg">
                  <h3 className="text-2xl font-bold mb-3 flex items-center text-gray-900">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-700 mr-2">
                      02.
                    </span>{" "}
                    Program Management
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Match interns with projects and guides, schedule demos, and
                    manage panel nominations. Automate communications and
                    scheduling.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row group">
                <div className="md:w-1/3 flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 rounded-full flex items-center justify-center z-10 text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                </div>
                <div className="md:w-2/3 mt-8 md:mt-0 bg-gradient-to-br from-white to-cyan-50 p-6 rounded-xl border border-cyan-200 group-hover:border-cyan-300 transition-all shadow-lg">
                  <h3 className="text-2xl font-bold mb-3 flex items-center text-gray-900">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-700 mr-2">
                      03.
                    </span>{" "}
                    Evaluation & Reporting
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Collect weekly updates, capture demo feedback, and generate
                    comprehensive reports to evaluate individual and program
                    performance.
                  </p>
                </div>
              </div>

              {/* Connecting line */}
              <div className="absolute left-1/3 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 via-cyan-400 to-blue-500 transform -translate-x-1/2 hidden md:block rounded-full"></div>
            </div>

            {/* Quick start button */}
            <div className="mt-20 text-center">
              <Link
                href="/sign-in"
                className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-10 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 overflow-hidden group relative"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-600 to-blue-700 group-hover:scale-[1.05] opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                <span className="relative flex items-center">
                  Start Managing Now
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-28 bg-white relative">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-cyan-100/50 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-100/50 blur-[100px] rounded-full"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="flex justify-center">
              <p className="inline-block px-4 py-1 bg-cyan-100 text-cyan-700 font-medium mb-4 tracking-wider rounded-full border border-cyan-200">
                SUCCESS STORIES
              </p>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 relative inline-block text-gray-900">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-700">
                What Teams Are Saying
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-6">
              Join organizations that have transformed their internship programs
            </p>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="mt-6 inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
            >
              <span className="flex items-center">
                Share Your Feedback
                <MessageSquare className="ml-2 h-4 w-4" />
              </span>
            </button>
          </div>

          <div className="relative">
            {testimonials.length > 3 && (
              <>
                <button
                  onClick={prevTestimonial}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-lg hover:shadow-xl border border-gray-200 hover:border-cyan-300 transition-all focus:outline-none"
                  aria-label="Previous testimonial"
                >
                  <div className="h-8 w-8 flex items-center justify-center text-gray-700 hover:text-cyan-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </div>
                </button>
                <button
                  onClick={nextTestimonial}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-lg hover:shadow-xl border border-gray-200 hover:border-cyan-300 transition-all focus:outline-none"
                  aria-label="Next testimonial"
                >
                  <div className="h-8 w-8 flex items-center justify-center text-gray-700 hover:text-cyan-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              </>
            )}

            <div ref={testimonialRef} className="overflow-hidden mx-6">
              {testimonials.length > 0 ? (
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{
                    transform: `translateX(-${
                      currentTestimonialIndex * 33.33
                    }%)`,
                  }}
                >
                  {testimonials.map((testimonial) => (
                    <div
                      key={testimonial._id}
                      className="flex-shrink-0 w-full md:w-1/3 px-2 sm:px-3"
                    >
                      <div className="bg-white p-5 sm:p-6 rounded-xl shadow-lg border border-gray-200 hover:border-cyan-300 transition-all group hover:transform hover:translate-y-[-5px] duration-300 h-full">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center text-cyan-700 font-bold text-base">
                            {getInitials(testimonial.name)}
                          </div>
                          <div className="ml-3">
                            <h4 className="font-bold text-base text-gray-900">
                              {testimonial.name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {testimonial.designation}
                            </p>
                          </div>
                        </div>
                        <div className="mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`${
                                star <= testimonial.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              } inline-block mr-1 text-xl`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 sm:line-clamp-6">
                          &quot;{testimonial.description}&quot;
                        </p>

                        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">
                    No testimonials available yet. Be the first to share your
                    feedback!
                  </p>
                </div>
              )}
            </div>

            {/* Pagination dots for mobile view */}
            {testimonials.length > 3 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: testimonials.length - 2 }).map(
                  (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonialIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        currentTestimonialIndex === index
                          ? "bg-cyan-500"
                          : "bg-gray-300"
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-cyan-50 to-blue-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-300/20 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-300/20 rounded-full blur-[100px]"></div>
          </div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center">
              <div className="inline-block px-4 py-1 bg-cyan-100 text-cyan-700 font-medium mb-6 tracking-wider rounded-full border border-cyan-200">
                GET STARTED NOW
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-gray-900">
              Ready to Transform Your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-700">
                Internship Program?
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Say goodbye to spreadsheets and scattered communication. Manage
              your entire internship workflow in one place.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-10 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 overflow-hidden group relative"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-600 to-blue-700 group-hover:scale-[1.05] opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
              <span className="relative flex items-center">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Link>

            {/* Abstract design element */}
            <div className="mt-16 flex justify-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-1 bg-cyan-400/60 rounded-full"></div>
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                <div className="w-10 h-1 bg-cyan-400/60 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - with reduced height */}
      <footer className="bg-gray-50 py-6 text-gray-600 border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-cyan-600" />
              </div>
              <span className="font-bold text-lg text-gray-900">
                InternshipHub
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link
                href="#features"
                className="hover:text-cyan-600 transition-colors text-xs"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="hover:text-cyan-600 transition-colors text-xs"
              >
                How It Works
              </Link>
              <Link
                href="#testimonials"
                className="hover:text-cyan-600 transition-colors text-xs"
              >
                Testimonials
              </Link>
              <Link
                href="#"
                className="hover:text-cyan-600 transition-colors text-xs"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="hover:text-cyan-600 transition-colors text-xs"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
