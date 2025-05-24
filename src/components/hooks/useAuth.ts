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

      console.log("Attempting login with Supabase...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error details:", {
          message: error.message,
          status: error.status,
          name: error.name,
        });
        setError({
          message: error.message,
          field: error.message.toLowerCase().includes("password") ? "password" : "email",
        });
        return false;
      }

      if (data?.user) {
        console.log("User authenticated, getting session...");
        // Wait for session to be set
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setError({
            message: "Failed to establish session. Please try again.",
          });
          return false;
        }

        if (session) {
          console.log("Session established, redirecting...");
          navigate("/generate");
          return true;
        } else {
          console.error("No session after successful login");
          setError({
            message: "Session not established. Please try again.",
          });
          return false;
        }
      }

      console.error("No user data after successful authentication");
      setError({
        message: "An unexpected error occurred. Please try again.",
      });
      return false;
    } catch (err) {
      console.error("Unexpected login error:", err);
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
