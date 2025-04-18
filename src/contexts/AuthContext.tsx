import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthState } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
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
    // Fetch the user profile to get avatar_url
    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url, full_name')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return { avatar_url: null, full_name: null };
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching profile:', error);
        return { avatar_url: null, full_name: null };
      }
    };

    // Store the subscription for cleanup
    let subscription: { unsubscribe: () => void } | null = null;

    // First check current session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: {
              id: session.user.id,
              email: session.user.email,
              avatar_url: profile?.avatar_url || null,
              name: profile?.full_name || null,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    // Setup auth state change listener
    const setupAuthListener = () => {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session) {
          try {
            const profile = await fetchProfile(session.user.id);
            setState({
              user: {
                id: session.user.id,
                email: session.user.email,
                avatar_url: profile?.avatar_url || null,
                name: profile?.full_name || null,
              },
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            console.error('Error in auth state change handler:', error);
            setState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      });
      
      subscription = data.subscription;
    };

    // Initialize auth
    const initAuth = async () => {
      setupAuthListener(); // First set up listener
      await checkSession(); // Then check session
    };

    initAuth();

    // Cleanup on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login successful",
        description: "Welcome back to NutriFit.ai!",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account created",
        description: "Welcome to NutriFit!",
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
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
