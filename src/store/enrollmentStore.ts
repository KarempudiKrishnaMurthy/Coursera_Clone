import { create } from 'zustand';
import { Course, EnrolledCourseProgress } from '../types';
import * as enrollmentService from '../services/enrollments.service';
import { useAuthStore } from './authStore';

interface EnrollmentState {
  enrolledList: { course: Course; progress: EnrolledCourseProgress }[];
  isLoading: boolean;
  fetchEnrolledCourses: () => Promise<void>;
  enroll: (courseId: string) => Promise<void>;
  markLessonComplete: (courseId: string, lessonId: string, isCompleted: boolean, totalLessons: number) => Promise<void>;
  isEnrolled: (courseId: string) => boolean;
}

export const useEnrollmentStore = create<EnrollmentState>((set, get) => ({
  enrolledList: [],
  isLoading: false,

  fetchEnrolledCourses: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ enrolledList: [] });
      return;
    }
    set({ isLoading: true });
    try {
      const data = await enrollmentService.getEnrolledCourses(user.enrolledCourseIds);
      set({ enrolledList: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  enroll: async (courseId: string) => {
    useAuthStore.getState().enrollCourseInUser(courseId);
    await enrollmentService.enrollInCourse(courseId);
    await get().fetchEnrolledCourses();
  },

  markLessonComplete: async (courseId, lessonId, isCompleted, totalLessons) => {
    const updatedProgress = await enrollmentService.updateLessonCompletion(
      courseId,
      lessonId,
      isCompleted,
      totalLessons
    );
    set({
      enrolledList: get().enrolledList.map((item) =>
        item.course.id === courseId ? { ...item, progress: updatedProgress } : item
      ),
    });
  },

  isEnrolled: (courseId: string) => {
    const user = useAuthStore.getState().user;
    return user ? user.enrolledCourseIds.includes(courseId) : false;
  },
}));
