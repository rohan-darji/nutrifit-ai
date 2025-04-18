
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ImageCapture } from "@/components/ImageCapture";
import { NutritionDisplay } from "@/components/NutritionDisplay";
import { useNutrition } from "@/contexts/NutritionContext";
import { LogOut, User, History, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { result, isAnalyzing } = useNutrition();

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b border-secondary">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">NutriFit.ai</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/profile">
                <Shield className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <History className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user?.avatar_url || undefined} 
                    alt="User avatar" 
                  />
                  <AvatarFallback>
                    {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout}
              className="hover:bg-accent/10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 py-8">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <p className="text-lg">Analyzing your food...</p>
          </div>
        ) : result ? (
          <NutritionDisplay />
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">Food Analysis</h2>
              <p className="text-muted-foreground">
                Take a photo of your food to get its nutritional information.
              </p>
            </div>
            <ImageCapture />
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
