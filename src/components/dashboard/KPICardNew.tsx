import { LucideIcon, TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface SparklineData {
  label: string;
  valor: number;
}

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
  inverterCor?: boolean;
  sparklineData?: SparklineData[];
  sparklineColor?: string;
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
  inverterCor = false,
  sparklineData,
  sparklineColor,
}: KPICardNewProps) => {
  const getVariacaoColor = () => {
    if (variacao === null || variacao === undefined) return 'text-muted-foreground';
    const isPositive = variacao > 0;
    const isNegative = variacao < 0;
    
    if (inverterCor) {
      return isNegative ? 'text-red-400' : isPositive ? 'text-emerald-400' : 'text-muted-foreground';
    }
    return isNegative ? 'text-emerald-400' : isPositive ? 'text-red-400' : 'text-muted-foreground';
  };

  const getVariacaoBgColor = () => {
    if (variacao === null || variacao === undefined) return 'bg-muted';
    const isPositive = variacao > 0;
    const isNegative = variacao < 0;
    
    if (inverterCor) {
      return isNegative ? 'bg-red-500/15' : isPositive ? 'bg-emerald-500/15' : 'bg-muted';
    }
    return isNegative ? 'bg-emerald-500/15' : isPositive ? 'bg-red-500/15' : 'bg-muted';
  };

  const getVariacaoIcon = () => {
    if (variacao === null || variacao === undefined) return Minus;
    if (variacao < 0) return ArrowDown;
    if (variacao > 0) return ArrowUp;
    return Minus;
  };

  const getTrendIcon = () => {
    if (variacao === null || variacao === undefined) return Minus;
    if (Math.abs(variacao) > 10) {
      return variacao > 0 ? ChevronUp : ChevronDown;
    }
    return variacao > 0 ? TrendingUp : variacao < 0 ? TrendingDown : Minus;
  };

  const VariacaoIcon = getVariacaoIcon();
  const TrendIcon = getTrendIcon();

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

  const getIntensityLabel = () => {
    if (variacao === null || variacao === undefined) return '';
    const absVariacao = Math.abs(variacao);
    if (absVariacao > 20) return 'Variação alta';
    if (absVariacao > 10) return 'Variação moderada';
    if (absVariacao > 5) return 'Variação leve';
    return 'Estável';
  };

  const getSparklineColor = () => {
    if (iconColor.includes('emerald') || iconColor.includes('green')) return '#10b981';
    if (iconColor.includes('blue')) return '#3b82f6';
    if (iconColor.includes('purple') || iconColor.includes('violet')) return '#8b5cf6';
    if (iconColor.includes('yellow') || iconColor.includes('amber')) return '#f59e0b';
    if (iconColor.includes('orange')) return '#f97316';
    if (iconColor.includes('red')) return '#ef4444';
    return '#3b82f6';
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-full",
                    "transition-all duration-300 group-hover:scale-105",
                    "border border-transparent",
                    getVariacaoBgColor(),
                    getVariacaoColor(),
                    variacao !== 0 && "shadow-sm"
                  )}>
                    {/* Animated Arrow Indicator */}
                    <div className={cn(
                      "relative flex items-center justify-center",
                      variacao !== 0 && "animate-bounce-subtle"
                    )}>
                      <VariacaoIcon className={cn(
                        "h-4 w-4 transition-all duration-300",
                        variacao > 0 && "drop-shadow-[0_0_3px_rgba(239,68,68,0.5)]",
                        variacao < 0 && !inverterCor && "drop-shadow-[0_0_3px_rgba(34,197,94,0.5)]",
                        variacao < 0 && inverterCor && "drop-shadow-[0_0_3px_rgba(239,68,68,0.5)]",
                        variacao > 0 && inverterCor && "drop-shadow-[0_0_3px_rgba(34,197,94,0.5)]"
                      )} />
                    </div>
                    <span className="tabular-nums">
                      {variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%
                    </span>
                    {/* Mini trend icon for large variations */}
                    {Math.abs(variacao) > 10 && (
                      <TrendIcon className="h-3 w-3 opacity-70" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>{getIntensityLabel()}</p>
                </TooltipContent>
              </Tooltip>
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
        
        <div className="flex items-end gap-2">
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
          
          {/* Inline mini trend indicator */}
          {variacao !== null && variacao !== undefined && variacao !== 0 && (
            <div className={cn(
              "flex items-center mb-1 transition-opacity duration-300",
              "opacity-60 group-hover:opacity-100"
            )}>
              {variacao > 0 ? (
                <ChevronUp className={cn(
                  "h-5 w-5",
                  inverterCor ? "text-emerald-400" : "text-red-400"
                )} />
              ) : (
                <ChevronDown className={cn(
                  "h-5 w-5",
                  inverterCor ? "text-red-400" : "text-emerald-400"
                )} />
              )}
            </div>
          )}
        </div>
        
        {/* Mini Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="h-10 mt-2 -mx-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '11px',
                    padding: '4px 8px',
                  }}
                  formatter={(value: number) => [
                    new Intl.NumberFormat('pt-BR', {
                      notation: 'compact',
                      maximumFractionDigits: 1,
                    }).format(value),
                    ''
                  ]}
                  labelFormatter={(label) => label}
                />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke={sparklineColor || getSparklineColor()}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {subtitulo && (
          <p className="text-xs text-muted-foreground mt-1.5 transition-opacity duration-300 group-hover:opacity-80">
            {subtitulo}
          </p>
        )}
        {variacaoLabel && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 transition-opacity duration-300 group-hover:opacity-80">
            <TrendIcon className="h-3 w-3" />
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
