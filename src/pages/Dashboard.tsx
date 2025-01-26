import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Dumbbell } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [hasWorkoutPlan, setHasWorkoutPlan] = useState(false);
  const [isSetDaysModalOpen, setIsSetDaysModalOpen] = useState(false);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [workoutSplits, setWorkoutSplits] = useState<
    { name: string; count: number }[]
  >([]);
  const [userEmail, setUserEmail] = useState("");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) navigate("/login");
      else setUserEmail(user.email || "");
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("avatar_url, workout_splits, nickname")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (profile) {
        setUserAvatarUrl(
          profile.avatar_url ? `${profile.avatar_url}?${Date.now()}` : null
        );
        setNickname(profile.nickname || "");
        if (profile.workout_splits) {
          setWorkoutSplits(profile.workout_splits);
          setHasWorkoutPlan(true);
        }
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setIsImageLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatar")
        .upload(`public/${user.id}/${file.name}`, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatar")
        .getPublicUrl(uploadData.path);

      const { error: updateError } = await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: `${urlData.publicUrl}?${Date.now()}`,
        nickname,
      });

      if (updateError) throw updateError;

      setUserAvatarUrl(`${urlData.publicUrl}?${Date.now()}`);
      toast.success("Profile image updated!");
    } catch {
      toast.error("Failed to update avatar");
    } finally {
      setIsImageLoading(false);
    }
  };

  const saveWorkoutSplits = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ workout_splits: workoutSplits })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save workout splits.");
    } else {
      toast.success("Workout splits saved successfully!");
    }
  };

  const SetDaysModal = () => (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 space-y-6">
        <h2 className="text-2xl font-bold">Set workout split</h2>
        <p className="text-gray-600">
          How many days do you want to workout per week?
        </p>

        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDaysPerWeek(Math.max(1, daysPerWeek - 1))}
          >
            -
          </Button>
          <span className="text-4xl font-bold">{daysPerWeek}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDaysPerWeek(Math.min(7, daysPerWeek + 1))}
          >
            +
          </Button>
        </div>

        <Button
          className="w-full"
          onClick={() => {
            setIsSetDaysModalOpen(false);
            setHasWorkoutPlan(true);
            const defaultSplits = Array.from(
              { length: daysPerWeek },
              (_, index) => ({
                name: `Day ${index + 1}`,
                count: 0,
              })
            );
            setWorkoutSplits(defaultSplits);
            saveWorkoutSplits();
          }}
        >
          Set Days
        </Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">
          Hey, {nickname || userEmail.split("@")[0] || "Buddy"}
        </h1>
        <div className="flex items-center space-x-4">
          <label htmlFor="profile-image" className="cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
              {userAvatarUrl ? (
                <>
                  <img
                    src={userAvatarUrl}
                    alt="Profile"
                    className={`w-full h-full object-cover ${
                      isImageLoading ? "opacity-50" : ""
                    }`}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                    <Plus className="text-white w-5 h-5" />
                  </div>
                </>
              ) : (
                <span className="text-gray-500">+</span>
              )}
            </div>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
          </label>
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {!hasWorkoutPlan && (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
          <Dumbbell className="w-16 h-16 text-gray-400" />
          <p className="text-lg font-semibold">
            You don't have your workout days set
          </p>
          <Button onClick={() => setIsSetDaysModalOpen(true)}>
            <Plus className="mr-2" /> Set your workout days
          </Button>
        </div>
      )}

      {hasWorkoutPlan && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workoutSplits.map((split, index) => (
            <Card key={index} className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{split.name}</h3>
                  <p className="text-gray-600">{split.count} workouts</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const updatedSplits = [...workoutSplits];
                    updatedSplits[index].count += 1;
                    setWorkoutSplits(updatedSplits);
                    saveWorkoutSplits();
                  }}
                >
                  <Plus />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isSetDaysModalOpen && <SetDaysModal />}
    </div>
  );
}
