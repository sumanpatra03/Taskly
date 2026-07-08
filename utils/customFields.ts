import { createClient } from './supabase/client';

const supabase = createClient();

export const customFields = {
  // Get all custom field definitions for a project
  getFields: async (projectId: string) => {
    const { data, error } = await supabase
      .from('task_custom_fields')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as ITaskCustomField[];
  },

  // Create a new custom field definition
  createField: async (projectId: string, name: string, type: 'text' | 'number' | 'select' | 'date', options: string[] = []) => {
    const { data, error } = await supabase
      .from('task_custom_fields')
      .insert({
        project_id: projectId,
        name,
        type,
        options,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ITaskCustomField;
  },

  // Delete a custom field definition
  deleteField: async (fieldId: string) => {
    const { error } = await supabase
      .from('task_custom_fields')
      .delete()
      .eq('id', fieldId);

    if (error) throw error;
  },

  // Get all custom field values assigned to a specific task
  getFieldValues: async (taskId: string) => {
    const { data, error } = await supabase
      .from('task_custom_field_values')
      .select('*')
      .eq('task_id', taskId);

    if (error) throw error;
    return data as ITaskCustomFieldValue[];
  },

  // Set or update a custom field value for a task
  saveFieldValue: async (taskId: string, fieldId: string, value: string | null) => {
    const { data, error } = await supabase
      .from('task_custom_field_values')
      .upsert({
        task_id: taskId,
        field_id: fieldId,
        value,
        updated_at: new Date(),
      }, {
        onConflict: 'task_id,field_id',
      })
      .select()
      .single();

    if (error) throw error;
    return data as ITaskCustomFieldValue;
  },
};
