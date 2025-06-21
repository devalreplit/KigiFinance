import * as React from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface SheetContentProps {
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  className?: string;
}

interface SheetTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const SheetContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

export function Sheet({ children, open = false, onOpenChange = () => {} }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({ children, asChild }: SheetTriggerProps) {
  const { onOpenChange } = React.useContext(SheetContext);
  
  const handleClick = () => {
    onOpenChange(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    });
  }

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  );
}

export function SheetContent({ children, side = "right", className }: SheetContentProps) {
  const { open, onOpenChange } = React.useContext(SheetContext);

  if (!open) return null;

  const sideClasses = {
    left: "left-0 top-0 h-full",
    right: "right-0 top-0 h-full",
    top: "top-0 left-0 w-full",
    bottom: "bottom-0 left-0 w-full",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Content */}
      <div
        className={cn(
          "fixed z-50 bg-white dark:bg-gray-800 shadow-lg",
          sideClasses[side],
          className
        )}
      >
        {children}
      </div>
    </>
  );
}