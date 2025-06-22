
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
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

const SheetContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

const Sheet = ({ open, onOpenChange, children }: SheetProps) => {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
};

const SheetTrigger = ({ asChild, children }: SheetTriggerProps) => {
  const { onOpenChange } = React.useContext(SheetContext);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenChange(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onClick: handleClick,
    });
  }

  return (
    <button onClick={handleClick} type="button">
      {children}
    </button>
  );
};

const SheetContent = ({ 
  side = "left", 
  className, 
  children 
}: SheetContentProps) => {
  const { open, onOpenChange } = React.useContext(SheetContext);

  // Previne scroll do body quando o sheet está aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Fecha o sheet quando ESC é pressionado
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const sideClasses = {
    left: "left-0 top-0 h-full w-80 transform transition-transform duration-300 ease-in-out translate-x-0",
    right: "right-0 top-0 h-full w-80 transform transition-transform duration-300 ease-in-out translate-x-0",
    top: "top-0 left-0 w-full h-80 transform transition-transform duration-300 ease-in-out translate-y-0",
    bottom: "bottom-0 left-0 w-full h-80 transform transition-transform duration-300 ease-in-out translate-y-0",
  };

  const content = (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out opacity-100"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      
      {/* Content */}
      <div
        className={cn(
          "fixed z-[101] bg-white shadow-xl",
          sideClasses[side],
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export { Sheet, SheetTrigger, SheetContent };
