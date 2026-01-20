import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegistroEnergia, getNomeMes, isBandeiraComCusto } from '@/types/energia';
import { BandeiraBadge } from './BandeiraBadge';
import { Zap, DollarSign, TrendingUp, Calendar } from 'lucide-react';

interface CardMesAtualProps {
  registro: RegistroEnergia;
}

export const CardMesAtual = ({ registro }: CardMesAtualProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPreco = (value: number | null) => {
    if (value === null || value === 0) return '-';
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 6 })}`;
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">
              {getNomeMes(registro.mes)} de {registro.ano}
            </CardTitle>
          </div>
          <BandeiraBadge bandeira={registro.bandeira_tarifaria} size="md" />
        </div>
        <CardDescription>Dados do mês mais recente</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Consumo */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Zap className="h-4 w-4" />
              Consumo
            </div>
            <p className="text-xl font-bold">{formatNumber(Number(registro.consumo_kwh))} kWh</p>
          </div>

          {/* Valor Pago */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <DollarSign className="h-4 w-4" />
              Valor Pago
            </div>
            <p className="text-xl font-bold text-primary">{formatCurrency(Number(registro.valor_pago))}</p>
          </div>

          {/* Preços Unitários */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4" />
              TE / TUSD
            </div>
            <p className="text-sm font-medium">
              {formatPreco(Number(registro.preco_te || 0))}
            </p>
            <p className="text-sm font-medium">
              {formatPreco(Number(registro.preco_tusd || 0))}
            </p>
          </div>

          {/* Preço Bandeira */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              Preço Bandeira
            </div>
            <p className="text-sm font-medium">
              {isBandeiraComCusto(registro.bandeira_tarifaria) 
                ? formatPreco(Number(registro.preco_bandeira || 0))
                : 'Sem custo adicional'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};