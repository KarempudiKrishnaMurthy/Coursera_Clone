import React from 'react';
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
import { GraduationCap, Mail, Lock, User, Check, ArrowRight } from 'lucide-react';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup(data.name, data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 w-full min-w-0">
      <Card className="w-full max-w-md rounded-3xl shadow-xl p-2 sm:p-4 space-y-4 min-w-0 border-slate-200">
        <CardHeader className="text-center space-y-2 min-w-0 pb-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center mx-auto shadow-md shadow-primary-500/30">
            <GraduationCap size={26} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight break-words">
            Create your account
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-500">
            Start learning with lifetime access on CourseHub
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 min-w-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 min-w-0">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  type="text"
                  {...register('name')}
                  placeholder="Jane Doe"
                  className={`pl-10 ${errors.name ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                />
              </div>
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  type="email"
                  {...register('email')}
                  placeholder="jane@example.com"
                  className={`pl-10 ${errors.email ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  type="password"
                  {...register('password')}
                  placeholder="Minimum 6 characters"
                  className={`pl-10 ${errors.password ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                />
              </div>
              {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="Repeat password"
                  className={`pl-10 ${errors.confirmPassword ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-rose-600 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-2 pt-1 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" />
                <span>Full access to free previews and exercises</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" />
                <span>Personalized skill recommendations</span>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2 font-bold shadow-md">
              Create Free Account
            </Button>
          </form>

          <p className="text-center text-xs sm:text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-bold text-primary-600 hover:text-primary-700">
              Sign in here <ArrowRight size={14} className="inline" />
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
