import { createClient } from './supabase/client';

const supabase = createClient();

export const subtasks = {
  list: async (taskId: string) => {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as ISubtask[];
  },

  create: async (taskId: string, title: string, position = 0) => {
    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        task_id: taskId,
        title,
        completed: false,
        position,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as ISubtask;
  },

  update: async (
    subtaskId: string,
    updates: Partial<Omit<ISubtask, 'id' | 'task_id' | 'created_at'>>
  ) => {
    const { data, error } = await supabase
      .from('subtasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subtaskId)
      .select('*')
      .single();

    if (error) throw error;
    return data as ISubtask;
  },

  delete: async (subtaskId: string) => {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId);

    if (error) throw error;
  },
};
