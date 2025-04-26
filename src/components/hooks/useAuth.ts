import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "@/components/hooks/useNavigate";

export interface AuthError {
  message: string;
  field?: "email" | "password";
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        setError({
          message: error.message,
          field: error.message.toLowerCase().includes("password") ? "password" : "email",
        });
        return false;
      }

      if (data?.user) {
        // Wait for session to be set
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          console.log("Login successful, redirecting...");
          navigate("/generate");
          return true;
        } else {
          setError({
            message: "Session not established. Please try again.",
          });
          return false;
        }
      }

      setError({
        message: "An unexpected error occurred. Please try again.",
      });
      return false;
    } catch (err) {
      console.error("Unexpected error during login:", err);
      setError({
        message: "An unexpected error occurred. Please try again.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
  };
}
