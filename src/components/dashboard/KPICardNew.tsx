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
}: KPICardNewProps) => {
  const getVariacaoColor = () => {
    if (variacao === null || variacao === undefined) return 'text-muted-foreground';
    // Para custos/gastos, negativo é bom (verde), positivo é ruim (vermelho)
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

  const cardContent = (
    <Card className={cn(
      "p-5 bg-card border-border relative overflow-hidden transition-all duration-300",
      "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
      "cursor-pointer group",
      destaque && destaqueColor === 'yellow' && "border-yellow-500/50 bg-yellow-500/5",
      destaque && destaqueColor === 'red' && "border-red-500/50 bg-red-500/5",
      destaque && destaqueColor === 'green' && "border-emerald-500/50 bg-emerald-500/5"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", getIconBgColor())}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div className="flex items-center gap-2">
          {variacao !== null && variacao !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full",
              variacao < 0 ? 'bg-emerald-500/10' : variacao > 0 ? 'bg-red-500/10' : 'bg-muted',
              getVariacaoColor()
            )}>
              <VariacaoIcon className="h-3.5 w-3.5" />
              <span>{variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%</span>
            </div>
          )}
          {badge && (
            <span 
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm"
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
      <p className="text-sm text-muted-foreground mb-1.5 font-medium">{titulo}</p>
      <p className={cn(
        "text-2xl font-bold tracking-tight",
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
        <p className="text-xs text-muted-foreground mt-1.5">{subtitulo}</p>
      )}
      {variacaoLabel && (
        <p className="text-xs text-muted-foreground mt-1">{variacaoLabel}</p>
      )}
    </Card>
  );

  if (tooltipText) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {cardContent}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return cardContent;
};
