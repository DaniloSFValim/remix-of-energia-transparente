import { Card } from '@/components/ui/card';
import { RegistroEnergia, getNomeMes } from '@/types/energia';
import { FileText, Users, TrendingUp, TrendingDown, AlertTriangle, Trophy, AlertCircle } from 'lucide-react';

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
      <h3 className="text-lg font-semibold text-foreground">Análises COSIP</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Resumo COSIP */}
        <Card className="p-5 bg-card border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-cyan-500" />
            <h4 className="font-medium text-foreground">Resumo COSIP</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Total faturado</span>
              <span className="font-medium text-foreground">{formatCurrency(totalFaturado)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Total arrecadado</span>
              <span className="font-medium text-emerald-400">{formatCurrency(totalArrecadado)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Eficiência</span>
              <span className="font-medium text-cyan-400">{eficiencia.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Inadimplência média</span>
              <span className={`font-medium ${inadimplenciaMedia < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {inadimplenciaMedia.toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>

        {/* Evolução de Clientes */}
        <Card className="p-5 bg-card border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-blue-500" />
            <h4 className="font-medium text-foreground">Evolução de Clientes</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Início do período</span>
              <span className="font-medium text-foreground">{primeiroClientes.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Fim do período</span>
              <span className="font-medium text-foreground">{ultimoClientes.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Variação</span>
              <span className={`font-medium ${variacaoClientesPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {variacaoClientesPercent >= 0 ? '+' : ''}{variacaoClientesPercent.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              {variacaoClientes >= 0 ? 'Aumento' : 'Redução'} de {Math.abs(variacaoClientes).toLocaleString('pt-BR')} clientes
            </p>
          </div>
        </Card>

        {/* Tendências COSIP */}
        <Card className="p-5 bg-card border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <h4 className="font-medium text-foreground">Tendências COSIP</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Arrecadação</span>
              <span className={`font-medium flex items-center gap-1 ${tendenciaArrecadacao ? 'text-red-400' : 'text-emerald-400'}`}>
                {tendenciaArrecadacao ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {tendenciaArrecadacao ? 'Piorando' : 'Melhorando'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Inadimplência</span>
              <span className={`font-medium flex items-center gap-1 ${tendenciaInadimplencia ? 'text-emerald-400' : 'text-red-400'}`}>
                {tendenciaInadimplencia ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {tendenciaInadimplencia ? 'Melhorando' : 'Piorando'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Projeção próximo mês</span>
              <span className="font-medium text-foreground">{formatCurrency(projecaoProximoMes)}</span>
            </div>
          </div>
        </Card>

        {/* Padrões Identificados */}
        <Card className="p-5 bg-card border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h4 className="font-medium text-foreground">Padrões Identificados</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Maior arrecadação</span>
              <span className="font-medium text-foreground">{formatPeriodo(maiorArrecadacao)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Menor arrecadação</span>
              <span className="font-medium text-foreground">{formatPeriodo(menorArrecadacao)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Melhor adimplência</span>
              <span className="font-medium text-emerald-400">{formatPeriodo(melhorAdimplencia)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Pior adimplência</span>
              <span className="font-medium text-red-400">{formatPeriodo(piorAdimplencia)}</span>
            </div>
          </div>
        </Card>

        {/* Top 3 Arrecadação */}
        <Card className="p-5 bg-card border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h4 className="font-medium text-foreground">Top 3 Arrecadação</h4>
          </div>
          <div className="space-y-3">
            {top3Arrecadacao.map((r, i) => (
              <div key={r.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : 'bg-orange-700 text-white'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground text-sm">{formatPeriodo(r)}</span>
                </div>
                <span className="font-medium text-emerald-400">{formatCurrency(Number(r.cosip_arrecadado))}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Meses com Maior Inadimplência */}
        <Card className="p-5 bg-card border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <h4 className="font-medium text-foreground">Meses com Maior Inadimplência</h4>
          </div>
          <div className="space-y-3">
            {top3Inadimplencia.map((r, i) => (
              <div key={r.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-red-500 text-white' : i === 1 ? 'bg-red-400 text-white' : 'bg-red-300 text-black'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground text-sm">{formatPeriodo(r)}</span>
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
