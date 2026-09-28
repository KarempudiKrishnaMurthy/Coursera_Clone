import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { User, Mail, Briefcase, CheckCircle2, Shield } from 'lucide-react';

interface ProfileFormData {
  name: string;
  email: string;
  headline: string;
  bio: string;
}

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      headline: user?.headline || '',
      bio: user?.bio || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile(data);
    setSuccessMessage(true);
    setTimeout(() => setSuccessMessage(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 w-full min-w-0">
      <div className="min-w-0">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight truncate">Account Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal information, headline, and bio visible across CourseHub.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start min-w-0">
        {/* Left Column: Avatar & Summary */}
        <Card className="md:col-span-1 p-6 text-center space-y-4 min-w-0 shadow-sm">
          <div className="relative inline-block">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary-100 shadow-md mx-auto"
            />
          </div>
          <div className="min-w-0 truncate">
            <h3 className="font-bold text-slate-900 text-lg truncate">{user?.name}</h3>
            <p className="text-xs text-primary-600 font-medium truncate">{user?.headline || 'Learner'}</p>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{user?.email}</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-emerald-700 bg-emerald-50 py-2 rounded-xl">
            <Shield size={15} /> Verified Student
          </div>
        </Card>

        {/* Right Column: Edit Form */}
        <Card className="md:col-span-2 p-8 space-y-6 min-w-0 shadow-sm">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-sm animate-in fade-in-50">
              <CheckCircle2 size={18} />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 min-w-0">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative min-w-0">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="pl-10"
                />
              </div>
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>}
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative min-w-0">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  type="email"
                  disabled
                  {...register('email')}
                  className="pl-10 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Contact support to modify verified login email.
              </span>
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Professional Headline
              </label>
              <div className="relative min-w-0">
                <Briefcase size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  type="text"
                  {...register('headline')}
                  placeholder="e.g. Senior Frontend Engineer @ TechCorp"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Biography
              </label>
              <div className="relative min-w-0">
                <textarea
                  {...register('bio')}
                  rows={4}
                  placeholder="Share a brief overview of your background, experience, and learning goals..."
                  className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none min-w-0"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="font-semibold px-6 shadow-sm">
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
