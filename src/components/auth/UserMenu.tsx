import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserMenuProps {
  userEmail: string;
}

export function UserMenu({ userEmail }: UserMenuProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error);
        return;
      }

      // Redirect to login page after successful logout
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <span className="text-airbnb-hof text-sm">{userEmail}</span>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="text-airbnb-rausch hover:text-red-700 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-150 disabled:opacity-50"
      >
        {isLoading ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}
