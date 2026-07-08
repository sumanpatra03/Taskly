'use client';

import Link from 'next/link';
import { ProjectActions } from './ProjectActions';
import { useProjectAccess } from '@/hooks/useProjectAccess';
import { ProjectAction } from '@/consts';
import { Folder, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import StackedAvatars from '@/components/StackedAvaters';

interface ProjectItemProps {
  project: IProjectWithStats;
  tab: 'active' | 'all' | 'closed';
  setProjectToClose?: (id: string) => void;
  setProjectToReopen?: (id: string) => void;
  setProjectToDelete?: (project: IProjectWithStats) => void;
}

export const ProjectItem = ({
  project,
  tab,
  setProjectToClose,
  setProjectToReopen,
  setProjectToDelete,
}: ProjectItemProps) => {
  const { can } = useProjectAccess({ projectId: project.id });

  // 1. Calculate Collaborators list
  const members = project.project_members
    ?.map((pm) => pm.users)
    .filter((u): u is { id: string; name: string; avatar: string } => !!u) || [];

  // 2. Calculate Task completion stats
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter((t) => {
    const label = t.statuses?.label?.toLowerCase() || '';
    return label === 'done' || label === 'completed' || label === 'closed' || label === 'complete';
  }).length || 0;
  
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const progressClamped = Math.min(progressPercent, 100);

  return (
    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-all duration-200 ease-out border-l-[3px] border-l-transparent hover:border-l-primary gap-4 group relative">
      {/* Left Details Block */}
      <div className="flex items-start gap-4 flex-grow min-w-0">
        <div className={cn(
          "p-2.5 rounded-xl text-primary shrink-0 transition-colors mt-0.5",
          project.closed ? "bg-slate-100 dark:bg-slate-800 text-slate-400" : "bg-primary/10"
        )}>
          <Folder className="w-5 h-5" />
        </div>
        
        <div className="space-y-1 min-w-0 flex-grow text-left">
          <div className="flex items-center gap-2 flex-wrap">
            {project.closed ? (
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 truncate">
                {project.name}
              </h3>
            ) : (
              <Link href={`/projects/${project.id}`}>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-primary dark:hover:text-primary transition-colors truncate">
                  {project.name}
                </h3>
              </Link>
            )}
            
            {/* Status Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/20 dark:border-slate-800/30 shrink-0">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full inline-block shrink-0",
                project.closed ? "bg-slate-400" : "bg-emerald-500 animate-pulse"
              )} />
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {project.closed ? 'Closed' : 'Active'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
            {project.description || <span className="italic opacity-60">No description provided.</span>}
          </p>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created {new Date(project.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            {totalTasks > 0 && (
              <>
                <span>•</span>
                <span className="font-semibold text-slate-500 dark:text-slate-400">{totalTasks} tasks ({completedTasks} completed)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Metrics Block */}
      <div className="flex items-center gap-6 shrink-0 justify-between md:justify-end w-full md:w-auto">
        {/* Task Completion Progress Bar */}
        {totalTasks > 0 && (
          <div className="flex items-center gap-2 w-36 sm:w-44 text-right">
            <div className="h-1.5 flex-grow bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-200/10 dark:border-slate-800/20">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressClamped}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0 w-8">
              {progressClamped}%
            </span>
          </div>
        )}

        {/* Workspace Collaborators Avatar Stack */}
        {members.length > 0 && (
          <div className="shrink-0 flex items-center">
            <StackedAvatars users={members} />
          </div>
        )}

        {/* Dropdown Menu actions */}
        {can(ProjectAction.CLOSE_PROJECT) && (
          <div className="shrink-0 relative z-10 p-0.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-colors">
            <ProjectActions
              project={project}
              tab={tab}
              setProjectToClose={setProjectToClose}
              setProjectToReopen={setProjectToReopen}
              setProjectToDelete={setProjectToDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
};
