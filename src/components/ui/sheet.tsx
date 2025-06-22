
import React from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface SheetTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface SheetContentProps {
  side?: "left" | "right" | "top" | "bottom";
  className?: string;
  children: React.ReactNode;
}

const Sheet = ({ open, onOpenChange, children }: SheetProps) => {
  return (
    <div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { open, onOpenChange } as any);
        }
        return child;
      })}
    </div>
  );
};

const SheetTrigger = ({ asChild, children, ...props }: SheetTriggerProps & any) => {
  const { onOpenChange } = props;
  
  const handleClick = () => {
    if (onOpenChange) {
      onOpenChange(true);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onClick: handleClick,
    });
  }

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
};

const SheetContent = ({ 
  side = "left", 
  className, 
  children, 
  ...props 
}: SheetContentProps & any) => {
  const { open, onOpenChange } = props;

  if (!open) return null;

  const sideClasses = {
    left: "left-0 top-0 h-full w-80 animate-in slide-in-from-left duration-300",
    right: "right-0 top-0 h-full w-80 animate-in slide-in-from-right duration-300",
    top: "top-0 left-0 w-full h-80 animate-in slide-in-from-top duration-300",
    bottom: "bottom-0 left-0 w-full h-80 animate-in slide-in-from-bottom duration-300",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Content */}
      <div
        className={cn(
          "fixed z-50 bg-white shadow-xl",
          sideClasses[side],
          className
        )}
      >
        {children}
      </div>
    </>
  );
};

export { Sheet, SheetTrigger, SheetContent };
