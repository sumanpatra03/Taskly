import { subtasks } from '@/utils/subtasks';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export const useSubtaskQueries = (taskId: string) => {
  const queryClient = useQueryClient();

  // Fetch all subtasks for a task
  const { data: subtaskList, isLoading } = useQuery<ISubtask[]>({
    queryKey: ['subtasks', taskId],
    queryFn: () => subtasks.list(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Create a new subtask
  const { mutate: createSubtask } = useMutation({
    mutationFn: (title: string) => {
      const position = subtaskList ? subtaskList.length : 0;
      return subtasks.create(taskId, title, position);
    },
    onSuccess: (newSubtask) => {
      // Optimistically update subtasks list
      queryClient.setQueryData<ISubtask[]>(
        ['subtasks', taskId],
        (oldSubtasks) => {
          if (!oldSubtasks) return [newSubtask];
          return [...oldSubtasks, newSubtask];
        }
      );
    },
  });

  // Toggle subtask completed status or edit title
  const { mutate: updateSubtask } = useMutation({
    mutationFn: ({
      subtaskId,
      updates,
    }: {
      subtaskId: string;
      updates: Partial<Omit<ISubtask, 'id' | 'task_id' | 'created_at'>>;
    }) => subtasks.update(subtaskId, updates),
    onSuccess: (updatedSubtask) => {
      // Optimistically update subtasks list
      queryClient.setQueryData<ISubtask[]>(
        ['subtasks', taskId],
        (oldSubtasks) => {
          if (!oldSubtasks) return [updatedSubtask];
          return oldSubtasks.map((subtask) =>
            subtask.id === updatedSubtask.id ? updatedSubtask : subtask
          );
        }
      );
    },
  });

  // Delete a subtask
  const { mutate: deleteSubtask } = useMutation({
    mutationFn: (subtaskId: string) => subtasks.delete(subtaskId),
    onSuccess: (_, subtaskId) => {
      // Optimistically update subtasks list
      queryClient.setQueryData<ISubtask[]>(
        ['subtasks', taskId],
        (oldSubtasks) => {
          if (!oldSubtasks) return [];
          return oldSubtasks.filter((subtask) => subtask.id !== subtaskId);
        }
      );
    },
  });

  return {
    subtaskList,
    isLoading,
    createSubtask,
    updateSubtask,
    deleteSubtask,
  };
};

export const prefetchSubtasks = async (
  queryClient: QueryClient,
  taskId: string
) => {
  await queryClient.prefetchQuery({
    queryKey: ['subtasks', taskId],
    queryFn: () => subtasks.list(taskId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};
