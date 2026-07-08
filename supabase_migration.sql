-- 1. Create task_custom_fields table
CREATE TABLE IF NOT EXISTS public.task_custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'number', 'select', 'date')),
    options TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create task_custom_field_values table
CREATE TABLE IF NOT EXISTS public.task_custom_field_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    field_id UUID REFERENCES public.task_custom_fields(id) ON DELETE CASCADE NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_task_field UNIQUE (task_id, field_id)
);

-- 3. Enable RLS on both tables
ALTER TABLE public.task_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_custom_field_values ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for task_custom_fields
-- Check if user is a member of the project
CREATE POLICY "Allow all members to read custom fields" 
ON public.task_custom_fields FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.project_members 
        WHERE project_members.project_id = task_custom_fields.project_id 
          AND project_members.user_id = auth.uid() 
          AND project_members."invitationStatus" = 'accepted'
    ) OR EXISTS (
        SELECT 1 FROM public.projects 
        WHERE projects.id = task_custom_fields.project_id 
          AND projects.created_by = auth.uid()
    )
);

CREATE POLICY "Allow owners and admins to manage custom fields" 
ON public.task_custom_fields FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.project_members 
        WHERE project_members.project_id = task_custom_fields.project_id 
          AND project_members.user_id = auth.uid() 
          AND project_members.role IN ('owner', 'admin')
          AND project_members."invitationStatus" = 'accepted'
    ) OR EXISTS (
        SELECT 1 FROM public.projects 
        WHERE projects.id = task_custom_fields.project_id 
          AND projects.created_by = auth.uid()
    )
);

-- 5. Create RLS policies for task_custom_field_values
-- Find project_id from task_id -> tasks.project_id
CREATE POLICY "Allow all members to read custom field values" 
ON public.task_custom_field_values FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.tasks 
        JOIN public.project_members ON project_members.project_id = tasks.project_id
        WHERE tasks.id = task_custom_field_values.task_id 
          AND project_members.user_id = auth.uid()
          AND project_members."invitationStatus" = 'accepted'
    ) OR EXISTS (
        SELECT 1 FROM public.tasks 
        JOIN public.projects ON projects.id = tasks.project_id
        WHERE tasks.id = task_custom_field_values.task_id 
          AND projects.created_by = auth.uid()
    )
);

CREATE POLICY "Allow write members to manage custom field values" 
ON public.task_custom_field_values FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.tasks 
        JOIN public.project_members ON project_members.project_id = tasks.project_id
        WHERE tasks.id = task_custom_field_values.task_id 
          AND project_members.user_id = auth.uid() 
          AND project_members.role IN ('owner', 'admin', 'write')
          AND project_members."invitationStatus" = 'accepted'
    ) OR EXISTS (
        SELECT 1 FROM public.tasks 
        JOIN public.projects ON projects.id = tasks.project_id
        WHERE tasks.id = task_custom_field_values.task_id 
          AND projects.created_by = auth.uid()
    )
);

-- 6. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_task_custom_fields_project_id ON public.task_custom_fields(project_id);
CREATE INDEX IF NOT EXISTS idx_task_custom_field_values_task_id ON public.task_custom_field_values(task_id);
CREATE INDEX IF NOT EXISTS idx_task_custom_field_values_field_id ON public.task_custom_field_values(field_id);
