import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RegistroEnergia, getNomeMes, isBandeiraComCusto } from '@/types/energia';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface ResumoExecutivoProps {
  registros: RegistroEnergia[];
}

interface Insight {
  tipo: 'positivo' | 'negativo' | 'neutro' | 'alerta';
  titulo: string;
  descricao: string;
  valor?: string;
}

export const ResumoExecutivo = ({ registros }: ResumoExecutivoProps) => {
  if (registros.length < 2) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(Math.round(value));
  };

  const formatPeriodo = (r: RegistroEnergia) => `${getNomeMes(r.mes)}/${r.ano}`;

  // Ordenar registros por data
  const sorted = [...registros].sort((a, b) => (a.ano * 100 + a.mes) - (b.ano * 100 + b.mes));
  const ultimoRegistro = sorted[sorted.length - 1];
  const penultimoRegistro = sorted[sorted.length - 2];

  // Calcular métricas principais
  const totalGasto = registros.reduce((acc, r) => acc + Number(r.valor_pago), 0);
  const totalConsumo = registros.reduce((acc, r) => acc + Number(r.consumo_kwh), 0);
  const custoMedioKwh = totalGasto / totalConsumo;

  // Variação mensal
  const variacaoMensal = ((Number(ultimoRegistro.valor_pago) - Number(penultimoRegistro.valor_pago)) / Number(penultimoRegistro.valor_pago)) * 100;
  const variacaoConsumo = ((Number(ultimoRegistro.consumo_kwh) - Number(penultimoRegistro.consumo_kwh)) / Number(penultimoRegistro.consumo_kwh)) * 100;

  // Tendência de longo prazo (primeiros 3 vs últimos 3 meses)
  const primeiros3 = sorted.slice(0, Math.min(3, sorted.length));
  const ultimos3 = sorted.slice(-Math.min(3, sorted.length));
  const mediaGastoInicio = primeiros3.reduce((acc, r) => acc + Number(r.valor_pago), 0) / primeiros3.length;
  const mediaGastoFim = ultimos3.reduce((acc, r) => acc + Number(r.valor_pago), 0) / ultimos3.length;
  const tendenciaGasto = ((mediaGastoFim - mediaGastoInicio) / mediaGastoInicio) * 100;

  // Impacto das bandeiras
  const custoExtraBandeiras = registros.reduce((acc, r) => {
    if (isBandeiraComCusto(r.bandeira_tarifaria) && r.preco_bandeira) {
      return acc + (Number(r.preco_bandeira) * Number(r.consumo_kwh));
    }
    return acc;
  }, 0);

  // Meses com bandeira não-verde
  const mesesBandeiraColorida = registros.filter(r => isBandeiraComCusto(r.bandeira_tarifaria)).length;
  const percentualBandeiraColorida = (mesesBandeiraColorida / registros.length) * 100;

  // Mês mais caro e mais barato
  const registrosComCusto = registros.map(r => ({
    ...r,
    custokWh: Number(r.valor_pago) / Number(r.consumo_kwh)
  }));
  const mesMaisCaro = [...registrosComCusto].sort((a, b) => b.custokWh - a.custokWh)[0];
  const mesMaisBarato = [...registrosComCusto].sort((a, b) => a.custokWh - b.custokWh)[0];

  // Gerar insights automáticos
  const insights: Insight[] = [];

  // Insight sobre variação mensal
  if (variacaoMensal < -5) {
    insights.push({
      tipo: 'positivo',
      titulo: 'Redução nos gastos',
      descricao: `O gasto caiu ${Math.abs(variacaoMensal).toFixed(1)}% em relação ao mês anterior`,
      valor: formatCurrency(Number(penultimoRegistro.valor_pago) - Number(ultimoRegistro.valor_pago))
    });
  } else if (variacaoMensal > 10) {
    insights.push({
      tipo: 'alerta',
      titulo: 'Aumento significativo',
      descricao: `O gasto subiu ${variacaoMensal.toFixed(1)}% em relação ao mês anterior`,
      valor: `+${formatCurrency(Number(ultimoRegistro.valor_pago) - Number(penultimoRegistro.valor_pago))}`
    });
  }

  // Insight sobre tendência de longo prazo
  if (tendenciaGasto < -5 && sorted.length >= 6) {
    insights.push({
      tipo: 'positivo',
      titulo: 'Tendência de queda',
      descricao: `Os gastos estão em tendência de queda de ${Math.abs(tendenciaGasto).toFixed(1)}% no período`,
    });
  } else if (tendenciaGasto > 10 && sorted.length >= 6) {
    insights.push({
      tipo: 'negativo',
      titulo: 'Tendência de alta',
      descricao: `Os gastos apresentam tendência de alta de ${tendenciaGasto.toFixed(1)}% no período`,
    });
  }

  // Insight sobre bandeiras
  if (custoExtraBandeiras > 0) {
    insights.push({
      tipo: 'alerta',
      titulo: 'Impacto das bandeiras',
      descricao: `${mesesBandeiraColorida} meses com bandeira colorida geraram custo adicional`,
      valor: formatCurrency(custoExtraBandeiras)
    });
  } else if (registros.length >= 3) {
    insights.push({
      tipo: 'positivo',
      titulo: 'Bandeira verde',
      descricao: 'Todo o período operou com bandeira verde, sem custos adicionais',
    });
  }

  // Insight sobre eficiência
  if (variacaoConsumo < -3 && variacaoMensal < 0) {
    insights.push({
      tipo: 'positivo',
      titulo: 'Maior eficiência',
      descricao: 'O consumo reduziu acompanhando a queda nos gastos',
    });
  } else if (variacaoConsumo > 5 && variacaoMensal < 0) {
    insights.push({
      tipo: 'neutro',
      titulo: 'Tarifa mais baixa',
      descricao: 'Consumo aumentou mas gastos caíram devido a tarifas menores',
    });
  }

  // Insight sobre mês atual vs histórico
  const custoAtualKwh = Number(ultimoRegistro.valor_pago) / Number(ultimoRegistro.consumo_kwh);
  if (custoAtualKwh < custoMedioKwh * 0.9) {
    insights.push({
      tipo: 'positivo',
      titulo: 'Custo abaixo da média',
      descricao: `O custo por kWh está ${((1 - custoAtualKwh / custoMedioKwh) * 100).toFixed(0)}% abaixo da média histórica`,
    });
  } else if (custoAtualKwh > custoMedioKwh * 1.1) {
    insights.push({
      tipo: 'negativo',
      titulo: 'Custo acima da média',
      descricao: `O custo por kWh está ${((custoAtualKwh / custoMedioKwh - 1) * 100).toFixed(0)}% acima da média histórica`,
    });
  }

  // Limitar a 4 insights mais relevantes
  const insightsFiltrados = insights.slice(0, 4);

  const getInsightIcon = (tipo: Insight['tipo']) => {
    switch (tipo) {
      case 'positivo':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'negativo':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'alerta':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const getInsightBorderColor = (tipo: Insight['tipo']) => {
    switch (tipo) {
      case 'positivo':
        return 'border-l-emerald-500';
      case 'negativo':
        return 'border-l-red-500';
      case 'alerta':
        return 'border-l-amber-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/80 border-border">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Resumo Executivo</h3>
          <p className="text-xs text-muted-foreground">
            Análise automática de {registros.length} meses • {formatPeriodo(sorted[0])} a {formatPeriodo(ultimoRegistro)}
          </p>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground mb-1">Gasto Total</p>
          <p className="text-lg font-bold text-emerald-500">{formatCurrency(totalGasto)}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground mb-1">Consumo Total</p>
          <p className="text-lg font-bold text-blue-500">{formatNumber(totalConsumo)} kWh</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground mb-1">Custo Médio</p>
          <p className="text-lg font-bold text-purple-500">R$ {custoMedioKwh.toFixed(2)}/kWh</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground mb-1">Variação Mensal</p>
          <p className={`text-lg font-bold flex items-center justify-center gap-1 ${variacaoMensal < 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {variacaoMensal < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
            {variacaoMensal > 0 ? '+' : ''}{variacaoMensal.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Insights */}
      {insightsFiltrados.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-foreground">Insights Automáticos</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insightsFiltrados.map((insight, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg bg-muted/20 border-l-4 ${getInsightBorderColor(insight.tipo)}`}
              >
                <div className="flex items-start gap-2">
                  {getInsightIcon(insight.tipo)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{insight.titulo}</span>
                      {insight.valor && (
                        <Badge variant="secondary" className="text-xs">
                          {insight.valor}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{insight.descricao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Destaques do período */}
      <div className="mt-5 pt-4 border-t border-border">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ArrowRight className="h-3 w-3 text-emerald-500" />
            <span>Mês mais econômico: <strong className="text-foreground">{formatPeriodo(mesMaisBarato)}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowRight className="h-3 w-3 text-red-500" />
            <span>Mês mais caro: <strong className="text-foreground">{formatPeriodo(mesMaisCaro)}</strong></span>
          </div>
          {percentualBandeiraColorida > 0 && (
            <div className="flex items-center gap-1">
              <ArrowRight className="h-3 w-3 text-amber-500" />
              <span>Bandeiras coloridas: <strong className="text-foreground">{percentualBandeiraColorida.toFixed(0)}%</strong> do período</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
