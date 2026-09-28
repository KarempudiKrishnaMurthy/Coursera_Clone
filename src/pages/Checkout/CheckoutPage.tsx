import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useEnrollmentStore } from '../../store/enrollmentStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import {
  Trash2,
  CreditCard,
  Lock,
  CheckCircle2,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, clearCart, totalPrice } = useCartStore();
  const { enroll } = useEnrollmentStore();
  const { isAuthenticated } = useAuthStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const total = totalPrice();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    setIsProcessing(true);
    // Simulate payment transaction
    setTimeout(async () => {
      for (const item of items) {
        await enroll(item.id);
      }
      clearCart();
      setIsProcessing(false);
      setOrderComplete(true);
    }, 800);
  };

  if (orderComplete) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 size={44} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Enrollment Confirmed!</h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Thank you for your enrollment. Your courses have been added to your dashboard with full lifetime access.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" onClick={() => navigate('/dashboard')} className="font-bold w-full sm:w-auto">
            Go to My Learning
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/courses')} className="w-full sm:w-auto">
            Explore More Courses
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <ShoppingCart size={30} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-slate-500 text-sm">
          Looks like you haven't added any courses to your shopping cart yet.
        </p>
        <Link to="/courses">
          <Button size="lg" className="font-semibold">
            Explore Catalog <ArrowRight size={16} className="ml-1 inline" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full min-w-0">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8 truncate">
        Shopping Cart & Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start min-w-0">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-sm text-slate-500 min-w-0">
            <span>{items.length} Course{items.length > 1 ? 's' : ''} in Cart</span>
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium shrink-0"
            >
              Clear Cart
            </button>
          </div>

          <div className="space-y-4 min-w-0">
            {items.map((course) => (
              <Card
                key={course.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0 w-full shadow-sm"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-24 h-16 object-cover rounded-xl shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 truncate">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">By {course.instructor.name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>★ {course.rating}</span>
                      <span>•</span>
                      <span className="capitalize">{course.level}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-900">
                      {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                    </span>
                    {course.originalPrice && course.price > 0 && (
                      <span className="text-xs text-slate-400 line-through block">
                        ${course.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => removeItem(course.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Checkout & Payment Summary */}
        <Card className="lg:col-span-1 p-6 sm:p-8 shadow-xl space-y-6 min-w-0 w-full">
          <h2 className="text-xl font-bold text-slate-900 truncate">Order Summary</h2>

          <div className="space-y-3 text-sm text-slate-600 pb-4 border-b border-slate-200 min-w-0">
            <div className="flex justify-between">
              <span>Original Price</span>
              <span>${(total * 1.4).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discounts applied</span>
              <span>-${(total * 0.4).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100 min-w-0">
              <span>Total</span>
              <span className="text-2xl text-primary-600 font-extrabold truncate">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Simulated Payment Form */}
          <form onSubmit={handleCheckout} className="space-y-4 min-w-0">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Name on Card
              </label>
              <Input
                type="text"
                defaultValue="Alex Rivera"
                required
              />
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Card Number
              </label>
              <div className="relative min-w-0">
                <CreditCard size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  type="text"
                  defaultValue="4242 •••• •••• 4242"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-0">
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Expiry
                </label>
                <Input
                  type="text"
                  defaultValue="12/28"
                  required
                />
              </div>
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  CVC
                </label>
                <Input
                  type="text"
                  defaultValue="888"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isProcessing}
              className="w-full font-bold shadow-md"
            >
              Complete Order • ${total.toFixed(2)}
            </Button>
          </form>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Lock size={13} />
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>256-Bit SSL Encrypted Mock Checkout</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
