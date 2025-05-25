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
import Cookies from "js-cookie";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import "../auth.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to sign in");

      // Store token in both localStorage and cookies
      localStorage.setItem("token", data.token);
      Cookies.set("token", data.token, { expires: 1 }); // Expires in 1 day

      // Store user info in localStorage
      const userData = {
        email: data.email,
        userId: data.userId,
      };
      localStorage.setItem("user", JSON.stringify(userData));

      router.push("/home"); // Redirect to home after login
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-white auth-section">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          href="/"
          className="flex items-center text-black hover:text-[#0891B2] transition-colors font-bold no-underline group"
          passHref
        >
          <ArrowLeft className="h-5 w-5 mr-1 transition-colors" />
          <span className="text-black group-hover:text-[#0891B2] transition-colors">
            Back
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
            <CardTitle className="auth-title text-4xl font-bold bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-transparent bg-clip-text">
              Welcome back
            </CardTitle>
            <CardDescription
              className="text-sm !text-black font-medium"
              style={{ color: "black" }}
            >
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="bg-white relative z-30">
            {error && (
              <div className="bg-[#F0F9FF] border border-red-500/30 text-red-700 text-sm p-4 rounded-lg mb-4 flex items-start">
                <span className="font-medium">{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5 relative z-40">
              <div className="space-y-2 relative">
                <label
                  htmlFor="email"
                  className="text-sm font-bold !text-black"
                  style={{ color: "black" }}
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

              <div className="space-y-2 relative">
                <label
                  htmlFor="password"
                  className="text-sm font-bold !text-black"
                  style={{ color: "black" }}
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

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-black text-black focus:ring-black/20"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm !text-black font-bold"
                    style={{ color: "black" }}
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm text-[#0891B2] hover:text-[#06B6D4] hover:underline transition-colors font-bold"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="gradient-button w-full bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:opacity-90 text-white font-bold py-2 shadow-md hover:shadow-lg transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
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

      {/* Remove any potential hidden overlays that might be blocking interactions */}
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
      `}</style>
    </div>
  );
}
