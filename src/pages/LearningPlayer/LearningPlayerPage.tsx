import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Course, Lesson, EnrolledCourseProgress } from '../../types';
import * as coursesService from '../../services/courses.service';
import * as enrollmentService from '../../services/enrollments.service';
import { useEnrollmentStore } from '../../store/enrollmentStore';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  Volume2,
  Maximize2,
  ChevronDown,
  ChevronUp,
  FileText,
  RotateCcw,
  Check,
  Menu,
  X,
  Share2,
} from 'lucide-react';

export const LearningPlayerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { markLessonComplete } = useEnrollmentStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<EnrolledCourseProgress | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Notes tab state (persisted locally in localStorage per course)
  const [notes, setNotes] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes'>('overview');

  useEffect(() => {
    if (courseId) {
      setIsLoading(true);
      Promise.all([
        coursesService.getCourseById(courseId),
        enrollmentService.getCourseProgress(courseId),
      ]).then(([c, p]) => {
        setCourse(c);
        setProgress(p);

        if (c && c.sections.length > 0) {
          // Open all sections by default
          const sectionsMap: Record<string, boolean> = {};
          c.sections.forEach((s) => (sectionsMap[s.id] = true));
          setOpenSections(sectionsMap);

          // Find first lesson or resume from last accessed
          const allLessons = c.sections.flatMap((s) => s.lessons);
          const resumeLesson = allLessons.find((l) => l.id === p?.lastAccessedLessonId) || allLessons[0];
          setActiveLesson(resumeLesson);
        }

        // Load saved notes
        const savedNotes = localStorage.getItem(`course_notes_${courseId}`) || '';
        setNotes(savedNotes);

        setIsLoading(false);
      });
    }
  }, [courseId]);

  if (isLoading || !course || !activeLesson) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center w-full min-w-0">
        <div className="text-center space-y-4 min-w-0">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading your learning workspace...</p>
        </div>
      </div>
    );
  }

  const allLessons = course.sections.flatMap((s) => s.lessons);
  const totalLessons = allLessons.length;
  const completedIds = progress?.completedLessonIds || [];
  const isCurrentCompleted = completedIds.includes(activeLesson.id);

  const handleToggleComplete = async (lessonId: string, currentStatus: boolean) => {
    await markLessonComplete(course.id, lessonId, !currentStatus, totalLessons);
    const updated = await enrollmentService.getCourseProgress(course.id);
    setProgress(updated);
  };

  const handleSaveNotes = () => {
    localStorage.setItem(`course_notes_${course.id}`, notes);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleNextLesson = () => {
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex < allLessons.length - 1) {
      setActiveLesson(allLessons[currentIndex + 1]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden w-full min-w-0">
      {/* 1. Player Top Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-20 min-w-0 w-full">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dashboard"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">My Courses</span>
          </Link>
          <div className="h-4 w-px bg-slate-700 hidden sm:block shrink-0" />
          <h1 className="text-sm font-semibold text-slate-200 truncate max-w-xs sm:max-w-md md:max-w-xl min-w-0">
            {course.title}
          </h1>
        </div>

        {/* Progress & Sidebar Toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-slate-400">Progress:</span>
            <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress?.progressPercent || 0}%` }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-400">
              {progress?.progressPercent || 0}%
            </span>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            <span className="hidden sm:inline">Curriculum</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace (Video Player + Sidebar) */}
      <div className="flex flex-1 overflow-hidden relative min-w-0 w-full">
        {/* Left: Video Area & Tabs */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900 min-w-0">
          {/* Simulated Video Player */}
          <div className="relative aspect-video max-h-[65vh] w-full bg-black flex items-center justify-center group overflow-hidden shrink-0">
            {/* Poster / Background preview */}
            <img
              src={course.thumbnail}
              alt={activeLesson.title}
              className={`w-full h-full object-cover transition-opacity duration-700 max-w-full ${
                isPlaying ? 'opacity-30' : 'opacity-60'
              }`}
            />

            {/* Centered Play / Pause Overlay */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute w-20 h-20 rounded-full bg-primary-600/90 hover:bg-primary-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform backdrop-blur-sm"
            >
              {isPlaying ? <Pause size={36} /> : <Play size={36} className="ml-1 fill-white" />}
            </button>

            {/* Video Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between text-xs text-white min-w-0">
              <div className="flex items-center gap-3 min-w-0 truncate">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover:text-primary-400 transition-colors shrink-0"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-white" />}
                </button>
                <span className="shrink-0">{activeLesson.duration}</span>
                <span className="text-slate-400 shrink-0">•</span>
                <span className="font-semibold truncate max-w-xs">{activeLesson.title}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-300 shrink-0">
                <Volume2 size={18} className="cursor-pointer hover:text-white" />
                <Maximize2 size={18} className="cursor-pointer hover:text-white" />
              </div>
            </div>
          </div>

          {/* Lesson Action Controls Under Video */}
          <div className="p-6 border-b border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0">
            <div className="min-w-0 truncate">
              <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
                Now Playing
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5 truncate">{activeLesson.title}</h2>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              <Button
                variant={isCurrentCompleted ? 'outline' : 'primary'}
                size="md"
                onClick={() => handleToggleComplete(activeLesson.id, isCurrentCompleted)}
                className={`flex-1 sm:flex-initial flex items-center gap-2 ${
                  isCurrentCompleted
                    ? 'border-emerald-600 text-emerald-400 hover:bg-emerald-950/40'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
                }`}
              >
                <CheckCircle2 size={16} />
                {isCurrentCompleted ? 'Completed ✓' : 'Mark as Complete'}
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={handleNextLesson}
                className="border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                Next Lesson →
              </Button>
            </div>
          </div>

          {/* Bottom Tabs: Overview & Notes */}
          <div className="p-6 space-y-6 flex-1 bg-slate-950 min-w-0">
            <div className="flex items-center gap-6 border-b border-slate-800 min-w-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 text-sm font-semibold transition-colors border-b-2 shrink-0 ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview & Resources
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'notes'
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText size={15} />
                My Notes
              </button>
            </div>

            {activeTab === 'overview' ? (
              <div className="space-y-4 max-w-3xl text-sm text-slate-300 leading-relaxed min-w-0">
                <h3 className="font-semibold text-white text-base">About this lesson</h3>
                <p className="break-words">
                  In this lesson, you explore key concepts and practical patterns. Follow along with the code repository and challenge exercises provided in the course resources.
                </p>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 min-w-0">
                  <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
                    Lesson Resources
                  </h4>
                  <ul className="text-xs text-primary-400 space-y-1">
                    <li className="hover:underline cursor-pointer truncate">
                      • Download source code (.zip)
                    </li>
                    <li className="hover:underline cursor-pointer truncate">
                      • Lecture cheat sheet & slides (.pdf)
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-w-3xl min-w-0">
                <div className="flex items-center justify-between min-w-0">
                  <span className="text-xs text-slate-400 truncate">
                    Notes are automatically saved locally for this course.
                  </span>
                  {noteSaved && (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 shrink-0">
                      <Check size={14} /> Saved!
                    </span>
                  )}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Jot down key takeaways, code snippets, or thoughts as you watch..."
                  rows={8}
                  className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none min-w-0"
                />
                <Button variant="primary" size="sm" onClick={handleSaveNotes} className="font-semibold">
                  Save Notes
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Collapsible Curriculum Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-hidden z-10 animate-in slide-in-from-right duration-200 min-w-0">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between min-w-0">
              <h3 className="font-bold text-sm text-white">Course Content</h3>
              <span className="text-xs text-slate-400 shrink-0">
                {completedIds.length} / {totalLessons} completed
              </span>
            </div>

            {/* Sections Accordion */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800 min-w-0">
              {course.sections.map((section, sIdx) => {
                const isOpen = !!openSections[section.id];
                return (
                  <div key={section.id} className="min-w-0">
                    <button
                      onClick={() =>
                        setOpenSections((prev) => ({ ...prev, [section.id]: !prev[section.id] }))
                      }
                      className="w-full flex items-center justify-between p-3.5 bg-slate-850 hover:bg-slate-800 text-left transition-colors min-w-0"
                    >
                      <div className="space-y-0.5 min-w-0 truncate">
                        <span className="text-[11px] font-semibold text-primary-400 uppercase tracking-wider block">
                          Section {sIdx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-200 line-clamp-1 truncate">
                          {section.title}
                        </h4>
                      </div>
                      {isOpen ? (
                        <ChevronUp size={16} className="text-slate-400 shrink-0 ml-2" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400 shrink-0 ml-2" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-slate-850 bg-slate-900/60 min-w-0">
                        {section.lessons.map((lesson) => {
                          const isCompleted = completedIds.includes(lesson.id);
                          const isActive = activeLesson.id === lesson.id;

                          return (
                            <div
                              key={lesson.id}
                              onClick={() => setActiveLesson(lesson)}
                              className={`p-3 pl-4 flex items-start gap-3 cursor-pointer transition-colors min-w-0 ${
                                isActive
                                  ? 'bg-primary-950/60 border-l-4 border-primary-500'
                                  : 'hover:bg-slate-800/60 border-l-4 border-transparent'
                              }`}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleComplete(lesson.id, isCompleted);
                                }}
                                className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-500/20" />
                                ) : (
                                  <Circle size={16} />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-xs sm:text-sm leading-snug break-words ${
                                    isActive
                                      ? 'font-bold text-white'
                                      : isCompleted
                                      ? 'text-slate-400 line-through'
                                      : 'text-slate-300'
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                <span className="text-[11px] text-slate-500 font-mono mt-0.5 block truncate">
                                  {lesson.duration}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
