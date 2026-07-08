import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  isDeleting?: boolean;
}

export const DeleteConfirmation = ({
  isOpen,
  onClose,
  itemName,
  onConfirm,
  title = "Are you absolutely sure?",
  description,
  isDeleting = false,
}: DeleteConfirmationProps) => {
  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    await onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="dark:bg-gray-950 border border-border/80">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-left text-sm text-muted-foreground mt-2">
            {description || (
              <>
                This action cannot be undone. This will permanently delete <strong>{itemName}</strong> and remove all associated data.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2">
          <AlertDialogCancel onClick={onClose} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className={cn(
              buttonVariants({ variant: "destructive" }),
              "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            )}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
