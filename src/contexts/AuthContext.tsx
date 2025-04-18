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
    // Set a timeout to ensure loading state is resolved
    const loadingTimeout = setTimeout(() => {
      console.log('Loading timeout reached, forcing isLoading to false');
      setState(prev => ({
        ...prev,
        isLoading: false
      }));
    }, 5000); // 5 seconds timeout
    
    // Fetch the user profile to get avatar_url
    const fetchProfile = async (userId: string) => {
      try {
        console.log('Fetching profile for user:', userId);
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url, full_name')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return null;
        }
        
        return data?.avatar_url;
      } catch (error) {
        console.error('Exception fetching profile:', error);
        return null;
      }
    };

    // Check current session
    console.log('Checking Supabase session...');
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      console.log('Session check result:', session ? 'Session found' : 'No session', error ? 'Error:' + error.message : '');
      
      if (error) {
        console.error('Session check error:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }
      
      if (session) {
        // Set authenticated state immediately without waiting for profile
        setState({
          user: {
            id: session.user.id,
            email: session.user.email,
            avatar_url: null, // Will be updated later
          },
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Fetch profile in the background
        fetchProfile(session.user.id).then(avatar_url => {
          if (avatar_url) {
            setState(prev => ({
              ...prev,
              user: {
                ...prev.user!,
                avatar_url,
              },
            }));
          }
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    }).catch(error => {
      console.error('Session check failed:', error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'Session found' : 'No session');
      
      if (session) {
        // Set authenticated state immediately without waiting for profile
        setState({
          user: {
            id: session.user.id,
            email: session.user.email,
            avatar_url: null, // Will be updated later
          },
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Fetch profile in the background
        fetchProfile(session.user.id).then(avatar_url => {
          if (avatar_url) {
            setState(prev => ({
              ...prev,
              user: {
                ...prev.user!,
                avatar_url,
              },
            }));
          }
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
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
        description: "Welcome to NutriFit.ai!",
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
