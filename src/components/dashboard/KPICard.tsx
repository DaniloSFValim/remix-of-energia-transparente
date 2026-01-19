import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  titulo: string;
  valor: string;
  subtitulo?: string;
  icon: LucideIcon;
  variante?: 'default' | 'success' | 'warning';
}

export const KPICard = ({ 
  titulo, 
  valor, 
  subtitulo, 
  icon: Icon,
  variante = 'default' 
}: KPICardProps) => {
  const varianteClasses = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-secondary/10 text-secondary',
    warning: 'bg-orange-500/10 text-orange-500',
  };

  return (
    <Card className="animate-fade-in hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{titulo}</p>
            <p className="text-2xl font-bold tracking-tight">{valor}</p>
            {subtitulo && (
              <p className="text-xs text-muted-foreground">{subtitulo}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${varianteClasses[variante]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
