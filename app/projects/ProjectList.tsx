'use client';

import { EmptyProjectList } from './components/EmptyProjectList';
import { ProjectItem } from './components/ProjectItem';
import { ProjectListHeader } from './components/ProjectListHeader';

interface ProjectListProps {
  tab: 'active' | 'all' | 'closed';
  projects: IProjectWithStats[];
  sortOrder: 'newest' | 'oldest';
  onSort?: (order: 'newest' | 'oldest') => void;
  setProjectToClose?: (id: string) => void;
  setProjectToReopen?: (id: string) => void;
  setProjectToDelete?: (project: IProjectWithStats) => void;
}

export const ProjectList = ({
  tab,
  projects,
  sortOrder,
  onSort,
  setProjectToClose,
  setProjectToReopen,
  setProjectToDelete,
}: ProjectListProps) => {
  if (projects.length === 0) {
    return <EmptyProjectList tab={tab} />;
  }

  return (
    <div className="space-y-4">
      <ProjectListHeader
        tab={tab}
        count={projects.length}
        sortOrder={sortOrder}
        onSort={onSort}
      />
      <div className="bg-white dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 divide-y divide-slate-100 dark:divide-slate-850/40 overflow-hidden shadow-[0_4px_24px_-10px_rgba(0,0,0,0.03)] backdrop-blur-md">
        {projects.map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
            tab={tab}
            setProjectToClose={setProjectToClose}
            setProjectToReopen={setProjectToReopen}
            setProjectToDelete={setProjectToDelete}
          />
        ))}
      </div>
    </div>
  );
};
