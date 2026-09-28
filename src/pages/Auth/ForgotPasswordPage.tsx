import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../components/ui/card';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import * as authService from '../../services/auth.service';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    await authService.forgotPassword(data.email);
    setIsLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 w-full min-w-0">
      <Card className="w-full max-w-md rounded-3xl shadow-xl p-2 sm:p-4 space-y-4 min-w-0 border-slate-200">
        <CardHeader className="text-center space-y-2 min-w-0 pb-2">
          <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight break-words">
            Reset Password
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-500">
            Enter your email address and we'll send you recovery instructions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 min-w-0">
          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 min-w-0">
              <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-900 text-sm">Check your inbox</h4>
              <p className="text-xs text-emerald-700">
                We've sent a mock reset link to your email address. Follow the instructions to reset your password.
              </p>
              <Link to="/auth/login" className="block pt-2">
                <Button size="sm" variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 min-w-0">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                  <Input
                    type="email"
                    {...register('email')}
                    placeholder="you@example.com"
                    className={`pl-10 ${errors.email ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>}
              </div>

              <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full font-bold shadow-md">
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
