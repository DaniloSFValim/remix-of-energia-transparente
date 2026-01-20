import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RegistroEnergia, getNomeMes, isBandeiraComCusto, BandeiraTarifaria } from '@/types/energia';
import { BandeiraBadge } from './BandeiraBadge';
import { Zap, DollarSign, TrendingUp, TrendingDown, Calendar, AlertTriangle, Minus } from 'lucide-react';

interface CardMesAtualProps {
  registro: RegistroEnergia;
  registroAnterior?: RegistroEnergia | null;
}

export const CardMesAtual = ({ registro, registroAnterior }: CardMesAtualProps) => {
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

  const calcularVariacao = (atual: number, anterior: number | undefined) => {
    if (!anterior || anterior === 0) return null;
    return ((atual - anterior) / anterior) * 100;
  };

  const variacaoConsumo = registroAnterior 
    ? calcularVariacao(Number(registro.consumo_kwh), Number(registroAnterior.consumo_kwh))
    : null;

  const variacaoValor = registroAnterior 
    ? calcularVariacao(Number(registro.valor_pago), Number(registroAnterior.valor_pago))
    : null;

  const VariacaoIndicator = ({ variacao, invertColors = false }: { variacao: number | null; invertColors?: boolean }) => {
    if (variacao === null) return null;
    
    const isPositive = variacao > 0;
    const isNeutral = Math.abs(variacao) < 0.5;
    
    // Para consumo/valor, aumento é ruim (vermelho), diminuição é bom (verde)
    // invertColors inverte essa lógica se necessário
    const colorClass = isNeutral 
      ? 'text-muted-foreground' 
      : (isPositive !== invertColors) 
        ? 'text-destructive' 
        : 'text-primary';
    
    const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
    
    return (
      <div className={`flex items-center gap-1 text-xs ${colorClass}`}>
        <Icon className="h-3 w-3" />
        <span>{isPositive ? '+' : ''}{variacao.toFixed(1)}%</span>
      </div>
    );
  };

  const getAlertaBandeira = (bandeira: BandeiraTarifaria | null) => {
    if (bandeira === 'vermelha_2') {
      return {
        tipo: 'destructive' as const,
        titulo: 'Bandeira Vermelha Patamar 2',
        mensagem: 'Custo energético elevado devido às condições críticas de geração. Recomenda-se atenção ao consumo.',
      };
    }
    if (bandeira === 'vermelha_1') {
      return {
        tipo: 'destructive' as const,
        titulo: 'Bandeira Vermelha Patamar 1',
        mensagem: 'Custo adicional por condições desfavoráveis de geração de energia.',
      };
    }
    if (bandeira === 'amarela') {
      return {
        tipo: 'default' as const,
        titulo: 'Bandeira Amarela',
        mensagem: 'Custo adicional moderado nas tarifas devido às condições de geração.',
      };
    }
    return null;
  };

  const alerta = getAlertaBandeira(registro.bandeira_tarifaria);
  const mesAnteriorNome = registroAnterior ? getNomeMes(registroAnterior.mes) : null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Alerta de Bandeira */}
      {alerta && (
        <Alert variant={alerta.tipo} className={alerta.tipo === 'destructive' ? 'border-destructive/50 bg-destructive/10' : 'border-yellow-500/50 bg-yellow-500/10'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{alerta.titulo}</AlertTitle>
          <AlertDescription>{alerta.mensagem}</AlertDescription>
        </Alert>
      )}

      {/* Card Principal */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">
                {getNomeMes(registro.mes)} de {registro.ano}
              </CardTitle>
            </div>
            <BandeiraBadge bandeira={registro.bandeira_tarifaria} size="md" />
          </div>
          <CardDescription>
            Dados do mês mais recente
            {mesAnteriorNome && ` • Comparado com ${mesAnteriorNome}`}
          </CardDescription>
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
              <VariacaoIndicator variacao={variacaoConsumo} />
            </div>

            {/* Valor Pago */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <DollarSign className="h-4 w-4" />
                Valor Pago
              </div>
              <p className="text-xl font-bold text-primary">{formatCurrency(Number(registro.valor_pago))}</p>
              <VariacaoIndicator variacao={variacaoValor} />
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
    </div>
  );
};