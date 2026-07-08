'use client';
import { useTaskDetails } from '../Board/TaskDetailsContext';
import { useTaskQueries } from '@/hooks/useTaskQueries';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { useProjectQueries } from '@/hooks/useProjectQueries';
import { useParams } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { DeleteConfirmation } from '@/components/DeleteConfirmation';

export const OtherActions = () => {
  const { projectId } = useParams();
  const { selectedTask, closeDrawer } = useTaskDetails();
  const { deleteTask } = useTaskQueries(selectedTask?.id || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { reloadProjectTasks } = useProjectQueries(projectId as string);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask();
      await reloadProjectTasks();
      closeDrawer();

      toast({
        title: 'Task deleted',
        description: 'The task has been deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Failed to delete task',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="py-4">
      <Button
        onClick={() => setIsDeleteDialogOpen(true)}
        className="flex h-6 justify-start w-full text-red-500 bg-transparent hover:bg-red-200 hover:dark:bg-red-950"
        disabled={isDeleting}
      >
        <Trash className="w-3 h-3 mr-2" />
        {isDeleting ? 'Deleting...' : 'Delete'}
      </Button>

      <DeleteConfirmation
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        itemName={selectedTask?.title || ''}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
