import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  ShoppingCart,
  User as UserIcon,
  LogOut,
  BookOpen,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items: cartItems } = useCartStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 w-full min-w-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
        <div className="flex items-center justify-between h-16 gap-4 min-w-0">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 min-w-0 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform shrink-0">
                <GraduationCap size={22} className="stroke-[2.2]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors truncate">
                  Course<span className="text-primary-600">Hub</span>
                </span>
              </div>
            </Link>

            {/* Explore Link */}
            <Link
              to="/courses"
              className={`hidden md:inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                location.pathname === '/courses'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass size={16} />
              Explore Catalog
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md mx-2 min-w-0">
            <div className="relative w-full min-w-0">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="What do you want to learn today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-slate-400 min-w-0"
              />
            </div>
          </form>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Cart Link */}
            <Link
              to="/checkout"
              className="relative p-2 text-slate-600 hover:text-primary-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in-50">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Authenticated State */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <span className="hidden lg:inline text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-300"
                    />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 p-1">
                  <div className="px-3 py-2 border-b border-slate-100 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <BookOpen size={16} className="text-slate-400" />
                      My Learning
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <UserIcon size={16} className="text-slate-400" />
                      Profile & Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/auth/signup"
                  className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Join for Free
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-3 min-w-0">
            <form onSubmit={handleSearch} className="px-2 min-w-0">
              <div className="relative w-full min-w-0">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search courses, skills, instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-0"
                />
              </div>
            </form>

            <nav className="flex flex-col space-y-1 px-2">
              <Link
                to="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Browse All Courses
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    My Learning
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Account Profile
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
