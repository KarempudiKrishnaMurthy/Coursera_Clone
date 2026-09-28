import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Globe, Github, Twitter, Linkedin, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 w-full min-w-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800 min-w-0">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4 min-w-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform shrink-0">
                <GraduationCap size={20} className="stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-primary-400 transition-colors truncate">
                Course<span className="text-primary-400">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed break-words">
              CourseHub empowers modern professionals with job-ready tech, design, and business skills taught by leading industry practitioners.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors">
                <Github size={18} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Col 1 */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/courses?category=web-dev" className="hover:text-white transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/courses?category=data-science" className="hover:text-white transition-colors">
                  Data Science & AI
                </Link>
              </li>
              <li>
                <Link to="/courses?category=cloud-devops" className="hover:text-white transition-colors">
                  Cloud & DevOps
                </Link>
              </li>
              <li>
                <Link to="/courses?category=design" className="hover:text-white transition-colors">
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">
                  All Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Programs
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Career Certificates
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Master Track Degrees
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Enterprise Training
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Become an Instructor
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help & Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CourseHub Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 hover:text-slate-300 cursor-pointer">
              <Globe size={14} /> English (US)
            </span>
            <a href="#" className="hover:text-slate-300">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
