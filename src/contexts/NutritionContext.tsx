
import React, { createContext, useContext, useState } from "react";
import { NutritionResult } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NutritionContextType {
  result: NutritionResult | null;
  isAnalyzing: boolean;
  imageUrl: string | null;
  analyzeImage: (imageData: string) => Promise<void>;
  resetAnalysis: () => void;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export const NutritionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { toast } = useToast();
  
  const analyzeImage = async (imageData: string) => {
    try {
      setIsAnalyzing(true);
      setImageUrl(imageData);

      // Get logged-in user
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        throw new Error("Unable to retrieve user from Supabase.");
      }

      const userId = user.id;
  
      // Convert base64 to Blob
      const blob = await (await fetch(imageData)).blob();
      const formData = new FormData();
      formData.append("image", blob, "food.jpg");
      formData.append("user_id", userId);
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/calculate-nutrition/`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }
  
      const analysisResult: NutritionResult = await response.json();
      setResult(analysisResult);
  
      toast({
        title: "Analysis complete",
        description: "Your food nutrition information is ready!",
      });
    } catch (error) {
      console.error("API error:", error);
      toast({
        title: "Analysis failed",
        description: "We couldn't analyze your food. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  
  const resetAnalysis = () => {
    setResult(null);
    setImageUrl(null);
  };
  
  return (
    <NutritionContext.Provider
      value={{
        result,
        isAnalyzing,
        imageUrl,
        analyzeImage,
        resetAnalysis,
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (context === undefined) {
    throw new Error("useNutrition must be used within a NutritionProvider");
  }
  return context;
};
