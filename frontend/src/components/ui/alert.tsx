import type { HTMLAttributes } from 'react';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const alertVariants = cva('rounded-md border p-3 text-sm', {
  variants: {
    variant: {
      default: 'border-border text-foreground',
      destructive: 'border-destructive/50 bg-destructive/10 text-destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type AlertProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants>;

export function Alert({
  className,
  variant,
  role = 'alert',
  ...props
}: AlertProps) {
  return (
    <div
      role={role}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

export function AlertTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={cn('mb-1 font-medium leading-none', className)} {...props} />
  );
}

export function AlertDescription({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('leading-relaxed', className)} {...props} />;
}
