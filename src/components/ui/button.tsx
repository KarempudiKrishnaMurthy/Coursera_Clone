import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500',
        primary:
          'bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500',
        secondary:
          'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300 focus-visible:ring-secondary-400',
        accent:
          'bg-accent-600 text-white shadow-sm hover:bg-accent-700 active:bg-accent-800 focus-visible:ring-accent-500',
        destructive:
          'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-500',
        danger:
          'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-500',
        outline:
          'border border-secondary-300 bg-white text-secondary-700 shadow-sm hover:bg-secondary-50 active:bg-secondary-100 focus-visible:ring-primary-500',
        ghost:
          'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 active:bg-secondary-200 focus-visible:ring-secondary-400',
        link: 'text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-500',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        md: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-base font-semibold',
        icon: 'h-9 w-9 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
