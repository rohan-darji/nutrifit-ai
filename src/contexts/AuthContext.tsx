
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthState, User } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("nutrifit_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setState({
          user: parsedUser,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        localStorage.removeItem("nutrifit_user");
        setState({ ...state, isLoading: false });
      }
    } else {
      setState({ ...state, isLoading: false });
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulated login logic
    try {
      // In a real app, this would validate credentials against a backend
      if (email && password) {
        // Mock user data
        const user: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
        };
        
        localStorage.setItem("nutrifit_user", JSON.stringify(user));
        
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        toast({
          title: "Login successful",
          description: "Welcome back to NutriFit!",
        });
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your email and password",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    // Simulated signup logic
    try {
      if (email && password && name) {
        // Mock user creation
        const user: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name,
        };
        
        localStorage.setItem("nutrifit_user", JSON.stringify(user));
        
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        toast({
          title: "Account created",
          description: "Welcome to NutriFit!",
        });
      } else {
        throw new Error("Please fill all required fields");
      }
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Could not create your account. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("nutrifit_user");
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
