import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../components/ui/card';
import { GraduationCap, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'alex.rivera@example.com',
      password: 'password123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch {
      setAuthError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 w-full min-w-0">
      <Card className="w-full max-w-md rounded-3xl shadow-xl p-2 sm:p-4 space-y-4 min-w-0 border-slate-200">
        <CardHeader className="text-center space-y-2 min-w-0 pb-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center mx-auto shadow-md shadow-primary-500/30 shrink-0">
            <GraduationCap size={26} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
            Welcome back
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-500">
            Log in to continue learning on CourseHub
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 min-w-0">
          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs sm:text-sm min-w-0">
              <AlertCircle size={16} className="shrink-0" />
              <span className="break-words min-w-0">{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 min-w-0">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative min-w-0">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  className={`pl-10 ${errors.email ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center justify-between mb-1.5 min-w-0">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium shrink-0"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative min-w-0">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className={`pl-10 ${errors.password ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2 font-bold shadow-md">
              Sign In to Account
            </Button>
          </form>

          {/* Demo Credentials note */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center text-xs text-slate-500 min-w-0">
            <p className="font-semibold text-slate-700">Demo Account Pre-filled</p>
            <p>Click "Sign In to Account" for instant mock login.</p>
          </div>

          {/* Signup Switch */}
          <p className="text-center text-xs sm:text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="font-bold text-primary-600 hover:text-primary-700">
              Sign up for free <ArrowRight size={14} className="inline" />
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
