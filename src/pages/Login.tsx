// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message); // Show error toast
        return;
      }

      toast.success("Logged in successfully!"); // Show success toast
      navigate("/dashboard"); // Redirect to dashboard
    } catch (err) {
      console.error(err); // Log the error for debugging
      toast.error("An unexpected error occurred. Please try again."); // Show error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* App Name */}
        <h1 className="text-2xl font-bold text-center text-gray-900">Stride</h1>

        {/* Form Title & Subtitle */}
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold text-gray-900">Log in</h2>
          <p className="text-sm text-gray-500">
            Log into your account on trackfit
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm text-gray-900 border-gray-300 focus:ring-gray-400"
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-sm text-gray-900 border-gray-300 focus:ring-gray-400"
              required
            />
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              Forgot your password?
            </a>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full bg-gray-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-800 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        {/* Sign-up Link */}
        <div className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="font-medium text-gray-900 hover:underline"
          >
            Sign up
          </a>
        </div>
      </Card>
    </div>
  );
}
