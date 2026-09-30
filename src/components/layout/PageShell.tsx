import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const PageShell: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden w-full min-w-0 bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 min-w-0 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
