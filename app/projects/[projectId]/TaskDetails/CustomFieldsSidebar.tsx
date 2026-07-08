'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTaskDetails } from '../Board/TaskDetailsContext';
import { useCustomFieldsQueries } from '@/hooks/useCustomFieldsQueries';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { DatePicker } from './DatePicker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const CustomFieldsSidebar = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const { selectedTask } = useTaskDetails();
  const { fieldsList, isLoadingFields, valuesList, isLoadingValues, saveValue } =
    useCustomFieldsQueries(projectId, selectedTask?.id);

  if (isLoadingFields) {
    return (
      <div className="py-2 text-[10px] text-muted-foreground flex items-center gap-1.5 justify-center">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Loading custom fields...</span>
      </div>
    );
  }

  if (fieldsList.length === 0) {
    return null;
  }

  return (
    <div className="py-2 space-y-2">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Custom Fields
      </h4>
      <div className="space-y-1">
        {fieldsList.map((field) => {
          const matchingValObj = valuesList.find((v) => v.field_id === field.id);
          return (
            <CustomFieldItem
              key={field.id}
              field={field}
              initialValue={matchingValObj?.value || ''}
              onSave={async (val) => {
                try {
                  await saveValue({ fieldId: field.id, value: val === '' ? null : val });
                } catch (err) {
                  console.error(err);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

interface ItemProps {
  field: ITaskCustomField;
  initialValue: string;
  onSave: (val: string) => Promise<void>;
}

const CustomFieldItem = ({ field, initialValue, onSave }: ItemProps) => {
  const [val, setVal] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  const handleSave = async (newValue: string) => {
    if (newValue === initialValue) return;
    try {
      await onSave(newValue);
    } catch (err) {
      toast({
        title: 'Failed to update field value',
        variant: 'destructive',
      });
      // Revert local value on error
      setVal(initialValue);
    }
  };

  const renderFieldInput = () => {
    switch (field.type) {
      case 'text':
      case 'number':
        if (isEditing) {
          return (
            <Input
              type={field.type}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                handleSave(val);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditing(false);
                  handleSave(val);
                }
              }}
              autoFocus
              className="h-6.5 text-xs text-right max-w-[130px] border-none bg-slate-100 dark:bg-slate-800 focus-visible:ring-1 focus-visible:ring-slate-300 p-1"
            />
          );
        }
        return (
          <span
            onClick={() => setIsEditing(true)}
            className="text-xs text-gray-750 dark:text-gray-300 hover:bg-slate-150/40 dark:hover:bg-slate-800/80 px-2 py-0.5 rounded cursor-pointer transition-colors line-clamp-1 max-w-[130px] text-right font-medium"
          >
            {val || <span className="opacity-40 font-normal">None</span>}
          </span>
        );

      case 'date': {
        const parsedDate = val ? new Date(val) : undefined;
        return (
          <DatePicker
            date={parsedDate}
            onSelect={(date) => {
              const dateStr = date ? date.toISOString().split('T')[0] : '';
              setVal(dateStr);
              handleSave(dateStr);
            }}
          />
        );
      }

      case 'select':
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="text-xs text-gray-755 dark:text-gray-300 hover:bg-slate-150/40 dark:hover:bg-slate-800/80 px-2 py-0.5 rounded transition-colors focus:outline-none font-medium max-w-[130px] truncate text-right">
              {val || <span className="opacity-40 font-normal">None</span>}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-4">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Set {field.name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                setVal('');
                handleSave('');
              }}>
                <span className="w-3.5 h-3.5 mr-2" />
                <span className="text-xs">None</span>
              </DropdownMenuItem>
              {field.options.map((opt) => (
                <DropdownMenuItem
                  key={opt}
                  onClick={() => {
                    setVal(opt);
                    handleSave(opt);
                  }}
                >
                  <span className="w-3.5 h-3.5 mr-2 border rounded-full bg-primary/20 border-primary" />
                  <span className="text-xs">{opt}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-between items-center text-gray-500 py-1.5 gap-4">
      <span className="text-xs truncate max-w-[100px] text-left" title={field.name}>
        {field.name}
      </span>
      {renderFieldInput()}
    </div>
  );
};
