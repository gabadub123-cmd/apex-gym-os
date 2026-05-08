"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, ChevronRight, ChevronLeft, Loader2, Play, CheckCircle2 } from "lucide-react";
import { completeOnboarding } from "@/lib/supabase/actions";

const steps = [
  { id: "welcome", title: "Welcome to Apex Gym OS" },
  { id: "video", title: "How It Works" },
  { id: "profile", title: "Complete Your Profile" },
  { id: "goals", title: "Set Your First Goal" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [videoWatched, setVideoWatched] = useState(false);
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleNext() {
    if (currentStep === 1 && !videoWatched) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  function handleFinish() {
    const formData = new FormData();
    if (phone) formData.append("phone", phone);
    if (dob) formData.append("date_of_birth", dob);
    if (gender) formData.append("gender", gender);
    if (bio) formData.append("bio", bio);
    if (goalTitle) formData.append("goal_title", goalTitle);
    if (goalTarget) formData.append("goal_target", goalTarget);

    startTransition(async () => {
      await completeOnboarding(formData);
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Dumbbell className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {steps.length}
          </CardDescription>
          <div className="flex gap-1.5 justify-center mt-3">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  i <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 0 && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Let&apos;s get you set up. This will only take a minute.
              </p>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Play className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm">Watch a quick intro video</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm">Complete your profile</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Dumbbell className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm">Set your first goal</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                {!videoWatched ? (
                  <button
                    onClick={() => setVideoWatched(true)}
                    className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Play className="h-8 w-8 text-primary ml-1" />
                    </div>
                    <span className="text-sm">Click to watch intro</span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-green-400">
                    <CheckCircle2 className="h-12 w-12" />
                    <span className="text-sm font-medium">Video watched!</span>
                  </div>
                )}
              </div>
              {!videoWatched && (
                <p className="text-xs text-muted-foreground text-center">
                  Please watch the video before continuing
                </p>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (optional)</Label>
                <Input
                  id="phone"
                  placeholder="+31 6 12345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Short Bio (optional)</Label>
                <Input
                  id="bio"
                  placeholder="Tell your coach a bit about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                What&apos;s your main fitness goal? Your coach can adjust this later.
              </p>
              <div className="space-y-2">
                <Label htmlFor="goalTitle">Goal</Label>
                <Input
                  id="goalTitle"
                  placeholder="e.g. Lose 5kg, Bench 100kg, Run a 5k"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalTarget">Target Value (optional)</Label>
                <Input
                  id="goalTarget"
                  placeholder="e.g. 80kg, 100kg, 25 minutes"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={currentStep === 1 && !videoWatched}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Get Started
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
