import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Course } from '../../types';
import * as coursesService from '../../services/courses.service';
import { RatingStars } from '../../components/common/RatingStars';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useCartStore } from '../../store/cartStore';
import { useEnrollmentStore } from '../../store/enrollmentStore';
import { useAuthStore } from '../../store/authStore';
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe,
  Share2,
  BookOpen,
  Check,
  ShoppingCart,
  Award,
  Video,
  FileText,
  UserCheck,
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewLessonTitle, setPreviewLessonTitle] = useState('');

  const { isAuthenticated } = useAuthStore();
  const { addItem, isInCart } = useCartStore();
  const { isEnrolled, enroll } = useEnrollmentStore();

  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      coursesService.getCourseBySlug(slug).then((data) => {
        setCourse(data);
        if (data && data.sections.length > 0) {
          // Open first section by default
          setOpenSections({ [data.sections[0].id]: true });
        }
        setIsLoading(false);
      });
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-10 bg-slate-200 rounded w-2/3" />
        <div className="h-5 bg-slate-200 rounded w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-slate-200 rounded-xl" />
            <div className="h-40 bg-slate-200 rounded-xl" />
          </div>
          <div className="h-96 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Course Not Found</h2>
        <p className="text-slate-500 text-sm">
          We couldn't find the course you requested. It may have been moved or unpublished.
        </p>
        <Link to="/courses">
          <Button variant="primary">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const enrolled = isEnrolled(course.id);
  const inCart = isInCart(course.id);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleEnrollNow = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    await enroll(course.id);
    navigate(`/learn/${course.id}`);
  };

  const handleAddToCart = () => {
    addItem(course);
  };

  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);

  const openLessonPreview = (lessonTitle: string) => {
    setPreviewLessonTitle(lessonTitle);
    setShowPreviewModal(true);
  };

  return (
    <div>
      {/* 1. Dark Top Header Bar */}
      <section className="bg-slate-900 text-white py-10 lg:py-16 w-full min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start min-w-0">
            <div className="lg:col-span-2 space-y-4 min-w-0">
              {/* Breadcrumbs & Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs min-w-0">
                <Link to="/courses" className="text-primary-400 hover:underline">
                  Courses
                </Link>
                <span className="text-slate-500">/</span>
                <span className="text-slate-300 capitalize">{course.category.replace('-', ' ')}</span>
                {course.isBestseller && (
                  <Badge variant="amber" size="sm" className="ml-2">
                    Bestseller
                  </Badge>
                )}
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight break-words">
                {course.title}
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed break-words">
                {course.subtitle}
              </p>

              {/* Stats & Instructor */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm pt-2 text-slate-300 min-w-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  <RatingStars rating={course.rating} ratingsCount={course.ratingsCount} />
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 min-w-0">
                  <UserCheck size={16} className="text-primary-400 shrink-0" />
                  <span className="truncate">{course.studentsCount.toLocaleString()} enrolled learners</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 shrink-0">
                  <Globe size={15} className="text-slate-400" />
                  <span>{course.language}</span>
                </div>
              </div>

              {/* Instructor snippet */}
              <div className="flex items-center gap-3 pt-3 min-w-0">
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                />
                <div className="min-w-0 truncate">
                  <p className="text-xs text-slate-400">Created by</p>
                  <p className="text-sm font-semibold text-white truncate">{course.instructor.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Grid & Sticky Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 w-full min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start min-w-0">
          {/* Left Column (Details, Syllabus, Reviews) */}
          <div className="lg:col-span-2 space-y-12 min-w-0">
            {/* What you'll learn card */}
            <div className="bg-primary-50/60 border border-primary-200/80 rounded-2xl p-6 sm:p-8 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-primary-600" />
                What You'll Learn
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 min-w-0">
                {course.whatYouWillLearn.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 min-w-0">
                    <Check size={17} className="text-primary-600 shrink-0 mt-0.5" />
                    <span className="break-words min-w-0">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Overview / Description */}
            <div className="space-y-4 min-w-0">
              <h2 className="text-xl font-bold text-slate-900">Description</h2>
              <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed break-words">
                <p>{course.description}</p>
              </div>
            </div>

            {/* Course Content / Syllabus Accordion */}
            <div className="space-y-4 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-slate-900">Course Curriculum</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {course.sections.length} sections • {totalLessons} lessons
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allOpen = Object.keys(openSections).length === course.sections.length;
                    if (allOpen) {
                      setOpenSections({});
                    } else {
                      const all: Record<string, boolean> = {};
                      course.sections.forEach((s) => (all[s.id] = true));
                      setOpenSections(all);
                    }
                  }}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-800 shrink-0"
                >
                  {Object.keys(openSections).length === course.sections.length
                    ? 'Collapse all sections'
                    : 'Expand all sections'}
                </button>
              </div>

              {/* Accordion List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 bg-white min-w-0">
                {course.sections.map((section) => {
                  const isOpen = !!openSections[section.id];
                  return (
                    <div key={section.id} className="min-w-0">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left min-w-0"
                      >
                        <div className="flex items-center gap-3 min-w-0 truncate">
                          {isOpen ? <ChevronUp size={18} className="text-slate-500 shrink-0" /> : <ChevronDown size={18} className="text-slate-500 shrink-0" />}
                          <span className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                            {section.title}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 shrink-0 ml-2">
                          {section.lessons.length} lessons
                        </span>
                      </button>

                      {isOpen && (
                        <div className="divide-y divide-slate-100 bg-white min-w-0">
                          {section.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between px-6 py-3 hover:bg-slate-50/80 transition-colors text-sm gap-2 min-w-0"
                            >
                              <div className="flex items-center gap-3 min-w-0 truncate">
                                <PlayCircle size={16} className="text-primary-600 shrink-0" />
                                <span className="text-slate-700 truncate">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                {lesson.isFreePreview && (
                                  <button
                                    onClick={() => openLessonPreview(lesson.title)}
                                    className="text-xs font-medium text-primary-600 hover:underline px-2 py-0.5 rounded bg-primary-50"
                                  >
                                    Preview
                                  </button>
                                )}
                                <span className="text-xs text-slate-400 font-mono">
                                  {lesson.duration}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prerequisites */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
                {course.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            {/* Instructor Profile */}
            <div className="space-y-4 pt-4 border-t border-slate-200 min-w-0">
              <h2 className="text-xl font-bold text-slate-900">Your Instructor</h2>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card space-y-4 min-w-0">
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary-500 shrink-0"
                  />
                  <div className="min-w-0 truncate">
                    <h3 className="font-bold text-slate-900 text-lg truncate">{course.instructor.name}</h3>
                    <p className="text-sm text-primary-600 truncate">{course.instructor.headline}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-500 mt-1">
                      <span>★ {course.instructor.rating} Rating</span>
                      <span>•</span>
                      <span>{course.instructor.studentsCount.toLocaleString()} Students</span>
                      <span>•</span>
                      <span>{course.instructor.coursesCount} Courses</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed break-words">{course.instructor.bio}</p>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-6 pt-4 border-t border-slate-200 min-w-0">
              <div className="flex items-center justify-between min-w-0">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-slate-900">Student Feedback</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <RatingStars rating={course.rating} ratingsCount={course.ratingsCount} size="md" />
                    <span className="text-xs text-slate-500 font-medium">Course Rating</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                {course.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 bg-white rounded-xl border border-slate-200 shadow-card space-y-3 min-w-0"
                  >
                    <div className="flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          className="w-9 h-9 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0 truncate">
                          <h4 className="text-sm font-semibold text-slate-800 truncate">{rev.userName}</h4>
                          <span className="text-xs text-slate-400">{rev.date}</span>
                        </div>
                      </div>
                      <div className="flex text-amber-400 shrink-0">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Purchase / Enrollment Card */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 min-w-0 w-full">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden min-w-0">
              {/* Video Thumbnail Preview */}
              <div
                onClick={() => openLessonPreview('Course Overview')}
                className="relative aspect-video bg-slate-900 cursor-pointer group shrink-0"
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity max-w-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 text-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <PlayCircle size={32} className="fill-primary-600 text-white" />
                  </div>
                </div>
                <span className="absolute bottom-2.5 right-2.5 text-xs bg-slate-900/80 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                  Preview this course
                </span>
              </div>

              {/* Price & CTAs */}
              <div className="p-6 space-y-5 min-w-0">
                <div className="flex items-baseline gap-2 min-w-0 truncate">
                  <span className="text-3xl font-extrabold text-slate-900 shrink-0">
                    {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                  </span>
                  {course.originalPrice && course.price > 0 && (
                    <span className="text-sm text-slate-400 line-through truncate">
                      ${course.originalPrice.toFixed(2)}
                    </span>
                  )}
                  {course.originalPrice && course.price > 0 && (
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full shrink-0">
                      {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2.5 min-w-0">
                  {enrolled ? (
                    <Button
                      size="lg"
                      onClick={() => navigate(`/learn/${course.id}`)}
                      className="w-full font-bold flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white"
                    >
                      <BookOpen size={18} />
                      Go to Course Player
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        variant="primary"
                        onClick={handleEnrollNow}
                        className="w-full font-bold shadow-md"
                      >
                        {course.price === 0 ? 'Enroll Now (Free)' : 'Buy Now'}
                      </Button>

                      {course.price > 0 && (
                        <Button
                          variant={inCart ? 'secondary' : 'outline'}
                          size="md"
                          onClick={handleAddToCart}
                          className="w-full"
                          disabled={inCart}
                        >
                          {inCart ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                              <Check size={16} /> Already in Cart
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <ShoppingCart size={16} /> Add to Cart
                            </span>
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Includes Features List */}
                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm mb-3">This course includes:</p>
                  <div className="flex items-center gap-2">
                    <Video size={15} className="text-primary-600 shrink-0" />
                    <span className="truncate">8.5 hours on-demand video</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-primary-600 shrink-0" />
                    <span className="truncate">Downloadable source code & notes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={15} className="text-primary-600 shrink-0" />
                    <span className="truncate">Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={15} className="text-primary-600 shrink-0" />
                    <span className="truncate">Full lifetime access on mobile & web</span>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert('Course link copied to clipboard!');
                    }}
                    className="text-xs text-slate-500 hover:text-primary-600 inline-flex items-center gap-1"
                  >
                    <Share2 size={13} /> Share this course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl min-w-0">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 min-w-0">
              <span className="text-sm font-semibold text-white truncate">
                Course Preview: {previewLessonTitle || course.title}
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-white p-1 text-sm shrink-0 ml-2"
              >
                ✕
              </button>
            </div>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <div className="text-center p-8 space-y-3 min-w-0">
                <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-primary-500/40">
                  <PlayCircle size={32} />
                </div>
                <h4 className="text-white font-semibold break-words">{previewLessonTitle || 'Introductory Lesson'}</h4>
                <p className="text-slate-400 text-xs max-w-sm mx-auto break-words">
                  Interactive video streaming player preview with full player controls, variable playback speed, and captions.
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Free preview lesson</span>
              <Button variant="primary" size="sm" onClick={() => setShowPreviewModal(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
