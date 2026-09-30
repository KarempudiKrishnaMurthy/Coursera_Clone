import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Course, Testimonial } from '../../types';
import * as coursesService from '../../services/courses.service';
import { CourseCard } from '../../components/courses/CourseCard';
import { Button } from '../../components/common/Button';
import {
  Search,
  Sparkles,
  Award,
  Users,
  Clock,
  ArrowRight,
  Code,
  Database,
  Cloud,
  Palette,
  Smartphone,
  Shield,
  Briefcase,
  Star,
  Quote,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; count: number; icon: string }[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [courses, cats, tests] = await Promise.all([
          coursesService.getPopularCourses(),
          coursesService.getCategories(),
          coursesService.getTestimonials(),
        ]);
        setPopularCourses(courses);
        setCategories(cats);
        setTestimonials(tests);
      } catch (err) {
        console.error('Failed to load home page data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/courses?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/courses');
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code': return <Code className="text-primary-600" size={24} />;
      case 'Database': return <Database className="text-indigo-600" size={24} />;
      case 'Cloud': return <Cloud className="text-sky-600" size={24} />;
      case 'Palette': return <Palette className="text-pink-600" size={24} />;
      case 'Smartphone': return <Smartphone className="text-emerald-600" size={24} />;
      case 'Shield': return <Shield className="text-amber-600" size={24} />;
      case 'Briefcase': return <Briefcase className="text-violet-600" size={24} />;
      default: return <Code className="text-primary-600" size={24} />;
    }
  };

  return (
    <div className="space-y-16 lg:space-y-24 pb-16 w-full min-w-0 overflow-x-hidden">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/70 via-white to-slate-50 pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/80 w-full min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full min-w-0">
          <div className="text-center max-w-3xl mx-auto space-y-6 min-w-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100/70 text-primary-800 text-xs sm:text-sm font-semibold tracking-wide border border-primary-200">
              <Sparkles size={15} className="text-primary-600" />
              <span>Over 25,000+ graduates in tech & business</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight break-words">
              Learn Without Limits. <br className="hidden sm:inline" />
              <span className="text-primary-600">Advance Your Future.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed break-words">
              Master in-demand skills from world-class software engineers, product designers, and AI researchers. Gain accredited knowledge that opens doors.
            </p>

            {/* Hero Search Box */}
            <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto pt-2 w-full min-w-0">
              <div className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-2xl shadow-xl border border-slate-200 min-w-0">
                <div className="relative flex-1 w-full min-w-0">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search by skill, course, or topic (e.g. React, Python, AWS)..."
                    className="w-full pl-12 pr-4 py-3 text-slate-900 text-sm sm:text-base rounded-xl focus:outline-none placeholder:text-slate-400 min-w-0"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold shrink-0">
                  Search Courses
                </Button>
              </div>
            </form>

            {/* Popular tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs sm:text-sm text-slate-500 min-w-0">
              <span className="font-medium text-slate-700">Popular:</span>
              {['React 18', 'Python AI', 'DevOps & K8s', 'Figma UI', 'Ethical Hacking'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/courses?search=${encodeURIComponent(tag)}`)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-full border border-slate-200 text-slate-600 hover:text-primary-600 transition-colors shadow-2xs"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      </section>

      {/* 2. Value Propositions Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 min-w-0">
          <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-card min-w-0">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-xl shrink-0">
              <Award size={26} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-base truncate">Industry-Recognized Certificates</h3>
              <p className="text-sm text-slate-500 mt-1 break-words">Showcase shareable digital credentials on LinkedIn and resume.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-card min-w-0">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <Users size={26} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-base truncate">Taught by Top Experts</h3>
              <p className="text-sm text-slate-500 mt-1 break-words">Learn directly from staff engineers at Google, Stanford & Stripe.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-card min-w-0">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <Clock size={26} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-base truncate">Learn at Your Own Pace</h3>
              <p className="text-sm text-slate-500 mt-1 break-words">Lifetime access to interactive video lessons, quizzes, and notes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 min-w-0">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Top Categories
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Explore specialized paths crafted to level up your technical career.
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 shrink-0"
          >
            All Categories <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 min-w-0">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/courses?category=${cat.id}`}
              className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between min-w-0"
            >
              <div className="p-3 bg-slate-50 group-hover:bg-primary-50 rounded-xl w-fit transition-colors shrink-0">
                {getCategoryIcon(cat.icon)}
              </div>
              <div className="mt-4 min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base group-hover:text-primary-600 transition-colors truncate">
                  {cat.name}
                </h3>
                <span className="text-xs text-slate-400 mt-0.5 block truncate">
                  {cat.count} courses
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Popular Courses Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 min-w-0">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
              <Star size={14} className="fill-primary-600 text-primary-600" />
              Highest Rated
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Most Popular Courses
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Join thousands of learners in our best-selling specialization tracks.
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 shrink-0"
          >
            Explore all courses <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-w-0">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 animate-pulse min-w-0">
                <div className="aspect-video bg-slate-200 rounded-lg w-full" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-6 bg-slate-200 rounded w-1/3 pt-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-w-0">
            {popularCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Testimonials Section */}
      <section className="bg-slate-900 text-white py-16 sm:py-24 w-full min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 min-w-0">
            <span className="text-primary-400 font-semibold text-xs sm:text-sm uppercase tracking-widest">
              Student Success Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight break-words">
              Loved by 25,000+ Ambitious Professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-w-0">
            {testimonials.map((test) => (
              <div
                key={test.id}
                className="bg-slate-800/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-slate-700/80 flex flex-col justify-between relative shadow-lg min-w-0"
              >
                <Quote size={32} className="text-primary-500/30 mb-4 shrink-0" />
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed italic mb-6 break-words">
                  "{test.quote}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-700 min-w-0">
                  <img
                    src={test.avatar}
                    alt={test.author}
                    className="w-11 h-11 rounded-full object-cover border border-slate-600 shrink-0"
                  />
                  <div className="min-w-0 truncate">
                    <h4 className="font-semibold text-white text-sm truncate">{test.author}</h4>
                    <p className="text-xs text-slate-400 truncate">
                      {test.role} at <span className="text-primary-400 font-medium">{test.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-700 to-indigo-800 rounded-3xl p-8 sm:p-14 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 min-w-0">
          <div className="space-y-3 text-center lg:text-left max-w-xl min-w-0">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight break-words">
              Ready to accelerate your professional journey?
            </h2>
            <p className="text-primary-100 text-sm sm:text-base leading-relaxed break-words">
              Start learning for free today. Join CourseHub and unlock courses crafted by the industry’s most respected builders.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/courses')}
              className="bg-white text-primary-700 hover:bg-primary-50 active:bg-primary-100 font-bold px-8 shadow-md"
            >
              Get Started Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/courses?price=free')}
              className="border-primary-300 text-white hover:bg-primary-600/40 active:bg-primary-600/60 font-semibold"
            >
              Free Courses
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
