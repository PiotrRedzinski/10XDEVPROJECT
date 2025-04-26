import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthButton } from "@/components/ui/auth/AuthButton";

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    // Backend integration will be implemented later
    console.log(data);
    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
        <p className="mt-2 text-sm text-gray-600">
          We've sent you a link to reset your password. The link will expire in 24 hours.
        </p>
        <div className="mt-6">
          <a href="/login" className="text-sm font-medium text-rose-600 hover:text-rose-500">
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Reset your password</h3>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <AuthButton type="submit" loading={isLoading}>
        Send reset link
      </AuthButton>

      <p className="text-center text-sm text-gray-600">
        Remember your password?{" "}
        <a href="/login" className="font-medium text-rose-600 hover:text-rose-500">
          Sign in
        </a>
      </p>
    </form>
  );
}
