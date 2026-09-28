import React from 'react';
import { Badge as ShadcnBadge, BadgeProps as ShadcnBadgeProps } from '../ui/badge';

export interface BadgeProps extends Omit<ShadcnBadgeProps, 'variant' | 'size'> {
  children: React.ReactNode;
  variant?: 'primary' | 'brand' | 'secondary' | 'accent' | 'amber' | 'emerald' | 'slate' | 'rose';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  className = '',
  ...props
}) => {
  return (
    <ShadcnBadge
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {children}
    </ShadcnBadge>
  );
};
