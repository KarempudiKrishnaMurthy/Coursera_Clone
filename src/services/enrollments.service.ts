import { Course, EnrolledCourseProgress } from '../types';
import { apiClient } from './apiClient';

/**
 * Fetch all enrolled courses with progress for the authenticated user
 */
export async function getEnrolledCourses(
  _enrolledIds?: string[]
): Promise<{ course: Course; progress: EnrolledCourseProgress }[]> {
  try {
    const response = await apiClient.get<{ course: Course; progress: EnrolledCourseProgress }[]>(
      '/enrollments/my-courses'
    );
    return response.data;
  } catch {
    return [];
  }
}

/**
 * Enroll authenticated student into a course
 */
export async function enrollInCourse(courseId: string): Promise<EnrolledCourseProgress> {
  const response = await apiClient.post<EnrolledCourseProgress>(`/enrollments/${courseId}`);
  return response.data;
}

/**
 * Update lesson completion status and recalculate course progress percentage
 */
export async function updateLessonCompletion(
  courseId: string,
  lessonId: string,
  isCompleted: boolean,
  totalLessons: number
): Promise<EnrolledCourseProgress> {
  const response = await apiClient.put<EnrolledCourseProgress>(
    `/enrollments/${courseId}/progress`,
    {
      lessonId,
      isCompleted,
      totalLessons,
    }
  );
  return response.data;
}

/**
 * Fetch student progress for a specific course
 */
export async function getCourseProgress(courseId: string): Promise<EnrolledCourseProgress | null> {
  try {
    const response = await apiClient.get<EnrolledCourseProgress>(
      `/enrollments/${courseId}/progress`
    );
    return response.data;
  } catch {
    return null;
  }
}
