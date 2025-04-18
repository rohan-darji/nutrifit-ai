import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Camera, ChevronRight, Info, User } from "lucide-react";

const onboardingSteps = [
  {
    title: "Welcome to NutriFit.ai",
    description: "Discover the nutritional content of any food just by taking a photo.",
    icon: Info,
    color: "bg-primary",
  },
  {
    title: "Snap or Upload",
    description: "Capture a photo of your meal with the camera or upload an existing image.",
    icon: Camera,
    color: "bg-nutripurple",
  },
  {
    title: "Get Detailed Analysis",
    description: "See calories, macronutrients, and health rating for your food.",
    icon: User,
    color: "bg-nutriorange",
  },
];

const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useOnboarding();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col justify-center items-center px-6 pb-20">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className={`${currentStepData.color} w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-lg`}>
            <currentStepData.icon className="w-12 h-12 text-primary-foreground" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-center">
            {currentStepData.title}
          </h1>
          
          <p className="text-center text-muted-foreground mb-12">
            {currentStepData.description}
          </p>
          
          <div className="flex space-x-2 mb-8">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full ${
                  index === currentStep ? "w-8 bg-primary" : "w-4 bg-secondary"
                } transition-all duration-300`}
              />
            ))}
          </div>
          
          <Button 
            className="w-full"
            size="lg"
            onClick={handleNext}
          >
            {currentStep < onboardingSteps.length - 1 ? (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
