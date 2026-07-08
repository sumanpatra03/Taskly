'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PanelsTopLeft, SquareKanban } from 'lucide-react';
import SearchAndButton from '../Search';
import { ProjectList } from '../ProjectList';

interface ProjectTabsProps {
  activeProjects: IProjectWithStats[];
  closedProjects: IProjectWithStats[];
  allProjects: IProjectWithStats[];
  searchTerm: string;
  setSearchTerm?: (term: string) => void;
  sortOrder: 'newest' | 'oldest';
  onSort?: (order: 'newest' | 'oldest') => void;
  setProjectToClose?: (id: string) => void;
  setProjectToReopen?: (id: string) => void;
  setProjectToDelete?: (project: IProjectWithStats) => void;
}

export const ProjectTabs = ({
  activeProjects,
  closedProjects,
  allProjects,
  searchTerm,
  setSearchTerm,
  sortOrder,
  onSort,
  setProjectToClose,
  setProjectToReopen,
  setProjectToDelete,
}: ProjectTabsProps) => (
  <Tabs defaultValue="active-projects" className="space-y-6">
    <TabsList className="bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-xl gap-1.5 border border-slate-200/40 dark:border-slate-800/40 h-10 w-fit shrink-0">
      <TabsTrigger 
        value="active-projects"
        className="rounded-lg text-slate-500 dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-950 text-xs font-semibold py-1.5 px-3.5 data-[state=active]:text-slate-850 data-[state=active]:dark:text-white transition-all shadow-none data-[state=active]:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-transparent data-[state=active]:border-slate-200/50 data-[state=active]:dark:border-slate-850/60 gap-1.5"
      >
        <PanelsTopLeft className="w-3.5 h-3.5" />
        <span>Active</span>
      </TabsTrigger>
      <TabsTrigger 
        value="closed-projects"
        className="rounded-lg text-slate-500 dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-950 text-xs font-semibold py-1.5 px-3.5 data-[state=active]:text-slate-850 data-[state=active]:dark:text-white transition-all shadow-none data-[state=active]:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-transparent data-[state=active]:border-slate-200/50 data-[state=active]:dark:border-slate-850/60 gap-1.5"
      >
        <SquareKanban className="w-3.5 h-3.5" />
        <span>Closed</span>
      </TabsTrigger>
      <TabsTrigger 
        value="all-projects"
        className="rounded-lg text-slate-500 dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-950 text-xs font-semibold py-1.5 px-3.5 data-[state=active]:text-slate-850 data-[state=active]:dark:text-white transition-all shadow-none data-[state=active]:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-transparent data-[state=active]:border-slate-200/50 data-[state=active]:dark:border-slate-850/60 gap-1.5"
      >
        <SquareKanban className="w-3.5 h-3.5" />
        <span>All</span>
      </TabsTrigger>
    </TabsList>

    <TabsContent value="active-projects">
      <SearchAndButton
        placeholderText="Search active projects"
        onSearch={setSearchTerm}
      />
      <ProjectList
        tab="active"
        projects={activeProjects}
        sortOrder={sortOrder}
        onSort={onSort}
        setProjectToClose={setProjectToClose}
        setProjectToReopen={setProjectToReopen}
        setProjectToDelete={setProjectToDelete}
      />
    </TabsContent>
    <TabsContent value="closed-projects">
      <SearchAndButton
        placeholderText="Search closed projects"
        onSearch={setSearchTerm}
      />
      <ProjectList
        tab="closed"
        projects={closedProjects}
        sortOrder={sortOrder}
        onSort={onSort}
        setProjectToClose={setProjectToClose}
        setProjectToReopen={setProjectToReopen}
        setProjectToDelete={setProjectToDelete}
      />
    </TabsContent>
    <TabsContent value="all-projects">
      <SearchAndButton
        placeholderText="Search all projects"
        onSearch={setSearchTerm}
      />
      <ProjectList
        tab="all"
        projects={allProjects}
        sortOrder={sortOrder}
        onSort={onSort}
        setProjectToClose={setProjectToClose}
        setProjectToReopen={setProjectToReopen}
        setProjectToDelete={setProjectToDelete}
      />
    </TabsContent>
  </Tabs>
);
