import { useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FullscreenChartProps {
  children: ReactNode;
  title: string;
  icon?: ReactNode;
  className?: string;
}

export const FullscreenChart = ({ children, title, icon, className }: FullscreenChartProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 transition-all duration-200",
            "hover:bg-primary/10 hover:text-primary",
            "opacity-60 hover:opacity-100",
            className
          )}
          title="Ver em tela cheia"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              {icon}
              {title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 p-6 overflow-auto">
          <div className="h-full min-h-[500px]">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
