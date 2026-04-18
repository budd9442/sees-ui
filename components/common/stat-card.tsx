'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;      // percentage change
    absolute?: number;  // raw absolute change (optional, e.g. 0.30 GPA points)
    isPositive: boolean;
  };
  /** When set, the whole card navigates to this route. */
  href?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  href,
  className,
}: StatCardProps) {
  const inner = (
    <Card
      className={cn(
        'h-full transition-all hover:shadow-lg',
        href && 'hover:border-primary/35 cursor-pointer',
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <p
                className={cn(
                  'text-sm font-medium flex items-center gap-1',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                {trend.absolute != null ? (
                  <span>{trend.absolute} pts ({trend.value}%)</span>
                ) : (
                  <span>{trend.value}%</span>
                )}
              </p>
            )}
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
