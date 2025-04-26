import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthButton } from "@/components/ui/auth/AuthButton";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    // Backend integration will be implemented later
    console.log(data);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <div className="text-sm text-right">
        <a href="/reset-password" className="text-rose-600 hover:text-rose-500">
          Forgot your password?
        </a>
      </div>

      <AuthButton type="submit" loading={isLoading}>
        Sign in
      </AuthButton>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <a href="/register" className="font-medium text-rose-600 hover:text-rose-500">
          Sign up
        </a>
      </p>
    </form>
  );
}
