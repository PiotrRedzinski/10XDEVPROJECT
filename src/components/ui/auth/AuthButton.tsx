import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function AuthButton({ loading, children, ...props }: AuthButtonProps) {
  return (
    <Button className="w-full bg-rose-600 font-medium hover:bg-rose-700" size="lg" disabled={loading} {...props}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : (
        children
      )}
    </Button>
  );
}
