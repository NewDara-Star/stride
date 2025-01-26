import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: authData.user.id,
          nickname,
          avatar_url: null,
          workout_splits: null,
        });

        if (profileError) {
          toast.error("Failed to create profile");
          return;
        }
      }

      if (profileImage && authData.user) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatar")
          .upload(
            `public/${authData.user.id}/${profileImage.name}`,
            profileImage,
            { upsert: true }
          );

        if (uploadError) {
          toast.error("Failed to upload profile image.");
          return;
        }

        const { data: urlData } = supabase.storage
          .from("avatar")
          .getPublicUrl(uploadData.path);

        const { error: updateError } = await supabase.from("profiles").upsert({
          id: authData.user.id,
          avatar_url: `${urlData.publicUrl}?${Date.now()}`,
          nickname,
        });

        if (updateError) {
          toast.error("Failed to update profile.");
          return;
        }
      }

      toast.success("Account created! Please check your email.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-900">Stride</h1>
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold text-gray-900">Sign up</h2>
          <p className="text-sm text-gray-500">Create an account on trackfit</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
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

          <div className="space-y-2">
            <Label
              htmlFor="nickname"
              className="text-sm font-medium text-gray-700"
            >
              Nickname
            </Label>
            <Input
              id="nickname"
              type="text"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="text-sm text-gray-900 border-gray-300 focus:ring-gray-400"
              required
            />
          </div>

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

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-sm text-gray-900 border-gray-300 focus:ring-gray-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="profileImage"
              className="text-sm font-medium text-gray-700"
            >
              Profile Image
            </Label>
            <Input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
              className="text-sm text-gray-900 border-gray-300 focus:ring-gray-400"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gray-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-800 transition"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign up"}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-gray-900 hover:underline"
          >
            Login
          </a>
        </div>
      </Card>
    </div>
  );
}
