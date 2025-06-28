
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  destructive?: boolean;
}

export function AlertDialog({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar", 
  onConfirm,
  destructive = false 
}: AlertDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
          <Button 
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Export individual components for compatibility
export const AlertDialogAction = Button;
export const AlertDialogCancel = Button;
export { DialogContent as AlertDialogContent };
export { DialogDescription as AlertDialogDescription };
export { DialogFooter as AlertDialogFooter };
export { DialogHeader as AlertDialogHeader };
export { DialogTitle as AlertDialogTitle };
