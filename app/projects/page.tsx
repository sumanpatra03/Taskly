import { createClient } from '@/utils/supabase/server';
import { users, type IUser } from '@/utils/users';
import { AccountDetails } from './AccountDetails';
import { Projects } from './Projects';
import { redirect } from 'next/navigation';
import { projects } from '@/utils/projects';

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const userData = await users.getUser(user.id);
  if (!userData) redirect('/login');

  const userProjects = await projects.getUserProjects(user.id);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Dynamic Welcome Greeting */}
      <div className="space-y-1.5 pb-3 border-b border-slate-250/20 dark:border-slate-800/60">
        <h1 className="text-2xl font-bold tracking-tight text-slate-850 dark:text-slate-100">
          Welcome back, {userData.name}!
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Collaborate on tasks, manage settings, and track milestones inside your workspaces.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Profile Sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <AccountDetails initialData={userData} />
        </div>
        {/* Workspace Panels */}
        <div className="flex-1 w-full">
          <Projects initialProjects={userProjects} />
        </div>
      </div>
    </div>
  );
}
