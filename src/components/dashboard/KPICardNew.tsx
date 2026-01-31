import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface KPICardNewProps {
  icon: LucideIcon;
  titulo: string;
  valor: string;
  subtitulo?: string;
  variacao?: number | null;
  variacaoLabel?: string;
  destaque?: boolean;
  destaqueColor?: 'yellow' | 'red' | 'green';
  badge?: string;
  badgeColor?: string;
  iconColor?: string;
  tooltipText?: string;
  index?: number;
}

export const KPICardNew = ({
  icon: Icon,
  titulo,
  valor,
  subtitulo,
  variacao,
  variacaoLabel,
  destaque,
  destaqueColor,
  badge,
  badgeColor = '#eab308',
  iconColor = 'text-primary',
  tooltipText,
  index = 0,
}: KPICardNewProps) => {
  const getVariacaoColor = () => {
    if (variacao === null || variacao === undefined) return 'text-muted-foreground';
    return variacao < 0 ? 'text-emerald-400' : variacao > 0 ? 'text-red-400' : 'text-muted-foreground';
  };

  const getVariacaoIcon = () => {
    if (variacao === null || variacao === undefined) return Minus;
    if (variacao < 0) return TrendingDown;
    if (variacao > 0) return TrendingUp;
    return Minus;
  };

  const VariacaoIcon = getVariacaoIcon();

  const getIconBgColor = () => {
    if (iconColor.includes('emerald') || iconColor.includes('green')) return 'bg-emerald-500/20';
    if (iconColor.includes('blue')) return 'bg-blue-500/20';
    if (iconColor.includes('purple') || iconColor.includes('violet')) return 'bg-purple-500/20';
    if (iconColor.includes('yellow') || iconColor.includes('amber')) return 'bg-yellow-500/20';
    if (iconColor.includes('orange')) return 'bg-orange-500/20';
    if (iconColor.includes('red')) return 'bg-red-500/20';
    return 'bg-primary/20';
  };

  const getGlowColor = () => {
    if (iconColor.includes('emerald') || iconColor.includes('green')) return 'hover:shadow-emerald-500/20';
    if (iconColor.includes('blue')) return 'hover:shadow-blue-500/20';
    if (iconColor.includes('purple') || iconColor.includes('violet')) return 'hover:shadow-purple-500/20';
    if (iconColor.includes('yellow') || iconColor.includes('amber')) return 'hover:shadow-yellow-500/20';
    if (iconColor.includes('orange')) return 'hover:shadow-orange-500/20';
    if (iconColor.includes('red')) return 'hover:shadow-red-500/20';
    return 'hover:shadow-primary/20';
  };

  const cardContent = (
    <Card 
      className={cn(
        "p-5 bg-card border-border relative overflow-hidden",
        "transition-all duration-300 ease-out",
        "hover:border-primary/40 hover:shadow-xl hover:-translate-y-1",
        "cursor-pointer group",
        "opacity-0 animate-fade-in-up",
        getGlowColor(),
        destaque && destaqueColor === 'yellow' && "border-yellow-500/50 bg-yellow-500/5",
        destaque && destaqueColor === 'red' && "border-red-500/50 bg-red-500/5",
        destaque && destaqueColor === 'green' && "border-emerald-500/50 bg-emerald-500/5"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "p-2.5 rounded-xl transition-all duration-300",
            "group-hover:scale-110 group-hover:rotate-3",
            getIconBgColor()
          )}>
            <Icon className={cn("h-5 w-5 transition-transform duration-300", iconColor)} />
          </div>
          <div className="flex items-center gap-2">
            {variacao !== null && variacao !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full",
                "transition-all duration-300 group-hover:scale-105",
                variacao < 0 ? 'bg-emerald-500/10' : variacao > 0 ? 'bg-red-500/10' : 'bg-muted',
                getVariacaoColor()
              )}>
                <VariacaoIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-px" />
                <span>{variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%</span>
              </div>
            )}
            {badge && (
              <span 
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm transition-transform duration-300 group-hover:scale-105"
                style={{ 
                  backgroundColor: badgeColor, 
                  color: badgeColor === '#eab308' || badgeColor === '#22c55e' ? '#000' : '#fff' 
                }}
              >
                {badge}
              </span>
            )}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-1.5 font-medium transition-colors duration-300 group-hover:text-foreground/80">
          {titulo}
        </p>
        
        <p className={cn(
          "text-2xl font-bold tracking-tight transition-all duration-300",
          "group-hover:tracking-normal",
          destaque && destaqueColor === 'yellow' && "text-yellow-400",
          destaque && destaqueColor === 'green' && "text-emerald-400",
          destaque && destaqueColor === 'red' && "text-red-400",
          !destaque && iconColor.includes('emerald') && "text-emerald-400",
          !destaque && iconColor.includes('blue') && "text-blue-400",
          !destaque && iconColor.includes('purple') && "text-purple-400",
          !destaque && iconColor.includes('orange') && "text-orange-400",
          !destaque && !iconColor.includes('emerald') && !iconColor.includes('blue') && !iconColor.includes('purple') && !iconColor.includes('orange') && "text-foreground"
        )}>
          {valor}
        </p>
        
        {subtitulo && (
          <p className="text-xs text-muted-foreground mt-1.5 transition-opacity duration-300 group-hover:opacity-80">
            {subtitulo}
          </p>
        )}
        {variacaoLabel && (
          <p className="text-xs text-muted-foreground mt-1 transition-opacity duration-300 group-hover:opacity-80">
            {variacaoLabel}
          </p>
        )}
      </div>
    </Card>
  );

  if (tooltipText) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {cardContent}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-sm">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return cardContent;
};
