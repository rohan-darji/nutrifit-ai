
import React, { createContext, useContext, useState } from "react";
import { NutritionResult } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface NutritionContextType {
  result: NutritionResult | null;
  isAnalyzing: boolean;
  imageUrl: string | null;
  analyzeImage: (imageData: string) => Promise<void>;
  resetAnalysis: () => void;
}

// Mock API function (in a real app, this would call your backend API)
const mockAnalyzeFood = async (imageData: string): Promise<NutritionResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock data
  return {
    total_calories: 450,
    food_items: [
      { item: "Avocado Toast", calories: 250 },
      { item: "Boiled Egg", calories: 80 },
      { item: "Cherry Tomatoes", calories: 20 },
      { item: "Orange Juice", calories: 100 }
    ],
    healthiness: "Healthy",
    nutrient_breakdown: {
      carbohydrates: "45g (30%)",
      protein: "22g (20%)",
      fats: "25g (40%)",
      fiber: "8g (30%)",
      sugar: "12g (15%)",
    }
  };
};

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
      
      // In a real app, you would send this image to your API
      const analysisResult = await mockAnalyzeFood(imageData);
      setResult(analysisResult);
      
      toast({
        title: "Analysis complete",
        description: "Your food nutrition information is ready!",
      });
    } catch (error) {
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
