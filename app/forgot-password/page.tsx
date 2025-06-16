"use client";

import { useState, useEffect, useRef } from "react";
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
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import "../auth.css";

const useSuppressionKey = () => {
  useEffect(() => {
    return () => {
      // Cleanup function (empty in this case)
    };
  }, []);
};

export default function ForgotPassword() {
  useSuppressionKey();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Email verification states
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [checkingEmail, setCheckingEmail] = useState<boolean>(false);
  const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", ""]);
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);

  const otpInputRefs = Array(4)
    .fill(0)
    .map(() => useRef<HTMLInputElement>(null));

  // Run once when component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Validate email format
  useEffect(() => {
    const validateEmailFormat = () => {
      if (!email) {
        setIsValidEmail(false);
        return;
      }

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(email);
      setIsValidEmail(isValid);

      if (!isValid) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    };

    validateEmailFormat();
  }, [email]);

  // Check if email exists in the database
  const checkEmailExists = async () => {
    if (!isValidEmail) return;

    setCheckingEmail(true);
    try {
      const response = await fetch("/api/check-email-exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Email check failed");
      }

      if (!data.exists) {
        toast.error("Email not found", {
          description: "No account is associated with this email",
        });
        return false;
      }

      return true;
    } catch (error: any) {
      console.error("Error checking email:", error);
      toast.error("Error checking email", {
        description: error.message || "Please try again",
      });
      return false;
    } finally {
      setCheckingEmail(false);
    }
  };

  // Function to send OTP email
  const sendOtpEmail = async () => {
    if (!isValidEmail) return;

    // First check if email exists
    const emailExists = await checkEmailExists();
    if (!emailExists) return;

    setSendingOtp(true);
    setOtpError("");

    try {
      const response = await fetch("/api/auth/reset-password-otp", {
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
      const response = await fetch("/api/auth/reset-password-otp", {
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
      setEmailVerified(true);
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

    // Validate before submitting
    if (!emailVerified) {
      toast.error("Email verification required", {
        description: "Please verify your email first",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure your passwords match",
      });
      return;
    }

    setIsLoading(true);
    setError("");

    // Show loading toast
    const loadingToast = toast.loading("Resetting password...");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Password reset successful", {
        description: "You can now sign in with your new password",
      });

      // Redirect to sign-in page after short delay
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);

      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error("Password reset failed", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // If not mounted yet (during server rendering or hydration),
  // return a simplified version of the component
  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col relative bg-white auth-section">
        <div className="flex flex-col items-center justify-center flex-grow p-4 relative z-10">
          <Card className="auth-card w-full max-w-md shadow-lg bg-white text-black relative">
            <CardHeader className="space-y-1 text-center pb-6 bg-white relative z-30">
              <CardTitle className="auth-title text-4xl font-bold bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-transparent bg-clip-text">
                Forgot Password
              </CardTitle>
              <CardDescription className="text-sm">
                Enter Email to continue
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
          href="/sign-in"
          className="flex items-center text-black hover:text-[#0891B2] transition-colors font-bold no-underline group"
          passHref
        >
          <ArrowLeft className="h-5 w-5 mr-1 transition-colors" />
          <span className="text-black group-hover:text-[#0891B2] transition-colors">
            Back to Sign In
          </span>
        </Link>
      </div>

      {/* Background decorations - ensuring light colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/3 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-20 left-1/4 w-64 h-64 bg-cyan-300/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="flex flex-col items-center justify-center flex-grow p-4 relative z-10">
        <Card className="auth-card w-full max-w-md shadow-lg bg-white text-black relative transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,0,0,0.2)] z-20">
          {/* Glass highlight effect - make it non-blocking */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-white to-white rounded-xl opacity-50 group-hover:opacity-100 blur-sm transition-all duration-500 pointer-events-none"></div>

          <CardHeader className="space-y-1 text-center pb-6 bg-white relative z-30">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-1 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] rounded-full card-decoration"></div>
            </div>
            <CardTitle className="auth-title text-3xl font-bold bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-transparent bg-clip-text">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {!emailVerified
                ? "Enter your email address to reset your password"
                : "Create a new password for your account"}
            </CardDescription>
          </CardHeader>

          <CardContent className="bg-white relative z-30">
            {error && (
              <div className="bg-[#FFF5F5] border border-red-500/30 text-red-700 text-sm p-4 rounded-lg mb-4 flex items-start">
                <XCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 relative z-40">
              {/* Email Input Section */}
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
                      disabled={isLoading || showOtpInput || emailVerified}
                      className={`input-glow bg-white !border-2 focus:!ring-black/20 !text-black placeholder:text-gray-500 relative z-40 h-9 text-sm ${
                        emailError
                          ? "!border-red-500"
                          : emailVerified
                          ? "!border-green-500 pr-8"
                          : "!border-black"
                      }`}
                      style={{
                        color: "black",
                        backgroundColor: "white",
                        borderColor: emailError
                          ? "#ef4444"
                          : emailVerified
                          ? "#10b981"
                          : "black",
                        borderWidth: "2px",
                        position: "relative",
                        zIndex: 40,
                      }}
                    />
                    {emailVerified && (
                      <div className="absolute inset-y-0 right-2 flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  {isValidEmail && !emailError && !emailVerified && (
                    <button
                      type="button"
                      onClick={sendOtpEmail}
                      disabled={sendingOtp || showOtpInput}
                      className="px-3 py-1.5 h-9 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-medium rounded-md shadow-sm hover:opacity-90 transition-colors disabled:opacity-50"
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
                        disabled={otpValues.some((val) => !val) || verifyingOtp}
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

              {/* Password Fields - Only show after email verification */}
              {emailVerified && (
                <>
                  <div className="space-y-2 relative">
                    <label
                      htmlFor="password"
                      className="text-sm font-bold !text-black"
                      style={{ color: "black" }}
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="input-glow bg-white !border-2 !border-black focus:!border-black focus:ring-black/20 !text-black placeholder:text-gray-500 relative z-40 !pr-12"
                        style={{
                          color: "black",
                          backgroundColor: "white",
                          borderColor: "black",
                          borderWidth: "2px",
                          position: "relative",
                          zIndex: 40,
                          paddingRight: "3rem",
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
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      8+ chars with: 1-A, 1-a, 1-number, 1-@/#/$
                    </p>
                  </div>

                  <div className="space-y-2 relative">
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-bold !text-black"
                      style={{ color: "black" }}
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        className="input-glow bg-white !border-2 !border-black focus:!border-black focus:ring-black/20 !text-black placeholder:text-gray-500 relative z-40 !pr-12"
                        style={{
                          color: "black",
                          backgroundColor: "white",
                          borderColor: "black",
                          borderWidth: "2px",
                          position: "relative",
                          zIndex: 40,
                          paddingRight: "3rem",
                        }}
                      />
                      <div
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        style={{ zIndex: 60 }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="text-gray-500 hover:text-[#0891B2] transition-colors focus:outline-none"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    {password !== confirmPassword && confirmPassword && (
                      <p className="text-xs text-red-500 mt-0.5">
                        Passwords don't match
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="gradient-button w-full bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:opacity-90 text-white font-bold py-2 shadow-md hover:shadow-lg transition-all duration-300 relative"
                    disabled={isLoading || password !== confirmPassword}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Resetting...
                      </span>
                    ) : (
                      "Reset Password"
                    )}

                    {/* Animated background for loading state */}
                    {isLoading && (
                      <div className="absolute inset-0 w-full h-full overflow-hidden rounded">
                        <div className="absolute left-0 top-0 h-full bg-white/20 animate-progress"></div>
                      </div>
                    )}
                  </Button>
                </>
              )}
            </form>
          </CardContent>

          <CardFooter
            className="flex justify-center border-t !border-black p-6 bg-white relative z-30"
            style={{ borderColor: "black" }}
          >
            <Link
              href="/sign-up"
              className="text-sm text-[#0891B2] hover:text-[#06B6D4] hover:underline font-bold transition-colors"
            >
              Don&apos;t have an account? Sign up
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
