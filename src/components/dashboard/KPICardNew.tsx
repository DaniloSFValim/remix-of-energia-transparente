import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
}: KPICardNewProps) => {
  const getVariacaoColor = () => {
    if (variacao === null || variacao === undefined) return 'text-muted-foreground';
    // Para custos/gastos, negativo é bom (verde), positivo é ruim (vermelho)
    return variacao < 0 ? 'text-emerald-400' : variacao > 0 ? 'text-red-400' : 'text-muted-foreground';
  };

  const VariacaoIcon = variacao && variacao < 0 ? TrendingDown : TrendingUp;

  return (
    <Card className={cn(
      "p-4 bg-card border-border relative overflow-hidden transition-all hover:border-primary/30",
      destaque && destaqueColor === 'yellow' && "border-yellow-500/50 bg-yellow-500/5",
      destaque && destaqueColor === 'red' && "border-red-500/50 bg-red-500/5",
      destaque && destaqueColor === 'green' && "border-emerald-500/50 bg-emerald-500/5"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {variacao !== null && variacao !== undefined && (
          <div className={cn("flex items-center gap-1 text-sm", getVariacaoColor())}>
            <VariacaoIcon className="h-3 w-3" />
            <span>{variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%</span>
          </div>
        )}
        {badge && (
          <span 
            className="px-2 py-1 rounded text-xs font-semibold"
            style={{ backgroundColor: badgeColor, color: badgeColor === '#eab308' ? '#000' : '#fff' }}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{titulo}</p>
      <p className={cn(
        "text-xl font-bold",
        destaque && destaqueColor === 'yellow' && "text-yellow-400",
        destaque && destaqueColor === 'green' && "text-emerald-400",
        destaque && destaqueColor === 'red' && "text-red-400",
        !destaque && "text-primary"
      )}>
        {valor}
      </p>
      {subtitulo && (
        <p className="text-xs text-muted-foreground mt-1">{subtitulo}</p>
      )}
      {variacaoLabel && (
        <p className="text-xs text-muted-foreground mt-1">{variacaoLabel}</p>
      )}
    </Card>
  );
};
