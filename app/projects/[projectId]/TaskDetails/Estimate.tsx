'use client';

import React, { useState, useEffect } from 'react';
import { useTaskDetails } from '../Board/TaskDetailsContext';
import { useTaskQueries } from '@/hooks/useTaskQueries';
import { useProjectQueries } from '@/hooks/useProjectQueries';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const ESTIMATES = [null, 1, 2, 3, 5, 8, 13, 21];

export const Estimate = () => {
  const params = useParams();
  const { selectedTask } = useTaskDetails();
  const { task, updateStoryPoints } = useTaskQueries(selectedTask?.id || '');
  const { reloadProjectTasks } = useProjectQueries(params.projectId as string);

  const [isOpen, setIsOpen] = useState(false);
  const [currentEstimate, setCurrentEstimate] = useState<number | null>(null);

  useEffect(() => {
    if (task) {
      setCurrentEstimate(task.story_points ?? null);
    }
  }, [task?.story_points]);

  const handleSelectEstimate = async (points: number | null) => {
    setCurrentEstimate(points);
    await updateStoryPoints(points);
    await reloadProjectTasks();
    setIsOpen(false);
  };

  return (
    <>
      <div className="flex justify-between items-center text-gray-500 py-1">
        <span className="text-xs flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5" />
          Story Points
        </span>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 mr-4 p-2 dark:bg-gray-950 border border-border/80">
            <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1 border-b border-border/40">
              Select estimation
            </div>
            <div className="grid grid-cols-4 gap-1.5 p-1">
              {ESTIMATES.map((points) => (
                <button
                  key={points === null ? 'none' : points}
                  onClick={() => handleSelectEstimate(points)}
                  className={cn(
                    "h-7 text-xs font-medium rounded-md border border-border hover:bg-secondary/80 transition-all flex items-center justify-center",
                    currentEstimate === points
                      ? "bg-primary text-primary-foreground border-primary hover:bg-primary/95"
                      : points === null
                      ? "col-span-2 text-muted-foreground"
                      : ""
                  )}
                >
                  {points === null ? 'Clear' : points}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="text-xs pt-1 pb-4 flex items-center">
        {currentEstimate !== null ? (
          <Badge
            variant="secondary"
            className="text-[11px] font-bold px-2.5 py-0.5 border border-border/50 bg-secondary/80 hover:bg-secondary"
          >
            {currentEstimate} {currentEstimate === 1 ? 'point' : 'points'}
          </Badge>
        ) : (
          <span className="text-muted-foreground/60 italic font-normal">Unestimated</span>
        )}
      </div>
    </>
  );
};
