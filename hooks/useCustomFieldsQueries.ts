import { customFields } from '@/utils/customFields';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useCustomFieldsQueries = (projectId: string, taskId?: string) => {
  const queryClient = useQueryClient();

  // 1. Fetch custom fields definition
  const { data: fieldsList = [], isLoading: isLoadingFields, refetch: refetchFields } = useQuery<ITaskCustomField[]>({
    queryKey: ['custom-fields', projectId],
    queryFn: () => customFields.getFields(projectId),
    enabled: !!projectId,
  });

  // 2. Fetch field values (only if taskId is provided)
  const { data: valuesList = [], isLoading: isLoadingValues } = useQuery<ITaskCustomFieldValue[]>({
    queryKey: ['custom-field-values', taskId],
    queryFn: () => customFields.getFieldValues(taskId as string),
    enabled: !!taskId,
  });

  // 3. Create a custom field definition
  const createFieldMutation = useMutation({
    mutationFn: ({ name, type, options }: { name: string; type: 'text' | 'number' | 'select' | 'date'; options?: string[] }) =>
      customFields.createField(projectId, name, type, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields', projectId] });
    },
  });

  // 4. Delete a custom field definition
  const deleteFieldMutation = useMutation({
    mutationFn: (fieldId: string) => customFields.deleteField(fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields', projectId] });
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: ['custom-field-values', taskId] });
      }
    },
  });

  // 5. Save/upsert a field value for a task
  const saveValueMutation = useMutation({
    mutationFn: ({ fieldId, value }: { fieldId: string; value: string | null }) =>
      customFields.saveFieldValue(taskId as string, fieldId, value),
    onSuccess: () => {
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: ['custom-field-values', taskId] });
      }
    },
  });

  return {
    fieldsList,
    isLoadingFields,
    valuesList,
    isLoadingValues,
    refetchFields,
    createField: createFieldMutation.mutateAsync,
    isCreatingField: createFieldMutation.isPending,
    deleteField: deleteFieldMutation.mutateAsync,
    isDeletingField: deleteFieldMutation.isPending,
    saveValue: saveValueMutation.mutateAsync,
    isSavingValue: saveValueMutation.isPending,
  };
};
