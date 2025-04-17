
import React, { createContext, useContext, useState, useEffect } from "react";

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("nutrifit_onboarding_completed");
    if (onboardingCompleted === "true") {
      setHasCompletedOnboarding(true);
    }
  }, []);
  
  const completeOnboarding = () => {
    localStorage.setItem("nutrifit_onboarding_completed", "true");
    setHasCompletedOnboarding(true);
  };
  
  const resetOnboarding = () => {
    localStorage.removeItem("nutrifit_onboarding_completed");
    setHasCompletedOnboarding(false);
  };
  
  return (
    <OnboardingContext.Provider
      value={{
        hasCompletedOnboarding,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
