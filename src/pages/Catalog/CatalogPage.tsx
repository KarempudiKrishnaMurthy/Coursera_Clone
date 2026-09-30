import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Course, CourseFilters, CourseLevel } from '../../types';
import * as coursesService from '../../services/courses.service';
import { CourseCard } from '../../components/courses/CourseCard';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State derived from URL query parameters
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || 'all';
  const levelQuery = (searchParams.get('level') as CourseLevel) || 'all';
  const priceQuery = (searchParams.get('price') as 'all' | 'free' | 'paid') || 'all';
  const ratingQuery = Number(searchParams.get('rating')) || 0;
  const sortByQuery = (searchParams.get('sortBy') as CourseFilters['sortBy']) || 'popular';
  const pageQuery = Number(searchParams.get('page')) || 1;

  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string; count: number }[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Sync search input when URL changes
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Load categories once
  useEffect(() => {
    coursesService.getCategories().then(setCategories);
  }, []);

  // Fetch filtered courses
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const filters: CourseFilters = {
      search: searchQuery,
      category: categoryQuery,
      level: levelQuery,
      price: priceQuery,
      rating: ratingQuery,
      sortBy: sortByQuery,
      page: pageQuery,
      limit: 6,
    };

    coursesService.getCourses(filters).then((result) => {
      if (isMounted) {
        setCourses(result.items);
        setTotalCourses(result.total);
        setTotalPages(result.totalPages);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, categoryQuery, levelQuery, priceQuery, ratingQuery, sortByQuery, pageQuery]);

  // Helper to update URL params
  const updateParams = (newParams: Record<string, string | number | undefined>) => {
    const current = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === undefined || val === '' || val === 'all' || val === 0) {
        current.delete(key);
      } else {
        current.set(key, String(val));
      }
    });
    // Reset to page 1 on filter changes if page wasn't explicitly changed
    if (!('page' in newParams)) {
      current.delete('page');
    }
    setSearchParams(current);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const activeFilterCount = [
    categoryQuery !== 'all',
    levelQuery !== 'all',
    priceQuery !== 'all',
    ratingQuery > 0,
    searchQuery !== '',
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Search Bar */}
      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore All Courses
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Discover {totalCourses} specialized curriculum tracks to advance your mastery.
          </p>
        </div>

        {/* Search & Sort Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 min-w-0">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg min-w-0">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, instructor, or topic..."
              className="pl-10 pr-24 bg-white"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateParams({ search: '' });
                }}
                className="absolute right-16 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 z-10"
              >
                <X size={15} />
              </button>
            )}
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-3 text-xs"
            >
              Search
            </Button>
          </form>

          <div className="flex items-center justify-between sm:justify-end gap-3 min-w-0">
            {/* Mobile Filters Toggle */}
            <Button
              variant="outline"
              size="md"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 shrink-0"
            >
              <SlidersHorizontal size={16} />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Sort by:</span>
              <select
                value={sortByQuery}
                onChange={(e) => updateParams({ sortBy: e.target.value })}
                className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="highest-rated">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 min-w-0">
            <span className="text-xs text-slate-500 font-medium">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 max-w-[200px] truncate py-1">
                <span className="truncate">"{searchQuery}"</span>
                <X size={13} className="cursor-pointer hover:text-slate-900 shrink-0" onClick={() => updateParams({ search: '' })} />
              </Badge>
            )}
            {categoryQuery !== 'all' && (
              <Badge variant="secondary" className="gap-1 max-w-[200px] truncate py-1">
                <span className="truncate">{categories.find((c) => c.id === categoryQuery)?.name || categoryQuery}</span>
                <X size={13} className="cursor-pointer hover:text-slate-900 shrink-0" onClick={() => updateParams({ category: 'all' })} />
              </Badge>
            )}
            {levelQuery !== 'all' && (
              <Badge variant="secondary" className="gap-1 capitalize py-1">
                {levelQuery}
                <X size={13} className="cursor-pointer hover:text-slate-900 shrink-0" onClick={() => updateParams({ level: 'all' })} />
              </Badge>
            )}
            {priceQuery !== 'all' && (
              <Badge variant="secondary" className="gap-1 capitalize py-1">
                {priceQuery}
                <X size={13} className="cursor-pointer hover:text-slate-900 shrink-0" onClick={() => updateParams({ price: 'all' })} />
              </Badge>
            )}
            {ratingQuery > 0 && (
              <Badge variant="secondary" className="gap-1 py-1">
                ★ {ratingQuery}+
                <X size={13} className="cursor-pointer hover:text-slate-900 shrink-0" onClick={() => updateParams({ rating: 0 })} />
              </Badge>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-primary-600 hover:text-primary-800 ml-1 inline-flex items-center gap-1 shrink-0"
            >
              <RotateCcw size={12} /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main Layout: Sidebar Filters + Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start min-w-0">
        {/* Desktop Sidebar Filters */}
        <Card className="hidden lg:block lg:col-span-1 p-6 space-y-6 min-w-0 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 min-w-0">
            <h2 className="font-bold text-slate-900 text-base">Filter Courses</h2>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-primary-600 hover:underline shrink-0"
              >
                Reset
              </button>
            )}
          </div>

          {/* Filter Component Content */}
          <FilterSection
            categories={categories}
            categoryQuery={categoryQuery}
            levelQuery={levelQuery}
            priceQuery={priceQuery}
            ratingQuery={ratingQuery}
            onFilterChange={updateParams}
          />
        </Card>

        {/* Mobile Filters Drawer Modal using Dialog */}
        <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <DialogContent className="max-w-xs h-[85vh] overflow-y-auto flex flex-col justify-between p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">Filter Courses</DialogTitle>
            </DialogHeader>
            <div className="py-2 min-w-0 flex-1 overflow-y-auto">
              <FilterSection
                categories={categories}
                categoryQuery={categoryQuery}
                levelQuery={levelQuery}
                priceQuery={priceQuery}
                ratingQuery={ratingQuery}
                onFilterChange={updateParams}
              />
            </div>
            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <Button variant="outline" size="md" className="flex-1" onClick={clearAllFilters}>
                Reset
              </Button>
              <Button variant="primary" size="md" className="flex-1" onClick={() => setMobileFiltersOpen(false)}>
                Apply
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Courses Grid Content */}
        <div className="lg:col-span-3 space-y-8 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 animate-pulse min-w-0">
                  <div className="aspect-video bg-slate-200 rounded-lg w-full" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-8 bg-slate-200 rounded w-full pt-4" />
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-card min-w-0">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <BookOpen size={30} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 break-words">No courses match your criteria</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto break-words">
                Try loosening your filters, removing search terms, or exploring our general categories.
              </p>
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-6 min-w-0">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageQuery <= 1}
                    onClick={() => updateParams({ page: pageQuery - 1 })}
                    className="p-2"
                  >
                    <ChevronLeft size={16} />
                  </Button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateParams({ page: pageNum })}
                        className={`w-9 h-9 text-sm font-semibold rounded-lg transition-colors ${pageQuery === pageNum
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageQuery >= totalPages}
                    onClick={() => updateParams({ page: pageQuery + 1 })}
                    className="p-2"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Filter Section UI
interface FilterSectionProps {
  categories: { id: string; name: string; count: number }[];
  categoryQuery: string;
  levelQuery: string;
  priceQuery: string;
  ratingQuery: number;
  onFilterChange: (params: Record<string, string | number>) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  categories,
  categoryQuery,
  levelQuery,
  priceQuery,
  ratingQuery,
  onFilterChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Category
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={categoryQuery === 'all'}
              onChange={() => onFilterChange({ category: 'all' })}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span>All Categories</span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center justify-between text-sm text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  checked={categoryQuery === cat.id}
                  onChange={() => onFilterChange({ category: cat.id })}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="truncate max-w-[170px]">{cat.name}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">({cat.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="pt-4 border-t border-slate-100">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Skill Level
        </label>
        <div className="space-y-2">
          {[
            { id: 'all', label: 'All Levels' },
            { id: 'beginner', label: 'Beginner' },
            { id: 'intermediate', label: 'Intermediate' },
            { id: 'advanced', label: 'Advanced' },
          ].map((lvl) => (
            <label key={lvl.id} className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 cursor-pointer">
              <input
                type="radio"
                name="level"
                checked={levelQuery === lvl.id}
                onChange={() => onFilterChange({ level: lvl.id })}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span>{lvl.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="pt-4 border-t border-slate-100">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Price
        </label>
        <div className="space-y-2">
          {[
            { id: 'all', label: 'Any Price' },
            { id: 'free', label: 'Free' },
            { id: 'paid', label: 'Paid' },
          ].map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 cursor-pointer">
              <input
                type="radio"
                name="price"
                checked={priceQuery === p.id}
                onChange={() => onFilterChange({ price: p.id })}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span>{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="pt-4 border-t border-slate-100">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Minimum Rating
        </label>
        <div className="space-y-2">
          {[
            { val: 0, label: 'Any Rating' },
            { val: 4.8, label: '4.8 ★ and above' },
            { val: 4.5, label: '4.5 ★ and above' },
            { val: 4.0, label: '4.0 ★ and above' },
          ].map((r) => (
            <label key={r.val} className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={ratingQuery === r.val}
                onChange={() => onFilterChange({ rating: r.val })}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
