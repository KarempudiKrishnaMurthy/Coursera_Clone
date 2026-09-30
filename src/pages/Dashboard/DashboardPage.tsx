import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useEnrollmentStore } from '../../store/enrollmentStore';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  BookOpen,
  Play,
  Award,
  CheckCircle,
  Clock,
  Compass,
  ArrowRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { enrolledList, isLoading, fetchEnrolledCourses } = useEnrollmentStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    fetchEnrolledCourses();
  }, [isAuthenticated, fetchEnrolledCourses, navigate]);

  const completedCount = enrolledList.filter((item) => item.progress.progressPercent === 100).length;
  const inProgressCount = enrolledList.length - completedCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 w-full min-w-0">
      {/* User Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 min-w-0">
        <div className="flex items-center gap-5 min-w-0">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-primary-400 shadow-md shrink-0"
          />
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-700/60 text-primary-200 text-xs font-semibold mb-2">
              <Award size={14} /> Student Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
              Welcome back, {user?.name.split(' ')[0]}!
            </h1>
            <p className="text-primary-200 text-xs sm:text-sm mt-1 break-words">
              Keep pushing forward. Consistency is the secret to mastering new disciplines.
            </p>
          </div>
        </div>

        {/* Quick Progress Stats */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shrink-0">
          <div className="text-center px-2">
            <span className="block text-2xl sm:text-3xl font-black text-white">
              {enrolledList.length}
            </span>
            <span className="text-[11px] text-primary-200 uppercase tracking-wider font-semibold">
              Enrolled
            </span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center px-2">
            <span className="block text-2xl sm:text-3xl font-black text-white">
              {inProgressCount}
            </span>
            <span className="text-[11px] text-primary-200 uppercase tracking-wider font-semibold">
              In Progress
            </span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center px-2">
            <span className="block text-2xl sm:text-3xl font-black text-emerald-400">
              {completedCount}
            </span>
            <span className="text-[11px] text-primary-200 uppercase tracking-wider font-semibold">
              Completed
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6 min-w-0">
        <div className="flex items-center justify-between min-w-0">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 truncate">
            <BookOpen size={22} className="text-primary-600 shrink-0" />
            My Learning
          </h2>
          <Link
            to="/courses"
            className="text-xs sm:text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 shrink-0"
          >
            <Compass size={16} /> Browse More Courses
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse min-w-0">
                <div className="aspect-video bg-slate-200 rounded-xl" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-9 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : enrolledList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-card min-w-0">
            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto">
              <BookOpen size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 break-words">You haven't enrolled in any courses yet</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto break-words">
              Explore our catalogue of top-rated specializations in web development, AI, cloud architecture, and product design.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate('/courses')} className="font-semibold shadow-sm">
              Explore Course Catalog
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
            {enrolledList.map(({ course, progress }) => (
              <Card
                key={course.id}
                className="overflow-hidden flex flex-col justify-between min-w-0 w-full shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="min-w-0">
                  {/* Thumbnail with overlay continue button */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 group shrink-0">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 max-w-full"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/learn/${course.id}`)}
                        className="font-bold flex items-center gap-1.5 shadow-lg"
                      >
                        <Play size={14} className="fill-white" /> Continue
                      </Button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3 min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-600 truncate block">
                      {course.category.replace('-', ' ')}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base line-clamp-2 leading-snug break-words">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 truncate">
                      Instructor: {course.instructor.name}
                    </p>

                    {/* Progress Bar */}
                    <div className="pt-2 space-y-1.5 min-w-0">
                      <div className="flex items-center justify-between text-xs min-w-0">
                        <span className="font-medium text-slate-700">Course Progress</span>
                        <span className="font-bold text-primary-600">
                          {progress.progressPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            progress.progressPercent === 100 ? 'bg-emerald-500' : 'bg-primary-600'
                          }`}
                          style={{ width: `${progress.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="p-5 pt-0 min-w-0">
                  <Button
                    size="md"
                    variant="primary"
                    onClick={() => navigate(`/learn/${course.id}`)}
                    className="w-full font-semibold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Play size={15} className="fill-white" /> Continue Learning
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
