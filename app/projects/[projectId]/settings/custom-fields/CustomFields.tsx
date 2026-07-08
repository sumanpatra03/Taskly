'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useCustomFieldsQueries } from '@/hooks/useCustomFieldsQueries';
import { cn } from '@/lib/utils';
import { primaryBtnStyles, secondaryBtnStyles } from '@/app/commonStyles';
import { Trash2, Plus, X, Sliders, Calendar, Type, Hash, List } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useModalDialog } from '@/hooks/useModalDialog';

interface Props {
  projectId: string;
}

export const CustomFields = ({ projectId }: Props) => {
  const { fieldsList, isLoadingFields, createField, deleteField } = useCustomFieldsQueries(projectId);
  const { isModalOpen, openModal, closeModal } = useModalDialog();
  const { toast } = useToast();

  // Form states
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'select' | 'date'>('text');
  const [newOption, setNewOption] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    if (options.includes(trimmed)) {
      toast({
        title: 'Option already exists',
        variant: 'destructive',
      });
      return;
    }
    setOptions((prev) => [...prev, trimmed]);
    setNewOption('');
  };

  const handleRemoveOption = (indexToRemove: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleCreate = async () => {
    const trimmedName = fieldName.trim();
    if (!trimmedName) {
      toast({
        title: 'Field name is required',
        variant: 'destructive',
      });
      return;
    }

    if (fieldType === 'select' && options.length === 0) {
      toast({
        title: 'Please add at least one option for select fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createField({
        name: trimmedName,
        type: fieldType,
        options: fieldType === 'select' ? options : [],
      });
      toast({
        title: 'Success',
        description: 'Custom field created successfully',
      });
      // Reset state
      setFieldName('');
      setFieldType('text');
      setOptions([]);
      setNewOption('');
      closeModal();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Failed to create custom field',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the custom field "${name}"? All task values for this field will be lost.`)) {
      return;
    }
    try {
      await deleteField(id);
      toast({
        title: 'Field deleted',
        description: `Successfully deleted custom field "${name}"`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Failed to delete field',
        variant: 'destructive',
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="w-3.5 h-3.5" />;
      case 'number':
        return <Hash className="w-3.5 h-3.5" />;
      case 'select':
        return <List className="w-3.5 h-3.5" />;
      case 'date':
        return <Calendar className="w-3.5 h-3.5" />;
      default:
        return <Sliders className="w-3.5 h-3.5" />;
    }
  };

  const getTypeColorClass = (type: string) => {
    switch (type) {
      case 'text':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/40';
      case 'number':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/40';
      case 'select':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/40';
      case 'date':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/40';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">Custom Fields</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure custom field schemas to assign specialized parameters on task cards.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={(open) => (open ? openModal() : closeModal())}>
          <DialogTrigger asChild>
            <Button className={cn(primaryBtnStyles, 'h-9 px-4 text-xs font-semibold gap-1.5')}>
              <Plus className="w-4 h-4" />
              <span>Add Custom Field</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Create custom field</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Name</label>
                <Input
                  placeholder="e.g. Estimated Cost"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Type</label>
                <select
                  value={fieldType}
                  onChange={(e) => {
                    setFieldType(e.target.value as any);
                    setOptions([]);
                  }}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="text">Text Input</option>
                  <option value="number">Number Input</option>
                  <option value="select">Dropdown Select</option>
                  <option value="date">Date Selector</option>
                </select>
              </div>

              {fieldType === 'select' && (
                <div className="space-y-2 border-t pt-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Dropdown Options</label>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an option (e.g. High)"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                      className="h-8.5 text-xs flex-grow"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddOption}
                      className="h-8.5 text-xs px-3"
                    >
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {options.map((opt, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-350"
                      >
                        <span>{opt}</span>
                        <X
                          className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          onClick={() => handleRemoveOption(i)}
                        />
                      </Badge>
                    ))}
                    {options.length === 0 && (
                      <span className="text-[10px] italic text-muted-foreground block py-1">
                        No options added yet.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 border-t pt-3.5">
              <Button
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
                className="h-8.5 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isSubmitting}
                className={cn(primaryBtnStyles, 'h-8.5 text-xs px-4')}
              >
                Create Field
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-850/60 rounded-2xl divide-y divide-slate-100 dark:divide-slate-850/40 overflow-hidden shadow-[0_4px_24px_-10px_rgba(0,0,0,0.03)]">
        {isLoadingFields ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Loading custom field definitions...
          </div>
        ) : fieldsList.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground italic">
            No custom fields configured for this project.
          </div>
        ) : (
          fieldsList.map((field) => (
            <div key={field.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-xl border shrink-0 flex items-center justify-center",
                  getTypeColorClass(field.type)
                )}>
                  {getTypeIcon(field.type)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{field.name}</h4>
                  {field.type === 'select' && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Options: {field.options.join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={cn("text-[10px] font-bold uppercase tracking-wider border", getTypeColorClass(field.type))}>
                  {field.type}
                </Badge>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(field.id, field.name)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 h-8 w-8"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
