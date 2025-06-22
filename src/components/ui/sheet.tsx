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
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenChange(true);
  };

  if (asChild && React.isValidElement(children)) {
    const childProps = children.props || {};
    const originalOnClick = childProps.onClick;
    
    return React.cloneElement(children, {
      ...childProps,
      onClick: (e: React.MouseEvent) => {
        handleClick(e);
        if (originalOnClick) originalOnClick(e);
      },
    });
  }

  return (
    <button onClick={handleClick} type="button">
      {children}
    </button>
  );
}

export function SheetContent({ children, side = "right", className }: SheetContentProps) {
  const { open, onOpenChange } = React.useContext(SheetContext);

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
}