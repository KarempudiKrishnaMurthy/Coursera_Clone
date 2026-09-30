export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';

export interface Lesson {
  id: string;
  title: string;
  duration: string; // e.g. "12:45"
  videoUrl?: string;
  isFreePreview?: boolean;
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Instructor {
  id: string;
  name: string;
  headline: string;
  avatar: string;
  bio: string;
  rating: number;
  studentsCount: number;
  coursesCount: number;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: CourseLevel;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingsCount: number;
  studentsCount: number;
  language: string;
  lastUpdated: string;
  thumbnail: string;
  previewVideoUrl?: string;
  instructor: Instructor;
  whatYouWillLearn: string[];
  requirements: string[];
  sections: Section[];
  reviews: Review[];
  isBestseller?: boolean;
  isFeatured?: boolean;
}

export interface CourseFilters {
  search?: string;
  category?: string;
  level?: CourseLevel | 'all';
  rating?: number;
  price?: 'all' | 'free' | 'paid';
  sortBy?: 'popular' | 'highest-rated' | 'newest' | 'price-low' | 'price-high';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  headline?: string;
  enrolledCourseIds: string[];
}

export interface EnrolledCourseProgress {
  courseId: string;
  completedLessonIds: string[];
  lastAccessedLessonId?: string;
  progressPercent: number;
  lastAccessedAt: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
}
