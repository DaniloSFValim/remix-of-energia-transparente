import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RegistroEnergia, getNomeMes, isBandeiraComCusto } from '@/types/energia';
import { BarChart3, Flag, TrendingUp, TrendingDown, Target, Trophy, AlertCircle } from 'lucide-react';

interface AnalisesAutomaticasProps {
  registros: RegistroEnergia[];
}

export const AnalisesAutomaticas = ({ registros }: AnalisesAutomaticasProps) => {
  if (registros.length === 0) return null;

  // Resumo do período
  const totalConsumo = registros.reduce((acc, r) => acc + Number(r.consumo_kwh), 0);
  const totalGasto = registros.reduce((acc, r) => acc + Number(r.valor_pago), 0);
  const custoMedio = totalGasto / totalConsumo;

  // Contagem de bandeiras
  const bandeiraVerde = registros.filter(r => r.bandeira_tarifaria === 'verde').length;
  const bandeiraAmarela = registros.filter(r => r.bandeira_tarifaria === 'amarela').length;
  const bandeiraVermelha = registros.filter(r => 
    r.bandeira_tarifaria === 'vermelha_1' || r.bandeira_tarifaria === 'vermelha_2'
  ).length;

  // Impacto das bandeiras
  const custoExtraBandeiras = registros.reduce((acc, r) => {
    if (isBandeiraComCusto(r.bandeira_tarifaria) && r.preco_bandeira) {
      return acc + (Number(r.preco_bandeira) * Number(r.consumo_kwh));
    }
    return acc;
  }, 0);

  const mesesComBandeira = registros.filter(r => isBandeiraComCusto(r.bandeira_tarifaria)).length;

  // Evolução das tarifas
  const primeiroRegistro = registros[0];
  const ultimoRegistro = registros[registros.length - 1];
  const variacaoTUSD = primeiroRegistro?.preco_tusd && ultimoRegistro?.preco_tusd
    ? ((Number(ultimoRegistro.preco_tusd) - Number(primeiroRegistro.preco_tusd)) / Number(primeiroRegistro.preco_tusd)) * 100
    : 0;
  const variacaoTE = primeiroRegistro?.preco_te && ultimoRegistro?.preco_te
    ? ((Number(ultimoRegistro.preco_te) - Number(primeiroRegistro.preco_te)) / Number(primeiroRegistro.preco_te)) * 100
    : 0;

  // Padrões identificados
  const maiorConsumo = [...registros].sort((a, b) => Number(b.consumo_kwh) - Number(a.consumo_kwh))[0];
  const menorConsumo = [...registros].sort((a, b) => Number(a.consumo_kwh) - Number(b.consumo_kwh))[0];
  
  // Tendência de consumo
  const primeiros3 = registros.slice(0, 3);
  const ultimos3 = registros.slice(-3);
  const mediaInicio = primeiros3.reduce((acc, r) => acc + Number(r.consumo_kwh), 0) / 3;
  const mediaFim = ultimos3.reduce((acc, r) => acc + Number(r.consumo_kwh), 0) / 3;
  const tendenciaConsumo = mediaFim < mediaInicio ? 'Caindo' : 'Subindo';

  // Projeção próximo mês
  const projecaoProximoMes = mediaFim;

  // Top 3 mais econômicos e mais caros
  const registrosComCusto = registros.map(r => ({
    ...r,
    custokWh: Number(r.valor_pago) / Number(r.consumo_kwh)
  }));
  const top3Economicos = [...registrosComCusto].sort((a, b) => a.custokWh - b.custokWh).slice(0, 3);
  const top3Caros = [...registrosComCusto].sort((a, b) => b.custokWh - a.custokWh).slice(0, 3);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(Math.round(value));
  };

  const formatPeriodo = (r: RegistroEnergia) => `${getNomeMes(r.mes).substring(0, 3)}/${r.ano}`;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Análises Automáticas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Resumo do Período */}
        <Card className="p-5 bg-card border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <h4 className="font-medium text-foreground">Resumo do Período</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Total consumido</span>
              <span className="font-medium text-foreground">{formatNumber(totalConsumo)} kWh</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Total gasto</span>
              <span className="font-medium text-emerald-400">{formatCurrency(totalGasto)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Custo médio</span>
              <span className="font-medium text-foreground">R$ {custoMedio.toFixed(2)}/kWh</span>
            </div>
            <div className="pt-2">
              <p className="text-muted-foreground text-xs mb-2">Bandeiras no período:</p>
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs">Verde: {bandeiraVerde}</Badge>
                <Badge className="bg-amber-500 hover:bg-amber-500 text-black text-xs">Amarela: {bandeiraAmarela}</Badge>
                <Badge className="bg-red-600 hover:bg-red-600 text-white text-xs">Vermelha: {bandeiraVermelha}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Impacto das Bandeiras */}
        <Card className="p-5 bg-card border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <Flag className="h-4 w-4 text-amber-500" />
            <h4 className="font-medium text-foreground">Impacto das Bandeiras</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Custo extra bandeiras</span>
              <span className="font-medium text-red-400">{formatCurrency(custoExtraBandeiras)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Se fosse tudo verde</span>
              <span className="font-medium text-emerald-400">Economia de {formatCurrency(custoExtraBandeiras)}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              {mesesComBandeira} meses com bandeira colorida geraram custos adicionais.
            </p>
          </div>
        </Card>

        {/* Evolução das Tarifas */}
        <Card className="p-5 bg-card border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <h4 className="font-medium text-foreground">Evolução das Tarifas</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Variação TUSD</span>
              <span className={`font-medium ${variacaoTUSD > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {variacaoTUSD > 0 ? '+' : ''}{variacaoTUSD.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Variação TE</span>
              <span className={`font-medium ${variacaoTE > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {variacaoTE > 0 ? '+' : ''}{variacaoTE.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Comparação do primeiro e último mês do período.
            </p>
          </div>
        </Card>

        {/* Padrões Identificados */}
        <Card className="p-5 bg-card border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-cyan-500" />
            <h4 className="font-medium text-foreground">Padrões Identificados</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Maior consumo</span>
              <span className="font-medium text-foreground">{formatPeriodo(maiorConsumo)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Menor consumo</span>
              <span className="font-medium text-foreground">{formatPeriodo(menorConsumo)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Tendência</span>
              <span className={`font-medium flex items-center gap-1 ${tendenciaConsumo === 'Caindo' ? 'text-emerald-400' : 'text-red-400'}`}>
                {tendenciaConsumo === 'Caindo' ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {tendenciaConsumo}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Projeção próximo mês</span>
              <span className="font-medium text-foreground">{formatNumber(projecaoProximoMes)} kWh</span>
            </div>
          </div>
        </Card>

        {/* Top 3 Mais Econômicos */}
        <Card className="p-5 bg-card border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h4 className="font-medium text-foreground">Top 3 Mais Econômicos</h4>
          </div>
          <div className="space-y-3">
            {top3Economicos.map((r, i) => (
              <div key={r.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : 'bg-orange-700 text-white'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground text-sm">{formatPeriodo(r)}</span>
                </div>
                <span className="font-medium text-emerald-400">R$ {r.custokWh.toFixed(2)}/kWh</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top 3 Mais Caros */}
        <Card className="p-5 bg-card border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <h4 className="font-medium text-foreground">Top 3 Mais Caros</h4>
          </div>
          <div className="space-y-3">
            {top3Caros.map((r, i) => (
              <div key={r.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-red-500 text-white' : i === 1 ? 'bg-red-400 text-white' : 'bg-red-300 text-black'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground text-sm">{formatPeriodo(r)}</span>
                </div>
                <span className="font-medium text-red-400">R$ {r.custokWh.toFixed(2)}/kWh</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
