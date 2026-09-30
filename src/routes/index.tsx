import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Link } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { Button } from '../components/ui/button';

// Lazy-loaded route components for optimal code-splitting and bundle performance
const HomePage = lazy(() => import('../pages/Home/HomePage').then((m) => ({ default: m.HomePage })));
const CatalogPage = lazy(() => import('../pages/Catalog/CatalogPage').then((m) => ({ default: m.CatalogPage })));
const CourseDetailPage = lazy(() => import('../pages/CourseDetail/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })));
const LoginPage = lazy(() => import('../pages/Auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('../pages/Auth/SignupPage').then((m) => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() => import('../pages/Auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const LearningPlayerPage = lazy(() => import('../pages/LearningPlayer/LearningPlayerPage').then((m) => ({ default: m.LearningPlayerPage })));
const ProfilePage = lazy(() => import('../pages/Profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const CheckoutPage = lazy(() => import('../pages/Checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));

// Loading spinner fallback for lazy-loaded route transitions
const PageLoadingFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-3 w-full min-w-0">
    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Loading CourseHub...</p>
  </div>
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoadingFallback />}>
    <Component />
  </Suspense>
);

// 404 Fallback Page
const NotFoundPage = () => (
  <div className="min-h-[70vh] flex items-center justify-center px-4 text-center w-full min-w-0">
    <div className="space-y-4 max-w-md min-w-0">
      <span className="text-6xl font-extrabold text-primary-600 block">404</span>
      <h1 className="text-2xl font-bold text-slate-900 break-words">Page Not Found</h1>
      <p className="text-sm text-slate-500">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="inline-block pt-2">
        <Button size="md">Return to Home</Button>
      </Link>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageShell />,
    children: [
      { index: true, element: withSuspense(HomePage) },
      { path: 'courses', element: withSuspense(CatalogPage) },
      { path: 'courses/:slug', element: withSuspense(CourseDetailPage) },
      { path: 'dashboard', element: withSuspense(DashboardPage) },
      { path: 'profile', element: withSuspense(ProfilePage) },
      { path: 'checkout', element: withSuspense(CheckoutPage) },
      { path: 'auth/login', element: withSuspense(LoginPage) },
      { path: 'auth/signup', element: withSuspense(SignupPage) },
      { path: 'auth/forgot-password', element: withSuspense(ForgotPasswordPage) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    // Dedicated full-screen learning player route
    path: 'learn/:courseId',
    element: withSuspense(LearningPlayerPage),
  },
]);
