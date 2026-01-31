import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, AlertCircle, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { RegistroEnergia } from '@/types/energia';

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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-primary" />
        Indicadores COSIP
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Arrecadado */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+{(eficiencia - 100).toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Total Arrecadado</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalArrecadado)}</p>
          <p className="text-xs text-muted-foreground mt-1">no período selecionado</p>
        </Card>

        {/* Inadimplência Média */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-primary" />
            </div>
            <Badge className={isSuperavit ? 'bg-emerald-500 text-white' : 'bg-yellow-500 text-black'}>
              {isSuperavit ? 'Superávit' : 'Déficit'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Inadimplência Média</p>
          <p className={`text-2xl font-bold ${isSuperavit ? 'text-emerald-400' : 'text-red-400'}`}>
            {inadimplenciaMedia.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            arrecadação {isSuperavit ? 'acima' : 'abaixo'} do faturado
          </p>
        </Card>

        {/* Variação de Clientes */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${variacaoClientesPercent < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {variacaoClientesPercent < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              <span>{variacaoClientesPercent > 0 ? '+' : ''}{variacaoClientesPercent.toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Variação de Clientes</p>
          <p className="text-2xl font-bold text-foreground">{formatNumber(ultimoClientes)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {variacaoClientes >= 0 ? '+' : ''}{formatNumber(variacaoClientes)} no período
          </p>
        </Card>
      </div>
    </div>
  );
};
