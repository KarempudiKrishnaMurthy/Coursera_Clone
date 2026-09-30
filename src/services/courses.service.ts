import { Course, CourseFilters, PaginatedResult, Review, Testimonial } from '../types';
import { apiClient } from './apiClient';

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  count: number;
}

const STATIC_TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    quote: 'CourseHub completely changed my trajectory. Within 4 months of completing the React & TypeScript track, I transitioned from junior QA to a full-stack engineer.',
    author: 'Elena Vasquez',
    role: 'Full-Stack Engineer',
    company: 'Stripe',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 't-2',
    quote: 'The depth of content and practical lab assignments rival top university curricula. The machine learning specialization gave our team immediate production ROI.',
    author: 'David Chen',
    role: 'Senior ML Engineer',
    company: 'Spotify',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 't-3',
    quote: 'World-class instructors who actually build systems at scale. CourseHub is the single most valuable continuous learning resource our engineering org uses.',
    author: 'Priya Sharma',
    role: 'Principal Cloud Architect',
    company: 'Datadog',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
];

/**
 * Fetch courses with comprehensive filtering, searching, and pagination
 */
export async function getCourses(filters: CourseFilters = {}): Promise<PaginatedResult<Course>> {
  const params: Record<string, string | number> = {};

  if (filters.search && filters.search.trim()) params.search = filters.search.trim();
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  if (filters.level && filters.level !== 'all') params.level = filters.level;
  if (filters.rating && filters.rating > 0) params.rating = filters.rating;
  if (filters.price && filters.price !== 'all') params.price = filters.price;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  const response = await apiClient.get<PaginatedResult<Course>>('/courses', { params });
  return response.data;
}

/**
 * Fetch a single course by its unique ID
 */
export async function getCourseById(id: string): Promise<Course | null> {
  try {
    const response = await apiClient.get<Course>(`/courses/${id}`);
    return response.data;
  } catch {
    return null;
  }
}

/**
 * Fetch a single course by slug
 */
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  try {
    const response = await apiClient.get<Course>(`/courses/slug/${slug}`);
    return response.data;
  } catch {
    return null;
  }
}

/**
 * Fetch featured popular courses for homepage carousel/grid
 */
export async function getPopularCourses(): Promise<Course[]> {
  try {
    const response = await apiClient.get<Course[]>('/courses/popular');
    return response.data;
  } catch {
    return [];
  }
}

/**
 * Fetch all categories
 */
export async function getCategories(): Promise<CategoryItem[]> {
  try {
    const response = await apiClient.get<CategoryItem[]>('/categories');
    return response.data;
  } catch {
    return [];
  }
}

/**
 * Fetch course reviews (paginated)
 */
export async function getCourseReviews(courseId: string, page = 1, limit = 10): Promise<PaginatedResult<Review>> {
  const response = await apiClient.get<PaginatedResult<Review>>(`/courses/${courseId}/reviews`, {
    params: { page, limit },
  });
  return response.data;
}

/**
 * Create a course review
 */
export async function createCourseReview(
  courseId: string,
  rating: number,
  comment: string
): Promise<Review> {
  const response = await apiClient.post<Review>(`/courses/${courseId}/reviews`, {
    rating,
    comment,
  });
  return response.data;
}

/**
 * Fetch testimonials
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  return STATIC_TESTIMONIALS;
}
