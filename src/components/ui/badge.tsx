import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-600 text-white shadow hover:bg-primary-700',
        primary: 'border-primary-200 bg-primary-50 text-primary-700',
        brand: 'border-primary-200 bg-primary-50 text-primary-700',
        secondary: 'border-secondary-200 bg-secondary-100 text-secondary-800 hover:bg-secondary-200',
        accent: 'border-accent-200 bg-accent-50 text-accent-700',
        destructive: 'border-transparent bg-rose-600 text-white shadow hover:bg-rose-700',
        rose: 'border-rose-200 bg-rose-50 text-rose-700',
        amber: 'border-amber-200 bg-amber-50 text-amber-800 font-semibold',
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        slate: 'border-slate-200 bg-slate-100 text-slate-700',
        outline: 'text-slate-950 border-slate-200',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
