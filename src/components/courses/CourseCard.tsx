import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Course } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { ShoppingCart, Check, BookOpen } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useEnrollmentStore } from '../../store/enrollmentStore';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();
  const { addItem, isInCart } = useCartStore();
  const { isEnrolled } = useEnrollmentStore();

  const enrolled = isEnrolled(course.id);
  const inCart = isInCart(course.id);

  const handleCardClick = () => {
    navigate(`/courses/${course.slug}`);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enrolled) {
      navigate(`/learn/${course.id}`);
    } else if (!inCart) {
      addItem(course);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className="group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer min-w-0 w-full"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 shrink-0">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 max-w-full"
          loading="lazy"
        />
        {course.isBestseller && (
          <div className="absolute top-2.5 left-2.5">
            <Badge variant="amber" size="sm">
              Bestseller
            </Badge>
          </div>
        )}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="bg-slate-900/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded capitalize">
            {course.level}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 min-w-0">
        <div className="flex-1 min-w-0">
          <Link
            to={`/courses/${course.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-slate-900 line-clamp-2 text-base leading-snug group-hover:text-primary-600 transition-colors break-words"
          >
            {course.title}
          </Link>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1 truncate">
            {course.instructor.name}
          </p>

          {/* Rating */}
          <div className="mt-2.5">
            <RatingStars rating={course.rating} ratingsCount={course.ratingsCount} />
          </div>
        </div>

        {/* Price & CTA Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-baseline gap-1.5 min-w-0 truncate">
            <span className="text-lg font-bold text-slate-900 shrink-0">
              {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
            </span>
            {course.originalPrice && course.price > 0 && (
              <span className="text-xs text-slate-400 line-through truncate">
                ${course.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="shrink-0">
            {enrolled ? (
              <button
                onClick={handleCartClick}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                title="Go to Learning Player"
              >
                <BookOpen size={14} />
                Learn
              </button>
            ) : inCart ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                <Check size={14} className="text-emerald-600" />
                In Cart
              </span>
            ) : (
              <button
                onClick={handleCartClick}
                className="p-1.5 rounded-lg text-slate-600 hover:text-primary-600 hover:bg-primary-50 active:bg-primary-100 transition-colors border border-transparent hover:border-primary-200"
                title="Add to cart"
              >
                <ShoppingCart size={17} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
