'use client';

import React, { useState } from 'react';
import { useTaskDetails } from '../Board/TaskDetailsContext';
import { useSubtaskQueries } from '@/hooks/useSubtaskQueries';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeleteConfirmation } from '@/components/DeleteConfirmation';

export const Subtasks = () => {
  const { selectedTask } = useTaskDetails();
  const taskId = selectedTask?.id || '';

  const {
    subtaskList = [],
    isLoading,
    createSubtask,
    updateSubtask,
    deleteSubtask,
  } = useSubtaskQueries(taskId);

  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Delete Confirmation state
  const [subtaskToDelete, setSubtaskToDelete] = useState<ISubtask | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const list = subtaskList || [];
  const completedCount = list.filter((s) => s.completed).length;
  const totalCount = list.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAdd = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    createSubtask(trimmed);
    setNewTitle('');
  };

  const handleToggle = (subtaskId: string, completed: boolean) => {
    updateSubtask({ subtaskId, updates: { completed } });
  };

  const handleStartEdit = (subtask: ISubtask) => {
    setEditingId(subtask.id);
    setEditTitle(subtask.title);
  };

  const handleSaveEdit = (subtaskId: string) => {
    const trimmed = editTitle.trim();
    if (!trimmed) return;
    updateSubtask({ subtaskId, updates: { title: trimmed } });
    setEditingId(null);
  };

  const handleDeleteClick = (subtask: ISubtask) => {
    setSubtaskToDelete(subtask);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (subtaskToDelete) {
      deleteSubtask(subtaskToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading subtasks...</span>
      </div>
    );
  }

  return (
    <div className="my-6 space-y-4">
      {/* Header with Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-bold text-sm">Subtasks</span>
          <span className="text-xs text-muted-foreground font-medium">
            {completedCount} of {totalCount} ({progressPercentage}%)
          </span>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Subtask list */}
      {totalCount > 0 && (
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
          {list.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/40 border border-transparent hover:border-border/30 group transition-all"
            >
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={(checked) => handleToggle(subtask.id, !!checked)}
                className="h-4 w-4 border-muted-foreground/60 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />

              <div className="flex-grow min-w-0">
                {editingId === subtask.id ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleSaveEdit(subtask.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(subtask.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    className="h-7 py-0 px-2 text-sm border-primary/40 focus-visible:ring-1 focus-visible:ring-primary/40"
                  />
                ) : (
                  <span
                    onClick={() => handleStartEdit(subtask)}
                    className={cn(
                      "text-sm cursor-pointer select-none truncate block pr-2 hover:text-primary transition-colors",
                      subtask.completed && "line-through text-muted-foreground/60 hover:text-muted-foreground/60"
                    )}
                    title="Click to edit subtask"
                  >
                    {subtask.title}
                  </span>
                )}
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDeleteClick(subtask)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Subtask Input Form */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Add a subtask..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="h-8.5 text-sm"
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!newTitle.trim()}
          className="h-8.5 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Add</span>
        </Button>
      </div>

      {/* Reusable Delete Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        itemName={subtaskToDelete?.title || ''}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
