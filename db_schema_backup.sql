-- ==========================================
-- Taskly Database Schema Backup
-- Target Platform: PostgreSQL (Supabase)
-- ==========================================

-- ------------------------------------------
-- 1. Table: public.users
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    avatar TEXT,
    description TEXT,
    links JSONB DEFAULT '[]'::jsonb,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'github', 'email')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 2. Table: public.projects
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    readme TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    closed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 3. Table: public.project_members
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'write', 'read')),
    "invitationStatus" TEXT NOT NULL CHECK ("invitationStatus" IN ('invited', 'accepted', 'declined', 'expired')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_project_member UNIQUE (project_id, user_id)
);

-- ------------------------------------------
-- 4. Table: public.statuses
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    color TEXT,
    "order" INTEGER NOT NULL,
    "limit" INTEGER DEFAULT 5 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 5. Table: public.priorities
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.priorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    color TEXT,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 6. Table: public.sizes
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    color TEXT,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 7. Table: public.labels
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 8. Table: public.tasks
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    status_id UUID REFERENCES public.statuses(id) ON DELETE SET NULL,
    size_id UUID REFERENCES public.sizes(id) ON DELETE SET NULL,
    priority_id UUID REFERENCES public.priorities(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    story_points INTEGER DEFAULT NULL,
    creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "statusPosition" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 9. Table: public.subtasks
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    position INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 10. Table: public.task_assignees (Junction Table)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_assignees (
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (task_id, user_id)
);

-- ------------------------------------------
-- 11. Table: public.task_labels (Junction Table)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_labels (
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (task_id, label_id)
);

-- ------------------------------------------
-- 12. Table: public.comments
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 13. Table: public.activities
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 14. Table: public.task_custom_fields
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'number', 'select', 'date')),
    options TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------
-- 15. Table: public.task_custom_field_values
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_custom_field_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    field_id UUID REFERENCES public.task_custom_fields(id) ON DELETE CASCADE NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_task_field UNIQUE (task_id, field_id)
);

-- ==========================================
-- PERFORMANCE INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_statuses_project_id ON public.statuses(project_id);
CREATE INDEX IF NOT EXISTS idx_priorities_project_id ON public.priorities(project_id);
CREATE INDEX IF NOT EXISTS idx_sizes_project_id ON public.sizes(project_id);
CREATE INDEX IF NOT EXISTS idx_labels_project_id ON public.labels(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status_id ON public.tasks(status_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON public.subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON public.comments(task_id);
CREATE INDEX IF NOT EXISTS idx_activities_task_id ON public.activities(task_id);
CREATE INDEX IF NOT EXISTS idx_task_custom_fields_project_id ON public.task_custom_fields(project_id);
CREATE INDEX IF NOT EXISTS idx_task_custom_field_values_task_id ON public.task_custom_field_values(task_id);
CREATE INDEX IF NOT EXISTS idx_task_custom_field_values_field_id ON public.task_custom_field_values(field_id);
