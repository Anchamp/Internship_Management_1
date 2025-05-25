"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import "../auth.css";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Sign up failed");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to sign up");
      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Show success toast
      toast.success("Account created successfully", {
        description: "You can now sign in with your new account",
      });

      router.push("/sign-in"); // Redirect to sign-in after successful signup
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      // Show error toast
      toast.error("Sign up failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col relative bg-[#0D0D0D] auth-section">
      {/* Back Button */}{" "}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="flex items-center text-[#F1F1F1] hover:text-[#B03EFF] transition-colors font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </Link>
      </div>{" "}
      <div className="flex flex-col items-center justify-center flex-grow p-4">
        <Card className="auth-card card-border-glow w-full max-w-md border border-[#B03EFF]/30 shadow-lg bg-[#0D0D0D] shadow-[#B03EFF]/10 text-[#F1F1F1]">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-1 bg-gradient-to-r from-[#7F00FF] to-[#C400FF] rounded-full card-decoration"></div>
            </div>
            <CardTitle className="auth-title text-4xl font-bold bg-gradient-to-r from-[#7F00FF] to-[#C400FF] text-transparent bg-clip-text">
              Create Account
            </CardTitle>
            <CardDescription className="text-sm text-[#A7A7A7]">
              Enter your information to create an account
            </CardDescription>
          </CardHeader>{" "}
          <CardContent>
            {error && (
              <div className="bg-[#1A1A1A] border border-red-500/30 text-red-400 text-sm p-4 rounded-lg mb-4 flex items-start">
                <span className="font-medium">{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#F1F1F1]"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="input-glow bg-[#1A1A1A] border-[#B03EFF]/30 focus:border-[#B03EFF] focus:ring-[#B03EFF]/20 text-[#F1F1F1] placeholder:text-[#A7A7A7]"
                />
              </div>{" "}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#F1F1F1]"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="input-glow bg-[#1A1A1A] border-[#B03EFF]/30 focus:border-[#B03EFF] focus:ring-[#B03EFF]/20 text-[#F1F1F1] placeholder:text-[#A7A7A7]"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-[#F1F1F1]"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="input-glow bg-[#1A1A1A] border-[#B03EFF]/30 focus:border-[#B03EFF] focus:ring-[#B03EFF]/20 text-[#F1F1F1] placeholder:text-[#A7A7A7]"
                />
              </div>{" "}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded border-[#B03EFF]/30 text-[#B03EFF] focus:ring-[#B03EFF]/20"
                  required
                />
                <label htmlFor="terms" className="text-sm text-[#A7A7A7]">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-[#B03EFF] hover:text-[#C400FF] hover:underline transition-colors"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-[#B03EFF] hover:text-[#C400FF] hover:underline transition-colors"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
              <Button
                type="submit"
                className="gradient-button w-full bg-gradient-to-r from-[#7F00FF] to-[#C400FF] hover:opacity-90 text-[#F1F1F1] font-medium py-2 shadow-md hover:shadow-lg transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign up"}
              </Button>
            </form>
          </CardContent>{" "}
          <CardFooter className="flex justify-center border-t border-[#B03EFF]/10 p-6">
            <Link
              href="/sign-in"
              className="text-sm text-[#B03EFF] hover:text-[#C400FF] hover:underline font-medium transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </CardFooter>
        </Card>
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-8 h-1 bg-gradient-to-r from-[#7F00FF]/30 to-[#C400FF]/30 rounded-full card-decoration"></div>
            <div className="w-2 h-2 bg-gradient-to-r from-[#7F00FF] to-[#C400FF] rounded-full card-decoration"></div>
            <div className="w-8 h-1 bg-gradient-to-r from-[#C400FF]/30 to-[#7F00FF]/30 rounded-full card-decoration"></div>
          </div>
          <p className="text-sm text-[#A7A7A7]">
            Create your professional resume in minutes
          </p>
        </div>
      </div>
    </div>
  );
}
