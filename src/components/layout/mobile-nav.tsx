import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./sidebar";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    console.log("MobileNav: Mudança de estado para:", open);
    setIsOpen(open);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-2 hover:bg-white/20 lg:hidden"
          onClick={() => console.log("Menu button clicked")}
        >
          <Menu className="h-6 w-6 text-white" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72 max-w-[85vw]">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}