import { Card } from '@/components/ui/card';
import { RegistroEnergia, getNomeMes } from '@/types/energia';
import { FileText, Users, TrendingUp, AlertTriangle, Trophy, AlertCircle } from 'lucide-react';

interface AnalisesCOSIPProps {
  registros: RegistroEnergia[];
}

export const AnalisesCOSIP = ({ registros }: AnalisesCOSIPProps) => {
  if (registros.length === 0) return null;

  const registrosComCOSIP = registros.filter(r => r.cosip_faturado && r.cosip_arrecadado && r.cosip_clientes);
  
  if (registrosComCOSIP.length === 0) return null;

  const totalFaturado = registrosComCOSIP.reduce((acc, r) => acc + Number(r.cosip_faturado || 0), 0);
  const totalArrecadado = registrosComCOSIP.reduce((acc, r) => acc + Number(r.cosip_arrecadado || 0), 0);
  const eficiencia = totalFaturado > 0 ? (totalArrecadado / totalFaturado) * 100 : 0;
  const inadimplenciaMedia = 100 - eficiencia;

  const primeiroClientes = registrosComCOSIP[0]?.cosip_clientes || 0;
  const ultimoClientes = registrosComCOSIP[registrosComCOSIP.length - 1]?.cosip_clientes || 0;
  const variacaoClientes = ultimoClientes - primeiroClientes;
  const variacaoClientesPercent = primeiroClientes > 0 ? ((ultimoClientes - primeiroClientes) / primeiroClientes) * 100 : 0;

  // Encontrar padrões
  const maiorArrecadacao = [...registrosComCOSIP].sort((a, b) => Number(b.cosip_arrecadado) - Number(a.cosip_arrecadado))[0];
  const menorArrecadacao = [...registrosComCOSIP].sort((a, b) => Number(a.cosip_arrecadado) - Number(b.cosip_arrecadado))[0];
  
  const inadimplencias = registrosComCOSIP.map(r => ({
    ...r,
    inadCalc: r.cosip_faturado && r.cosip_arrecadado 
      ? ((Number(r.cosip_faturado) - Number(r.cosip_arrecadado)) / Number(r.cosip_faturado)) * 100
      : 0
  }));
  const melhorAdimplencia = [...inadimplencias].sort((a, b) => a.inadCalc - b.inadCalc)[0];
  const piorAdimplencia = [...inadimplencias].sort((a, b) => b.inadCalc - a.inadCalc)[0];

  // Top 3 arrecadação
  const top3Arrecadacao = [...registrosComCOSIP]
    .sort((a, b) => Number(b.cosip_arrecadado) - Number(a.cosip_arrecadado))
    .slice(0, 3);

  // Top 3 inadimplência
  const top3Inadimplencia = [...inadimplencias]
    .filter(r => r.inadCalc > 0)
    .sort((a, b) => b.inadCalc - a.inadCalc)
    .slice(0, 3);

  // Projeção próximo mês (média dos últimos 3 meses)
  const ultimos3 = registrosComCOSIP.slice(-3);
  const projecaoProximoMes = ultimos3.reduce((acc, r) => acc + Number(r.cosip_arrecadado || 0), 0) / 3;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPeriodo = (r: RegistroEnergia) => `${getNomeMes(r.mes).substring(0, 3)}/${r.ano}`;

  // Tendências
  const tendenciaArrecadacao = registrosComCOSIP.length >= 3 
    ? Number(registrosComCOSIP[registrosComCOSIP.length - 1].cosip_arrecadado) > Number(registrosComCOSIP[registrosComCOSIP.length - 3].cosip_arrecadado)
    : true;
  
  const tendenciaInadimplencia = inadimplencias.length >= 3
    ? inadimplencias[inadimplencias.length - 1].inadCalc < inadimplencias[inadimplencias.length - 3].inadCalc
    : true;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Análises COSIP</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Resumo COSIP */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Resumo COSIP</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total faturado</span>
              <span className="font-medium">{formatCurrency(totalFaturado)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total arrecadado</span>
              <span className="font-medium text-primary">{formatCurrency(totalArrecadado)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Eficiência</span>
              <span className="font-medium text-emerald-400">{eficiencia.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inadimplência média</span>
              <span className={`font-medium ${inadimplenciaMedia < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {inadimplenciaMedia.toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>

        {/* Evolução de Clientes */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Evolução de Clientes</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Início do período</span>
              <span className="font-medium">{primeiroClientes.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fim do período</span>
              <span className="font-medium">{ultimoClientes.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Variação</span>
              <span className={`font-medium ${variacaoClientesPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {variacaoClientesPercent >= 0 ? '+' : ''}{variacaoClientesPercent.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {variacaoClientes >= 0 ? 'Aumento' : 'Redução'} de {Math.abs(variacaoClientes).toLocaleString('pt-BR')} clientes
            </p>
          </div>
        </Card>

        {/* Tendências COSIP */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Tendências COSIP</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Arrecadação</span>
              <span className={`font-medium ${tendenciaArrecadacao ? 'text-emerald-400' : 'text-red-400'}`}>
                {tendenciaArrecadacao ? '↗ Melhorando' : '↘ Caindo'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inadimplência</span>
              <span className={`font-medium ${tendenciaInadimplencia ? 'text-emerald-400' : 'text-red-400'}`}>
                {tendenciaInadimplencia ? '↘ Melhorando' : '↗ Piorando'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Projeção próximo mês</span>
              <span className="font-medium text-primary">{formatCurrency(projecaoProximoMes)}</span>
            </div>
          </div>
        </Card>

        {/* Padrões Identificados */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <h4 className="font-medium">Padrões Identificados</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Maior arrecadação</span>
              <span className="font-medium text-emerald-400">{formatPeriodo(maiorArrecadacao)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Menor arrecadação</span>
              <span className="font-medium text-red-400">{formatPeriodo(menorArrecadacao)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Melhor adimplência</span>
              <span className="font-medium text-emerald-400">{formatPeriodo(melhorAdimplencia)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pior adimplência</span>
              <span className="font-medium text-red-400">{formatPeriodo(piorAdimplencia)}</span>
            </div>
          </div>
        </Card>

        {/* Top 3 Arrecadação */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <h4 className="font-medium">Top 3 Arrecadação</h4>
          </div>
          <div className="space-y-2 text-sm">
            {top3Arrecadacao.map((r, i) => (
              <div key={r.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : 'bg-orange-600 text-white'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{formatPeriodo(r)}</span>
                </div>
                <span className="font-medium text-emerald-400">{formatCurrency(Number(r.cosip_arrecadado))}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Meses com Maior Inadimplência */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <h4 className="font-medium">Meses com Maior Inadimplência</h4>
          </div>
          <div className="space-y-2 text-sm">
            {top3Inadimplencia.map((r, i) => (
              <div key={r.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-red-500 text-white' : i === 1 ? 'bg-red-400 text-white' : 'bg-red-300 text-black'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{formatPeriodo(r)}</span>
                </div>
                <span className="font-medium text-red-400">{r.inadCalc.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
