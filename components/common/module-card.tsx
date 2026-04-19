'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, CheckCircle2, XCircle, Plus, Minus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { Module } from '@/types';

interface ModuleCardProps {
  module: Module;
  isSelected?: boolean;
  isInitiallySelected?: boolean;
  prerequisitesMet?: boolean;
  onToggleSelect?: () => void;
  className?: string;
}

export function ModuleCard({
  module,
  isSelected = false,
  isInitiallySelected = false,
  prerequisitesMet = true,
  onToggleSelect,
  className,
}: ModuleCardProps) {
  // Calculate "Live" enrollment count based on local cart state
  // If selected now but wasn't before: +1
  // If not selected now but was before: -1
  // Otherwise: stays the same
  const baseEnrolled = module.enrolled || 0;
  const enrolled = baseEnrolled + (isSelected && !isInitiallySelected ? 1 : !isSelected && isInitiallySelected ? -1 : 0);
  
  const capacity = module.capacity || 100;
  const percentage = Math.min(100, Math.round((enrolled / capacity) * 100));
  const isNearCapacity = percentage >= 80;
  const isFull = percentage >= 100;

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        isSelected && 'border-primary border-2',
        !prerequisitesMet && 'opacity-60',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-muted-foreground">
                  {module.code}
                </p>
                <Badge variant="outline" className="text-xs">
                  {module.credits} credits
                </Badge>
              </div>
              <h3 className="font-semibold leading-tight">{module.title}</h3>
            </div>
            {onToggleSelect && (
              <Button
                size="sm"
                variant={isSelected ? 'default' : 'outline'}
                onClick={onToggleSelect}
                disabled={(!prerequisitesMet && !isSelected) || (module.isCompulsory && isSelected)}
                className="ml-2"
              >
                {isSelected ? (
                  <>
                    <Minus className="h-4 w-4 mr-1" />
                    {module.isCompulsory ? 'Mandatory' : 'Remove'}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {module.description}
          </p>

          {/* Info Row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {module.lecturer && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{module.lecturer}</span>
              </div>
            )}
            {module.schedule && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{module.schedule}</span>
              </div>
            )}
          </div>

          {/* Prerequisites */}
          {module.prerequisites.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Prerequisites:
              </p>
              <div className="flex flex-wrap gap-1">
                {module.prerequisites.map((prereq) => (
                  <Badge
                    key={prereq}
                    variant="outline"
                    className="text-xs"
                  >
                    {prereq}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {prerequisitesMet ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">Prerequisites met</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">Prerequisites not met</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Capacity removed */}

          {/* Badges */}
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {module.semester}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {module.academicYear}
            </Badge>
            {module.degreeProgram && (
              <Badge variant="secondary" className="text-xs">
                {module.degreeProgram}
              </Badge>
            )}
            {module.specialization && (
              <Badge variant="secondary" className="text-xs">
                {module.specialization}
              </Badge>
            )}
          </div>

          {/* Enrollment Progress */}
          <div className="pt-2 space-y-2 border-t border-muted">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                 <Users className="h-3 w-3" />
                 Enrollment
              </span>
              <span className={cn(
                "font-semibold",
                isFull ? "text-red-600" : isNearCapacity ? "text-orange-600" : "text-muted-foreground"
              )}>
                {enrolled} / {capacity}
              </span>
            </div>
            <Progress
              value={percentage}
              className={cn(
                "h-1.5",
                isFull ? "[&>div]:bg-red-500" : isNearCapacity ? "[&>div]:bg-orange-500" : ""
              )}
            />
            {isFull && (
              <div className="flex items-center gap-1 text-[10px] text-red-600 font-medium italic">
                <Info className="h-3 w-3" />
                <span>Maximum capacity reached</span>
              </div>
            )}
            {!isFull && isNearCapacity && (
              <div className="flex items-center gap-1 text-[10px] text-orange-600 font-medium italic">
                <Info className="h-3 w-3" />
                <span>Limited seats remaining</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
