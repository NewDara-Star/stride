// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Dumbbell } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [hasWorkoutPlan, setHasWorkoutPlan] = useState(false);
  const [isSetDaysModalOpen, setIsSetDaysModalOpen] = useState(false);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [workoutSplits, setWorkoutSplits] = useState([
    { name: "Push Day", count: 11 },
    { name: "Pull Day", count: 9 },
    { name: "Leg Day", count: 7 },
    { name: "Full Body Day", count: 11 },
  ]);
  const [userEmail, setUserEmail] = useState("");

  // Auth check
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
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
          }}
        >
          Set Days
        </Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">
          Hey, {userEmail.split("@")[0] || "Buddy"}
        </h1>
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-gray-200" />{" "}
          {/* Profile image placeholder */}
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Empty State */}
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

      {/* Workout Split Cards */}
      {hasWorkoutPlan && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workoutSplits.map((split, index) => (
            <Card key={index} className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{split.name}</h3>
                  <p className="text-gray-600">{split.count} workouts</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Plus />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Set Days Modal */}
      {isSetDaysModalOpen && <SetDaysModal />}
    </div>
  );
}
