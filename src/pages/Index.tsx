import { useState, useMemo } from 'react';
import { NewHeader } from '@/components/dashboard/NewHeader';
import { KPICardNew } from '@/components/dashboard/KPICardNew';
import { IndicadoresCOSIP } from '@/components/dashboard/IndicadoresCOSIP';
import { GraficoEvolucaoConsumo } from '@/components/dashboard/GraficoEvolucaoConsumo';
import { GraficoCOSIP } from '@/components/dashboard/GraficoCOSIP';
import { GraficoBandeiras } from '@/components/dashboard/GraficoBandeiras';
import { GraficoCustokWh } from '@/components/dashboard/GraficoCustokWh';
import { GraficoValores } from '@/components/dashboard/GraficoValores';
import { AnalisesCOSIP } from '@/components/dashboard/AnalisesCOSIP';
import { AnalisesAutomaticas } from '@/components/dashboard/AnalisesAutomaticas';
import { TabelaDadosDetalhados } from '@/components/dashboard/TabelaDadosDetalhados';
import { FiltrosAvancados, FiltroAvancado } from '@/components/dashboard/FiltrosAvancados';
import { PrintHeader } from '@/components/dashboard/PrintHeader';
import { PrintFooter } from '@/components/dashboard/PrintFooter';
import { useAllRegistros, useUltimoRegistro } from '@/hooks/useAllRegistros';
import { getNomeBandeira, getCorBandeira, isBandeiraComCusto } from '@/types/energia';
import { DollarSign, Zap, Calculator, Flag, BarChart3, Loader2, Calendar, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const FILTRO_INICIAL: FiltroAvancado = {
  anoInicio: null,
  mesInicio: null,
  anoFim: null,
  mesFim: null,
  bandeira: 'todas',
  compararCom: {
    ativo: false,
    anoInicio: null,
    mesInicio: null,
    anoFim: null,
    mesFim: null,
  },
};

const Index = () => {
  const { data: allRegistros = [], isLoading } = useAllRegistros();
  const { data: ultimoRegistro } = useUltimoRegistro();
  const [filtro, setFiltro] = useState<FiltroAvancado>(FILTRO_INICIAL);

  // Anos disponíveis
  const anosDisponiveis = useMemo(() => {
    const anos = [...new Set(allRegistros.map(r => r.ano))].sort((a, b) => b - a);
    return anos;
  }, [allRegistros]);

  // Função para verificar se registro está no período
  const registroNoPeriodo = (
    registro: { ano: number; mes: number },
    anoInicio: number | null,
    mesInicio: number | null,
    anoFim: number | null,
    mesFim: number | null
  ) => {
    if (!anoInicio) return true;
    
    const dataRegistro = registro.ano * 100 + registro.mes;
    const dataInicio = anoInicio * 100 + (mesInicio || 1);
    const dataFim = (anoFim || anoInicio) * 100 + (mesFim || 12);
    
    return dataRegistro >= dataInicio && dataRegistro <= dataFim;
  };

  // Registros filtrados
  const registrosFiltrados = useMemo(() => {
    let resultado = allRegistros;
    
    // Filtro por período
    if (filtro.anoInicio) {
      resultado = resultado.filter(r => 
        registroNoPeriodo(r, filtro.anoInicio, filtro.mesInicio, filtro.anoFim, filtro.mesFim)
      );
    }
    
    // Filtro por bandeira
    if (filtro.bandeira !== 'todas') {
      resultado = resultado.filter(r => r.bandeira_tarifaria === filtro.bandeira);
    }
    
    return resultado;
  }, [allRegistros, filtro]);

  // Registros do período de comparação
  const registrosComparacao = useMemo(() => {
    if (!filtro.compararCom.ativo || !filtro.compararCom.anoInicio) return [];
    
    return allRegistros.filter(r => 
      registroNoPeriodo(
        r, 
        filtro.compararCom.anoInicio, 
        filtro.compararCom.mesInicio, 
        filtro.compararCom.anoFim, 
        filtro.compararCom.mesFim
      )
    );
  }, [allRegistros, filtro.compararCom]);

  // Último registro para KPIs
  const ultimoReg = registrosFiltrados.length > 0 
    ? [...registrosFiltrados].sort((a, b) => (b.ano * 100 + b.mes) - (a.ano * 100 + a.mes))[0]
    : null;

  // Registro anterior para comparação
  const registroAnterior = useMemo(() => {
    if (!ultimoReg) return null;
    const sorted = [...registrosFiltrados].sort((a, b) => (b.ano * 100 + b.mes) - (a.ano * 100 + a.mes));
    const idx = sorted.findIndex(r => r.id === ultimoReg.id);
    return idx < sorted.length - 1 ? sorted[idx + 1] : null;
  }, [ultimoReg, registrosFiltrados]);

  // Registro do mesmo mês ano anterior
  const mesmoMesAnoAnterior = useMemo(() => {
    if (!ultimoReg) return null;
    return allRegistros.find(r => r.mes === ultimoReg.mes && r.ano === ultimoReg.ano - 1);
  }, [ultimoReg, allRegistros]);

  // Cálculos de variação
  const calcVariacao = (atual: number, anterior: number | undefined) => {
    if (!anterior || anterior === 0) return null;
    return ((atual - anterior) / anterior) * 100;
  };

  const variacaoGasto = registroAnterior 
    ? calcVariacao(Number(ultimoReg?.valor_pago), Number(registroAnterior.valor_pago))
    : null;

  const variacaoConsumo = registroAnterior 
    ? calcVariacao(Number(ultimoReg?.consumo_kwh), Number(registroAnterior.consumo_kwh))
    : null;

  const custokWhAtual = ultimoReg 
    ? Number(ultimoReg.valor_pago) / Number(ultimoReg.consumo_kwh)
    : 0;

  const custokWhAnterior = registroAnterior 
    ? Number(registroAnterior.valor_pago) / Number(registroAnterior.consumo_kwh)
    : 0;

  const variacaoCusto = custokWhAnterior > 0 
    ? calcVariacao(custokWhAtual, custokWhAnterior)
    : null;

  const variacaoAnual = mesmoMesAnoAnterior 
    ? Number(ultimoReg?.valor_pago) - Number(mesmoMesAnoAnterior.valor_pago)
    : null;

  const variacaoAnualPercent = mesmoMesAnoAnterior 
    ? calcVariacao(Number(ultimoReg?.valor_pago), Number(mesmoMesAnoAnterior.valor_pago))
    : null;

  const custoAdicionalBandeira = ultimoReg && isBandeiraComCusto(ultimoReg.bandeira_tarifaria)
    ? Number(ultimoReg.preco_bandeira || 0) * Number(ultimoReg.consumo_kwh)
    : 0;

  // Data de atualização
  const dataAtualizacao = ultimoReg 
    ? new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  const handleLimparFiltros = () => {
    setFiltro(FILTRO_INICIAL);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NewHeader />
      
      <main className="container mx-auto px-4 py-6">
        {/* Cabeçalho de Impressão */}
        <PrintHeader filtro={filtro.anoInicio?.toString() || 'todos'} />
        {/* Título */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6 no-print">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl md:text-3xl font-bold text-primary">
                Dashboard de Iluminação Pública - Niterói/RJ
              </h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Portal de Transparência da Iluminação Pública Municipal</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-muted-foreground">Consumo de Energia e Custos Mensais</p>
            {ultimoReg && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                Última atualização: {dataAtualizacao}
              </p>
            )}
          </div>
          <FiltrosAvancados 
            filtro={filtro} 
            onFiltroChange={setFiltro} 
            anosDisponiveis={anosDisponiveis}
            registros={registrosFiltrados}
            onLimparFiltros={handleLimparFiltros}
          />
        </div>

        {ultimoReg && (
          <>
            {/* KPIs Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <KPICardNew
                icon={DollarSign}
                titulo="Gasto do Mês"
                valor={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(ultimoReg.valor_pago))}
                variacao={variacaoGasto}
                variacaoLabel="vs mês anterior"
                iconColor="text-emerald-500"
                tooltipText="Valor total pago na fatura de energia do mês"
                index={0}
              />
              <KPICardNew
                icon={Zap}
                titulo="Consumo do Mês"
                valor={`${new Intl.NumberFormat('pt-BR').format(Number(ultimoReg.consumo_kwh))} kWh`}
                variacao={variacaoConsumo}
                variacaoLabel="vs mês anterior"
                iconColor="text-blue-500"
                tooltipText="Consumo total de energia em quilowatts-hora"
                index={1}
              />
              <KPICardNew
                icon={Calculator}
                titulo="Custo Real por kWh"
                valor={`R$ ${custokWhAtual.toFixed(2)}`}
                subtitulo="Com impostos inclusos"
                variacao={variacaoCusto}
                iconColor="text-purple-500"
                tooltipText="Custo médio por kWh incluindo todos os impostos e taxas"
                index={2}
              />
              <KPICardNew
                icon={Flag}
                titulo="Bandeira Tarifária"
                valor={isBandeiraComCusto(ultimoReg.bandeira_tarifaria) 
                  ? `+R$ ${Number(ultimoReg.preco_bandeira || 0).toFixed(4)}/kWh`
                  : 'Sem custo adicional'
                }
                subtitulo={custoAdicionalBandeira > 0 
                  ? `Custo adicional: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custoAdicionalBandeira)}`
                  : undefined
                }
                badge={getNomeBandeira(ultimoReg.bandeira_tarifaria).toUpperCase()}
                badgeColor={getCorBandeira(ultimoReg.bandeira_tarifaria)}
                destaque={isBandeiraComCusto(ultimoReg.bandeira_tarifaria)}
                destaqueColor={ultimoReg.bandeira_tarifaria === 'amarela' ? 'yellow' : 'red'}
                iconColor={ultimoReg.bandeira_tarifaria === 'amarela' ? 'text-yellow-500' : ultimoReg.bandeira_tarifaria?.includes('vermelha') ? 'text-red-500' : 'text-emerald-500'}
                tooltipText="Bandeira tarifária aplicada pela ANEEL no período"
                index={3}
              />
              <KPICardNew
                icon={BarChart3}
                titulo="Comparação Anual"
                valor={variacaoAnual !== null 
                  ? `${variacaoAnual >= 0 ? '+' : '-'}R$ ${new Intl.NumberFormat('pt-BR').format(Math.abs(variacaoAnual))}`
                  : 'N/A'
                }
                subtitulo="vs mesmo mês ano anterior"
                variacao={variacaoAnualPercent}
                iconColor="text-orange-500"
                tooltipText="Comparação com o mesmo mês do ano anterior"
                index={4}
              />
            </div>

            {/* Indicadores COSIP */}
            <div className="mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <IndicadoresCOSIP registros={registrosFiltrados} />
            </div>

            {/* Gráficos */}
            <div className="space-y-6 mb-8">
              <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <GraficoEvolucaoConsumo registros={registrosFiltrados} registrosComparacao={registrosComparacao} />
              </div>
              <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <GraficoValores registros={registrosFiltrados} registrosComparacao={registrosComparacao} />
              </div>
              <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                <GraficoCustokWh registros={registrosFiltrados} registrosComparacao={registrosComparacao} />
              </div>
              <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
                <GraficoCOSIP registros={registrosFiltrados} />
              </div>
              <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '900ms' }}>
                <GraficoBandeiras registros={registrosFiltrados} />
              </div>
            </div>

            {/* Análises COSIP */}
            <div className="mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
              <AnalisesCOSIP registros={registrosFiltrados} />
            </div>

            {/* Análises Automáticas */}
            <div className="mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '1100ms' }}>
              <AnalisesAutomaticas registros={registrosFiltrados} />
            </div>

            {/* Tabela de Dados */}
            <div className="mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '1200ms' }}>
              <TabelaDadosDetalhados registros={registrosFiltrados} />
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground no-print">
          <p>Portal de Transparência - Iluminação Pública Municipal de Niterói</p>
          <p className="mt-1">Dados atualizados mensalmente pela Secretaria de Conservação e Serviços Públicos - SECONSER</p>
        </footer>

        {/* Rodapé de Impressão */}
        <PrintFooter />
      </main>
    </div>
  );
};

export default Index;
