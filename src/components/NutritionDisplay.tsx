
import React from "react";
import { NutritionResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNutrition } from "@/contexts/NutritionContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flame } from "lucide-react";

export const NutritionDisplay: React.FC = () => {
  const { result, imageUrl, resetAnalysis } = useNutrition();

  if (!result) return null;

  // Helper function to extract numeric value from string like "45g (30%)"
  const extractPercentage = (value: string): number => {
    const percentMatch = value.match(/\((\d+)%\)/);
    if (percentMatch) return parseInt(percentMatch[1], 10);
  
    const numberMatch = value.match(/^(\d+)(g|%)?/);
    if (numberMatch) return Math.min(parseInt(numberMatch[1], 10), 100);
  
    return 0;
  };
  

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={resetAnalysis} className="p-0 h-auto">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {imageUrl && (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <img 
                src={imageUrl} 
                alt="Food" 
                className="w-full h-full object-cover" 
              />
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <Flame className="w-5 h-5 mr-2 text-nutriorange" />
                Calories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-nutriorange">
                {result.total_calories}
                <span className="text-sm text-muted-foreground ml-1">kcal</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Overall: <span className={result.healthiness === "Healthy" ? "text-nutrigreen" : "text-nutriorange"}>{result.healthiness}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Nutrient Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Carbohydrates</span>
                  <span className="text-sm">{result.nutrient_breakdown.carbohydrates}</span>
                </div>
                <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-nutriorange" 
                    style={{ width: `${extractPercentage(result.nutrient_breakdown.carbohydrates)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Protein</span>
                  <span className="text-sm">{result.nutrient_breakdown.protein}</span>
                </div>
                <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-nutripurple" 
                    style={{ width: `${extractPercentage(result.nutrient_breakdown.protein)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Fats</span>
                  <span className="text-sm">{result.nutrient_breakdown.fats}</span>
                </div>
                <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-amber-400" 
                    style={{ width: `${extractPercentage(result.nutrient_breakdown.fats)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Fiber</span>
                  <span className="text-sm">{result.nutrient_breakdown.fiber}</span>
                </div>
                <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-nutrigreen" 
                    style={{ width: `${extractPercentage(result.nutrient_breakdown.fiber)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Sugar</span>
                  <span className="text-sm">{result.nutrient_breakdown.sugar}</span>
                </div>
                <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-red-500" 
                    style={{ width: `${extractPercentage(result.nutrient_breakdown.sugar)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Identified Food Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-secondary">
            {result.food_items.map((item, index) => (
              <li key={index} className="py-3 flex justify-between items-center">
                <span>{item.item}</span>
                <span className="text-nutriorange font-medium">{item.calories} kcal</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
