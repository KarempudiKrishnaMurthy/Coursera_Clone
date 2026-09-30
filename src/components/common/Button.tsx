import React from 'react';
import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from '../ui/button';

export interface ButtonProps extends Omit<ShadcnButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, ...props }, ref) => {
    return (
      <ShadcnButton
        ref={ref}
        variant={variant}
        size={size}
        isLoading={isLoading}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
