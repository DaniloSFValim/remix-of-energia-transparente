import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, AlertCircle, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { RegistroEnergia } from '@/types/energia';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface IndicadoresCOSIPProps {
  registros: RegistroEnergia[];
}

export const IndicadoresCOSIP = ({ registros }: IndicadoresCOSIPProps) => {
  if (registros.length === 0) return null;

  const totalArrecadado = registros.reduce((acc, r) => acc + Number(r.cosip_arrecadado || 0), 0);
  const totalFaturado = registros.reduce((acc, r) => acc + Number(r.cosip_faturado || 0), 0);
  
  const inadimplencias = registros.filter(r => r.inadimplencia !== null && r.cosip_clientes);
  const inadimplenciaMedia = inadimplencias.length > 0
    ? inadimplencias.reduce((acc, r) => acc + Number(r.inadimplencia || 0), 0) / inadimplencias.length
    : 0;

  const registrosComClientes = registros.filter(r => r.cosip_clientes && r.cosip_clientes > 0);
  const primeiroClientes = registrosComClientes[0]?.cosip_clientes || 0;
  const ultimoClientes = registrosComClientes[registrosComClientes.length - 1]?.cosip_clientes || 0;
  const variacaoClientes = ultimoClientes - primeiroClientes;
  const variacaoClientesPercent = primeiroClientes > 0 
    ? ((ultimoClientes - primeiroClientes) / primeiroClientes) * 100 
    : 0;

  const eficiencia = totalFaturado > 0 ? (totalArrecadado / totalFaturado) * 100 : 0;
  const isSuperavit = inadimplenciaMedia < 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const isEstavel = Math.abs(variacaoClientesPercent) < 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-l-4 border-primary pl-3">
        <h3 className="text-lg font-semibold text-foreground">Indicadores COSIP</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Arrecadado */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="p-5 bg-card border-border hover:border-primary/30 transition-all duration-300 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-emerald-500/20 rounded-xl transition-transform group-hover:scale-110">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium px-2 py-0.5 rounded-full bg-emerald-500/10">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+{(eficiencia - 100).toFixed(1)}%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Total Arrecadado</p>
              <p className="text-2xl font-bold text-emerald-400 tracking-tight">{formatCurrency(totalArrecadado)}</p>
              <p className="text-xs text-muted-foreground mt-1.5">no período selecionado</p>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total arrecadado pela COSIP no período filtrado</p>
          </TooltipContent>
        </Tooltip>

        {/* Inadimplência Média */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="p-5 bg-card border-border hover:border-primary/30 transition-all duration-300 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-amber-500/20 rounded-xl transition-transform group-hover:scale-110">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <Badge className={`${isSuperavit ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'} font-semibold shadow-sm`}>
                  {isSuperavit ? 'Superávit' : 'Déficit'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Inadimplência Média</p>
              <p className={`text-2xl font-bold tracking-tight ${isSuperavit ? 'text-emerald-400' : 'text-red-400'}`}>
                {inadimplenciaMedia.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                arrecadação {isSuperavit ? 'acima' : 'abaixo'} do faturado
              </p>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Percentual médio de inadimplência na contribuição COSIP</p>
          </TooltipContent>
        </Tooltip>

        {/* Variação de Clientes */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="p-5 bg-card border-border hover:border-primary/30 transition-all duration-300 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-purple-500/20 rounded-xl transition-transform group-hover:scale-110">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                {isEstavel ? (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm font-medium">
                    <Minus className="h-3.5 w-3.5" />
                    <span>Estável</span>
                  </div>
                ) : (
                  <div className={`flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full ${
                    variacaoClientesPercent < 0 ? 'text-red-400 bg-red-500/10' : 'text-emerald-400 bg-emerald-500/10'
                  }`}>
                    {variacaoClientesPercent < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                    <span>{variacaoClientesPercent > 0 ? '+' : ''}{variacaoClientesPercent.toFixed(1)}%</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-medium">Variação de Clientes</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">{formatNumber(ultimoClientes)}</p>
              <p className="text-xs text-muted-foreground mt-1.5">
                {variacaoClientes >= 0 ? '+' : ''}{formatNumber(variacaoClientes)} no período
              </p>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Número total de clientes contribuintes da COSIP</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
