'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, CheckCircle2, XCircle, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Module } from '@/types';

interface ModuleCardProps {
  module: Module;
  isSelected?: boolean;
  prerequisitesMet?: boolean;
  onToggleSelect?: () => void;
  className?: string;
}

export function ModuleCard({
  module,
  isSelected = false,
  prerequisitesMet = true,
  onToggleSelect,
  className,
}: ModuleCardProps) {
  // Capacity logic removed per requirement: module registration should not enforce/display capacity

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
                disabled={!prerequisitesMet}
                className="ml-2"
              >
                {isSelected ? (
                  <>
                    <Minus className="h-4 w-4 mr-1" />
                    Remove
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
        </div>
      </CardContent>
    </Card>
  );
}
