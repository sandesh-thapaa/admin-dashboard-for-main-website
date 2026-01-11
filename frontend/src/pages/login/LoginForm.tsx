import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { ApiError } from "../../types/api";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../schema/authSchema";
import { z } from "zod";
import { toast } from "sonner";

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      const { access_token } = response.data;
      if (access_token) {
        localStorage.setItem("access_token", access_token);
        toast.success("Login successful!");
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data as ApiError;
        const message =
          typeof errorData?.detail === "string"
            ? errorData.detail
            : errorData?.detail?.[0]?.msg || "Login failed";

        toast.error(message);
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-card border border-white/50 backdrop-blur-sm p-8 sm:p-10 flex flex-col gap-8 transition-all hover:shadow-2xl">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex justify-center w-full">
          <img
            src="/Logo.png"
            alt="logo"
            className="h-20 w-auto object-contain"
          />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-primary-dark">
            Leafclutch Technologies
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Welcome back, Admin
          </p>
        </div>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        {/* Email Field */}
        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-primary-dark ml-1"
            htmlFor="email"
          >
            Admin Email
          </label>
          <div className="relative">
            <input
              {...register("email")}
              className={`form-input-transition w-full rounded-lg bg-surface-light border-transparent px-4 pl-11 h-12 text-base text-primary-dark placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none ${
                errors.email ? "border-rose-500" : ""
              }`}
              id="email"
              placeholder="name@leafclutch.com"
              type="email"
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-primary-dark ml-1"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative group">
            <input
              {...register("password")}
              className={`form-input-transition w-full rounded-lg bg-surface-light border-transparent px-4 pl-11 pr-12 h-12 text-base text-primary-dark placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none ${
                errors.password ? "border-rose-500" : ""
              }`}
              id="password"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <button
              className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-slate-400 hover:text-primary transition-colors focus:outline-none"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full cursor-pointer items-center justify-center rounded-lg h-12 bg-primary hover:brightness-110 text-white text-base font-bold transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
          <button
            type="button"
            className="text-sm font-semibold text-primary hover:underline text-center transition-colors"
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
